const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');

// Accept multiple files up to 10
router.post('/', (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      return res.status(err.statusCode || 400).json({
        success: false,
        error: {
          message: err.message || 'File upload error',
          code: err.code || 'INVALID_FILE_TYPE'
        }
      });
    }
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          message: req.fileValidationError,
          code: 'INVALID_FILE_TYPE'
        }
      });
    }
    uploadController.uploadDocuments(req, res, next);
  });
});
router.get('/session/:sessionId', uploadController.getSessionDocuments);
router.delete('/:id', uploadController.removeDocument);

module.exports = router;
