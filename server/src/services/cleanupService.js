const Document = require('../models/Document');
const PrintSession = require('../models/PrintSession');
const { deleteFile } = require('./storageService');
const logger = require('../utils/logger');

class CleanupService {
  /**
   * Safely delete temporary uploaded documents for a completed or collected session
   */
  async cleanupSessionDocuments(sessionId) {
    logger.info(`Starting secure document cleanup for session: ${sessionId}`);

    const documents = await Document.find({
      sessionId,
      cleanupStatus: { $ne: 'CLEANED' }
    });

    let cleanedCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const doc of documents) {
      try {
        const deleted = deleteFile(doc.storagePath);
        if (deleted) {
          doc.cleanupStatus = 'CLEANED';
          doc.cleanedAt = new Date();
          await doc.save();
          cleanedCount++;
        } else {
          // If file was already gone or could not be removed
          doc.cleanupStatus = 'CLEANED'; // Mark cleaned if file is no longer on disk
          doc.cleanedAt = new Date();
          await doc.save();
          cleanedCount++;
        }
      } catch (err) {
        logger.error(`Failed to clean document ${doc._id} (${doc.storageFilename}):`, err);
        doc.cleanupStatus = 'FAILED';
        await doc.save();
        failedCount++;
        errors.push({ docId: doc._id, filename: doc.originalFilename, error: err.message });
      }
    }

    const session = await PrintSession.findOne({ sessionId });
    if (session) {
      session.cleanupStatus = failedCount > 0 ? 'FAILED' : 'CLEANED';
      if (session.status !== 'COMPLETED') {
        session.status = 'COMPLETED';
      }
      await session.save();
    }

    logger.info(
      `Cleanup completed for session ${sessionId}: ${cleanedCount} files cleaned, ${failedCount} failures.`
    );

    return {
      success: failedCount === 0,
      cleanedCount,
      failedCount,
      errors
    };
  }

  /**
   * Periodic scanner for expired sessions and their lingering files
   */
  async cleanupExpiredSessions() {
    try {
      const now = new Date();
      const expiredSessions = await PrintSession.find({
        expiresAt: { $lt: now },
        cleanupStatus: { $ne: 'CLEANED' }
      }).limit(50);

      logger.info(`Found ${expiredSessions.length} expired sessions to clean`);

      let totalCleaned = 0;
      for (const session of expiredSessions) {
        session.status = 'EXPIRED';
        await session.save();
        const res = await this.cleanupSessionDocuments(session.sessionId);
        totalCleaned += res.cleanedCount;
      }

      return { expiredSessionsCount: expiredSessions.length, totalCleaned };
    } catch (err) {
      logger.error('Error in cleanupExpiredSessions job:', err);
      return { error: err.message };
    }
  }
}

module.exports = new CleanupService();
