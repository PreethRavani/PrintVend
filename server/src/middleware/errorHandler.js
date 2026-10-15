const config = require('../config/config');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(`API Error on ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  const response = {
    success: false,
    error: {
      message: err.message || 'An unexpected internal server error occurred',
      code: err.code || 'INTERNAL_SERVER_ERROR'
    }
  };

  if (err.errors) {
    response.error.details = err.errors;
  }

  // Only include stack in development
  if (config.env === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
