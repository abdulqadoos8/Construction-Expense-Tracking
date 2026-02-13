const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixAuthFinal() {
    console.log('🔧 FINAL AUTH FIX - 100% GUARANTEED\n');
    
    // Generate REAL random hash
    console.log('1️⃣ Generating REAL random bcrypt hash...');
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('admin123', salt);
    console.log('   ✅ Hash generated:', hash);
    console.log('   ✅ Hash test:', await bcrypt.compare('admin123', hash) ? 'PASSED' : 'FAILED');
    console.log('');
    
    // Connect to database
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'construction_manager'
    });
    
    try {
        console.log('2️⃣ Connecting to database...');
        await connection.connect();
        console.log('   ✅ Connected');
        console.log('');
        
        // Set collation
        await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci');
        
        // Delete existing admin
        console.log('3️⃣ Removing corrupted admin...');
        const [deleteResult] = await connection.query('DELETE FROM admins WHERE username = ?', ['admin']);
        console.log(`   ✅ Removed ${deleteResult.affectedRows} admin(s)`);
        console.log('');
        
        // Insert new admin with REAL hash
        console.log('4️⃣ Creating new admin with REAL hash...');
        await connection.query(
            'INSERT INTO admins (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)',
            ['admin', hash, 'System Administrator', 'admin@construction.com', 'super_admin']
        );
        console.log('   ✅ Admin created');
        console.log('');
        
        // Verify
        console.log('5️⃣ Verifying admin...');
        const [rows] = await connection.query(
            'SELECT id, username, name, role, created_at FROM admins WHERE username = ?',
            ['admin']
        );
        
        if (rows.length > 0) {
            console.log('   ✅ Admin verified:');
            console.log('   ID:', rows[0].id);
            console.log('   Username:', rows[0].username);
            console.log('   Role:', rows[0].role);
            console.log('');
            
            // Test login
            console.log('6️⃣ Testing login with bcrypt...');
            const [adminRows] = await connection.query(
                'SELECT password FROM admins WHERE username = ?',
                ['admin']
            );
            const storedHash = adminRows[0].password;
            const loginTest = await bcrypt.compare('admin123', storedHash);
            console.log('   🔑 Login test:', loginTest ? '✅ READY TO LOGIN' : '❌ FAILED');
            console.log('');
            
            if (loginTest) {
                console.log('✅✅✅ FIX COMPLETE! ✅✅✅');
                console.log('');
                console.log('🔐 LOGIN WITH THESE CREDENTIALS:');
                console.log('   URL: http://localhost:3000');
                console.log('   Username: admin');
                console.log('   Password: admin123');
                console.log('');
                console.log('📝 Your REAL hash is:');
                console.log('   ' + storedHash);
                console.log('');
            }
        } else {
            console.log('❌ Failed to verify admin');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

fixAuthFinal();