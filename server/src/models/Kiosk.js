const mongoose = require('mongoose');

const kioskSchema = new mongoose.Schema(
  {
    kioskId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['ONLINE', 'BUSY', 'OFFLINE', 'MAINTENANCE'],
      default: 'ONLINE'
    },
    supportedPaperSizes: {
      type: [String],
      default: ['A4', 'A3']
    },
    supportedPrintModes: {
      type: [String],
      default: ['BW', 'COLOR']
    },
    supportedDuplex: {
      type: Boolean,
      default: true
    },
    paperLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 90
    },
    tonerBlack: {
      type: Number,
      min: 0,
      max: 100,
      default: 85
    },
    tonerColor: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    },
    queueLength: {
      type: Number,
      default: 0
    },
    queueLimit: {
      type: Number,
      default: 20
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0
    },
    lastReported: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Kiosk', kioskSchema);
