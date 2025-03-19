const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// Use environment variables for MongoDB connection
const url = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'badbank';

let db = null;
let client = null;

// Salt rounds for password hashing
const SALT_ROUNDS = 10;

// Maximum number of connection retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

console.log('Attempting to connect to MongoDB at:', url);

async function connectDB() {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
        try {
            if (db) {
                console.log('Database already connected');
                return db;
            }

            console.log(`Connection attempt ${retries + 1} of ${MAX_RETRIES}`);
            client = await MongoClient.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            db = client.db(dbName);
            console.log('Connected to MongoDB');
            
            // Create indexes if they don't exist
            const usersCollection = db.collection('users');
            await usersCollection.createIndex({ email: 1 }, { unique: true });
            
            // Verify database connection
            const collections = await db.listCollections().toArray();
            console.log('Available collections:', collections.map(col => col.name));
            
            return db;
        } catch (error) {
            console.error(`Connection attempt ${retries + 1} failed:`, error);
            retries++;
            
            if (retries < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY}ms...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            } else {
                console.error('Failed to connect to MongoDB after', MAX_RETRIES, 'attempts');
                throw error;
            }
        }
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return db;
}

async function create(name, email, password, role = 'user') {
    try {
        console.log('=== Starting create function ===');
        console.log('Creating user with:', { name, email, role });
        
        const collection = getDb().collection('users');
        console.log('Database collection accessed');
        
        // Generate random initial balance between 0 and 100
        const initialBalance = Math.floor(Math.random() * 101);
        console.log('Generated initial balance:', initialBalance);
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        console.log('Password hashed successfully');
        
        const now = new Date();
        const doc = {
            name,
            email,
            password: hashedPassword,
            balance: initialBalance,
            role,
            createdAt: now,
            updatedAt: now
        };
        
        console.log('Inserting document:', {
            ...doc,
            password: '[HIDDEN]'
        });
        
        const result = await collection.insertOne(doc);
        console.log('Insert result:', result);
        
        console.log('=== Successfully completed create function ===');
        return result;
    } catch (error) {
        console.error('Error in create function:', error);
        throw error;
    }
}

async function find(email) {
    const collection = getDb().collection('users');
    return collection.find({ email: email }).toArray();
}

async function findOne(email) {
    try {
        console.log('=== Starting findOne function ===');
        console.log('Input email:', email);
        
        if (!email) {
            console.log('Error: Email is required');
            return null;
        }

        const collection = getDb().collection('users');
        console.log('Database collection accessed');
        
        // Try to find the user
        console.log('Attempting to find user with email:', email);
        const user = await collection.findOne({ email: email });
        
        if (!user) {
            console.log('Error: User not found for email:', email);
            return null;
        }
        
        console.log('Found user:', { 
            email: user.email, 
            name: user.name,
            balance: user.balance,
            hasPassword: !!user.password
        });
        
        console.log('=== Successfully completed findOne function ===');
        return user;
    } catch (error) {
        console.error('=== Error in findOne function ===');
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw error;
    }
}

async function findOneByGoogleId(googleId) {
    const collection = getDb().collection('users');
    return collection.findOne({ googleId: googleId });
}

async function findOrCreateUserByGoogle({ googleId, email, name }) {
    const collection = getDb().collection('users');
    
    // Try to find the user first
    const existingUser = await collection.findOne({ googleId: googleId });
    if (existingUser) {
        return existingUser;
    }
    
    // Create a new user with a random secure password for Google OAuth users
    const randomPassword = await bcrypt.hash(Math.random().toString(36), SALT_ROUNDS);
    const newUser = {
        name: name,
        email: email,
        googleId: googleId,
        password: randomPassword, // Store hashed random password
        balance: Math.floor(Math.random() * 101),
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    return collection.insertOne(newUser);
}

// Add logging function
function logEvent(eventType, details) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${eventType}:`, JSON.stringify(details, null, 2));
}

async function update(email, amount) {
    try {
        logEvent('TRANSACTION_START', { email, amount });
        const collection = getDb().collection('users');
        
        // Validate input
        if (!email || typeof email !== 'string') {
            throw new Error('Invalid email format');
        }
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('Invalid amount format');
        }
        
        // Check if user exists
        const user = await collection.findOne({ email: email });
        if (!user) {
            logEvent('TRANSACTION_FAILED', { email, amount, reason: 'User not found' });
            throw new Error('User not found');
        }

        // Check if balance is sufficient (for withdrawal operations)
        if (amount < 0 && (user.balance + amount) < 0) {
            logEvent('TRANSACTION_FAILED', { 
                email, 
                amount, 
                currentBalance: user.balance,
                reason: 'Insufficient funds' 
            });
            throw new Error('Insufficient funds');
        }

        // Use atomic operation to update balance
        const result = await collection.updateOne(
            { email: email },
            { 
                $inc: { balance: amount },
                $set: { updatedAt: new Date() }
            }
        );

        if (result.matchedCount === 0) {
            logEvent('TRANSACTION_FAILED', { email, amount, reason: 'User not found during update' });
            throw new Error('User not found');
        }

        if (result.modifiedCount === 0) {
            logEvent('TRANSACTION_FAILED', { email, amount, reason: 'Update failed' });
            throw new Error('Update failed');
        }
        
        // Get updated user data
        const updatedUser = await collection.findOne({ email: email });
        
        logEvent('TRANSACTION_SUCCESS', {
            email,
            amount,
            oldBalance: user.balance,
            newBalance: updatedUser.balance
        });

        return {
            success: true,
            value: updatedUser
        };
    } catch (error) {
        logEvent('TRANSACTION_ERROR', {
            email,
            amount,
            error: error.message
        });
        throw error;
    }
}

// Password verification function
async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

async function all() {
    const collection = getDb().collection('users');
    return collection.find({}).toArray();
}

async function getBalance(email) {
    try {
        console.log('=== Starting getBalance function ===');
        console.log('Getting balance for email:', email);
        
        const collection = getDb().collection('users');
        const user = await collection.findOne({ email: email });
        
        if (!user) {
            console.log('Error: User not found for email:', email);
            return { 
                success: false, 
                message: 'User not found' 
            };
        }
        
        console.log('Found user balance:', user.balance);
        return { 
            success: true, 
            balance: user.balance 
        };
    } catch (error) {
        console.error('Error in getBalance function:', error);
        return { 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        };
    }
}

async function updateUserRole(email, role) {
    try {
        console.log('=== Starting updateUserRole function ===');
        console.log('Updating role for user:', email, 'to:', role);
        
        const collection = getDb().collection('users');
        console.log('Database collection accessed');
        
        const result = await collection.updateOne(
            { email: email },
            { 
                $set: { 
                    role: role,
                    updatedAt: new Date()
                } 
            }
        );
        
        console.log('Update result:', result);
        return result;
    } catch (error) {
        console.error('Error in updateUserRole function:', error);
        throw error;
    }
}

// Export as an object named 'dal'
module.exports = {
    connectDB,
    create,
    find,
    findOne,
    findOneByGoogleId,
    findOrCreateUserByGoogle,
    update,
    verifyPassword,
    all,
    getBalance,
    updateUserRole,
    logEvent
};