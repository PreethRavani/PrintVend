const config = require('../config/config');

const logger = {
  info: (msg, meta = '') => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
  },
  warn: (msg, meta = '') => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
  },
  error: (msg, error = '') => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, error ? error : '');
  },
  debug: (msg, meta = '') => {
    if (config.env === 'development' || config.env === 'test') {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
    }
  }
};

module.exports = logger;
