const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.createSession);
router.get('/:id', sessionController.getSession);
router.post('/:id/close', sessionController.closeSession);

module.exports = router;
