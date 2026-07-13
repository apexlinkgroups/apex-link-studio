require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const authRoutes      = require('./src/routes/authRoutes');
const projectRoutes   = require('./src/routes/projectRoutes');
const portfolioRoutes = require('./src/routes/portfolioRoutes');
const pricingRoutes   = require('./src/routes/pricingRoutes');
const paymentRoutes   = require('./src/routes/paymentRoutes');
const clientRoutes    = require('./src/routes/clientRoutes');

const app  = express();
const PORT = process.env.PORT || 5050;
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('Copy apps/backend/.env.example to apps/backend/.env and fill in the required values.');
  if (require.main === module) process.exit(1);
}

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  ...(process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()),
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

/* ── Security & Middleware ── */
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));
app.use(morgan('dev'));

/* Stripe webhooks need raw body – mount BEFORE json parser */
app.use('/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./src/routes/webhookRoutes')
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ── Rate Limiting ── */
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests, slow down.' });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many login attempts.' });
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

/* ── Routes ── */
app.use('/api/auth',      authRoutes);
app.use('/api/projects',  projectRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/pricing',   pricingRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/clients',   clientRoutes);

/* ── Health Check ── */
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

/* ── 404 ── */
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

/* ── Global Error Handler ── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

let connectPromise;
let seedPromise;

async function connectDB() {
  if (missingEnv.length) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectPromise) {
    connectPromise = mongoose.connect(process.env.MONGO_URI).then(async (connection) => {
      console.log('✅  MongoDB connected');
      seedPromise ||= require('./src/scripts/seed')();
      await seedPromise;
      return connection;
    });
  }

  return connectPromise;
}

if (require.main === module) {
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`)))
    .catch(err => { console.error('❌  DB connection failed:', err.message); process.exit(1); });
}

module.exports = { app, connectDB };
