const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  balance: {
    type: String, // Encrypted balance after transaction
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 