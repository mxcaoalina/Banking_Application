require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function updateAdminPassword() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        
        const db = client.db('badbank');
        const users = db.collection('users');
        
        // Update admin password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const result = await users.updateOne(
            { email: 'admin@badbank.com' },
            { 
                $set: { 
                    password: hashedPassword,
                    updatedAt: new Date()
                } 
            }
        );
        
        console.log('Password update result:', result);
        
        // Verify the update
        const adminUser = await users.findOne({ email: 'admin@badbank.com' });
        console.log('Admin user details:', {
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            balance: adminUser.balance
        });
        
    } catch (error) {
        console.error('Error updating admin password:', error);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB Atlas');
    }
}

updateAdminPassword(); 