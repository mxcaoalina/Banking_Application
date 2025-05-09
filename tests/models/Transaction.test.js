const mongoose = require('mongoose');
const Transaction = require('../../src/models/Transaction');
const User = require('../../src/models/User');

describe('Transaction Model Test', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Transaction.deleteMany({});
  });

  it('should create & save transaction successfully', async () => {
    const validTransaction = new Transaction({
      userId: testUser._id,
      type: 'deposit',
      amount: 100,
      balance: '100',
      description: 'Test deposit'
    });
    
    const savedTransaction = await validTransaction.save();
    
    expect(savedTransaction._id).toBeDefined();
    expect(savedTransaction.userId.toString()).toBe(testUser._id.toString());
    expect(savedTransaction.type).toBe('deposit');
    expect(savedTransaction.amount).toBe(100);
    expect(savedTransaction.balance).toBe('100');
  });

  it('should fail to save transaction without required fields', async () => {
    const transactionWithoutRequiredField = new Transaction({
      type: 'deposit',
      amount: 100
    });
    
    let err;
    try {
      await transactionWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.userId).toBeDefined();
    expect(err.errors.balance).toBeDefined();
  });

  it('should fail to save transaction with invalid type', async () => {
    const transactionWithInvalidType = new Transaction({
      userId: testUser._id,
      type: 'invalid_type',
      amount: 100,
      balance: '100'
    });
    
    let err;
    try {
      await transactionWithInvalidType.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.type).toBeDefined();
  });

  it('should fail to save transaction with negative amount', async () => {
    const transactionWithNegativeAmount = new Transaction({
      userId: testUser._id,
      type: 'deposit',
      amount: -100,
      balance: '100'
    });
    
    let err;
    try {
      await transactionWithNegativeAmount.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.amount).toBeDefined();
  });
}); 