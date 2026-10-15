const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.post('/', jobController.createJob);
router.get('/:id', jobController.getJob);
router.get('/:id/status', jobController.getJobStatus);
router.post('/simulate-payment', jobController.simulatePayment);
router.post('/:id/confirm-collection', jobController.confirmCollection);
router.post('/:id/cancel', jobController.cancelJob);
router.post('/:id/simulate-step', jobController.simulateStep);

module.exports = router;
