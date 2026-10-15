const PricingConfig = require('../models/PricingConfig');
const logger = require('../utils/logger');

// Fallback rates if DB not yet seeded
const DEFAULT_RATES = {
  A4: { BW: 2.0, COLOR: 10.0 },
  A3: { BW: 5.0, COLOR: 20.0 }
};

function parsePageRange(rangeStr, maxPages = 1) {
  if (!rangeStr || rangeStr.trim().toLowerCase() === 'all') {
    return {
      valid: true,
      count: Math.max(1, maxPages),
      pages: Array.from({ length: Math.max(1, maxPages) }, (_, i) => i + 1)
    };
  }

  const clean = rangeStr.replace(/\s+/g, '');
  const parts = clean.split(',');
  const selectedPages = new Set();

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        return { valid: false, error: `Invalid range format '${part}'` };
      }
      for (let p = start; p <= Math.min(end, maxPages); p++) {
        selectedPages.add(p);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        return { valid: false, error: `Invalid page number '${part}'` };
      }
      if (pageNum <= maxPages) {
        selectedPages.add(pageNum);
      }
    }
  }

  const pagesArray = Array.from(selectedPages).sort((a, b) => a - b);
  if (pagesArray.length === 0) {
    return { valid: false, error: 'Page range contains no valid pages within document length' };
  }

  return {
    valid: true,
    count: pagesArray.length,
    pages: pagesArray
  };
}

async function getActivePricing() {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    return {
      rates: DEFAULT_RATES,
      duplexDiscountPercentage: 0,
      currency: 'INR',
      currencySymbol: '₹'
    };
  }

  try {
    let config = await PricingConfig.findOne();
    if (!config) {
      config = await PricingConfig.create({
        rates: DEFAULT_RATES,
        duplexDiscountPercentage: 0,
        currency: 'INR',
        currencySymbol: '₹'
      });
    }
    return config;
  } catch (err) {
    logger.warn('Failed to fetch pricing config from DB, using fallback defaults', err);
    return {
      rates: DEFAULT_RATES,
      duplexDiscountPercentage: 0,
      currency: 'INR',
      currencySymbol: '₹'
    };
  }
}

async function calculateQuote({
  paperSize = 'A4',
  printMode = 'BW',
  copies = 1,
  pageRange = 'all',
  duplex = false,
  totalDocumentPages = 1
}) {
  const normPaperSize = (paperSize || 'A4').toUpperCase();
  const normPrintMode = (printMode || 'BW').toUpperCase();
  const safeCopies = Math.max(1, parseInt(copies, 10) || 1);

  if (!['A4', 'A3'].includes(normPaperSize)) {
    throw new Error(`Unsupported paper size: ${normPaperSize}. Must be A4 or A3.`);
  }

  if (!['BW', 'COLOR'].includes(normPrintMode)) {
    throw new Error(`Unsupported print mode: ${normPrintMode}. Must be BW or COLOR.`);
  }

  const rangeResult = parsePageRange(pageRange, totalDocumentPages);
  if (!rangeResult.valid) {
    throw new Error(rangeResult.error);
  }

  const selectedPagesCount = rangeResult.count;
  const pricing = await getActivePricing();
  const ratePerSide = pricing.rates[normPaperSize][normPrintMode];

  // Total sides printed = selected pages * copies
  const totalSides = selectedPagesCount * safeCopies;

  // Duplex distinction: 2 sides fit on 1 physical sheet
  const totalSheets = duplex ? Math.ceil(totalSides / 2) : totalSides;

  const subtotal = Number((totalSides * ratePerSide).toFixed(2));
  
  let discount = 0;
  if (duplex && pricing.duplexDiscountPercentage > 0) {
    discount = Number(((subtotal * pricing.duplexDiscountPercentage) / 100).toFixed(2));
  }

  const totalAmount = Number(Math.max(0, subtotal - discount).toFixed(2));

  return {
    ratePerSide,
    selectedPagesCount,
    copies: safeCopies,
    totalSides,
    totalSheets,
    paperSize: normPaperSize,
    printMode: normPrintMode,
    duplex: Boolean(duplex),
    pageRange,
    subtotal,
    discount,
    totalAmount,
    currency: pricing.currency || 'INR',
    currencySymbol: pricing.currencySymbol || '₹'
  };
}

module.exports = {
  calculateQuote,
  parsePageRange,
  getActivePricing,
  DEFAULT_RATES
};
