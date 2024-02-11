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
        await collection.findOneAndUpdate(
            { email: email },
            { $inc: { balance: amount } }, // Increment (or decrement for withdrawals) the balance
            { returnDocument: 'after' } // Ensure the updated document is returned
        );
        console.log(response);
        if (response.ok && response.value) {
            return { success: true, value: response.value }; // Return a success response with the updated document
        } else {
            return { success: false, message: 'Update failed or account not found' };
        }
    } catch (error) {
        console.error('Update operation failed:', error);
        return { success: false, message: 'Internal server error' };
    }
}

async function all() {
    const collection = getDb().collection('users');
    return collection.find({}).toArray();
}


module.exports = { connectDB, create, findOne, find, update, all, findOneByGoogleId };