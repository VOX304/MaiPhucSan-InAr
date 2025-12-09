const mongoose = require('mongoose');

async function connect() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/smarthoover';

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected:', uri);
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}

module.exports = { connect };
