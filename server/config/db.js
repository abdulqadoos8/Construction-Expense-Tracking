const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'construction_manager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,
    multipleStatements: true,
    charset: 'utf8mb4',
    collation: 'utf8mb4_0900_ai_ci'  // CRITICAL: MySQL 8.0 default
});

const promisePool = pool.promise();

const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connected successfully!');
        
        // 🔴 CRITICAL: Force correct collation for EVERY connection
        await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci');
        await connection.query('SET collation_connection = utf8mb4_0900_ai_ci');
        await connection.query('SET collation_database = utf8mb4_0900_ai_ci');
        await connection.query('SET collation_server = utf8mb4_0900_ai_ci');
        
        console.log('✅ Collation forced to: utf8mb4_0900_ai_ci');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

testConnection();

module.exports = promisePool;