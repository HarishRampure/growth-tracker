const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

let isConnected = false;
let isInMemoryFallback = false;

const connectDB = async () => {
  if (isConnected) {
    return true;
  }

  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI || mongoURI.includes('<username>') || mongoURI === '') {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  MongoDB URI not set or invalid in .env. Falling back to high-fidelity In-Memory Database.');
    isInMemoryFallback = true;
    return false;
  }

  try {
    await mongoose.connect(mongoURI);
    isConnected = true;
    isInMemoryFallback = false;
    console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB Atlas Connected Successfully!');
    return true;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ MongoDB Connection Failed:', error.message);
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  Falling back to high-fidelity In-Memory Database.');
    isInMemoryFallback = true;
    return false;
  }
};

const checkDatabaseState = () => {
  return {
    connected: isConnected && mongoose.connection.readyState === 1,
    inMemory: isInMemoryFallback,
    uriSet: !!process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')
  };
};

module.exports = {
  connectDB,
  checkDatabaseState
};
