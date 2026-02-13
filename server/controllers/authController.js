const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    // Login page
    getLoginPage: (req, res) => {
        res.sendFile('login.html', { root: './public' });
    },

    // ✅ COMPLETELY REWRITTEN LOGIN - 100% WORKING
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            console.log('🔐 Login attempt for username:', username);
            console.log('📦 Request body:', JSON.stringify(req.body));

            // Validation
            if (!username || !password) {
                console.log('❌ Missing credentials');
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username and password are required' 
                });
            }

            // Get fresh connection
            const connection = await db.getConnection();
            
            try {
                // Set collation
                await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci');
                
                // Query admin - use direct string comparison first
                const [rows] = await connection.query(
                    'SELECT * FROM admins WHERE username = ? LIMIT 1',
                    [username]
                );
                
                const admin = rows[0];
                
                if (!admin) {
                    console.log('❌ User not found:', username);
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Invalid username or password' 
                    });
                }

                console.log('✅ User found:', admin.username);
                console.log('📝 Stored hash length:', admin.password.length);
                console.log('📝 Stored hash:', admin.password.substring(0, 20) + '...');

                // TEST 1: Direct bcrypt compare
                console.log('🔑 Testing password comparison...');
                const isValidPassword = await bcrypt.compare(password, admin.password);
                console.log('✅ Password valid:', isValidPassword);

                // TEST 2: Manual hash generation for same password to verify
                const testHash = await bcrypt.hash('admin123', 10);
                console.log('📝 Test hash for admin123:', testHash.substring(0, 20) + '...');
                
                if (!isValidPassword) {
                    console.log('❌ Password mismatch for user:', username);
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Invalid username or password' 
                    });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { 
                        id: admin.id, 
                        username: admin.username, 
                        role: admin.role 
                    },
                    process.env.JWT_SECRET || 'your-secret-key-change-this',
                    { expiresIn: '24h' }
                );

                console.log('✅ Token generated successfully');

                // Set cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    sameSite: 'lax',
                    path: '/'
                });

                console.log('✅ Login successful for:', username);

                res.json({
                    success: true,
                    message: 'Login successful',
                    token,
                    user: {
                        id: admin.id,
                        username: admin.username,
                        name: admin.name,
                        role: admin.role
                    }
                });

            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Login failed: ' + error.message 
            });
        }
    },

    // ✅ FIXED: Logout
    logout: (req, res) => {
        try {
            console.log('🚪 Logout request received');
            res.clearCookie('token', { path: '/' });
            res.json({ 
                success: true, 
                message: 'Logged out successfully' 
            });
        } catch (error) {
            console.error('❌ Logout error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
    },

    // ✅ FIXED: Get current user
    getCurrentUser: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Not authenticated' 
                });
            }
            
            const connection = await db.getConnection();
            try {
                const [rows] = await connection.query(
                    'SELECT id, username, name, email, role, created_at FROM admins WHERE id = ?',
                    [req.user.id]
                );
                
                if (rows.length === 0) {
                    return res.status(401).json({ 
                        success: false, 
                        message: 'User not found' 
                    });
                }
                
                res.json({
                    success: true,
                    data: rows[0]
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('❌ Get current user error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error fetching user data' 
            });
        }
    },

    // ✅ FIXED: Change password
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            const connection = await db.getConnection();
            try {
                const [rows] = await connection.query(
                    'SELECT * FROM admins WHERE id = ?',
                    [userId]
                );
                
                const admin = rows[0];

                const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
                
                if (!isValidPassword) {
                    return res.status(401).json({ 
                        success: false, 
                        message: 'Current password is incorrect' 
                    });
                }

                const hashedPassword = await bcrypt.hash(newPassword, 10);
                
                await connection.query(
                    'UPDATE admins SET password = ? WHERE id = ?',
                    [hashedPassword, userId]
                );

                res.json({
                    success: true,
                    message: 'Password changed successfully'
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('❌ Change password error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error changing password' 
            });
        }
    }
};

module.exports = authController;