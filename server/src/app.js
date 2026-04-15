require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// CORS Middleware - MUST be BEFORE any routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Also use cors package as fallback
app.use(cors());
app.use(express.json());

// Port Configuration for Render
const PORT = process.env.PORT || 3000;

// ========================
// API Routes
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running and healthy!' });
});

// Run the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});