const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware.verifyToken);

// GET all expenses
router.get('/', expenseController.getAllExpenses);

// GET material totals
router.get('/materials/totals', expenseController.getMaterialTotals);

// GET single expense by ID
router.get('/:id', expenseController.getExpenseById);

// POST create new expense
router.post('/', expenseController.createExpense);

// PUT update expense
router.put('/:id', expenseController.updateExpense);

// DELETE expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;