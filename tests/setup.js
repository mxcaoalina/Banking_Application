// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/badbank-test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Increase timeout for tests
jest.setTimeout(30000); 