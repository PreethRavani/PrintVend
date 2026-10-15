const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const config = require('../config/config');
const logger = require('../utils/logger');

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

function sanitizeFilename(originalName) {
  // Extract base extension
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueId = crypto.randomBytes(8).toString('hex');
  return `${base}_${uniqueId}${ext}`;
}

async function extractPageCount(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return Math.max(1, data.numpages || 1);
    } catch (err) {
      logger.warn(`Could not parse PDF page count for ${filePath}: ${err.message}. Defaulting to 1.`);
      return 1;
    }
  }
  // Image files are treated as 1 page
  return 1;
}

function deleteFile(filePath) {
  try {
    // Validate path to prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(config.uploadDir))) {
      logger.warn(`Security violation attempt: Cannot delete file outside uploadDir: ${filePath}`);
      return false;
    }

    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
      logger.info(`Safely removed temporary file: ${resolvedPath}`);
      return true;
    }
    return false;
  } catch (err) {
    logger.error(`Error deleting file ${filePath}:`, err);
    return false;
  }
}

module.exports = {
  sanitizeFilename,
  extractPageCount,
  deleteFile
};
