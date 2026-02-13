const db = require('../config/db');

class ExpenseModel {
    // Get all expenses
    static async getAllExpenses() {
        try {
            const [rows] = await db.query(`
                SELECT *, 
                CASE 
                    WHEN remaining_balance < 0 THEN 'Advance'
                    WHEN remaining_balance = 0 THEN 'Paid'
                    ELSE 'Pending'
                END as payment_status
                FROM expenses 
                ORDER BY date DESC
            `);
            return rows;
        } catch (error) {
            console.error('Error in getAllExpenses:', error);
            throw error;
        }
    }

    // Get expense by ID
    static async getExpenseById(id) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('Invalid ID');
            }
            const [rows] = await db.query('SELECT * FROM expenses WHERE id = ?', [parseInt(id)]);
            return rows[0];
        } catch (error) {
            console.error('Error in getExpenseById:', error);
            throw error;
        }
    }

    // Create new expense
    static async createExpense(expenseData) {
        try {
            const {
                date, category, description, quantity, unit_type,
                unit_price, total_cost, amount_paid, remaining_balance, 
                is_advance, advance_note, notes
            } = expenseData;

            const query = `
                INSERT INTO expenses 
                (date, category, description, quantity, unit_type, unit_price, 
                 total_cost, amount_paid, remaining_balance, is_advance, advance_note, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                date,
                category,
                description || '',
                parseFloat(quantity) || 0,
                unit_type,
                parseFloat(unit_price) || 0,
                parseFloat(total_cost) || 0,
                parseFloat(amount_paid) || 0,
                parseFloat(remaining_balance) || 0,
                is_advance || false,
                advance_note || null,
                notes || ''
            ];

            const [result] = await db.query(query, values);
            return result.insertId;
        } catch (error) {
            console.error('Error in createExpense:', error);
            throw error;
        }
    }

    // Update expense
    static async updateExpense(id, expenseData) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('Invalid ID');
            }

            const {
                date, category, description, quantity, unit_type,
                unit_price, total_cost, amount_paid, remaining_balance,
                is_advance, advance_note, notes
            } = expenseData;

            const query = `
                UPDATE expenses 
                SET date = ?, category = ?, description = ?, quantity = ?, 
                    unit_type = ?, unit_price = ?, total_cost = ?, 
                    amount_paid = ?, remaining_balance = ?, 
                    is_advance = ?, advance_note = ?, notes = ?
                WHERE id = ?
            `;

            const values = [
                date,
                category,
                description || '',
                parseFloat(quantity) || 0,
                unit_type,
                parseFloat(unit_price) || 0,
                parseFloat(total_cost) || 0,
                parseFloat(amount_paid) || 0,
                parseFloat(remaining_balance) || 0,
                is_advance || false,
                advance_note || null,
                notes || '',
                parseInt(id)
            ];

            const [result] = await db.query(query, values);
            return result.affectedRows;
        } catch (error) {
            console.error('Error in updateExpense:', error);
            throw error;
        }
    }

    // Delete expense
    static async deleteExpense(id) {
        try {
            if (!id || id === 'undefined' || id === undefined || isNaN(parseInt(id))) {
                throw new Error('Invalid expense ID');
            }
            
            const expenseId = parseInt(id);
            const [result] = await db.query('DELETE FROM expenses WHERE id = ?', [expenseId]);
            return result.affectedRows;
        } catch (error) {
            console.error('Error in deleteExpense:', error);
            throw error;
        }
    }

    // Get material totals
    static async getMaterialTotals() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    category,
                    SUM(quantity) as total_quantity,
                    unit_type,
                    COUNT(*) as entry_count,
                    SUM(total_cost) as total_cost,
                    SUM(amount_paid) as total_paid,
                    SUM(CASE WHEN remaining_balance < 0 THEN ABS(remaining_balance) ELSE 0 END) as total_advance
                FROM expenses
                GROUP BY category, unit_type
                ORDER BY total_quantity DESC
            `);
            return rows;
        } catch (error) {
            console.error('Error in getMaterialTotals:', error);
            throw error;
        }
    }

    // Get summary
    static async getSummary() {
        try {
            // Get overall summary
            const [summary] = await db.query(`
                SELECT 
                    COALESCE(SUM(total_cost), 0) as total_cost,
                    COALESCE(SUM(amount_paid), 0) as total_paid,
                    COALESCE(SUM(remaining_balance), 0) as remaining_balance,
                    COALESCE(SUM(CASE WHEN remaining_balance < 0 THEN ABS(remaining_balance) ELSE 0 END), 0) as total_advance,
                    COUNT(*) as total_entries,
                    SUM(CASE WHEN remaining_balance < 0 THEN 1 ELSE 0 END) as advance_entries
                FROM expenses
            `);

            // Get monthly summary
            const [monthlySummary] = await db.query(`
                SELECT 
                    DATE_FORMAT(date, '%Y-%m') as month,
                    SUM(total_cost) as total_expense,
                    SUM(amount_paid) as total_paid,
                    SUM(CASE WHEN remaining_balance < 0 THEN ABS(remaining_balance) ELSE 0 END) as total_advance,
                    COUNT(*) as entry_count
                FROM expenses
                GROUP BY DATE_FORMAT(date, '%Y-%m')
                ORDER BY month DESC
                LIMIT 12
            `);

            // Get category summary
            const [categorySummary] = await db.query(`
                SELECT 
                    category,
                    SUM(total_cost) as total_expense,
                    SUM(amount_paid) as total_paid,
                    SUM(remaining_balance) as remaining_balance,
                    SUM(CASE WHEN remaining_balance < 0 THEN ABS(remaining_balance) ELSE 0 END) as total_advance,
                    COUNT(*) as entry_count,
                    SUM(quantity) as total_quantity,
                    unit_type
                FROM expenses
                GROUP BY category, unit_type
                ORDER BY total_expense DESC
            `);

            return {
                summary: {
                    total_cost: parseFloat(summary[0].total_cost) || 0,
                    total_paid: parseFloat(summary[0].total_paid) || 0,
                    remaining_balance: parseFloat(summary[0].remaining_balance) || 0,
                    total_advance: parseFloat(summary[0].total_advance) || 0,
                    total_entries: parseInt(summary[0].total_entries) || 0,
                    advance_entries: parseInt(summary[0].advance_entries) || 0
                },
                monthly: monthlySummary,
                category: categorySummary
            };
        } catch (error) {
            console.error('Error in getSummary:', error);
            throw error;
        }
    }
}

module.exports = ExpenseModel;