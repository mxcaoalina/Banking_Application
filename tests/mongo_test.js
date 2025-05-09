require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB.');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
  }
}

testConnection(); 