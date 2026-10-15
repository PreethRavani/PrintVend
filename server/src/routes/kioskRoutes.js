const express = require('express');
const router = express.Router();
const kioskController = require('../controllers/kioskController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.get('/', kioskController.getKiosks);
router.get('/:id', kioskController.getKioskById);
router.post('/', requireAdminAuth, kioskController.createKiosk);
router.patch('/:id', requireAdminAuth, kioskController.updateKiosk);

module.exports = router;
