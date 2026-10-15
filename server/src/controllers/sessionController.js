const QRCode = require('qrcode');
const PrintSession = require('../models/PrintSession');
const Kiosk = require('../models/Kiosk');
const Document = require('../models/Document');
const { generateSecureToken, hashToken, generateSessionId } = require('../utils/tokenGenerator');
const cleanupService = require('../services/cleanupService');
const config = require('../config/config');
const logger = require('../utils/logger');

exports.createSession = async (req, res, next) => {
  try {
    const { kioskId = 'KIOSK-LIB-01', studentId } = req.body;

    const kiosk = await Kiosk.findOne({ kioskId: kioskId.toUpperCase() });
    if (!kiosk) {
      return res.status(404).json({
        success: false,
        error: { message: `Kiosk '${kioskId}' not found`, code: 'KIOSK_NOT_FOUND' }
      });
    }

    if (kiosk.status === 'OFFLINE' || kiosk.status === 'MAINTENANCE') {
      return res.status(503).json({
        success: false,
        error: { message: `Kiosk '${kioskId}' is currently ${kiosk.status}`, code: 'KIOSK_UNAVAILABLE' }
      });
    }

    const sessionId = generateSessionId();
    const token = generateSecureToken(24);
    const tokenHash = hashToken(token);

    const expiresAt = new Date(Date.now() + config.sessionExpiryMinutes * 60 * 1000);

    const session = await PrintSession.create({
      sessionId,
      tokenHash,
      kioskId: kiosk.kioskId,
      studentId: studentId ? studentId.trim() : null,
      expiresAt,
      status: 'ACTIVE'
    });

    // Mobile upload URL (points to client frontend route)
    const clientBase = config.clientUrl.replace(/\/$/, '');
    const mobileUploadUrl = `${clientBase}/mobile-upload?session=${sessionId}&token=${token}&kiosk=${kiosk.kioskId}`;

    // Generate QR code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(mobileUploadUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    logger.info(`Created print session ${sessionId} for kiosk ${kiosk.kioskId}`);

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        token, // Returned once to initialize client context
        kioskId: session.kioskId,
        studentId: session.studentId,
        expiresAt: session.expiresAt,
        qrCodeUrl: qrCodeDataUrl,
        mobileUploadUrl
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await PrintSession.findOne({ sessionId: id });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' }
      });
    }

    const documents = await Document.find({
      sessionId: session.sessionId,
      cleanupStatus: { $ne: 'CLEANED' }
    }).select('-storagePath');

    res.json({
      success: true,
      data: {
        session,
        isExpired: session.isExpired(),
        documents
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.closeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await PrintSession.findOne({ sessionId: id });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: 'Session not found', code: 'SESSION_NOT_FOUND' }
      });
    }

    session.status = 'COMPLETED';
    await session.save();

    // Trigger cleanup
    const cleanupResult = await cleanupService.cleanupSessionDocuments(session.sessionId);

    res.json({
      success: true,
      message: 'Session closed and temporary files scheduled for cleanup',
      data: { cleanupResult }
    });
  } catch (err) {
    next(err);
  }
};
