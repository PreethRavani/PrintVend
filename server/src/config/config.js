const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  env: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-campus-print',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  uploadDir: process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : (process.env.VERCEL ? '/tmp/uploads' : path.resolve(__dirname, '../../', 'uploads')),
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 25,
  maxFilesPerSession: parseInt(process.env.MAX_FILES_PER_SESSION, 10) || 10,
  sessionExpiryMinutes: parseInt(process.env.SESSION_EXPIRY_MINUTES, 10) || 30,
  autoCleanupIntervalMinutes: parseInt(process.env.AUTO_CLEANUP_INTERVAL_MINUTES, 10) || 10,
  enablePrinterSimulation: process.env.ENABLE_PRINTER_SIMULATION !== 'false'
};
