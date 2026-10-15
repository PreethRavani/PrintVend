const mongoose = require('mongoose');

const pricingConfigSchema = new mongoose.Schema(
  {
    rates: {
      A4: {
        BW: { type: Number, default: 2.0 },     // ₹2 per side
        COLOR: { type: Number, default: 10.0 }  // ₹10 per side
      },
      A3: {
        BW: { type: Number, default: 5.0 },     // ₹5 per side
        COLOR: { type: Number, default: 20.0 }  // ₹20 per side
      }
    },
    duplexDiscountPercentage: {
      type: Number,
      default: 0 // Optional discount for duplex eco-printing
    },
    currency: {
      type: String,
      default: 'INR'
    },
    currencySymbol: {
      type: String,
      default: '₹'
    },
    lastUpdatedBy: {
      type: String,
      default: 'SYSTEM'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingConfig', pricingConfigSchema);
