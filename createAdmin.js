const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function createAdminUser() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        
        const db = client.db('badbank');
        const users = db.collection('users');
        
        // Check if admin already exists
        const existingAdmin = await users.findOne({ email: 'admin@badbank.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }
        
        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = {
            name: 'Admin',
            email: 'admin@badbank.com',
            password: hashedPassword,
            balance: 13,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await users.insertOne(adminUser);
        console.log('Admin user created successfully:', result);
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB Atlas');
    }
}

createAdminUser(); 