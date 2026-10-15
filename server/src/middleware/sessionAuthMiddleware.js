const PrintSession = require('../models/PrintSession');
const { hashToken } = require('../utils/tokenGenerator');
const logger = require('../utils/logger');

async function validateSessionAccess(req, res, next) {
  try {
    const sessionId =
      req.headers['x-session-id'] || req.params.sessionId || req.params.id || req.body.sessionId;
    const sessionToken = req.headers['x-session-token'] || req.query.token;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Session identifier is required', code: 'SESSION_ID_MISSING' }
      });
    }

    const session = await PrintSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: 'Print session not found or has been removed', code: 'SESSION_NOT_FOUND' }
      });
    }

    if (session.isExpired()) {
      session.status = 'EXPIRED';
      await session.save();
      return res.status(410).json({
        success: false,
        error: { message: 'Print session has expired. Please start a new session.', code: 'SESSION_EXPIRED' }
      });
    }

    // If a session token was provided, verify its hash
    if (sessionToken) {
      const hashed = hashToken(sessionToken);
      if (hashed !== session.tokenHash) {
        logger.warn(`Unauthorized attempt to access session ${sessionId} with invalid token`);
        return res.status(403).json({
          success: false,
          error: { message: 'Unauthorized: Invalid session access token', code: 'TOKEN_MISMATCH' }
        });
      }
    }

    req.printSession = session;
    next();
  } catch (err) {
    logger.error('Session validation error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Error validating session access', code: 'SESSION_VALIDATION_ERROR' }
    });
  }
}

module.exports = {
  validateSessionAccess
};
