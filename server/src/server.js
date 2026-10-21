const app = require('./app');
const config = require('./config/config');
const { connectDB, disconnectDB } = require('./config/db');
const printerSimulator = require('./jobs/printerSimulator');
const cleanupCron = require('./jobs/cleanupCron');
const logger = require('./utils/logger');

let server = null;

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Auto-seed if database is empty
    const Kiosk = require('./models/Kiosk');
    const kioskCount = await Kiosk.countDocuments();
    if (kioskCount === 0) {
      logger.info('Database is unseeded. Running automatic database seed...');
      const seed = require('./scripts/seed');
      await seed(false);
    }

    // Start background simulator and cleanup jobs
    printerSimulator.start(2500); // Progress tick every 2.5s for snappy demonstration
    cleanupCron.start();

    server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 Smart Campus Print Server running on port ${config.port}`);
      logger.info(`📍 API Health: http://localhost:${config.port}/api/health`);
      logger.info(`🖥️  Client URL: ${config.clientUrl}`);
      logger.info(`=======================================================`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Gracefully shutting down server...`);
  printerSimulator.stop();
  cleanupCron.stop();

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Export app instance for Vercel Serverless / Services deployment
module.exports = app;

// Start listener for standalone/local Node execution
if (require.main === module || (!process.env.VERCEL && process.env.NODE_ENV !== 'test')) {
  startServer();
}
