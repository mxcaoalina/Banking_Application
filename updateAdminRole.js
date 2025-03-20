require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://LA_PC:admin123@cluster.ucsoruf.mongodb.net/badbank?retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function updateAdminRole() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        
        const db = client.db('badbank');
        const users = db.collection('users');
        
        // Update admin role
        const result = await users.updateOne(
            { email: 'admin@badbank.com' },
            { 
                $set: { 
                    role: 'admin',
                    updatedAt: new Date()
                } 
            }
        );
        
        console.log('Role update result:', result);
        
        // Verify the update
        const adminUser = await users.findOne({ email: 'admin@badbank.com' });
        console.log('Admin user details:', {
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            balance: adminUser.balance
        });
        
    } catch (error) {
        console.error('Error updating admin role:', error);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB Atlas');
    }
}

updateAdminRole(); 