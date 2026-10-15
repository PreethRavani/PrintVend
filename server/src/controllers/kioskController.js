const Kiosk = require('../models/Kiosk');
const PrintJob = require('../models/PrintJob');

exports.getKiosks = async (req, res, next) => {
  try {
    const kiosks = await Kiosk.find().sort({ kioskId: 1 });
    res.json({
      success: true,
      data: { kiosks }
    });
  } catch (err) {
    next(err);
  }
};

exports.getKioskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const kiosk = await Kiosk.findOne({
      $or: [{ kioskId: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!kiosk) {
      return res.status(404).json({
        success: false,
        error: { message: `Kiosk '${id}' not found`, code: 'KIOSK_NOT_FOUND' }
      });
    }

    // Live queue statistics
    const activeJobs = await PrintJob.countDocuments({
      kioskId: kiosk.kioskId,
      status: { $in: ['QUEUED', 'PRINTING'] }
    });

    res.json({
      success: true,
      data: {
        kiosk,
        activeJobs
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createKiosk = async (req, res, next) => {
  try {
    const {
      kioskId,
      name,
      location,
      status,
      supportedPaperSizes,
      supportedPrintModes,
      supportedDuplex,
      paperLevel,
      tonerBlack,
      tonerColor,
      queueLimit
    } = req.body;

    if (!kioskId || !name || !location) {
      return res.status(400).json({
        success: false,
        error: { message: 'kioskId, name, and location are required fields', code: 'VALIDATION_ERROR' }
      });
    }

    const existing = await Kiosk.findOne({ kioskId: kioskId.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: `Kiosk ID '${kioskId}' already exists`, code: 'DUPLICATE_KIOSK_ID' }
      });
    }

    const kiosk = await Kiosk.create({
      kioskId: kioskId.toUpperCase(),
      name,
      location,
      status: status || 'ONLINE',
      supportedPaperSizes: supportedPaperSizes || ['A4', 'A3'],
      supportedPrintModes: supportedPrintModes || ['BW', 'COLOR'],
      supportedDuplex: supportedDuplex !== undefined ? supportedDuplex : true,
      paperLevel: paperLevel !== undefined ? paperLevel : 100,
      tonerBlack: tonerBlack !== undefined ? tonerBlack : 100,
      tonerColor: tonerColor !== undefined ? tonerColor : 100,
      queueLimit: queueLimit || 20
    });

    res.status(201).json({
      success: true,
      data: { kiosk }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateKiosk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const kiosk = await Kiosk.findOneAndUpdate(
      { $or: [{ kioskId: id.toUpperCase() }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: updates, lastReported: new Date() },
      { new: true, runValidators: true }
    );

    if (!kiosk) {
      return res.status(404).json({
        success: false,
        error: { message: `Kiosk '${id}' not found`, code: 'KIOSK_NOT_FOUND' }
      });
    }

    res.json({
      success: true,
      data: { kiosk }
    });
  } catch (err) {
    next(err);
  }
};
