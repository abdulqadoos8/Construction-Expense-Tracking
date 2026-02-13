const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import middleware
const authMiddleware = require('./middleware/authMiddleware');
const AdminModel = require('./models/adminModel');

// ✅ FIX: CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ✅ FIX: Cookie parser with secret
app.use(cookieParser(process.env.SESSION_SECRET || 'construction_session_secret'));

// ✅ FIX: Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'construction_session_secret',
    resave: false,
    saveUninitialized: false,
    name: 'construction_session',
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// ✅ FIX: Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${req.cookies?.token ? 'Authenticated' : 'Not Authenticated'}`);
    next();
});

// Initialize admin table
AdminModel.initAdminTable().then(() => {
    console.log('✅ Admin table initialized');
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// ✅ FIX: Page Routes
app.get('/login', authMiddleware.redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/dashboard', authMiddleware.requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/expenses', authMiddleware.requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/expenses.html'));
});

app.get('/reports', authMiddleware.requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reports.html'));
});

// ✅ FIX: Root redirect
app.get('/', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        const decoded = require('./config/auth').verifyToken(token);
        if (decoded) {
            return res.redirect('/dashboard');
        }
    }
    res.redirect('/login');
});

// ✅ FIX: 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('⚠️  Login required - No default access!');
});