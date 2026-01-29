// Test MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔄 Testing MongoDB connection...');
console.log('URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')); // Hide password

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', err.message);
    console.error('\n📋 Common issues:');
    console.error('   1. Check MongoDB Atlas → Network Access → Add IP (0.0.0.0/0)');
    console.error('   2. Verify username/password');
    console.error('   3. Check internet connection');
    console.error('   4. Ensure MongoDB cluster is running');
    process.exit(1);
  });
