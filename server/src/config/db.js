const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

let memoryServer = null;

const connectDB = async () => {
  try {
    // Attempt connection to configured URI first
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000
    });
    logger.info(`MongoDB Connected successfully to: ${config.mongodbUri}`);
  } catch (primaryErr) {
    logger.warn(`Could not connect to primary MongoDB at ${config.mongodbUri} (${primaryErr.message}).`);
    
    // In dev or test environments, automatically spin up mongodb-memory-server
    try {
      logger.info('Initializing in-memory MongoDB server for prototype persistence...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      logger.info(`Connected to In-Memory MongoDB at: ${memUri}`);
    } catch (memErr) {
      logger.error('Failed to start in-memory MongoDB fallback', memErr);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB runtime connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    logger.info('MongoDB disconnected cleanly');
  } catch (err) {
    logger.error('Error during MongoDB disconnect:', err);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
