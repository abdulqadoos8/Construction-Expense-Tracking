const authConfig = require('../config/auth');
const AdminModel = require('../models/adminModel');

const authMiddleware = {
    // Verify token middleware
    verifyToken: async (req, res, next) => {
        try {
            // Get token from cookie or header
            let token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Access denied. No token provided.' 
                });
            }

            // Verify token
            const decoded = authConfig.verifyToken(token);
            if (!decoded) {
                res.clearCookie('token');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid or expired token.' 
                });
            }

            // Get user from database
            const admin = await AdminModel.findById(decoded.id);
            if (!admin) {
                res.clearCookie('token');
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found.' 
                });
            }

            // Attach user to request
            req.user = admin;
            next();
        } catch (error) {
            console.error('❌ Auth middleware error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Authentication error.' 
            });
        }
    },

    // Require auth for page routes
    requireAuth: async (req, res, next) => {
        try {
            const token = req.cookies?.token;
            
            if (!token) {
                console.log('❌ No token found, redirecting to login');
                return res.redirect('/login');
            }

            const decoded = authConfig.verifyToken(token);
            if (!decoded) {
                console.log('❌ Invalid token, clearing cookie');
                res.clearCookie('token');
                return res.redirect('/login');
            }

            const admin = await AdminModel.findById(decoded.id);
            if (!admin) {
                console.log('❌ User not found, clearing cookie');
                res.clearCookie('token');
                return res.redirect('/login');
            }

            req.user = admin;
            next();
        } catch (error) {
            console.error('❌ Require auth error:', error);
            res.redirect('/login');
        }
    },

    // Redirect if already authenticated
    redirectIfAuthenticated: async (req, res, next) => {
        try {
            const token = req.cookies?.token;
            if (token) {
                const decoded = authConfig.verifyToken(token);
                if (decoded) {
                    const admin = await AdminModel.findById(decoded.id);
                    if (admin) {
                        return res.redirect('/dashboard');
                    }
                }
            }
            next();
        } catch (error) {
            next();
        }
    },

    // Check if user is admin
    isAdmin: (req, res, next) => {
        if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
            next();
        } else {
            res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin only.' 
            });
        }
    },

    // Check if user is super admin
    isSuperAdmin: (req, res, next) => {
        if (req.user && req.user.role === 'super_admin') {
            next();
        } else {
            res.status(403).json({ 
                success: false, 
                message: 'Access denied. Super admin only.' 
            });
        }
    }
};

module.exports = authMiddleware;