const PrintJob = require('../models/PrintJob');
const Kiosk = require('../models/Kiosk');
const PricingConfig = require('../models/PricingConfig');
const Payment = require('../models/Payment');
const { getActivePricing } = require('../services/pricingService');
const logger = require('../utils/logger');

exports.getOverview = async (req, res, next) => {
  try {
    const totalJobs = await PrintJob.countDocuments();
    const queuedJobs = await PrintJob.countDocuments({ status: { $in: ['QUEUED', 'PRINTING'] } });
    const completedJobs = await PrintJob.countDocuments({ status: 'COLLECTED' });
    const failedJobs = await PrintJob.countDocuments({ status: 'FAILED' });
    const activeKiosks = await Kiosk.countDocuments({ status: 'ONLINE' });
    const totalKiosks = await Kiosk.countDocuments();

    // Calculate total simulated revenue from successful payments
    const payments = await Payment.find({ status: 'SUCCESS' });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const recentJobs = await PrintJob.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select('jobNumber kioskId status quote settings createdAt');

    res.json({
      success: true,
      data: {
        stats: {
          totalJobs,
          queuedJobs,
          completedJobs,
          failedJobs,
          activeKiosks,
          totalKiosks,
          totalRevenue: Number(totalRevenue.toFixed(2))
        },
        recentJobs
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const {
      search,
      kioskId,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (search) {
      query.jobNumber = { $regex: search.trim().toUpperCase(), $options: 'i' };
    }
    if (kioskId) {
      query.kioskId = kioskId.toUpperCase();
    }
    if (status) {
      query.status = status.toUpperCase();
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await PrintJob.countDocuments(query);
    const jobs = await PrintJob.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10))
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const allJobs = await PrintJob.find().lean();

    // Mode distribution (BW vs COLOR)
    let bwCount = 0;
    let colorCount = 0;
    let a4Count = 0;
    let a3Count = 0;
    let duplexCount = 0;
    let simplexCount = 0;

    const dayCounts = {};

    allJobs.forEach((j) => {
      if (j.settings?.printMode === 'COLOR') colorCount++;
      else bwCount++;

      if (j.settings?.paperSize === 'A3') a3Count++;
      else a4Count++;

      if (j.settings?.duplex) duplexCount++;
      else simplexCount++;

      const day = new Date(j.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const jobsByDay = Object.keys(dayCounts).map((day) => ({
      date: day,
      count: dayCounts[day]
    }));

    const total = allJobs.length || 1;
    const failureCount = allJobs.filter((j) => j.status === 'FAILED').length;
    const failureRate = Number(((failureCount / total) * 100).toFixed(1));

    res.json({
      success: true,
      data: {
        analytics: {
          jobsByDay,
          modes: { BW: bwCount, COLOR: colorCount },
          paperSizes: { A4: a4Count, A3: a3Count },
          duplexVsSimplex: { duplex: duplexCount, simplex: simplexCount },
          totalProcessed: allJobs.length,
          failureRatePercentage: failureRate
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getPricing = async (req, res, next) => {
  try {
    const pricing = await getActivePricing();
    res.json({
      success: true,
      data: { pricing }
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePricing = async (req, res, next) => {
  try {
    const { rates, duplexDiscountPercentage } = req.body;

    if (!rates || !rates.A4 || !rates.A3) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid pricing structure provided', code: 'INVALID_PRICING_STRUCTURE' }
      });
    }

    // Validate rate values
    if (
      rates.A4.BW <= 0 ||
      rates.A4.COLOR <= 0 ||
      rates.A3.BW <= 0 ||
      rates.A3.COLOR <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: { message: 'All rates must be positive numbers', code: 'INVALID_RATE_VALUE' }
      });
    }

    let config = await PricingConfig.findOne();
    if (!config) {
      config = new PricingConfig();
    }

    config.rates = rates;
    if (duplexDiscountPercentage !== undefined) {
      config.duplexDiscountPercentage = Math.max(0, Math.min(100, duplexDiscountPercentage));
    }
    config.lastUpdatedBy = req.adminUser ? req.adminUser.email : 'ADMIN';

    await config.save();

    logger.info(`Pricing updated by ${config.lastUpdatedBy}`);

    res.json({
      success: true,
      message: 'Pricing configuration updated successfully. Applies to all future print jobs.',
      data: { pricing: config }
    });
  } catch (err) {
    next(err);
  }
};
