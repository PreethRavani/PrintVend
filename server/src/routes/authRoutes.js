const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAdminAuth, authController.getMe);

module.exports = router;
