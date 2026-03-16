require('dotenv').config();

const express = require('express');
const cors = require('cors'); 
const app = express();
app.use(cors());
// app.use(cors({
//   origin: 'http://localhost:5173', 
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }));

app.use(express.json());



// const PORT = 'https://donation-management-kupat-hair.onrender.com/api';

app.get('/', (req, res) => {
  res.send('Server is running');
});
const branchRouter = require('./routers/branchRoutes');
app.use('/api/branches', branchRouter);

const cashRouter = require('./routers/cashRoutes');
app.use('/api/cash-reports', cashRouter); 

const donationRoutes = require('./routers/donationRoutes');
app.use('/api/donations', donationRoutes);

const authRoutes = require('./routers/authRoutes');
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
