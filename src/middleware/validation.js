// Input validation middleware
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

module.exports = {
    validateTransaction
}; 