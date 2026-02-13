const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.get('/expenses/excel', 
    authMiddleware.verifyToken, 
    reportController.downloadExpenseReport
);

router.get('/materials/excel', 
    authMiddleware.verifyToken, 
    reportController.downloadMaterialSummary
);

module.exports = router;