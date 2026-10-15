const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const seed = require('../src/scripts/seed');

let testSessionId;

beforeAll(async () => {
  await seed(false);
  const sessionRes = await request(app)
    .post('/api/sessions')
    .send({ kioskId: 'KIOSK-LIB-01' });
  testSessionId = sessionRes.body.data.sessionId;
});

afterAll(async () => {
  await disconnectDB();
});

describe('College Catalog API Tests', () => {
  test('GET /api/catalog returns branch list, year list, and documents', async () => {
    const res = await request(app).get('/api/catalog');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.branches.length).toBe(8);
    expect(res.body.data.years.length).toBe(4);
    expect(Array.isArray(res.body.data.documents)).toBe(true);
    expect(res.body.data.documents.length).toBeGreaterThan(0);
  });

  test('GET /api/catalog filters by branch and year', async () => {
    const res = await request(app).get('/api/catalog?branch=CS&year=TY');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const docs = res.body.data.documents;
    expect(docs.some((d) => d.id === 'cs-ty-os-lab')).toBe(true);
    // Universal college forms should also be included
    expect(docs.some((d) => d.id === 'form-bonafide-cert')).toBe(true);
  });

  test('POST /api/catalog/select adds official document to active print session', async () => {
    const res = await request(app)
      .post('/api/catalog/select')
      .send({
        sessionId: testSessionId,
        catalogId: 'cs-ty-os-lab'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.document).toBeDefined();
    expect(res.body.data.document.pageCount).toBe(7);
    expect(res.body.data.document.source).toBe('COLLEGE_CATALOG');

    // Verify session now contains the document
    const sessionRes = await request(app).get(`/api/sessions/${testSessionId}`);
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.data.documents.length).toBeGreaterThan(0);
    expect(sessionRes.body.data.documents.some((d) => d.courseCode === 'CS501L')).toBe(true);
  });
});
