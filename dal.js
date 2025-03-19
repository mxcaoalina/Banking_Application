require('dotenv').config();
console.log('Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('DB_NAME:', process.env.DB_NAME);

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Use environment variables for MongoDB connection
const url = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!url || !dbName) {
    throw new Error('MongoDB connection details not found in environment variables');
}

let db = null;
let client = null;

// Salt rounds for password hashing
const SALT_ROUNDS = 10;

// Maximum number of connection retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Encryption key and IV from environment variables
const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY, process.env.ENCRYPTION_SALT, 32);
const IV_LENGTH = 16;

// Encryption functions
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

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
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                minPoolSize: 5,
                retryWrites: true,
                w: 'majority',
                authSource: 'admin',
                useUnifiedTopology: true,
                useNewUrlParser: true
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
    console.log('=== Starting create function ===');
    try {
        const db = await getDb();
        console.log('Database collection accessed');
        
        // Check if user exists
        const existingUser = await findOne(email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        
        // Generate initial balance and encrypt it
        const initialBalance = Math.floor(Math.random() * 100) + 1;
        const encryptedBalance = encrypt(initialBalance.toString());
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        console.log('Password hashed successfully');
        
        const user = {
            name,
            email,
            password: hashedPassword,
            balance: encryptedBalance,
            role,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        console.log('Inserting document:', {
            ...user,
            password: '[HIDDEN]',
            balance: '[ENCRYPTED]'
        });
        
        const result = await db.collection('users').insertOne(user);
        console.log('Insert result:', result);
        
        return result;
    } catch (error) {
        console.error('Error in create:', error);
        throw error;
    }
}

async function find(email) {
    const collection = getDb().collection('users');
    return collection.find({ email: email }).toArray();
}

async function findOne(email) {
    console.log('=== Starting findOne function ===');
    try {
        const db = await getDb();
        console.log('Database collection accessed');
        console.log('Attempting to find user with email:', email);
        
        const user = await db.collection('users').findOne({ email });
        
        if (user) {
            // Decrypt balance before sending
            const decryptedBalance = decrypt(user.balance);
            const userWithDecryptedBalance = {
                ...user,
                balance: parseFloat(decryptedBalance)
            };
            
            console.log('Found user:', {
                email: user.email,
                name: user.name,
                balance: userWithDecryptedBalance.balance,
                hasPassword: !!user.password
            });
            
            return userWithDecryptedBalance;
        }
        
        console.log('Error: User not found for email:', email);
        throw new Error('User not found for email: ' + email);
    } catch (error) {
        console.error('Error in findOne:', error);
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
    console.log('=== Starting update function ===');
    try {
        const db = await getDb();
        console.log('Database collection accessed');
        
        // Get current user
        const user = await findOne(email);
        if (!user) {
            throw new Error('User not found');
        }
        
        // Calculate new balance
        const currentBalance = parseFloat(user.balance);
        const newBalance = currentBalance + amount;
        
        // Encrypt new balance
        const encryptedBalance = encrypt(newBalance.toString());
        
        // Update user with encrypted balance
        const result = await db.collection('users').updateOne(
            { email },
            {
                $set: {
                    balance: encryptedBalance,
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.modifiedCount === 0) {
            throw new Error('Update failed');
        }
        
        // Return decrypted balance for response
        return {
            success: true,
            value: {
                ...user,
                balance: newBalance
            }
        };
    } catch (error) {
        console.error('Error in update:', error);
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

async function updateUserPassword(email, newPassword) {
    try {
        console.log('=== Starting password update ===');
        console.log('Updating password for user:', email);
        
        const collection = getDb().collection('users');
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        
        const result = await collection.updateOne(
            { email: email },
            { 
                $set: { 
                    password: hashedPassword,
                    updatedAt: new Date()
                } 
            }
        );
        
        console.log('Password update result:', result);
        return result;
    } catch (error) {
        console.error('Error updating password:', error);
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
    updateUserPassword,
    logEvent
};