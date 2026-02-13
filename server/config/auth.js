const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = {
    // JWT Secret from env
    jwtSecret: process.env.JWT_SECRET || 'construction_manager_secret_key_2026',
    
    // Session secret
    sessionSecret: process.env.SESSION_SECRET || 'construction_session_secret_2026',
    
    // REMOVED: Default admin credentials from .env - Now only in database!
    
    // Hash password
    hashPassword: async (password) => {
        return await bcrypt.hash(password, 10);
    },

    // Compare password
    comparePassword: async (password, hashedPassword) => {
        return await bcrypt.compare(password, hashedPassword);
    },

    // Generate JWT token
    generateToken: (user) => {
        return jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            authConfig.jwtSecret,
            { expiresIn: '24h' }
        );
    },

    // Verify JWT token
    verifyToken: (token) => {
        try {
            return jwt.verify(token, authConfig.jwtSecret);
        } catch (error) {
            return null;
        }
    }
};

module.exports = authConfig;