require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const app = express();

// הגדרת CORS - מאפשר לכל המקורות לגשת (הכי בטוח לעבודה מול Render כרגע)
app.use(cors());

app.use(express.json());

// --- תיקון הפורט ---
// אנחנו אומרים לו: קח את הפורט ש-Render נותן לך, ואם אין (כמו במחשב בבית), קח 3000
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Server is running and healthy!');
});

require('./jobs/bank_rates'); // ייבוא והפעלת ה-Job של עדכון שערי החליפין

// --- הראוטים  ---
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

// Run the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is up! Listening on port: ${PORT}`);
});