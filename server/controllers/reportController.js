const ExcelJS = require('exceljs');
const ExpenseModel = require('../models/expenseModel');
const db = require('../config/db');

const reportController = {
    // Download Excel Report
    downloadExpenseReport: async (req, res) => {
        try {
            const expenses = await ExpenseModel.getAllExpenses();
            const summary = await ExpenseModel.getSummary();
            const materialTotals = await ExpenseModel.getMaterialTotals();

            // Create workbook
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Construction Manager';
            workbook.lastModifiedBy = 'Admin';
            workbook.created = new Date();
            workbook.modified = new Date();

            // ============ SHEET 1: SUMMARY ============
            const summarySheet = workbook.addWorksheet('Summary Report');
            
            // Add title
            summarySheet.mergeCells('A1:G1');
            const titleRow = summarySheet.getCell('A1');
            titleRow.value = 'CONSTRUCTION EXPENSE SUMMARY REPORT';
            titleRow.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D6EFD' } };
            titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
            summarySheet.getRow(1).height = 30;

            // Generated date
            summarySheet.mergeCells('A2:G2');
            const dateRow = summarySheet.getCell('A2');
            dateRow.value = `Generated on: ${new Date().toLocaleString('en-PK')}`;
            dateRow.font = { italic: true, color: { argb: 'FF666666' } };
            dateRow.alignment = { horizontal: 'right' };

            // Summary Statistics
            summarySheet.addRow([]);
            summarySheet.addRow(['FINANCIAL SUMMARY']);
            summarySheet.getRow(4).font = { bold: true, size: 14 };

            const summaryData = [
                ['Total Cost', summary.summary.total_cost, 'PKR'],
                ['Total Paid', summary.summary.total_paid, 'PKR'],
                ['Remaining Balance', summary.summary.remaining_balance, 'PKR'],
                ['Total Advance', summary.summary.total_advance, 'PKR'],
                ['Total Entries', summary.summary.total_entries, ''],
                ['Advance Entries', summary.summary.advance_entries, '']
            ];

            let rowIndex = 5;
            summaryData.forEach(([label, value, currency]) => {
                summarySheet.getCell(`A${rowIndex}`).value = label;
                summarySheet.getCell(`A${rowIndex}`).font = { bold: true };
                
                if (currency) {
                    summarySheet.getCell(`B${rowIndex}`).value = value;
                    summarySheet.getCell(`B${rowIndex}`).numFmt = '#,##0.00';
                    summarySheet.getCell(`C${rowIndex}`).value = currency;
                } else {
                    summarySheet.getCell(`B${rowIndex}`).value = value;
                }
                
                rowIndex++;
            });

            // ============ SHEET 2: MATERIAL TOTALS ============
            const materialSheet = workbook.addWorksheet('Material Totals');
            
            materialSheet.columns = [
                { header: 'Category', key: 'category', width: 25 },
                { header: 'Total Quantity', key: 'total_quantity', width: 20 },
                { header: 'Unit Type', key: 'unit_type', width: 15 },
                { header: 'Entry Count', key: 'entry_count', width: 15 },
                { header: 'Total Cost (PKR)', key: 'total_cost', width: 20 },
                { header: 'Total Paid (PKR)', key: 'total_paid', width: 20 },
                { header: 'Advance (PKR)', key: 'total_advance', width: 20 }
            ];

            // Style header row
            materialSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            materialSheet.getRow(1).fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: 'FF198754' } 
            };

            // Add data
            materialTotals.forEach(item => {
                materialSheet.addRow({
                    category: item.category,
                    total_quantity: item.total_quantity,
                    unit_type: item.unit_type,
                    entry_count: item.entry_count,
                    total_cost: item.total_cost,
                    total_paid: item.total_paid,
                    total_advance: item.total_advance || 0
                });
            });

            // Format number columns
            materialSheet.getColumn('total_quantity').numFmt = '#,##0.00';
            materialSheet.getColumn('total_cost').numFmt = '#,##0.00';
            materialSheet.getColumn('total_paid').numFmt = '#,##0.00';
            materialSheet.getColumn('total_advance').numFmt = '#,##0.00';

            // ============ SHEET 3: ALL EXPENSES ============
            const expenseSheet = workbook.addWorksheet('All Expenses');
            
            expenseSheet.columns = [
                { header: 'ID', key: 'id', width: 8 },
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Category', key: 'category', width: 20 },
                { header: 'Description', key: 'description', width: 30 },
                { header: 'Quantity', key: 'quantity', width: 12 },
                { header: 'Unit', key: 'unit_type', width: 10 },
                { header: 'Unit Price', key: 'unit_price', width: 15 },
                { header: 'Total Cost', key: 'total_cost', width: 15 },
                { header: 'Amount Paid', key: 'amount_paid', width: 15 },
                { header: 'Balance', key: 'remaining_balance', width: 15 },
                { header: 'Status', key: 'payment_status', width: 15 },
                { header: 'Advance Note', key: 'advance_note', width: 25 }
            ];

            // Style header row
            expenseSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            expenseSheet.getRow(1).fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: 'FF0D6EFD' } 
            };

            // Add data
            expenses.forEach(expense => {
                expenseSheet.addRow({
                    id: expense.id,
                    date: new Date(expense.date).toLocaleDateString('en-PK'),
                    category: expense.category,
                    description: expense.description || '-',
                    quantity: expense.quantity,
                    unit_type: expense.unit_type,
                    unit_price: expense.unit_price,
                    total_cost: expense.total_cost,
                    amount_paid: expense.amount_paid,
                    remaining_balance: expense.remaining_balance,
                    payment_status: expense.payment_status,
                    advance_note: expense.advance_note || '-'
                });
            });

            // Format number columns
            ['quantity', 'unit_price', 'total_cost', 'amount_paid', 'remaining_balance'].forEach(col => {
                expenseSheet.getColumn(col).numFmt = '#,##0.00';
            });

            // Color code remaining balance
            expenseSheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    const balanceCell = row.getCell('remaining_balance');
                    if (balanceCell.value < 0) {
                        balanceCell.font = { color: { argb: 'FF00FF00' }, bold: true }; // Green for advance
                    } else if (balanceCell.value > 0) {
                        balanceCell.font = { color: { argb: 'FFFF0000' }, bold: true }; // Red for pending
                    }
                }
            });

            // ============ SHEET 4: CATEGORY SUMMARY ============
            const categorySheet = workbook.addWorksheet('Category Summary');
            
            categorySheet.columns = [
                { header: 'Category', key: 'category', width: 25 },
                { header: 'Total Quantity', key: 'total_quantity', width: 20 },
                { header: 'Unit', key: 'unit_type', width: 15 },
                { header: 'Entries', key: 'entry_count', width: 12 },
                { header: 'Total Cost', key: 'total_expense', width: 20 },
                { header: 'Total Paid', key: 'total_paid', width: 20 },
                { header: 'Balance', key: 'remaining_balance', width: 20 },
                { header: 'Advance', key: 'total_advance', width: 20 }
            ];

            // Style header row
            categorySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            categorySheet.getRow(1).fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: 'FF6F42C1' } 
            };

            // Add data
            summary.category.forEach(item => {
                categorySheet.addRow({
                    category: item.category,
                    total_quantity: item.total_quantity || 0,
                    unit_type: item.unit_type || '-',
                    entry_count: item.entry_count,
                    total_expense: item.total_expense,
                    total_paid: item.total_paid,
                    remaining_balance: item.remaining_balance,
                    total_advance: item.total_advance || 0
                });
            });

            // Format columns
            ['total_quantity', 'total_expense', 'total_paid', 'remaining_balance', 'total_advance'].forEach(col => {
                categorySheet.getColumn(col).numFmt = '#,##0.00';
            });

            // Generate filename with date
            const date = new Date();
            const filename = `construction_expense_report_${date.getFullYear()}_${(date.getMonth()+1).toString().padStart(2,'0')}_${date.getDate().toString().padStart(2,'0')}.xlsx`;

            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

            // Write to response
            await workbook.xlsx.write(res);
            res.end();

            // Log download
            await db.query(
                'INSERT INTO report_downloads (admin_id, report_type, file_format) VALUES (?, ?, ?)',
                [req.user.id, 'full_report', 'excel']
            );

        } catch (error) {
            console.error('Error generating Excel report:', error);
            res.status(500).json({ success: false, message: 'Error generating report' });
        }
    },

    // Download Material Summary Only
    downloadMaterialSummary: async (req, res) => {
        try {
            const materialTotals = await ExpenseModel.getMaterialTotals();
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Material Summary');

            worksheet.columns = [
                { header: 'Material Category', key: 'category', width: 30 },
                { header: 'Total Quantity Used', key: 'total_quantity', width: 20 },
                { header: 'Unit', key: 'unit_type', width: 15 },
                { header: 'Number of Purchases', key: 'entry_count', width: 20 },
                { header: 'Total Cost (PKR)', key: 'total_cost', width: 20 },
                { header: 'Total Paid (PKR)', key: 'total_paid', width: 20 },
                { header: 'Advance Payment (PKR)', key: 'total_advance', width: 20 }
            ];

            // Style header
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: 'FF0D6EFD' } 
            };

            materialTotals.forEach(item => {
                worksheet.addRow({
                    category: item.category,
                    total_quantity: item.total_quantity,
                    unit_type: item.unit_type,
                    entry_count: item.entry_count,
                    total_cost: item.total_cost,
                    total_paid: item.total_paid,
                    total_advance: item.total_advance || 0
                });
            });

            // Add total row
            worksheet.addRow({});
            const totalRow = worksheet.addRow({
                category: 'GRAND TOTAL',
                total_quantity: materialTotals.reduce((sum, item) => sum + parseFloat(item.total_quantity), 0),
                entry_count: materialTotals.reduce((sum, item) => sum + parseInt(item.entry_count), 0),
                total_cost: materialTotals.reduce((sum, item) => sum + parseFloat(item.total_cost), 0),
                total_paid: materialTotals.reduce((sum, item) => sum + parseFloat(item.total_paid), 0),
                total_advance: materialTotals.reduce((sum, item) => sum + parseFloat(item.total_advance || 0), 0)
            });

            totalRow.font = { bold: true };
            totalRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF8F9FA' }
            };

            // Format number columns
            ['total_quantity', 'total_cost', 'total_paid', 'total_advance'].forEach(col => {
                worksheet.getColumn(col).numFmt = '#,##0.00';
            });

            const filename = `material_summary_${new Date().toISOString().split('T')[0]}.xlsx`;

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error('Error generating material summary:', error);
            res.status(500).json({ success: false, message: 'Error generating summary' });
        }
    }
};

module.exports = reportController;