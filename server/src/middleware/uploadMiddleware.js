const multer = require('multer');
const path = require('path');
const config = require('../config/config');
const { sanitizeFilename } = require('../services/storageService');

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpeg', '.jpg', '.png'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = sanitizeFilename(file.originalname);
    cb(null, safeName);
  }
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    req.fileValidationError = 'Invalid file format. Only PDF, JPG, and PNG documents are supported.';
    return cb(null, false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeMB * 1024 * 1024,
    files: config.maxFilesPerSession
  },
  fileFilter
});

module.exports = upload;
