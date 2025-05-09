const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dal = require('./services/dal');

// Import middleware
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const accountRoutes = require('./routes/accountRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['https://badbank-full-stack-capstone-844c728b4974.herokuapp.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static('public'));

// Application middleware
app.use(requestLogger);

// Routes
app.use('/account', accountRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

// Connect to database unless we're running tests
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Routes
app.post('/api/account/create', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const User = require('./models/User');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Create new user
    const user = await User.create({ name, email, password });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/account/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = require('./models/User');
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/account/balance/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const User = require('./models/User');
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, balance: user.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Only start the server if this file is run directly and not in test mode
if (require.main === module && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; 