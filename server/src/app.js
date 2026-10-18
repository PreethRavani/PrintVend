const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const kioskRoutes = require('./routes/kioskRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const jobRoutes = require('./routes/jobRoutes');
const adminRoutes = require('./routes/adminRoutes');
const catalogRoutes = require('./routes/catalogRoutes');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching local origins
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev prototype
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'x-session-token']
  })
);

// Logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limit for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: { message: 'Too many login attempts. Please try again later.', code: 'RATE_LIMIT_EXCEEDED' }
  }
});
app.use('/api/auth/login', authLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'Smart Campus Print Kiosk System API',
    timestamp: new Date(),
    environment: config.env
  });
});

// Database connection assurance for serverless / on-demand environments
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');

let dbInitPromise = null;
const ensureDatabase = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await connectDB();
      const Kiosk = require('./models/Kiosk');
      const kioskCount = await Kiosk.countDocuments();
      if (kioskCount === 0) {
        const seed = require('./scripts/seed');
        await seed(false);
      }
    })().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
};

app.use(async (req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/kiosks', kioskRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/catalog', catalogRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.originalUrl} not found`, code: 'NOT_FOUND' }
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
