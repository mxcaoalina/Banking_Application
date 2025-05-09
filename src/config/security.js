require('dotenv').config();

const securityConfig = {
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  },
  
  // Password hashing
  bcrypt: {
    saltRounds: 10
  },
  
  // Encryption settings
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 64,
    tagLength: 16
  },
  
  // Session settings
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  
  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

module.exports = securityConfig; 