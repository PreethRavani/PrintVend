const mongoose = require('mongoose');

const printJobSchema = new mongoose.Schema(
  {
    jobNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    kioskId: {
      type: String,
      required: true,
      index: true
    },
    documents: [
      {
        documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Document'
        },
        filename: String,
        pageCount: Number,
        fileSizeBytes: Number
      }
    ],
    settings: {
      paperSize: {
        type: String,
        enum: ['A4', 'A3'],
        default: 'A4'
      },
      printMode: {
        type: String,
        enum: ['BW', 'COLOR'],
        default: 'BW'
      },
      copies: {
        type: Number,
        default: 1,
        min: 1,
        max: 50
      },
      pageRange: {
        type: String,
        default: 'all' // e.g. "all", "1-5", "1,3,5"
      },
      selectedPagesCount: {
        type: Number,
        default: 1
      },
      duplex: {
        type: Boolean,
        default: false
      },
      orientation: {
        type: String,
        enum: ['PORTRAIT', 'LANDSCAPE'],
        default: 'PORTRAIT'
      },
      pageOrdering: {
        type: String,
        enum: ['STANDARD', 'REVERSE'],
        default: 'STANDARD'
      }
    },
    quote: {
      ratePerSide: {
        type: Number,
        required: true
      },
      totalSides: {
        type: Number,
        required: true
      },
      totalSheets: {
        type: Number,
        required: true
      },
      subtotal: {
        type: Number,
        required: true
      },
      discount: {
        type: Number,
        default: 0
      },
      totalAmount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'INR'
      }
    },
    paymentId: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: [
        'UPLOADED',
        'AWAITING_PAYMENT',
        'PAID',
        'QUEUED',
        'PRINTING',
        'READY_FOR_COLLECTION',
        'COLLECTED',
        'FAILED',
        'CANCELLED'
      ],
      default: 'AWAITING_PAYMENT'
    },
    queuePosition: {
      type: Number,
      default: 0
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0
    },
    printingProgressPercentage: {
      type: Number,
      default: 0
    },
    collectionCode: {
      type: String,
      default: null // 4-digit code generated upon readiness
    },
    collectedAt: {
      type: Date,
      default: null
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        note: {
          type: String,
          default: ''
        }
      }
    ]
  },
  { timestamps: true }
);

printJobSchema.methods.updateStatus = function (newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note
  });
};

module.exports = mongoose.model('PrintJob', printJobSchema);
