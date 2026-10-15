const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true
    },
    storageFilename: {
      type: String,
      required: true
    },
    storagePath: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    fileSizeBytes: {
      type: Number,
      required: true
    },
    pageCount: {
      type: Number,
      default: 1,
      min: 1
    },
    uploadStatus: {
      type: String,
      enum: ['UPLOADED', 'PROCESSING', 'FAILED', 'CLEANED'],
      default: 'UPLOADED'
    },
    cleanupStatus: {
      type: String,
      enum: ['RETAINED', 'CLEANED', 'FAILED'],
      default: 'RETAINED'
    },
    cleanedAt: {
      type: Date,
      default: null
    },
    source: {
      type: String,
      enum: ['MOBILE', 'KIOSK_LOCAL', 'COLLEGE_CATALOG'],
      default: 'MOBILE'
    },
    branch: {
      type: String,
      default: null
    },
    year: {
      type: String,
      default: null
    },
    category: {
      type: String,
      default: null
    },
    courseCode: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
