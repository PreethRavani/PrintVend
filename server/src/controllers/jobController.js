const PrintJob = require('../models/PrintJob');
const PrintSession = require('../models/PrintSession');
const Document = require('../models/Document');
const Kiosk = require('../models/Kiosk');
const { generateJobNumber } = require('../utils/tokenGenerator');
const { calculateQuote } = require('../services/pricingService');
const paymentService = require('../services/paymentService');
const queueService = require('../services/queueService');
const cleanupService = require('../services/cleanupService');
const printerSimulator = require('../jobs/printerSimulator');
const logger = require('../utils/logger');

exports.createJob = async (req, res, next) => {
  try {
    const {
      sessionId,
      kioskId,
      documentIds = [],
      settings = {}
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing sessionId for job creation', code: 'MISSING_SESSION_ID' }
      });
    }

    const session = await PrintSession.findOne({ sessionId });
    if (!session || session.isExpired()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Session is invalid or expired', code: 'INVALID_SESSION' }
      });
    }

    const targetKioskId = (kioskId || session.kioskId).toUpperCase();
    const kiosk = await Kiosk.findOne({ kioskId: targetKioskId });
    if (!kiosk || kiosk.status === 'OFFLINE' || kiosk.status === 'MAINTENANCE') {
      return res.status(400).json({
        success: false,
        error: { message: `Kiosk '${targetKioskId}' is not operational`, code: 'KIOSK_UNAVAILABLE' }
      });
    }

    // Find documents
    const query = { sessionId, cleanupStatus: { $ne: 'CLEANED' } };
    if (documentIds.length > 0) {
      query._id = { $in: documentIds };
    }
    const documents = await Document.find(query);

    if (documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No valid uploaded documents found in this session to print', code: 'NO_DOCUMENTS' }
      });
    }

    // Check hardware support for settings
    const paperSize = (settings.paperSize || 'A4').toUpperCase();
    const printMode = (settings.printMode || 'BW').toUpperCase();
    const duplex = Boolean(settings.duplex);

    if (!kiosk.supportedPaperSizes.includes(paperSize)) {
      return res.status(400).json({
        success: false,
        error: { message: `Paper size ${paperSize} is not supported on kiosk ${targetKioskId}`, code: 'UNSUPPORTED_PAPER_SIZE' }
      });
    }

    if (!kiosk.supportedPrintModes.includes(printMode)) {
      return res.status(400).json({
        success: false,
        error: { message: `Print mode ${printMode} is not supported on kiosk ${targetKioskId}`, code: 'UNSUPPORTED_PRINT_MODE' }
      });
    }

    if (duplex && !kiosk.supportedDuplex) {
      return res.status(400).json({
        success: false,
        error: { message: `Double-sided printing is not supported on kiosk ${targetKioskId}`, code: 'UNSUPPORTED_DUPLEX' }
      });
    }

    // Calculate total pages across selected documents
    const totalDocumentPages = documents.reduce((sum, d) => sum + (d.pageCount || 1), 0);

    // Calculate authoritative quote on server
    const quote = await calculateQuote({
      paperSize,
      printMode,
      copies: settings.copies || 1,
      pageRange: settings.pageRange || 'all',
      duplex,
      totalDocumentPages
    });

    const jobNumber = generateJobNumber();

    const job = await PrintJob.create({
      jobNumber,
      sessionId,
      kioskId: kiosk.kioskId,
      documents: documents.map((d) => ({
        documentId: d._id,
        filename: d.originalFilename,
        pageCount: d.pageCount,
        fileSizeBytes: d.fileSizeBytes
      })),
      settings: {
        paperSize,
        printMode,
        copies: settings.copies || 1,
        pageRange: settings.pageRange || 'all',
        selectedPagesCount: quote.selectedPagesCount,
        duplex,
        orientation: settings.orientation || 'PORTRAIT',
        pageOrdering: settings.pageOrdering || 'STANDARD'
      },
      quote,
      status: 'AWAITING_PAYMENT',
      statusHistory: [
        {
          status: 'AWAITING_PAYMENT',
          timestamp: new Date(),
          note: 'Job created, awaiting simulated payment confirmation'
        }
      ]
    });

    logger.info(`Created PrintJob ${jobNumber} for session ${sessionId}, total: ₹${quote.totalAmount}`);

    res.status(201).json({
      success: true,
      data: { job }
    });
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await PrintJob.findOne({
      $or: [{ jobNumber: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { message: 'Print job not found', code: 'JOB_NOT_FOUND' }
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (err) {
    next(err);
  }
};

exports.getJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await PrintJob.findOne({
      $or: [{ jobNumber: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { message: 'Print job not found', code: 'JOB_NOT_FOUND' }
      });
    }

    // In serverless environments where background intervals freeze, advance simulation on poll
    if (process.env.VERCEL && (job.status === 'QUEUED' || job.status === 'PRINTING')) {
      const printerSimulator = require('../jobs/printerSimulator');
      await printerSimulator.tick();
      job = await PrintJob.findById(job._id);
    }

    res.json({
      success: true,
      data: {
        jobNumber: job.jobNumber,
        status: job.status,
        queuePosition: job.queuePosition,
        estimatedWaitMinutes: job.estimatedWaitMinutes,
        printingProgressPercentage: job.printingProgressPercentage,
        collectionCode: job.collectionCode,
        kioskId: job.kioskId,
        updatedAt: job.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.simulatePayment = async (req, res, next) => {
  try {
    const { jobNumber, sessionId, amount, paymentMode, upiId, forceFail } = req.body;

    const paymentResult = await paymentService.processPayment({
      jobNumber,
      sessionId,
      amount,
      paymentMode,
      upiId,
      forceFail
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: paymentResult.reason || 'Simulated payment was declined',
          code: 'PAYMENT_FAILED',
          paymentId: paymentResult.paymentId
        }
      });
    }

    // Automatically queue the job after payment
    const queuedJob = await queueService.queueJob(jobNumber);

    res.json({
      success: true,
      data: {
        payment: paymentResult,
        job: queuedJob
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: { message: err.message, code: 'PAYMENT_ERROR' }
    });
  }
};

exports.confirmCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { collectionCode, sessionId } = req.body;

    const job = await PrintJob.findOne({
      $or: [{ jobNumber: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { message: 'Print job not found', code: 'JOB_NOT_FOUND' }
      });
    }

    // Validate status
    if (job.status !== 'READY_FOR_COLLECTION' && job.status !== 'PRINTING') {
      return res.status(400).json({
        success: false,
        error: { message: `Job is not ready for collection (current status: ${job.status})`, code: 'INVALID_STATUS' }
      });
    }

    // Verify collection code if provided
    if (collectionCode && job.collectionCode && collectionCode.trim() !== job.collectionCode.trim()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Invalid collection PIN code', code: 'INVALID_COLLECTION_CODE' }
      });
    }

    job.updateStatus('COLLECTED', 'User verified collection code and retrieved printed documents');
    job.collectedAt = new Date();
    await job.save();

    // Mark the associated print session as COMPLETED so mobile devices close the upload session
    await PrintSession.updateOne({ sessionId: job.sessionId }, { status: 'COMPLETED' });

    // Trigger backend file cleanup
    const cleanupReport = await cleanupService.cleanupSessionDocuments(job.sessionId);

    logger.info(`Job ${job.jobNumber} marked COLLECTED. Cleanup report: ${JSON.stringify(cleanupReport)}`);

    res.json({
      success: true,
      message: 'Documents confirmed collected. Temporary files safely purged.',
      data: {
        jobNumber: job.jobNumber,
        status: job.status,
        collectedAt: job.collectedAt,
        cleanupReport
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await PrintJob.findOne({
      $or: [{ jobNumber: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { message: 'Job not found', code: 'JOB_NOT_FOUND' }
      });
    }

    if (!['AWAITING_PAYMENT', 'QUEUED'].includes(job.status)) {
      return res.status(400).json({
        success: false,
        error: { message: `Cannot cancel job in ${job.status} status`, code: 'CANNOT_CANCEL' }
      });
    }

    job.updateStatus('CANCELLED', 'Job cancelled by user');
    await job.save();

    // Clean up temporary files
    await cleanupService.cleanupSessionDocuments(job.sessionId);

    res.json({
      success: true,
      message: 'Job cancelled and session cleaned up'
    });
  } catch (err) {
    next(err);
  }
};

exports.simulateStep = async (req, res, next) => {
  try {
    // Manually trigger simulator tick for instant test progression
    await printerSimulator.tick();
    res.json({
      success: true,
      message: 'Printer simulator ticked manually'
    });
  } catch (err) {
    next(err);
  }
};
