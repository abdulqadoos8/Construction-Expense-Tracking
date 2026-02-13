const ExpenseModel = require('../models/expenseModel');

const expenseController = {
    // Get all expenses
    getAllExpenses: async (req, res) => {
        try {
            const expenses = await ExpenseModel.getAllExpenses();
            res.json({ success: true, data: expenses });
        } catch (error) {
            console.error('Error in getAllExpenses:', error);
            res.status(500).json({ success: false, message: 'Error fetching expenses' });
        }
    },

    // Get single expense by ID
    getExpenseById: async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'Invalid expense ID' });
            }
            
            const expense = await ExpenseModel.getExpenseById(id);
            
            if (expense) {
                res.json({ success: true, data: expense });
            } else {
                res.status(404).json({ success: false, message: 'Expense not found' });
            }
        } catch (error) {
            console.error('Error in getExpenseById:', error);
            res.status(500).json({ success: false, message: 'Error fetching expense' });
        }
    },

    // ✅ FIXED: Create new expense with ADVANCE PAYMENT SUPPORT (NO RESTRICTIONS)
    createExpense: async (req, res) => {
        try {
            console.log('📦 Received expense data:', req.body);

            const {
                date, category, description, quantity, unit_type,
                unit_price, amount_paid, advance_note, notes
            } = req.body;

            // Basic validation
            if (!date) {
                return res.status(400).json({ success: false, message: 'Date is required' });
            }
            
            if (!category) {
                return res.status(400).json({ success: false, message: 'Category is required' });
            }
            
            const trimmedCategory = category.toString().trim();
            if (trimmedCategory.length === 0) {
                return res.status(400).json({ success: false, message: 'Category cannot be empty' });
            }

            if (!quantity || parseFloat(quantity) <= 0) {
                return res.status(400).json({ success: false, message: 'Valid quantity is required' });
            }
            
            if (!unit_type) {
                return res.status(400).json({ success: false, message: 'Unit type is required' });
            }
            
            if (!unit_price || parseFloat(unit_price) <= 0) {
                return res.status(400).json({ success: false, message: 'Valid unit price is required' });
            }

            // Calculate totals
            const qty = parseFloat(quantity) || 0;
            const uPrice = parseFloat(unit_price) || 0;
            const aPaid = parseFloat(amount_paid) || 0;
            
            const total_cost = qty * uPrice;
            const remaining_balance = total_cost - aPaid;
            
            // ✅ ADVANCE PAYMENT DETECTION - NO BLOCKING!
            const isAdvancePayment = aPaid > total_cost;

            const expenseData = {
                date: date,
                category: trimmedCategory,
                description: description ? description.toString().trim() : '',
                quantity: qty,
                unit_type: unit_type.toString().trim(),
                unit_price: uPrice,
                total_cost: total_cost,
                amount_paid: aPaid,
                remaining_balance: remaining_balance,
                is_advance: isAdvancePayment,
                advance_note: advance_note ? advance_note.toString().trim() : 
                              (isAdvancePayment ? 'Advance payment' : null),
                notes: notes ? notes.toString().trim() : ''
            };

            console.log('💾 Saving expense data:', expenseData);

            const expenseId = await ExpenseModel.createExpense(expenseData);
            
            res.status(201).json({
                success: true,
                message: 'Expense created successfully',
                data: { id: expenseId, ...expenseData }
            });
        } catch (error) {
            console.error('❌ Error in createExpense:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error creating expense: ' + error.message 
            });
        }
    },

    // ✅ FIXED: Update expense with ADVANCE PAYMENT SUPPORT
    updateExpense: async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'Invalid expense ID' });
            }

            const {
                date, category, description, quantity, unit_type,
                unit_price, amount_paid, advance_note, notes
            } = req.body;

            // Validation
            if (!date) {
                return res.status(400).json({ success: false, message: 'Date is required' });
            }
            if (!category) {
                return res.status(400).json({ success: false, message: 'Category is required' });
            }
            
            const trimmedCategory = category.toString().trim();
            if (!quantity || parseFloat(quantity) <= 0) {
                return res.status(400).json({ success: false, message: 'Valid quantity is required' });
            }
            if (!unit_type) {
                return res.status(400).json({ success: false, message: 'Unit type is required' });
            }
            if (!unit_price || parseFloat(unit_price) <= 0) {
                return res.status(400).json({ success: false, message: 'Valid unit price is required' });
            }

            const qty = parseFloat(quantity);
            const uPrice = parseFloat(unit_price);
            const aPaid = parseFloat(amount_paid) || 0;
            
            const total_cost = qty * uPrice;
            const remaining_balance = total_cost - aPaid;
            
            // ✅ ADVANCE PAYMENT DETECTION
            const isAdvancePayment = aPaid > total_cost;

            const expenseData = {
                date,
                category: trimmedCategory,
                description: description ? description.toString().trim() : '',
                quantity: qty,
                unit_type: unit_type.toString().trim(),
                unit_price: uPrice,
                total_cost,
                amount_paid: aPaid,
                remaining_balance,
                is_advance: isAdvancePayment,
                advance_note: advance_note ? advance_note.toString().trim() : 
                              (isAdvancePayment ? 'Advance payment' : null),
                notes: notes ? notes.toString().trim() : ''
            };

            const affectedRows = await ExpenseModel.updateExpense(id, expenseData);
            
            if (affectedRows > 0) {
                res.json({ success: true, message: 'Expense updated successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Expense not found' });
            }
        } catch (error) {
            console.error('Error in updateExpense:', error);
            res.status(500).json({ success: false, message: 'Error updating expense: ' + error.message });
        }
    },

    // Delete expense
    deleteExpense: async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!id || id === 'undefined' || id === undefined) {
                return res.status(400).json({ success: false, message: 'Invalid expense ID' });
            }
            
            const expenseId = parseInt(id);
            
            if (isNaN(expenseId)) {
                return res.status(400).json({ success: false, message: 'Invalid expense ID' });
            }

            const affectedRows = await ExpenseModel.deleteExpense(expenseId);
            
            if (affectedRows > 0) {
                res.json({ success: true, message: 'Expense deleted successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Expense not found' });
            }
        } catch (error) {
            console.error('Error in deleteExpense controller:', error);
            res.status(500).json({ success: false, message: 'Error deleting expense: ' + error.message });
        }
    },

    // Get material totals
    getMaterialTotals: async (req, res) => {
        try {
            const materialTotals = await ExpenseModel.getMaterialTotals();
            res.json({ success: true, data: materialTotals });
        } catch (error) {
            console.error('Error in getMaterialTotals:', error);
            res.status(500).json({ success: false, message: 'Error fetching material totals' });
        }
    }
};

module.exports = expenseController;