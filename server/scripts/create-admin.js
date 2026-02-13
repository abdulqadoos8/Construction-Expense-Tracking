const path = require('path');
const dotenv = require('dotenv');

// ✅ IMPORTANT: Load .env from the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

const mysql = require('mysql2/promise');
const readline = require('readline');
const bcrypt = require('bcryptjs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🔐 ===== ADMIN ACCOUNT SETUP =====\n');

// Database configuration from .env
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'construction_manager',
    multipleStatements: true
};

console.log('📁 Database Configuration:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);
console.log('');

async function createAdmin() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully!\n');

        // Check if admins table exists
        const [tables] = await connection.query('SHOW TABLES LIKE "admins"');
        if (tables.length === 0) {
            console.log('📦 Creating admins table...');
            
            // Create admins table
            await connection.query(`
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
            console.log('✅ Admins table created!\n');
        }

        // Check existing admins
        const [existing] = await connection.query('SELECT COUNT(*) as count FROM admins');
        const adminCount = existing[0].count;
        
        if (adminCount > 0) {
            console.log(`⚠️  ${adminCount} admin account(s) already exist!\n`);
            const answer = await question('Do you want to create another admin? (yes/no): ');
            if (answer.toLowerCase() !== 'yes') {
                console.log('\n❌ Operation cancelled.\n');
                process.exit(0);
            }
            console.log('');
        }

        // Get admin details
        console.log('📝 Please enter new admin details:\n');

        const username = await question('Username: ');
        if (!username || username.trim() === '') {
            console.log('\n❌ Username is required!\n');
            process.exit(1);
        }

        let password;
        while (true) {
            password = await question('Password (min 6 characters): ');
            if (password.length >= 6) break;
            console.log('❌ Password must be at least 6 characters long. Please try again.\n');
        }

        const confirmPassword = await question('Confirm Password: ');
        if (password !== confirmPassword) {
            console.log('\n❌ Passwords do not match!\n');
            process.exit(1);
        }

        const name = await question('Full Name (optional): ');
        const email = await question('Email (optional): ');
        
        let role = 'admin';
        if (adminCount === 0) {
            const roleAnswer = await question('Role (admin/super_admin) [super_admin]: ');
            role = roleAnswer || 'super_admin';
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin
        const [result] = await connection.query(
            'INSERT INTO admins (username, password, name, email, role) VALUES (?, ?, ?, ?, ?)',
            [username.trim(), hashedPassword, name.trim() || null, email.trim() || null, role]
        );

        console.log('\n✅ ===== ADMIN ACCOUNT CREATED SUCCESSFULLY =====');
        console.log(`   ID: ${result.insertId}`);
        console.log(`   Username: ${username}`);
        console.log(`   Name: ${name || 'Not provided'}`);
        console.log(`   Email: ${email || 'Not provided'}`);
        console.log(`   Role: ${role}`);
        console.log('\n🔒 IMPORTANT: Please save these credentials securely!');
        console.log('\n✅ You can now login with this username and password.\n');

    } catch (error) {
        console.error('\n❌ Error creating admin:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n🔧 FIX: Please check your database credentials in server/.env file:');
            console.log('   DB_HOST=localhost');
            console.log('   DB_USER=root');
            console.log('   DB_PASSWORD=your_password_here');
            console.log('   DB_NAME=construction_manager\n');
        }
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n🔧 FIX: Database does not exist. Please create it first:');
            console.log('   CREATE DATABASE construction_manager;\n');
        }
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 FIX: MySQL is not running. Please start MySQL service.\n');
        }
    } finally {
        if (connection) await connection.end();
        rl.close();
        process.exit(0);
    }
}

function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

createAdmin();