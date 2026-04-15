require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// CORS Configuration
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

// ========================
// Serve Frontend Static Files
// ========================
// Try multiple possible paths for client/dist
const possiblePaths = [
  path.join(__dirname, '../../client/dist'),
  '/opt/render/project/repo/client/dist',
  '/opt/render/project/client/dist',
  path.join(process.cwd(), '../client/dist'),
  path.join(process.cwd(), 'client/dist'),
];

let frontendDistPath = possiblePaths[0];
console.log('📍 Current working directory:', process.cwd());
console.log('📍 __dirname:', __dirname);

for (const possiblePath of possiblePaths) {
  console.log('🔍 Checking:', possiblePath);
  if (require('fs').existsSync(possiblePath)) {
    console.log('✅ Found frontend dist at:', possiblePath);
    frontendDistPath = possiblePath;
    break;
  }
}

if (!require('fs').existsSync(frontendDistPath)) {
  console.log('❌ Frontend dist folder NOT found at any expected location!');
  console.log('📌 Build command may not have executed. Check render.yaml buildCommand.');
}

app.use(express.static(frontendDistPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running and healthy!' });
});

// SPA Fallback - Redirect all non-API routes to index.html
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  } else {
    next();
  }
});

// Run the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Frontend served from: ${frontendDistPath}`);
});