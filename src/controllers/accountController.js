const dal = require('../services/dal');

// Create new account
const createAccount = async (req, res) => {
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
};

// Login
const login = async (req, res) => {
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
};

// Update account balance
const updateBalance = async (req, res) => {
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
};

// Find user
const findUser = async (req, res) => {
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
};

// Get balance
const getBalance = async (req, res) => {
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
};

// Update password
const updatePassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        console.log('Updating password for:', email);
        
        const result = await dal.updateUserPassword(email, newPassword);
        
        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createAccount,
    login,
    updateBalance,
    findUser,
    getBalance,
    updatePassword
}; 