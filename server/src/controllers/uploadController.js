const Document = require('../models/Document');
const PrintSession = require('../models/PrintSession');
const { extractPageCount, deleteFile } = require('../services/storageService');
const config = require('../config/config');
const logger = require('../utils/logger');

exports.uploadDocuments = async (req, res, next) => {
  try {
    const sessionId = req.body.sessionId || req.headers['x-session-id'];

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing sessionId for upload', code: 'MISSING_SESSION_ID' }
      });
    }

    const session = await PrintSession.findOne({ sessionId });
    if (!session || session.status !== 'ACTIVE' || session.isExpired()) {
      if (req.files) {
        for (const f of req.files) {
          deleteFile(f.path);
        }
      }
      return res.status(400).json({
        success: false,
        error: {
          message: `This print session has ended and is no longer active (status: ${session ? session.status : 'NOT_FOUND'}). Please scan the new QR code at the kiosk.`,
          code: 'SESSION_INACTIVE'
        }
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No files were uploaded', code: 'NO_FILES' }
      });
    }

    // Check existing count
    const existingCount = await Document.countDocuments({
      sessionId,
      cleanupStatus: { $ne: 'CLEANED' }
    });

    if (existingCount + req.files.length > config.maxFilesPerSession) {
      // Remove newly uploaded files from disk
      for (const f of req.files) {
        deleteFile(f.path);
      }
      return res.status(400).json({
        success: false,
        error: {
          message: `Maximum file limit reached. Maximum ${config.maxFilesPerSession} files allowed per session.`,
          code: 'MAX_FILES_EXCEEDED'
        }
      });
    }

    const createdDocuments = [];

    for (const file of req.files) {
      // Extract page count (1 for images, parsed for PDF)
      const pageCount = await extractPageCount(file.path, file.mimetype);

      const doc = await Document.create({
        sessionId,
        originalFilename: file.originalname,
        storageFilename: file.filename,
        storagePath: file.path,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
        pageCount,
        uploadStatus: 'UPLOADED'
      });

      createdDocuments.push({
        id: doc._id,
        filename: doc.originalFilename,
        fileSizeBytes: doc.fileSizeBytes,
        mimeType: doc.mimeType,
        pageCount: doc.pageCount,
        createdAt: doc.createdAt
      });
    }

    logger.info(`Uploaded ${createdDocuments.length} document(s) for session ${sessionId}`);

    res.status(201).json({
      success: true,
      data: {
        documents: createdDocuments
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getSessionDocuments = async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId || req.params.id;

    const documents = await Document.find({
      sessionId,
      cleanupStatus: { $ne: 'CLEANED' }
    }).select('-storagePath');

    res.json({
      success: true,
      data: { documents }
    });
  } catch (err) {
    next(err);
  }
};

exports.removeDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    const query = { _id: id };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const doc = await Document.findOne(query);
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document not found', code: 'DOCUMENT_NOT_FOUND' }
      });
    }

    // Safely delete file from disk
    deleteFile(doc.storagePath);

    doc.cleanupStatus = 'CLEANED';
    doc.cleanedAt = new Date();
    await doc.save();

    logger.info(`Document ${id} removed by user from session ${doc.sessionId}`);

    res.json({
      success: true,
      message: 'Document removed successfully'
    });
  } catch (err) {
    next(err);
  }
};
