const mongoose = require('mongoose');

const printSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tokenHash: {
      type: String,
      required: true
    },
    kioskId: {
      type: String,
      required: true,
      ref: 'Kiosk'
    },
    studentId: {
      type: String,
      default: null,
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE'
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    cleanupStatus: {
      type: String,
      enum: ['PENDING', 'CLEANED', 'FAILED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

printSessionSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt || this.status === 'EXPIRED';
};

module.exports = mongoose.model('PrintSession', printSessionSchema);
