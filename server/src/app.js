require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'https://donation-management-kupat-hair.onrender.com', // Production frontend
    'http://localhost:5173', // Local development (Vite default)
    'http://localhost:3000', // Local development fallback
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// Port Configuration for Render
const PORT = process.env.PORT || 3000;

// ========================
// API Routes (must be before static files)
// ========================
require('./jobs/bank_rates'); // Bank rates update job

const branchRouter = require('./routers/branchRoutes');
app.use('/api/branches', branchRouter);

const cashRouter = require('./routers/cashRoutes');
app.use('/api/cash-reports', cashRouter);

const donationRoutes = require('./routers/donationRoutes');
app.use('/api/donations', donationRoutes);

const authRoutes = require('./routers/authRoutes');
app.use('/api/auth', authRoutes);

const exchangeRateRoutes = require('./routers/exchangeRateRoutes');
app.use('/api/exchange-rates', exchangeRateRoutes);

// ========================
// Serve Frontend Static Files
// ========================
const frontendDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(frontendDistPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running and healthy!' });
});

// SPA Fallback - Redirect all non-API routes to index.html
// Must be last middleware before listen
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Serve index.html for all other routes (SPA fallback)
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Run the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Frontend served from: ${frontendDistPath}`);
});