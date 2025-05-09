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

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'badbank-secure-encryption-key-2024';
const ENCRYPTION_SALT = process.env.ENCRYPTION_SALT || 'badbank-secure-salt-2024';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-gcm';
const AUTH_TAG_LENGTH = 16;

// Generate a key from the password and salt
const key = crypto.scryptSync(ENCRYPTION_KEY, ENCRYPTION_SALT, 32);

// Encryption function
function encrypt(text) {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        return text.toString(); // Fallback to plain text if encryption fails
    }
}

// Decryption function
function decrypt(text) {
    try {
        // Check if the text is encrypted (contains colons)
        if (!text.includes(':')) {
            return parseFloat(text); // Return plain text value if not encrypted
        }
        const [ivHex, authTagHex, encryptedHex] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return parseFloat(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return parseFloat(text); // Fallback to plain text if decryption fails
    }
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
    console.log('Creating user with:', { name, email, role });
    
    try {
        const db = getDb();
        console.log('Database collection accessed');
        
        // Generate initial balance
        const initialBalance = Math.floor(Math.random() * 100) + 1;
        console.log('Generated initial balance:', initialBalance);
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');
        
        // Encrypt initial balance
        const encryptedBalance = encrypt(initialBalance);
        
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
            password: '[HIDDEN]'
        });
        
        const result = await db.collection('users').insertOne(user);
        console.log('Insert result:', result);
        
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
    console.log('=== Starting findOne function ===');
    console.log('Input email:', email);
    
    try {
        const db = getDb();
        console.log('Database collection accessed');
        
        console.log('Attempting to find user with email:', email);
        const user = await db.collection('users').findOne({ email });
        
        if (user) {
            // Decrypt balance before returning
            const decryptedBalance = decrypt(user.balance);
            const userWithDecryptedBalance = {
                ...user,
                balance: decryptedBalance
            };
            
            console.log('Found user:', {
                email: user.email,
                name: user.name,
                balance: decryptedBalance,
                hasPassword: !!user.password
            });
            
            return userWithDecryptedBalance;
        }
        
        console.log('Error: User not found for email:', email);
        throw new Error('User not found for email: ' + email);
    } catch (error) {
        console.error('Error in findOne function:', error);
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
        password: randomPassword,
        balance: encrypt(0),
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const result = await collection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
}

async function update(email, amount) {
    console.log('=== Starting update function ===');
    console.log('Updating balance for:', { email, amount });
    
    try {
        const db = getDb();
        console.log('Database collection accessed');
        
        // Find the user first to get current balance
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        
        // Decrypt current balance
        const currentBalance = decrypt(user.balance);
        console.log('Current balance:', currentBalance);
        
        // Calculate new balance
        const newBalance = currentBalance + Number(amount);
        console.log('New balance:', newBalance);
        
        // Encrypt new balance
        const encryptedBalance = encrypt(newBalance);
        
        // Update user document
        const result = await db.collection('users').findOneAndUpdate(
            { email },
            { 
                $set: { 
                    balance: encryptedBalance,
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );
        
        if (!result.value) {
            throw new Error('Failed to update user balance');
        }
        
        // Decrypt balance before returning
        const updatedUser = {
            ...result.value,
            balance: newBalance
        };
        
        console.log('Update successful:', {
            email: updatedUser.email,
            newBalance: newBalance
        });
        
        return updatedUser;
    } catch (error) {
        console.error('Error in update function:', error);
        throw error;
    }
}

async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

async function all() {
    try {
        const db = getDb();
        const users = await db.collection('users').find({}).toArray();
        
        // Decrypt balances before returning
        return users.map(user => ({
            ...user,
            balance: decrypt(user.balance)
        }));
    } catch (error) {
        console.error('Error in all function:', error);
        throw error;
    }
}

async function getBalance(email) {
    console.log('=== Starting getBalance function ===');
    console.log('Getting balance for:', email);
    
    try {
        const db = getDb();
        console.log('Database collection accessed');
        
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        
        // Decrypt balance before returning
        const balance = decrypt(user.balance);
        console.log('Balance retrieved:', balance);
        
        return balance;
    } catch (error) {
        console.error('Error in getBalance function:', error);
        throw error;
    }
}

async function updateUserRole(email, role) {
    console.log('=== Starting updateUserRole function ===');
    console.log('Updating role for:', { email, role });
    
    try {
        const db = getDb();
        console.log('Database collection accessed');
        
        const result = await db.collection('users').findOneAndUpdate(
            { email },
            { 
                $set: { 
                    role,
                    updatedAt: new Date()
                }
            },
            { returnDocument: 'after' }
        );
        
        if (!result.value) {
            throw new Error('User not found');
        }
        
        console.log('Role update successful:', {
            email: result.value.email,
            newRole: result.value.role
        });
        
        return result.value;
    } catch (error) {
        console.error('Error in updateUserRole function:', error);
        throw error;
    }
}

async function updateUserPassword(email, newPassword) {
    console.log('=== Starting updateUserPassword function ===');
    console.log('Updating password for:', email);
    
    try {
        const db = getDb();
        console.log('Database collection accessed');
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        console.log('New password hashed successfully');
        
        const result = await db.collection('users').updateOne(
            { email },
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
        console.error('Error in updateUserPassword function:', error);
        throw error;
    }
}

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
    updateUserPassword
}; 