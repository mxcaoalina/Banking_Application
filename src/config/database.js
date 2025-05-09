require('dotenv').config();

const dbConfig = {
  uri: process.env.MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority'
  },
  // Connection retry settings
  retryAttempts: 5,
  retryDelay: 5000, // 5 seconds
};

module.exports = dbConfig; 