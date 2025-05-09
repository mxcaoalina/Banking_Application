const mongoose = require('mongoose');
const User = require('../../src/models/User');

describe('User Model Test', () => {
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

  it('should create & save user successfully', async () => {
    const validUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    const savedUser = await validUser.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(validUser.name);
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.role).toBe('user');
    expect(savedUser.password).not.toBe('password123'); // Password should be hashed
  });

  it('should fail to save user without required fields', async () => {
    const userWithoutRequiredField = new User({ name: 'Test User' });
    let err;
    
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('should fail to save user with invalid email', async () => {
    const userWithInvalidEmail = new User({
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    });
    
    let err;
    try {
      await userWithInvalidEmail.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('should compare password correctly', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    
    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);
    
    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });
}); 