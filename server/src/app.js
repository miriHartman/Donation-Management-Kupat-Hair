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

// --- הראוטים שלך ---
const branchRouter = require('./routers/branchRoutes');
app.use('/api/branches', branchRouter);

const cashRouter = require('./routers/cashRoutes');
app.use('/api/cash-reports', cashRouter); 

const donationRoutes = require('./routers/donationRoutes');
app.use('/api/donations', donationRoutes);

const authRoutes = require('./routers/authRoutes');
app.use('/api/auth', authRoutes);

// --- הפעלת השרת ---
// שימי לב ל-'0.0.0.0' - זה קריטי כדי ש-Render יוכל לגשת לשרת מבחוץ
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is up! Listening on port: ${PORT}`);
});