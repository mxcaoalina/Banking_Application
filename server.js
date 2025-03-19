require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dal = require('./dal');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['https://badbank-full-stack-capstone-844c728b4974.herokuapp.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static('public'));

// Add input validation middleware
const validateTransaction = (req, res, next) => {
    const { email, amount } = req.body;
    
    // Validate email format
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        });
    }
    
    // Validate amount is a number
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        return res.status(400).json({
            success: false,
            message: 'Amount must be a number'
        });
    }
    
    next();
};

// Add error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// Add request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
};

// Application middleware
app.use(requestLogger);
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize database connection and setup routes
async function initializeServer() {
    try {
        console.log('=== Starting server initialization ===');
        console.log('Attempting to connect to database...');
        await dal.connectDB();
        console.log('Database connected successfully');
        
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log('=== Server initialization completed ===');
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('Server error:', error);
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use`);
                process.exit(1);
            }
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}

// Account routes
app.post('/account/create', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('=== Starting account creation ===');
        console.log('Creating account for:', { name, email });
        
        const result = await dal.create(name, email, password);
        console.log('Account creation result:', result);
        
        res.json({
            success: true,
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/account/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        
        const user = await dal.findOne(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isValidPassword = await dal.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                balance: user.balance,
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/account/update', validateTransaction, async (req, res) => {
    try {
        const { email, amount } = req.body;
        console.log('Updating account for:', email, 'amount:', amount);
        
        const result = await dal.update(email, Number(amount));
        console.log('Update result:', result);
        
        res.json({
            success: true,
            balance: result.value.balance
        });
    } catch (error) {
        console.error('Error in update:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/account/findOne', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Finding user with email:', email);
        
        const user = await dal.findOne(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove sensitive data before sending
        const safeUser = {
            name: user.name,
            email: user.email,
            balance: user.balance,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json({
            success: true,
            user: safeUser
        });
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/account/balance/:email', async (req, res) => {
    try {
        console.log('=== Starting balance request ===');
        console.log('Raw request params:', req.params);
        
        const email = decodeURIComponent(req.params.email);
        console.log('Decoded email:', email);
        
        console.log('Checking if user exists...');
        const user = await dal.findOne(email);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('Found user balance:', user.balance);
        res.json({
            success: true,
            balance: user.balance
        });
    } catch (error) {
        console.error('Error getting balance:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/account/update-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        console.log('Updating password for:', email);
        
        const result = await dal.updateUserPassword(email, newPassword);
        
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// Add error handling middleware
app.use(errorHandler);

// Start the server
console.log('Starting server...');
initializeServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
}); 