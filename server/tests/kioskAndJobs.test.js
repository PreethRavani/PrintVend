const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const seed = require('../src/scripts/seed');
const Document = require('../src/models/Document');
const PrintJob = require('../src/models/PrintJob');

let serverInstance;
let adminAuthToken;
let testSessionId;
let testJobNumber;
let uploadedDocId;
let testFilePath;

beforeAll(async () => {
  await seed(false); // Seeds database and keeps connection active for tests
  // Login as admin for testing admin protection
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@campusprint.edu', password: 'Admin@12345' });
  adminAuthToken = loginRes.body.data.token;

  // Create temporary dummy file for upload test
  testFilePath = path.join(__dirname, 'test_sample_document.pdf');
  fs.writeFileSync(testFilePath, '%PDF-1.4 simulated binary test content for print kiosk');
});

afterAll(async () => {
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }
  await disconnectDB();
});

describe('Smart Campus Print API Integration Tests', () => {
  describe('Kiosks API', () => {
    test('GET /api/kiosks should return list of active campus kiosks', async () => {
      const res = await request(app).get('/api/kiosks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.kiosks)).toBe(true);
      expect(res.body.data.kiosks.length).toBeGreaterThan(0);
    });
  });

  describe('Session Management & QR Upload', () => {
    test('POST /api/sessions creates a new session with QR URL and token', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ kioskId: 'KIOSK-LIB-01', studentId: '2026-TEST-99' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessionId).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.qrCodeUrl).toMatch(/^data:image\/png;base64/);

      testSessionId = res.body.data.sessionId;
    });

    test('GET /api/sessions/:id should return session details and attached docs', async () => {
      const res = await request(app).get(`/api/sessions/${testSessionId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.session.sessionId).toBe(testSessionId);
    });
  });

  describe('Document Upload & Sanitization', () => {
    test('POST /api/uploads should safely upload document and record metadata', async () => {
      const res = await request(app)
        .post('/api/uploads')
        .field('sessionId', testSessionId)
        .attach('files', testFilePath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.documents.length).toBe(1);

      const doc = res.body.data.documents[0];
      uploadedDocId = doc.id;
      expect(doc.filename).toBe('test_sample_document.pdf');
    });

    test('POST /api/uploads should reject unsupported file extensions (e.g. .exe)', async () => {
      const badFilePath = path.join(__dirname, 'malicious_script.exe');
      fs.writeFileSync(badFilePath, 'dummy binary');

      try {
        const res = await request(app)
          .post('/api/uploads')
          .field('sessionId', testSessionId)
          .attach('files', badFilePath);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
      } finally {
        if (fs.existsSync(badFilePath)) {
          fs.unlinkSync(badFilePath);
        }
      }
    });
  });

  describe('Job Creation & Authoritative Pricing', () => {
    test('POST /api/jobs creates a print job with server-enforced pricing quote', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .send({
          sessionId: testSessionId,
          kioskId: 'KIOSK-LIB-01',
          documentIds: [uploadedDocId],
          settings: {
            paperSize: 'A4',
            printMode: 'BW',
            copies: 2,
            duplex: true
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.jobNumber).toMatch(/^JOB-/);
      expect(res.body.data.job.status).toBe('AWAITING_PAYMENT');
      expect(res.body.data.job.quote.totalAmount).toBeGreaterThan(0);

      testJobNumber = res.body.data.job.jobNumber;
    });
  });

  describe('Simulated Payment & Queue Flow', () => {
    test('POST /api/jobs/simulate-payment handles intentional failure for retry demonstration', async () => {
      const job = await PrintJob.findOne({ jobNumber: testJobNumber });

      const res = await request(app)
        .post('/api/jobs/simulate-payment')
        .send({
          jobNumber: testJobNumber,
          sessionId: testSessionId,
          amount: job.quote.totalAmount,
          upiId: 'fail@okhdfcbank',
          forceFail: true
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PAYMENT_FAILED');
    });

    test('POST /api/jobs/simulate-payment accepts valid simulated payment and places job in QUEUED', async () => {
      const job = await PrintJob.findOne({ jobNumber: testJobNumber });

      const res = await request(app)
        .post('/api/jobs/simulate-payment')
        .send({
          jobNumber: testJobNumber,
          sessionId: testSessionId,
          amount: job.quote.totalAmount,
          upiId: 'student@okhdfcbank',
          forceFail: false
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment.status).toBe('SUCCESS');
      expect(res.body.data.job.status).toBe('QUEUED');
      expect(res.body.data.job.queuePosition).toBeGreaterThan(0);
    });
  });

  describe('Collection Confirmation & Physical File Cleanup', () => {
    test('POST /api/jobs/:id/confirm-collection marks job COLLECTED and purges temporary files from disk', async () => {
      // Advance job to READY_FOR_COLLECTION for testing collection
      const job = await PrintJob.findOne({ jobNumber: testJobNumber });
      job.status = 'READY_FOR_COLLECTION';
      job.collectionCode = '9876';
      await job.save();

      const res = await request(app)
        .post(`/api/jobs/${testJobNumber}/confirm-collection`)
        .send({ collectionCode: '9876' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COLLECTED');
      expect(res.body.data.cleanupReport.success).toBe(true);

      // Verify that document cleanup status in DB is now CLEANED
      const doc = await Document.findById(uploadedDocId);
      expect(doc.cleanupStatus).toBe('CLEANED');
    });
  });

  describe('Admin Route Protection', () => {
    test('GET /api/admin/overview should reject request without token (401)', async () => {
      const res = await request(app).get('/api/admin/overview');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('GET /api/admin/overview should succeed with valid admin JWT token (200)', async () => {
      const res = await request(app)
        .get('/api/admin/overview')
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.totalJobs).toBeDefined();
    });
  });
});
