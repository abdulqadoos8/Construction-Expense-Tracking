const db = require('../config/db');
const authConfig = require('../config/auth');

class AdminModel {
    // Create admin table if not exists
    static async initAdminTable() {
        try {
            // Create admins table
            await db.query(`
                CREATE TABLE IF NOT EXISTS admins (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    name VARCHAR(100),
                    email VARCHAR(100),
                    role VARCHAR(50) DEFAULT 'admin',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Check if any admin exists
            const [rows] = await db.query('SELECT COUNT(*) as count FROM admins');
            
            if (rows[0].count === 0) {
                console.log('⚠️ No admin users found. Please create an admin account.');
                console.log('📝 Run: npm run create-admin');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error initializing admin table:', error);
            throw error;
        }
    }

    // Find admin by username
    static async findByUsername(username) {
        try {
            const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
            return rows[0];
        } catch (error) {
            console.error('❌ Error finding admin:', error);
            throw error;
        }
    }

    // Find admin by ID
    static async findById(id) {
        try {
            const [rows] = await db.query(
                'SELECT id, username, name, email, role, created_at FROM admins WHERE id = ?', 
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('❌ Error finding admin by ID:', error);
            throw error;
        }
    }

    // Create new admin
    static async createAdmin(adminData) {
        try {
            const { username, password, name, email, role } = adminData;
            
            // Check if username exists
            const existing = await this.findByUsername(username);
            if (existing) {
                throw new Error('Username already exists');
            }
            
            const hashedPassword = await authConfig.hashPassword(password);
            
            const [result] = await db.query(
                'INSERT INTO admins (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)',
                [username, hashedPassword, name || null, email || null, role || 'admin']
            );
            return result.insertId;
        } catch (error) {
            console.error('❌ Error creating admin:', error);
            throw error;
        }
    }

    // Update admin
    static async updateAdmin(id, adminData) {
        try {
            const { name, email, role } = adminData;
            const [result] = await db.query(
                'UPDATE admins SET name = ?, email = ?, role = ? WHERE id = ?',
                [name || null, email || null, role || 'admin', id]
            );
            return result.affectedRows;
        } catch (error) {
            console.error('❌ Error updating admin:', error);
            throw error;
        }
    }

    // Change password
    static async changePassword(id, newPassword) {
        try {
            const hashedPassword = await authConfig.hashPassword(newPassword);
            const [result] = await db.query(
                'UPDATE admins SET password = ? WHERE id = ?',
                [hashedPassword, id]
            );
            return result.affectedRows;
        } catch (error) {
            console.error('❌ Error changing password:', error);
            throw error;
        }
    }

    // Get all admins
    static async getAllAdmins() {
        try {
            const [rows] = await db.query(
                'SELECT id, username, name, email, role, created_at FROM admins ORDER BY id'
            );
            return rows;
        } catch (error) {
            console.error('❌ Error getting all admins:', error);
            throw error;
        }
    }

    // Delete admin
    static async deleteAdmin(id) {
        try {
            // Don't allow deleting the last super_admin
            const [superAdmins] = await db.query(
                'SELECT * FROM admins WHERE role = "super_admin"'
            );
            
            if (superAdmins.length === 1) {
                const [admin] = await db.query('SELECT role FROM admins WHERE id = ?', [id]);
                if (admin[0]?.role === 'super_admin') {
                    throw new Error('Cannot delete the last super admin');
                }
            }

            const [result] = await db.query('DELETE FROM admins WHERE id = ?', [id]);
            return result.affectedRows;
        } catch (error) {
            console.error('❌ Error deleting admin:', error);
            throw error;
        }
    }
}

module.exports = AdminModel;