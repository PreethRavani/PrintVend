const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

router.get('/', catalogController.getCatalog);
router.post('/select', catalogController.addCatalogDocument);
router.post('/session/:sessionId/select', catalogController.addCatalogDocument);

module.exports = router;
