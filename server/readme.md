# 🏗️ Construction Expense Tracker - Complete Documentation

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![License](https://img.shields.io/badge/license-MIT-yellow)

A complete construction expense management system with admin portal, advance payments, and Excel reports

</div>

---

 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Requirements](#-system-requirements)
- [Installation Guide](#-installation-guide)
- [Database Setup](#-database-setup)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Overview

**Construction Expense Tracker** is a full-stack web application designed specifically for the construction industry to manage project expenses efficiently. It provides a centralized platform for tracking material costs, labor payments, advance payments, and generating detailed financial reports.

### 🎨 Why This Project?
- ✅ **No more Excel sheets** - Centralized digital expense tracking
- ✅ **Real-time updates** - Instant visibility of project costs
- ✅ **Advance payment support** - Pay more than actual cost when needed
- ✅ **Material-wise tracking** - Know exactly how much cement, bricks, steel used
- ✅ **Professional reports** - Excel downloads for accounts department

---

## ✨ Key Features

### 🔐 **Secure Admin Portal**
| Feature | Description |
|---------|-------------|
| Login System | Secure authentication with bcrypt password hashing |
| Session Management | JWT token-based with HTTP-only cookies |
| Password Change | Admin can change password anytime |
| No Default Credentials | First admin created via setup script |

### 💰 **Expense Management**
| Feature | Description |
|---------|-------------|
| Add Expenses | Date, category, quantity, unit price, total cost |
| **Advance Payment** | ✅ Pay MORE than total cost - negative balance shown in green |
| Auto-calculation | Total cost = Quantity × Unit Price |
| Remaining Balance | Automatically calculated |
| Categories | Brick, Cement, Labour, Marble, Steel, Sand, Other |
| Edit/Delete | Full CRUD operations |
| Notes Field | Additional information for each expense |

### 📊 **Dashboard**
| Feature | Description |
|---------|-------------|
| Summary Cards | Total Cost, Total Paid, Remaining Balance, Total Entries |
| Recent Expenses | Last 5 expenses with status |
| Material Summary | Quick view of material consumption |
| Payment Status | Paid, Pending, Advance badges |
| Real-time Data | Auto-refresh every 30 seconds |

### 📈 **Reports & Analytics**
| Feature | Description |
|---------|-------------|
| Monthly Summary | Month-wise expense breakdown |
| Category Analysis | Category-wise total expense and paid amounts |
| **Excel Export** | ✅ 4-sheet comprehensive report |
| Material Totals | Total quantity of each material used |
| Advance Tracking | Separate column for advance payments |

### 🎨 **User Interface**
| Feature | Description |
|---------|-------------|
| Responsive Design | Works on mobile, tablet, desktop |
| Modern UI | Bootstrap 5 with custom gradients |
| Status Badges | Color-coded payment status |
| Loading States | Spinners and animations |
| Error Handling | User-friendly error messages |

---

## 🛠️ Technology Stack

### **Frontend**
```
├── HTML5              - Structure
├── CSS3              - Custom styling
├── Bootstrap 5       - Responsive framework
├── JavaScript ES6    - Client-side logic
├── Chart.js          - Data visualization
├── AOS              - Scroll animations
└── Bootstrap Icons  - Icon set
```

### **Backend**
```
├── Node.js           - Runtime environment
├── Express.js        - Web framework
├── MySQL2           - Database driver
├── bcryptjs         - Password hashing
├── jsonwebtoken     - JWT authentication
├── exceljs          - Excel report generation
├── cookie-parser    - Cookie management
└── dotenv           - Environment variables
```

### **Database**
```
├── MySQL 8.0        - Relational database
├── utf8mb4_0900_ai_ci - Collation
└── Tables: admins, expenses, material_summary, report_downloads
```

---

## 💻 System Requirements

### **Development Environment**
| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| Node.js | v14.x | v18.x or higher |
| MySQL | v5.7 | v8.0 or higher |
| RAM | 2GB | 4GB |
| Storage | 500MB | 1GB |
| OS | Windows 10 / Ubuntu 20.04 / macOS 11 | Any |

### **Browser Support**
| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Edge | 90+ |
| Safari | 14+ |
| Opera | 76+ |

---

## 📦 Installation Guide

### **Step 1: Clone Repository**
```bash
git clone https://github.com/your-username/construction-expense-tracker.git
cd construction-expense-tracker
```

### **Step 2: Install Backend Dependencies**
```bash
cd server
npm install
```

**This will install:**
```json
{
  "express": "^4.18.2",
  "mysql2": "^3.6.0",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "body-parser": "^1.20.2",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "express-session": "^1.17.3",
  "cookie-parser": "^1.4.6",
  "exceljs": "^4.4.0",
  "nodemon": "^3.0.1"
}
```

### **Step 3: Install MySQL**
```bash
# Windows - Download from https://dev.mysql.com/downloads/
# Ubuntu
sudo apt update
sudo apt install mysql-server -y

# macOS
brew install mysql
```

---

## 🗄️ Database Setup

### **Method 1: Automated Setup (Recommended)**
```bash
# Login to MySQL
mysql -u root -p

# Copy and paste the entire database.sql content
SOURCE database.sql;

# Exit
EXIT;
```

### **Method 2: Manual Setup**

**Step 1: Create Database**
```sql
CREATE DATABASE construction_manager;
USE construction_manager;
```

**Step 2: Create Tables**

```sql
-- Admins table for authentication
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Expenses table with advance payment support
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) NOT NULL,
    unit_type VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
    remaining_balance DECIMAL(12,2) NOT NULL,
    is_advance BOOLEAN DEFAULT FALSE,
    advance_note TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Material summary table for automatic calculations
CREATE TABLE material_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    total_quantity DECIMAL(12,2) DEFAULT 0,
    unit_type VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Report downloads tracking
CREATE TABLE report_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    report_type VARCHAR(50),
    download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_format VARCHAR(10),
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

**Step 3: Create Admin Account**
```bash
cd server
node scripts/create-admin.js
```

---

## ⚙️ Configuration

### **Environment Variables (.env)**

Create `.env` file in `server/` folder:

```env
# ====================================
# DATABASE CONFIGURATION
# ====================================
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here    # Leave empty if no password
DB_NAME=construction_manager
PORT=3000

# ====================================
# SECURITY KEYS (CHANGE IN PRODUCTION!)
# ====================================
JWT_SECRET=your_super_secret_key_change_this_in_production_2026
SESSION_SECRET=your_session_secret_change_this_in_production_2026
```

### **Database Connection (config/db.js)**

```javascript
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
    multipleStatements: true
});

const promisePool = pool.promise();

const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connected successfully!');
        await connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

testConnection();
module.exports = promisePool;
```

---

## 🚀 Running the Application

### **Development Mode**
```bash
cd server
npm run dev
```
Server starts at: http://localhost:3000

### **Production Mode**
```bash
cd server
npm start
```

### **Create Admin Account**
```bash
cd server
npm run create-admin

# Follow prompts:
# Username: admin
# Password: admin123
# Name: Administrator
# Email: admin@construction.com
```

### **Test Database Connection**
```bash
cd server
node test-db-connection.js
```

### **Fix Collation Issues**
```bash
cd server
node fix-collation.js
```

---

## 📡 API Documentation

### **Authentication Routes**

#### `POST /api/auth/login`
Admin login.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Administrator",
    "role": "super_admin"
  }
}
```

#### `POST /api/auth/logout`
Admin logout.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### `GET /api/auth/me`
Get current user info.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "name": "Administrator",
    "email": "admin@construction.com",
    "role": "super_admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Expense Routes**

#### `GET /api/expenses`
Get all expenses.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2024-01-15",
      "category": "Cement",
      "description": "Ordinary Portland Cement",
      "quantity": 100,
      "unit_type": "Bags",
      "unit_price": 1200,
      "total_cost": 120000,
      "amount_paid": 150000,
      "remaining_balance": -30000,
      "is_advance": true,
      "advance_note": "Advance for next order",
      "payment_status": "Advance"
    }
  ]
}
```

#### `POST /api/expenses`
Create new expense with advance payment support.

**Request:**
```json
{
  "date": "2024-03-15",
  "category": "Cement",
  "description": "Portland Cement",
  "quantity": 50,
  "unit_type": "Bags",
  "unit_price": 1200,
  "amount_paid": 70000,
  "advance_note": "Advance payment",
  "notes": "Urgent delivery"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": 8,
    "total_cost": 60000,
    "remaining_balance": -10000,
    "is_advance": true
  }
}
```

#### `PUT /api/expenses/:id`
Update expense.

#### `DELETE /api/expenses/:id`
Delete expense.

#### `GET /api/expenses/materials/totals`
Get material-wise totals.

### **Summary Routes**

#### `GET /api/summary`
Get dashboard summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_cost": 11276500,
      "total_paid": 12345000,
      "remaining_balance": -1068500,
      "total_advance": 1068500,
      "total_entries": 7,
      "advance_entries": 5
    },
    "monthly": [...],
    "category": [...]
  }
}
```

### **Report Routes**

#### `GET /api/reports/expenses/excel`
Download complete Excel report (4 sheets).

#### `GET /api/reports/materials/excel`
Download material summary Excel.

---

## 📁 Project Structure

```
construction-expense-tracker/
│
├── server/                          # Backend application
│   ├── config/
│   │   └── db.js                  # Database connection
│   │
│   ├── controllers/               # Business logic
│   │   ├── authController.js      # Login/logout logic
│   │   ├── expenseController.js   # CRUD operations
│   │   ├── summaryController.js   # Dashboard data
│   │   └── reportController.js    # Excel generation
│   │
│   ├── models/                    # Database queries
│   │   ├── adminModel.js          # Admin operations
│   │   └── expenseModel.js        # Expense operations
│   │
│   ├── routes/                    # API endpoints
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── summaryRoutes.js
│   │   └── reportRoutes.js
│   │
│   ├── middleware/                # Authentication
│   │   └── authMiddleware.js
│   │
│   ├── scripts/                  # Utility scripts
│   │   └── create-admin.js       # Admin creation
│   │
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main application
│   ├── package.json
│   └── database.sql              # Database schema
│
└── public/                        # Frontend application
    ├── index.html                # Landing page
    ├── login.html                # Login page
    ├── dashboard.html            # Dashboard page
    ├── expenses.html             # Expense management
    ├── reports.html              # Reports page
    │
    ├── css/
    │   └── style.css            # Custom styles
    │
    └── js/                       # Frontend logic
        ├── login.js             # Login handler
        ├── dashboard.js         # Dashboard logic
        ├── expenses.js          # CRUD operations
        └── reports.js           # Reports & charts
```

---

## 🚢 Deployment

### **Option 1: Railway.app (Recommended - Free)**

1. **Push code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/construction-manager.git
git push -u origin main
```

2. **Deploy on Railway:**
   - Visit [Railway.app](https://railway.app)
   - Login with GitHub
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Add MySQL database: "New" → "Database" → "MySQL"
   - Add environment variables from .env
   - Deploy! (2-3 minutes)

3. **Get your URL:**
   - Railway automatically provides: `https://construction-manager.up.railway.app`

### **Option 2: Render**

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: construction-manager
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
```

2. Deploy:
   - Connect GitHub repository
   - Add MySQL database
   - Deploy

### **Option 3: VPS (DigitalOcean, AWS, etc.)**

```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Clone repository
git clone https://github.com/your-username/construction-manager.git
cd construction-manager/server

# Install dependencies
npm install

# Setup database
mysql -u root -p < database.sql

# Setup environment
nano .env
# Add your environment variables

# Install PM2
npm install -g pm2
pm start server.js --name construction-manager

# Setup Nginx
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/construction-manager
```

---

## 🔧 Troubleshooting

### **Common Issues & Solutions**

<details>
<summary><b>❌ Illegal mix of collations error</b></summary>

**Error:** `Illegal mix of collations (utf8mb4_0900_ai_ci) and (utf8mb4_unicode_ci)`

**Solution:**
```sql
USE construction_manager;
ALTER TABLE expenses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE admins CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
ALTER TABLE material_summary CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```
</details>

<details>
<summary><b>❌ Cannot find module 'exceljs'</b></summary>

**Solution:**
```bash
cd server
npm install exceljs
```
</details>

<details>
<summary><b>❌ Invalid username or password</b></summary>

**Solution:**
```bash
cd server
node scripts/create-admin.js
# Create fresh admin account
```
</details>

<details>
<summary><b>❌ Port 3000 already in use</b></summary>

**Solution - Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

**Solution - Mac/Linux:**
```bash
lsof -i :3000
kill -9 [PID]
```
</details>

<details>
<summary><b>❌ ER_ACCESS_DENIED_ERROR</b></summary>

**Solution:**
1. Check MySQL credentials in .env
2. Reset MySQL password:
```bash
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
```
</details>

<details>
<summary><b>❌ Cannot POST /api/expenses</b></summary>

**Solution:**
1. Check if server is running
2. Check API_BASE in frontend JS files
3. Should be: `const API_BASE = 'http://localhost:3000/api';`
</details>

---

## ❓ FAQ

### **Q1: Is this project completely free?**
**A:** Yes! 100% free and open-source. You can host it on Railway.app for free (500 hours/month).

### **Q2: Can I pay more than the total cost?**
**A:** Yes! The system supports advance payments. When you pay more than total cost, it shows as negative balance in green and marks as "Advance".

### **Q3: How do I download Excel reports?**
**A:** Go to Reports page → Click "Download Full Report" → Excel file with 4 sheets downloads automatically.

### **Q4: What if I forget admin password?**
**A:** Run `npm run create-admin` in server folder and create a new admin account.

### **Q5: Can I use this on mobile?**
**A:** Yes! Fully responsive - works on phones, tablets, and desktops.

### **Q6: How do I fix collation errors?**
**A:** Run the SQL commands in troubleshooting section or use `node fix-collation.js`.

### **Q7: Can I add more categories?**
**A:** Yes! Edit the category dropdown in `expenses.html` and update the database.

### **Q8: Is there a demo available?**
**A:** Demo credentials: username `admin`, password `admin123`

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Development Process**

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit changes**
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. **Push to branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open Pull Request**

### **Contribution Guidelines**

- ✅ Write clear commit messages
- ✅ Test your changes locally
- ✅ Update documentation if needed
- ✅ Follow existing code style
- ✅ Add comments for complex logic

### **Development Roadmap**

- [ ] Multi-project support
- [ ] Budget planning
- [ ] Email notifications
- [ ] PDF invoice generation
- [ ] Supplier management
- [ ] Mobile app (React Native)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Abdul Qadoos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Developer

**Abdul Qadoos**
- 📧 Email: gulmalano2@gmail.com
- 🐙 GitHub: [@gulmalano](https://github.com/gulmalano)
- 💼 LinkedIn: [Abdul Qadoos](https://linkedin.com/in/gulmalano)

---

## 🙏 Acknowledgments

Special thanks to:
- **Bootstrap Team** - For amazing UI components
- **Express.js Team** - For robust backend framework
- **MySQL Team** - For reliable database
- **Node.js Community** - For excellent packages
- **All Contributors** - For making this project better

---

## 📊 Project Status

| Category | Status |
|----------|--------|
| ✅ Core Features | Complete |
| ✅ Authentication | Complete |
| ✅ CRUD Operations | Complete |
| ✅ Advance Payments | Complete |
| ✅ Excel Reports | Complete |
| ✅ Material Totals | Complete |
| 🟡 Mobile App | In Progress |
| 🟡 Multi-Project | Planned |

---

## 📞 Support

Need help? Have questions?

1. **Check Documentation** - This README file
2. **Open Issue** - [GitHub Issues](https://github.com/gulmalano/construction-manager/issues)
3. **Email** - gulmalano2@gmail.com
4. **Response Time** - Within 24-48 hours

---

## 🎯 Quick Commands Reference

```bash
# Install dependencies
cd server && npm install

# Development mode
npm run dev

# Production mode
npm start

# Create admin
npm run create-admin

# Test database
node test-db-connection.js

# Fix collation
node fix-collation.js

# Generate Excel report
# (Via browser: Reports page → Download button)
```

---

<div align="center">

## ⭐ Star this repository if you find it useful!

**Built with ❤️ for the Construction Industry**

[Report Bug](https://github.com/gulmalano/construction-manager/issues) · 
[Request Feature](https://github.com/gulmalano/construction-manager/issues) · 
[Documentation](https://github.com/gulmalano/construction-manager/wiki)

---

© 2026 Abdul Qadoos. All Rights Reserved.

</div>
