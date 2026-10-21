const QRCode = require('qrcode');
const PrintSession = require('../models/PrintSession');
const Kiosk = require('../models/Kiosk');
const Document = require('../models/Document');
const { generateSecureToken, hashToken, generateSessionId } = require('../utils/tokenGenerator');
const { getLocalLanIp } = require('../utils/networkUtils');
const cleanupService = require('../services/cleanupService');
const config = require('../config/config');
const logger = require('../utils/logger');

exports.createSession = async (req, res, next) => {
  try {
    const { kioskId = 'KIOSK-LIB-01', studentId } = req.body;

    let kiosk = await Kiosk.findOne({ kioskId: (kioskId || 'KIOSK-LIB-01').toUpperCase() });
    if (!kiosk) {
      kiosk = await Kiosk.findOne({ status: 'ONLINE' });
      if (!kiosk) {
        kiosk = await Kiosk.create({
          kioskId: 'KIOSK-LIB-01',
          name: 'Central Library - Ground Floor Lobby',
          location: 'Library Building, Ground Floor West',
          status: 'ONLINE',
          supportedPaperSizes: ['A4', 'A3'],
          supportedPrintModes: ['BW', 'COLOR'],
          supportedDuplex: true,
          paperLevel: 94,
          tonerBlack: 88,
          tonerColor: 76
        });
      }
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

    // Mobile upload URL resolution:
    // Automatically detect the public URL where the kiosk is currently accessed from (e.g. https://printvend.vercel.app)
    const forwardedHost = req.get('x-forwarded-host') || req.get('host');
    const forwardedProto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
    const requestOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : null;

    // Use requestOrigin if available and not an internal vercel-infra domain
    let clientBase = requestOrigin;
    if (!clientBase || clientBase.includes('vercel-infra.com')) {
      clientBase = process.env.CLIENT_URL || config.clientUrl;
    }
    if (clientBase && clientBase.includes('vercel-infra.com')) {
      clientBase = requestOrigin || config.clientUrl;
    }
    clientBase = (clientBase || '').replace(/\/$/, '');

    // For local testing on Wi-Fi/LAN, if URL points to localhost, replace with host machine's LAN IP
    // so mobile devices scanning the QR code can open the client over the local network.
    if (!process.env.VERCEL && (clientBase.includes('localhost') || clientBase.includes('127.0.0.1'))) {
      const lanIp = getLocalLanIp();
      if (lanIp && lanIp !== 'localhost') {
        clientBase = clientBase.replace('localhost', lanIp).replace('127.0.0.1', lanIp);
      }
    }
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
