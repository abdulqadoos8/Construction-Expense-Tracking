-- ============================================
-- CONSTRUCTION MANAGER - COMPLETE DATABASE SETUP
-- WORKS WITH ALL MYSQL VERSIONS
-- ============================================

USE construction_manager;

-- ===== 1. ADD ADVANCE PAYMENT COLUMNS =====
-- Check and add is_advance column
SET @dbname = 'construction_manager';
SET @tablename = 'expenses';
SET @columnname = 'is_advance';
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = @dbname 
     AND table_name = @tablename 
     AND column_name = @columnname) = 0,
    "ALTER TABLE expenses ADD COLUMN is_advance BOOLEAN DEFAULT FALSE",
    "SELECT 'Column is_advance already exists'"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add advance_note column
SET @columnname = 'advance_note';
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = @dbname 
     AND table_name = @tablename 
     AND column_name = @columnname) = 0,
    "ALTER TABLE expenses ADD COLUMN advance_note TEXT",
    "SELECT 'Column advance_note already exists'"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add updated_at column
SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = @dbname 
     AND table_name = @tablename 
     AND column_name = @columnname) = 0,
    "ALTER TABLE expenses ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at",
    "SELECT 'Column updated_at already exists'"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== 2. CREATE MATERIAL_SUMMARY TABLE =====
CREATE TABLE IF NOT EXISTS material_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    total_quantity DECIMAL(12,2) DEFAULT 0,
    unit_type VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category (category)
);

-- ===== 3. CREATE REPORT_DOWNLOADS TABLE =====
CREATE TABLE IF NOT EXISTS report_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    report_type VARCHAR(50),
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_format VARCHAR(10),
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- ===== 4. UPDATE EXISTING ADVANCE PAYMENTS =====
UPDATE expenses 
SET is_advance = TRUE, 
    advance_note = 'Advance payment (auto-detected)' 
WHERE remaining_balance < 0 AND (is_advance IS NULL OR is_advance = FALSE);

-- ===== 5. INITIALIZE MATERIAL_SUMMARY =====
INSERT INTO material_summary (category, total_quantity, unit_type)
SELECT 
    category, 
    SUM(quantity) as total_quantity, 
    unit_type
FROM expenses
GROUP BY category, unit_type
ON DUPLICATE KEY UPDATE
    total_quantity = VALUES(total_quantity),
    unit_type = VALUES(unit_type),
    last_updated = CURRENT_TIMESTAMP;

-- ===== 6. VERIFY CHANGES =====
SELECT '✅ Database update completed successfully!' as status;
SELECT 'Expenses table columns:' as '';
SHOW COLUMNS FROM expenses;
SELECT CONCAT('✅ ', COUNT(*), ' advance payments found') as '' FROM expenses WHERE is_advance = TRUE;
SELECT * FROM material_summary ORDER BY total_quantity DESC LIMIT 5;