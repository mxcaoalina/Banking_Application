const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');
const User = require('../../src/models/User');

describe('Account API Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/account/create', () => {
    it('should create a new account', async () => {
      const response = await request(app)
        .post('/api/account/create')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not create account with existing email', async () => {
      // First create a user
      await User.create({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'password123'
      });

      // Try to create another user with same email
      const response = await request(app)
        .post('/api/account/create')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/account/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/account/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/account/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/account/balance/:email', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        balance: '100'
      });
    });

    it('should get user balance', async () => {
      const response = await request(app)
        .get(`/api/account/balance/${testUser.email}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.balance).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/account/balance/nonexistent@example.com');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
}); 