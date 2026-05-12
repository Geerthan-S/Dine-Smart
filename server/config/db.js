const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('   Error:', error.message);
    console.error('');
    console.error('   To fix this, choose ONE of the following:');
    console.error('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.error('      Then run: mongod');
    console.error('   2. Use MongoDB Atlas (free cloud): https://www.mongodb.com/cloud/atlas');
    console.error('      Then update MONGO_URI in server/.env with your Atlas connection string');
    console.error('');
    process.exit(1);
  }
};

module.exports = connectDB;
