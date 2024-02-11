const MongoClient = require('mongodb').MongoClient;
const url         = process.env.MONGODB_URI;
let db;
 
console.log(url); // Debugging the URI

async function connectDB() {
    try {
        const client = await MongoClient.connect(url, { useUnifiedTopology: true });
        console.log("Connected successfully to db server");
        db = client.db(process.env.DB_NAME);
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}


async function create(name, email, password) {
    const collection = getDb().collection('users');
    const balance = Math.floor(Math.random() * 101);
    const doc = { name, email, password, balance };
    return collection.insertOne(doc);
}

async function find(email) {
    const collection = getDb().collection('users');
    return collection.find({ email: email }).toArray();
}

async function findOne(email) {
    const collection = getDb().collection('users');
    return collection.findOne({ email: email });
}

async function findOneByGoogleId(googleId) {
    const collection = getDb().collection('users');
    return collection.findOne({ googleId: googleId });
}

async function findOrCreateUserByGoogle({ googleId, email, name }) {
    // Try to find the user first
    const existingUser = await this.findOneByGoogleId(googleId);
    if (existingUser) {
        return existingUser; // User exists, return them
    } else {
        // User doesn't exist, create a new user
        const newUser = {
            name: name,
            email: email,
            googleId: googleId,
            // You might not have a password for users signing in with Google
        };
        // Assuming dal.create can handle creating users without a password if they're OAuth users
        return this.create(newUser);
    }
}

async function update(email, amount) {
    const collection = getDb().collection('users');
    console.log(`Updating user ${email} with amount ${amount}`); // Debugging log
    try {
        const user = await collection.findOne({ email: email });
        if (!user) {
            console.log(`User not found for email ${email}`);
            return { success: false, message: 'Account not found' };
        }

        // Check if the operation is a withdrawal and if it exceeds the user's current balance
        if (amount < 0 && (user.balance + amount) < 0) {
            console.log(`Insufficient funds for withdrawal by ${email}`);
            return { success: false, message: 'Insufficient funds' };
        }


        const result = await collection.findOneAndUpdate(
            { email: email },
            { $inc: { balance: amount } },
            { returnDocument: 'after' }
        );
        console.log('Update result:', result); // Log the result to see what's happening
        if (result && result.email) {
            return { success: true, value: result };
        } else {
            console.log(`No document found or updated for email ${email}`);
            return { success: false, message: 'Update failed or account not found' };
        }
    } catch (error) {
        console.error('Update operation failed:', error);
        return { success: false, message: 'Internal server error', error: error.message };
    }
}


async function all() {
    const collection = getDb().collection('users');
    return collection.find({}).toArray();
}


module.exports = { connectDB, create, findOne, find, update, all, findOneByGoogleId };