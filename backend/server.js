const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const clientUrls = (process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/craftigenstore';
const uploadsDir = path.join(__dirname, 'uploads');

const UserRouter = require('./routers/userRouter');
const ProductRouter = require('./routers/productRouter');
const ContactRouter = require('./routers/contactRouter');
const UtilRouter = require('./routers/util');
const OrderRouter = require('./routers/orderRouter');
const { requireProductionSecret } = require('./routers/helpers');

requireProductionSecret();

mongoose
  .connect(mongoUrl, {
    serverSelectionTimeoutMS: 10000
  })
  .then(() => {
    console.log('connected to database');
  })
  .catch((err) => {
    console.log('database connection failed:', err.message);
  });

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        ...clientUrls,
        "https://craftigen-store.vercel.app",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  })
);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const requestCounts = new Map();
app.use((req, res, next) => {
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 300;
  const key = req.ip;
  const now = Date.now();
  const entry = requestCounts.get(key) || { count: 0, resetAt: now + windowMs };

  if (entry.resetAt < now) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  requestCounts.set(key, entry);

  if (entry.count > maxRequests) {
    return res.status(429).json({ message: 'Too many requests, please try again later' });
  }

  next();
});

app.use('/user', UserRouter);
app.use('/product', ProductRouter);
app.use('/contact', ContactRouter);
app.use('/util', UtilRouter);
app.use('/order', OrderRouter);

app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d',
  index: false
}));
app.use(express.static(uploadsDir, {
  maxAge: '7d',
  index: false
}));

app.get('/', (req, res) => {
  res.json({ message: 'CraftigenStore API is running' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  res.status(500).json({ message: 'Internal server error' });
});

const server = app.listen(port, () => {
  console.log(`express server started successfully on port ${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the running process or change PORT in backend/.env.`);
    process.exit(1);
  }

  console.error('Server startup failed:', err.message);
  process.exit(1);
});

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
