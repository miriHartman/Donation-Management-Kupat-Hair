require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'https://donation-management-kupat-hair-client.onrender.com', // Production frontend (correct URL)
    'https://donation-management-kupat-hair.onrender.com', // Production fallback
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