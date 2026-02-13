const mysql = require('mysql2');
require('dotenv').config();

console.log('🔍 Testing Database Connection...');
console.log('📁 Database Config:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ? '******' : '(empty)',
    database: process.env.DB_NAME || 'construction_manager'
});

// Create connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'construction_manager'
});

// Test connection
connection.connect((err) => {
    if (err) {
        console.error('❌ Database Connection FAILED!');
        console.error('Error:', err.message);
        
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n🔧 FIX: Check your MySQL username and password in .env file');
        }
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('\n🔧 FIX: Database does not exist. Run the SQL script first');
        }
        if (err.code === 'ECONNREFUSED') {
            console.log('\n🔧 FIX: MySQL is not running. Start MySQL service');
        }
    } else {
        console.log('✅ Database Connected Successfully!');
        
        // Test query
        connection.query('SELECT NOW() as time', (err, results) => {
            if (err) {
                console.error('❌ Query Failed:', err.message);
            } else {
                console.log('✅ Query Successful! Server Time:', results[0].time);
            }
            
            // Check if table exists
            connection.query('SHOW TABLES LIKE "expenses"', (err, results) => {
                if (err) {
                    console.error('❌ Failed to check tables:', err.message);
                } else {
                    if (results.length > 0) {
                        console.log('✅ Table "expenses" exists');
                        
                        // Count records
                        connection.query('SELECT COUNT(*) as count FROM expenses', (err, results) => {
                            if (err) {
                                console.error('❌ Failed to count records:', err.message);
                            } else {
                                console.log(`📊 Total records in expenses table: ${results[0].count}`);
                            }
                            connection.end();
                        });
                    } else {
                        console.log('❌ Table "expenses" does not exist!');
                        console.log('🔧 Run database.sql to create tables');
                        connection.end();
                    }
                }
            });
        });
    }
});