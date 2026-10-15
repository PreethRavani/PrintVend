const { calculateQuote, getActivePricing } = require('../services/pricingService');

exports.getQuote = async (req, res, next) => {
  try {
    const {
      paperSize = 'A4',
      printMode = 'BW',
      copies = 1,
      pageRange = 'all',
      duplex = false,
      totalDocumentPages = 1
    } = req.body;

    const quote = await calculateQuote({
      paperSize,
      printMode,
      copies,
      pageRange,
      duplex,
      totalDocumentPages
    });

    res.json({
      success: true,
      data: { quote }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: { message: err.message, code: 'INVALID_PRICING_PARAMETERS' }
    });
  }
};

exports.getPricingConfig = async (req, res, next) => {
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
