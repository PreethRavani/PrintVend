const Payment = require('../models/Payment');
const PrintJob = require('../models/PrintJob');
const { generateTransactionId } = require('../utils/tokenGenerator');
const logger = require('../utils/logger');

class PaymentService {
  /**
   * Process a simulated payment for prototype demonstration
   */
  async processPayment({
    jobNumber,
    sessionId,
    amount,
    paymentMode = 'SIMULATED_UPI',
    upiId = 'student@okhdfcbank',
    forceFail = false
  }) {
    logger.info(`Processing payment for job ${jobNumber}, amount: ₹${amount}`);

    // Verify job exists and belongs to session
    const job = await PrintJob.findOne({ jobNumber, sessionId });
    if (!job) {
      throw new Error('Print job not found for this session');
    }

    if (job.status !== 'AWAITING_PAYMENT' && job.status !== 'UPLOADED') {
      throw new Error(`Invalid job status for payment: ${job.status}`);
    }

    // Authoritative amount check
    if (Math.abs(job.quote.totalAmount - amount) > 0.01) {
      throw new Error(`Amount mismatch. Expected: ₹${job.quote.totalAmount}, Received: ₹${amount}`);
    }

    const paymentId = generateTransactionId();

    // Check if simulation test failure was requested (or failure test VPA)
    const isTestFailure = forceFail === true || (upiId && upiId.toLowerCase().includes('fail'));

    const payment = await Payment.create({
      paymentId,
      jobNumber,
      sessionId,
      amount,
      currency: job.quote.currency || 'INR',
      paymentMode,
      provider: 'PROTOTYPE_SIMULATION_GATEWAY',
      isSimulated: true,
      status: isTestFailure ? 'FAILED' : 'SUCCESS',
      upiId: upiId ? upiId.replace(/(?<=.{2}).(?=.*@)/g, '*') : null, // Masked UPI ID for privacy
      failureReason: isTestFailure ? 'Simulated Bank Decline for Testing Retry Flow' : null,
      verificationMetadata: {
        simulatedAt: new Date(),
        gatewayRef: `SIM-REF-${Date.now()}`,
        disclaimer: 'PROTOTYPE DEMONSTRATION: NO REAL MONEY TRANSFERRED'
      }
    });

    if (isTestFailure) {
      logger.warn(`Simulated payment failed for job ${jobNumber} (intentional test failure)`);
      return {
        success: false,
        paymentId: payment.paymentId,
        status: 'FAILED',
        reason: payment.failureReason,
        isSimulated: true
      };
    }

    // Update job status to PAID and record payment ID
    job.paymentId = payment.paymentId;
    job.updateStatus('PAID', `Simulated payment of ₹${amount} received via ${paymentMode}`);
    await job.save();

    logger.info(`Simulated payment succeeded for job ${jobNumber}, txn: ${paymentId}`);

    return {
      success: true,
      paymentId: payment.paymentId,
      jobNumber: job.jobNumber,
      amount: payment.amount,
      currency: payment.currency,
      status: 'SUCCESS',
      isSimulated: true,
      paidAt: payment.createdAt
    };
  }

  async getPaymentStatus(paymentId) {
    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      throw new Error('Payment record not found');
    }
    return payment;
  }
}

module.exports = new PaymentService();
