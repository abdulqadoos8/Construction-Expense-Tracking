const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    console.log('\n🔍 Testing Database Connection...');
    console.log('=================================');
    
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'construction_manager'
    };
    
    console.log('📁 Connection Config:');
    console.log(`   Host: ${config.host}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${config.password ? '******' : '(empty)'}`);
    console.log(`   Database: ${config.database}`);
    console.log('');
    
    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL successfully!');
        
        const [rows] = await connection.query('SELECT VERSION() as version');
        console.log(`   MySQL Version: ${rows[0].version}`);
        
        await connection.end();
        console.log('\n✅ Test successful! Your database connection is working.\n');
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('   1. Check your username and password in .env file');
            console.log('   2. Try: DB_PASSWORD= (leave empty if no password)');
            console.log('   3. Reset MySQL password if forgotten');
        }
        else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('   1. Database does not exist. Create it:');
            console.log('      CREATE DATABASE construction_manager;');
        }
        else if (error.code === 'ECONNREFUSED') {
            console.log('   1. MySQL is not running');
            console.log('   2. Start MySQL service:');
            console.log('      - Windows: net start MySQL80');
            console.log('      - Mac: brew services start mysql');
            console.log('      - Linux: sudo systemctl start mysql');
        }
        
        return false;
    }
}

testConnection();