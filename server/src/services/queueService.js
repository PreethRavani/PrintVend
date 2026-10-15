const PrintJob = require('../models/PrintJob');
const Kiosk = require('../models/Kiosk');
const logger = require('../utils/logger');

// State transition validation matrix
const VALID_TRANSITIONS = {
  UPLOADED: ['AWAITING_PAYMENT', 'CANCELLED'],
  AWAITING_PAYMENT: ['PAID', 'CANCELLED', 'FAILED'],
  PAID: ['QUEUED', 'FAILED', 'CANCELLED'],
  QUEUED: ['PRINTING', 'CANCELLED', 'FAILED'],
  PRINTING: ['READY_FOR_COLLECTION', 'FAILED'],
  READY_FOR_COLLECTION: ['COLLECTED', 'FAILED'],
  COLLECTED: [],
  FAILED: ['AWAITING_PAYMENT', 'CANCELLED'],
  CANCELLED: []
};

class QueueService {
  isValidTransition(currentStatus, nextStatus) {
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
  }

  async queueJob(jobNumber) {
    const job = await PrintJob.findOne({ jobNumber });
    if (!job) {
      throw new Error(`Job ${jobNumber} not found`);
    }

    if (!this.isValidTransition(job.status, 'QUEUED') && job.status !== 'PAID') {
      throw new Error(`Cannot transition job from ${job.status} to QUEUED`);
    }

    // Count active jobs in queue or printing for this kiosk
    const activeJobsCount = await PrintJob.countDocuments({
      kioskId: job.kioskId,
      status: { $in: ['QUEUED', 'PRINTING'] },
      _id: { $ne: job._id }
    });

    job.queuePosition = activeJobsCount + 1;
    // Estimated wait time: ~1 minute per active job ahead + sheets * 5s
    job.estimatedWaitMinutes = Math.max(1, Math.ceil(activeJobsCount * 1.5 + (job.quote.totalSheets * 5) / 60));

    job.updateStatus('QUEUED', `Placed in kiosk queue at position #${job.queuePosition}`);
    await job.save();

    // Update kiosk metrics
    await Kiosk.findOneAndUpdate(
      { kioskId: job.kioskId },
      {
        $inc: { queueLength: 1 },
        $set: { estimatedWaitMinutes: job.estimatedWaitMinutes, lastReported: new Date() }
      }
    );

    logger.info(`Job ${jobNumber} queued at position #${job.queuePosition} for kiosk ${job.kioskId}`);
    return job;
  }

  async getKioskQueueStats(kioskId) {
    const activeJobs = await PrintJob.find({
      kioskId,
      status: { $in: ['QUEUED', 'PRINTING'] }
    }).sort({ createdAt: 1 });

    return {
      kioskId,
      activeJobsCount: activeJobs.length,
      estimatedWaitMinutes: Math.max(1, Math.ceil(activeJobs.length * 1.5))
    };
  }
}

module.exports = new QueueService();
