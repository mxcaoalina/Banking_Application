const express = require('express');
const cors = require('cors');
const dal = require('./dal');
const app = express();
const { MongoClient } = require('mongodb');

// Middleware
app.use(express.json());
app.use(cors());
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

// Get MongoDB URI from environment variable or use local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const PORT = process.env.PORT || 3000;

// Update connectDB function
async function connectDB() {
    try {
        console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI}`);
        const client = await MongoClient.connect(MONGODB_URI);
        db = client.db(process.env.DB_NAME || 'badbank');
        console.log('Connected to MongoDB');
        
        // List available collections
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
        
        return db;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

// Initialize database connection and setup routes
async function initializeServer() {
    try {
        console.log('=== Starting server initialization ===');
        console.log('Attempting to connect to database...');
        await connectDB();
        console.log('Database connected successfully');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log('=== Server initialization completed ===');
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}

// Add error handling middleware
app.use(errorHandler);

// Start the server
console.log('Starting server...');
initializeServer(); 