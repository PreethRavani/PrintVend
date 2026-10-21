const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

let memoryServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const maskedUri = config.mongodbUri ? config.mongodbUri.replace(/:[^:@]+@/, ':****@') : 'undefined';

  try {
    // Attempt connection to configured URI
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info(`MongoDB Connected successfully to: ${maskedUri}`);
  } catch (primaryErr) {
    logger.error(`Could not connect to MongoDB at ${maskedUri}: ${primaryErr.message}`);

    // On Vercel or in production, do NOT attempt mongodb-memory-server (it cannot run in serverless sandbox)
    if (process.env.VERCEL || config.env === 'production') {
      const isLocalhost = config.mongodbUri.includes('127.0.0.1') || config.mongodbUri.includes('localhost');
      if (isLocalhost) {
        throw new Error(
          'MONGODB_URI is still set to localhost or not configured in Vercel Environment Variables. Please set your MongoDB Atlas connection string in Vercel Project Settings.'
        );
      }
      if (config.mongodbUri.includes('xxxx') || config.mongodbUri.includes('<') || config.mongodbUri.includes('>')) {
        throw new Error(
          'MONGODB_URI contains a placeholder (such as "xxxx" or "<db_password>"). Please copy your exact cluster hostname from MongoDB Atlas into Vercel Environment Variables.'
        );
      }
      throw new Error(
        `Failed to connect to MongoDB Atlas (${primaryErr.message}). Please verify your Atlas password and ensure IP 0.0.0.0/0 is active in Atlas Network Access.`
      );
    }

    // In local dev/test environments only, fallback to in-memory MongoDB
    try {
      logger.info('Initializing in-memory MongoDB server for prototype persistence...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      logger.info(`Connected to In-Memory MongoDB at: ${memUri}`);
    } catch (memErr) {
      logger.error('Failed to start in-memory MongoDB fallback', memErr);
      throw primaryErr;
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
