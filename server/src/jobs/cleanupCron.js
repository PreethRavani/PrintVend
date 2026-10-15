const cleanupService = require('../services/cleanupService');
const logger = require('../utils/logger');
const config = require('../config/config');

class CleanupCron {
  constructor() {
    this.intervalId = null;
  }

  start() {
    const intervalMs = config.autoCleanupIntervalMinutes * 60 * 1000;
    logger.info(`Starting cleanup cron job (runs every ${config.autoCleanupIntervalMinutes} minutes)...`);

    // Run once after 1 minute startup
    setTimeout(() => {
      cleanupService.cleanupExpiredSessions().catch((e) => logger.error('Initial cleanup error:', e));
    }, 60000);

    this.intervalId = setInterval(async () => {
      try {
        await cleanupService.cleanupExpiredSessions();
      } catch (err) {
        logger.error('Error running automated cleanup cron:', err);
      }
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Cleanup cron stopped.');
    }
  }
}

module.exports = new CleanupCron();
