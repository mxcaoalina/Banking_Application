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

async function update(email, amount) {
    const collection = getDb().collection('users');
    try {
        console.log(`Updating user ${email} with amount ${amount}`); // Debugging log
        const result = await collection.findOneAndUpdate(
            { email: email },
            { $inc: { balance: amount } },
            { returnDocument: 'after' }
        );
        console.log('Update result:', result); // Log the result to see what's happening
        if (result.value) {
            return { success: true, value: result.value };
        } else {
            console.log(`No document found or updated for email ${email}`); // More detailed log
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