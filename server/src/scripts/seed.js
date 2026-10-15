const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');
const Kiosk = require('../models/Kiosk');
const AdminUser = require('../models/AdminUser');
const PricingConfig = require('../models/PricingConfig');
const PrintJob = require('../models/PrintJob');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

async function seed(disconnectAfter = true) {
  try {
    await connectDB();
    logger.info('Starting database seeding...');

    // 1. Seed Kiosks
    await Kiosk.deleteMany({});
    const kiosks = await Kiosk.insertMany([
      {
        kioskId: 'KIOSK-LIB-01',
        name: 'Central Library - Ground Floor Lobby',
        location: 'Library Building, Ground Floor West',
        status: 'ONLINE',
        supportedPaperSizes: ['A4', 'A3'],
        supportedPrintModes: ['BW', 'COLOR'],
        supportedDuplex: true,
        paperLevel: 94,
        tonerBlack: 88,
        tonerColor: 76,
        queueLength: 0,
        queueLimit: 25,
        estimatedWaitMinutes: 0
      },
      {
        kioskId: 'KIOSK-ENG-02',
        name: 'Engineering Block - Tech Atrium',
        location: 'Engineering Complex, Level 1 Main Hall',
        status: 'ONLINE',
        supportedPaperSizes: ['A4', 'A3'],
        supportedPrintModes: ['BW', 'COLOR'],
        supportedDuplex: true,
        paperLevel: 82,
        tonerBlack: 70,
        tonerColor: 65,
        queueLength: 1,
        queueLimit: 20,
        estimatedWaitMinutes: 2
      },
      {
        kioskId: 'KIOSK-CAF-03',
        name: 'Student Center & Cafeteria',
        location: 'Campus Hub, Food Court Entrance',
        status: 'ONLINE',
        supportedPaperSizes: ['A4'],
        supportedPrintModes: ['BW', 'COLOR'],
        supportedDuplex: true,
        paperLevel: 68,
        tonerBlack: 55,
        tonerColor: 48,
        queueLength: 0,
        queueLimit: 15,
        estimatedWaitMinutes: 0
      },
      {
        kioskId: 'KIOSK-MED-04',
        name: 'Health Sciences Wing',
        location: 'Medical Science Wing, 2nd Floor',
        status: 'MAINTENANCE',
        supportedPaperSizes: ['A4'],
        supportedPrintModes: ['BW'],
        supportedDuplex: false,
        paperLevel: 15,
        tonerBlack: 10,
        tonerColor: 0,
        queueLength: 0,
        queueLimit: 15,
        estimatedWaitMinutes: 0
      }
    ]);
    logger.info(`Seeded ${kiosks.length} campus kiosks.`);

    // 2. Seed Pricing Configuration
    await PricingConfig.deleteMany({});
    await PricingConfig.create({
      rates: {
        A4: { BW: 2.0, COLOR: 10.0 },
        A3: { BW: 5.0, COLOR: 20.0 }
      },
      duplexDiscountPercentage: 5, // 5% eco-friendly duplex discount
      currency: 'INR',
      currencySymbol: '₹',
      lastUpdatedBy: 'SYSTEM_SEED'
    });
    logger.info('Seeded default campus printing pricing.');

    // 3. Seed Admin User
    await AdminUser.deleteMany({});
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@12345', salt);

    await AdminUser.create({
      name: 'Campus System Administrator',
      email: 'admin@campusprint.edu',
      passwordHash,
      role: 'SUPERADMIN',
      isActive: true
    });
    logger.info('Seeded admin user: admin@campusprint.edu (password: Admin@12345)');

    // 4. Seed sample completed jobs for historical analytics
    await PrintJob.deleteMany({});
    await Payment.deleteMany({});

    const sampleJobs = [
      {
        jobNumber: 'JOB-20261014-9A2B',
        sessionId: 'SES-0001-A1',
        kioskId: 'KIOSK-LIB-01',
        documents: [{ filename: 'Assignment_Draft.pdf', pageCount: 4, fileSizeBytes: 142000 }],
        settings: {
          paperSize: 'A4',
          printMode: 'BW',
          copies: 1,
          pageRange: 'all',
          selectedPagesCount: 4,
          duplex: true
        },
        quote: {
          ratePerSide: 2,
          totalSides: 4,
          totalSheets: 2,
          subtotal: 8,
          discount: 0.4,
          totalAmount: 7.6,
          currency: 'INR'
        },
        status: 'COLLECTED',
        collectedAt: new Date(Date.now() - 3600 * 24 * 1000),
        statusHistory: [
          { status: 'COLLECTED', timestamp: new Date(Date.now() - 3600 * 24 * 1000), note: 'Collected' }
        ]
      },
      {
        jobNumber: 'JOB-20261015-3C4D',
        sessionId: 'SES-0002-B2',
        kioskId: 'KIOSK-ENG-02',
        documents: [{ filename: 'Lab_Report_Final.pdf', pageCount: 10, fileSizeBytes: 890000 }],
        settings: {
          paperSize: 'A4',
          printMode: 'COLOR',
          copies: 1,
          pageRange: 'all',
          selectedPagesCount: 10,
          duplex: false
        },
        quote: {
          ratePerSide: 10,
          totalSides: 10,
          totalSheets: 10,
          subtotal: 100,
          discount: 0,
          totalAmount: 100,
          currency: 'INR'
        },
        status: 'COLLECTED',
        collectedAt: new Date(Date.now() - 3600 * 6 * 1000),
        statusHistory: [
          { status: 'COLLECTED', timestamp: new Date(Date.now() - 3600 * 6 * 1000), note: 'Collected' }
        ]
      }
    ];

    await PrintJob.insertMany(sampleJobs);

    // Seed corresponding payments
    await Payment.create([
      {
        paymentId: 'TXN-SEED-01',
        jobNumber: 'JOB-20261014-9A2B',
        sessionId: 'SES-0001-A1',
        amount: 7.6,
        paymentMode: 'SIMULATED_UPI',
        status: 'SUCCESS',
        isSimulated: true,
        upiId: 'st***@okhdfcbank'
      },
      {
        paymentId: 'TXN-SEED-02',
        jobNumber: 'JOB-20261015-3C4D',
        sessionId: 'SES-0002-B2',
        amount: 100,
        paymentMode: 'SIMULATED_UPI',
        status: 'SUCCESS',
        isSimulated: true,
        upiId: 'fa***@oksbi'
      }
    ]);

    logger.info('Seeded demonstration jobs and payments.');
    logger.info('✅ Database seeding finished successfully!');
  } catch (err) {
    logger.error('Error during database seed:', err);
  } finally {
    if (disconnectAfter) {
      await disconnectDB();
    }
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
