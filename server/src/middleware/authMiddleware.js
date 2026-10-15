const jwt = require('jsonwebtoken');
const config = require('../config/config');
const AdminUser = require('../models/AdminUser');
const logger = require('../utils/logger');

async function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required. No Bearer token provided.', code: 'UNAUTHORIZED' }
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await AdminUser.findById(decoded.id).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token or inactive administrative account.', code: 'INVALID_ACCOUNT' }
      });
    }

    req.adminUser = user;
    next();
  } catch (err) {
    logger.warn('Admin JWT verification failure:', err.message);
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication failed. Token expired or invalid.', code: 'TOKEN_INVALID' }
    });
  }
}

module.exports = {
  requireAdminAuth
};
