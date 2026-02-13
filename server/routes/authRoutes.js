const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Public routes (no authentication required)
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// ✅ Protected routes (authentication required)
router.get('/me', authMiddleware.verifyToken, authController.getCurrentUser);
router.post('/change-password', authMiddleware.verifyToken, authController.changePassword);

// ✅ IMPORTANT: Remove any routes that don't have controller functions
// The following routes were causing the error - COMMENT THEM OUT:
// router.get('/admins', authMiddleware.verifyToken, authMiddleware.isSuperAdmin, authController.getAllAdmins);
// router.post('/admins', authMiddleware.verifyToken, authMiddleware.isSuperAdmin, authController.createAdmin);
// router.put('/admins/:id', authMiddleware.verifyToken, authMiddleware.isSuperAdmin, authController.updateAdmin);
// router.delete('/admins/:id', authMiddleware.verifyToken, authMiddleware.isSuperAdmin, authController.deleteAdmin);

module.exports = router;