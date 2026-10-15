const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true
    },
    jobNumber: {
      type: String,
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMode: {
      type: String,
      enum: ['SIMULATED_UPI', 'SIMULATED_QR', 'SIMULATED_CAMPUS_CARD'],
      default: 'SIMULATED_UPI'
    },
    provider: {
      type: String,
      default: 'PROTOTYPE_SIMULATION_GATEWAY'
    },
    status: {
      type: String,
      enum: ['INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'INITIATED'
    },
    upiId: {
      type: String,
      default: null,
      trim: true
    },
    isSimulated: {
      type: Boolean,
      default: true
    },
    verificationMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    failureReason: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
