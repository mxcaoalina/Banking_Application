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

// Update MongoDB connection with retry logic
async function connectDB() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`Connection attempt ${retryCount + 1} of ${maxRetries}`);
            console.log('Attempting to connect to MongoDB at:', MONGODB_URI);
            
            const client = await MongoClient.connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            
            db = client.db('badbank');
            console.log('Connected to MongoDB');
            
            // List available collections
            const collections = await db.listCollections().toArray();
            console.log('Available collections:', collections.map(c => c.name));
            
            // Set up connection error handler
            client.on('error', (error) => {
                console.error('MongoDB connection error:', error);
            });
            
            return db;
        } catch (error) {
            retryCount++;
            console.error(`Connection attempt ${retryCount} failed:`, error);
            
            if (retryCount === maxRetries) {
                console.error('Max retries reached. Exiting...');
                throw error;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
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