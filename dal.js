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

// Migration function to encrypt all existing balances
async function migrateBalances() {
    try {
        const db = getDb();
        const users = await db.collection('users').find({}).toArray();
        
        for (const user of users) {
            // Skip if balance is already encrypted
            if (user.balance && user.balance.includes(':')) {
                continue;
            }
            
            // Encrypt the balance
            const encryptedBalance = encrypt(user.balance);
            
            // Update the user document
            await db.collection('users').updateOne(
                { _id: user._id },
                { $set: { balance: encryptedBalance } }
            );
            
            console.log(`Migrated balance for user: ${user.email}`);
        }
        
        console.log('Balance migration completed successfully');
    } catch (error) {
        console.error('Error during balance migration:', error);
    }
}

// Modify the update function to ensure balances are encrypted
async function update(email, amount) {
    try {
        const db = getDb();
        const user = await findOne(email);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Decrypt current balance if it's encrypted
        const currentBalance = decrypt(user.balance);
        const newBalance = currentBalance + amount;

        if (newBalance < 0) {
            return { success: false, message: 'Insufficient funds' };
        }

        // Encrypt the new balance before saving
        const encryptedBalance = encrypt(newBalance);
        
        const result = await db.collection('users').updateOne(
            { email: email },
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

        // Log the transaction
        logEvent('TRANSACTION_SUCCESS', {
            email,
            amount,
            oldBalance: currentBalance,
            newBalance
        });

        return {
            success: true,
            value: {
                ...user,
                balance: newBalance,
                updatedAt: new Date()
            }
        };
    } catch (error) {
        console.error('Error in update function:', error);
        return { success: false, message: error.message };
    }
}

// Password verification function
async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

async function all() {
    try {
        console.log('=== Starting all function ===');
        const collection = getDb().collection('users');
        const users = await collection.find({}).toArray();
        
        // Decrypt balances for all users
        const usersWithDecryptedBalances = users.map(user => ({
            ...user,
            balance: decrypt(user.balance)
        }));
        
        console.log(`Retrieved ${usersWithDecryptedBalances.length} users with decrypted balances`);
        return usersWithDecryptedBalances;
    } catch (error) {
        console.error('Error in all function:', error);
        throw error;
    }
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
    logEvent,
    migrateBalances
};