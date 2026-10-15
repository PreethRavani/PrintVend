const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

router.post('/quote', pricingController.getQuote);
router.get('/', pricingController.getPricingConfig);

module.exports = router;
