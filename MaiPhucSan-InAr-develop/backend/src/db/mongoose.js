/**
 * MongoDB connection via Mongoose.
 *
 * TR2: The project requires MongoDB as persistence layer.
 * This module centralizes connection handling so that:
 *  - `server.js` can await a DB connection before starting
 *  - tests can stub this module if needed
 */
const mongoose = require('mongoose');
const env = require('../config/env');

let connected = false;

/**
 * Connect to MongoDB. Safe to call multiple times.
 * @returns {Promise<mongoose.Mongoose>}
 */
async function connectMongo() {
  if (connected) return mongoose;

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName
  });

  connected = true;
  return mongoose;
}

/**
 * Disconnect from MongoDB (used by tests / graceful shutdown).
 */
async function disconnectMongo() {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}

module.exports = {
  connectMongo,
  disconnectMongo
};
