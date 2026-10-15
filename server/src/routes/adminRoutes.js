const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// All admin routes require admin authentication
router.use(requireAdminAuth);

router.get('/overview', adminController.getOverview);
router.get('/jobs', adminController.getJobs);
router.get('/analytics', adminController.getAnalytics);
router.get('/pricing', adminController.getPricing);
router.patch('/pricing', adminController.updatePricing);

module.exports = router;
