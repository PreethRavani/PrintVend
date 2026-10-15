const PrintJob = require('../models/PrintJob');
const Kiosk = require('../models/Kiosk');
const logger = require('../utils/logger');
const config = require('../config/config');

class PrinterSimulator {
  constructor() {
    this.intervalId = null;
    this.isProcessing = false;
  }

  start(intervalMs = 3000) {
    if (!config.enablePrinterSimulation) {
      logger.info('Printer simulation is disabled via configuration.');
      return;
    }

    if (this.intervalId) return;

    logger.info(`Starting simulated printer background engine (tick every ${intervalMs}ms)...`);
    this.intervalId = setInterval(() => this.tick(), intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Printer simulator stopped.');
    }
  }

  async tick() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // 1. Advance PRINTING jobs
      const printingJobs = await PrintJob.find({ status: 'PRINTING' }).limit(5);
      for (const job of printingJobs) {
        job.printingProgressPercentage = Math.min(100, (job.printingProgressPercentage || 0) + 35);
        if (job.printingProgressPercentage >= 100) {
          job.status = 'READY_FOR_COLLECTION';
          job.collectionCode = Math.floor(1000 + Math.random() * 9000).toString();
          job.updateStatus(
            'READY_FOR_COLLECTION',
            `Printing completed. Ready for collection with PIN: ${job.collectionCode}`
          );

          // Update Kiosk hardware metrics
          const kiosk = await Kiosk.findOne({ kioskId: job.kioskId });
          if (kiosk) {
            kiosk.paperLevel = Math.max(0, kiosk.paperLevel - (job.quote.totalSheets || 1));
            kiosk.tonerBlack = Math.max(0, kiosk.tonerBlack - 1);
            if (job.settings.printMode === 'COLOR') {
              kiosk.tonerColor = Math.max(0, kiosk.tonerColor - 1);
            }
            kiosk.queueLength = Math.max(0, kiosk.queueLength - 1);
            kiosk.lastReported = new Date();
            await kiosk.save();
          }

          logger.info(`Job ${job.jobNumber} is now READY_FOR_COLLECTION (PIN: ${job.collectionCode})`);
        }
        await job.save();
      }

      // 2. Pick up QUEUED jobs and start printing them
      const queuedJobs = await PrintJob.find({ status: 'QUEUED' }).sort({ createdAt: 1 }).limit(3);
      for (const job of queuedJobs) {
        // Only start if kiosk is ONLINE
        const kiosk = await Kiosk.findOne({ kioskId: job.kioskId });
        if (kiosk && kiosk.status === 'ONLINE') {
          job.updateStatus('PRINTING', 'Printer received spool and commenced printing process');
          job.printingProgressPercentage = 15;
          await job.save();
          logger.info(`Job ${job.jobNumber} entered PRINTING status`);
        }
      }
    } catch (err) {
      logger.error('Error during printer simulator tick:', err);
    } finally {
      this.isProcessing = false;
    }
  }
}

module.exports = new PrinterSimulator();
