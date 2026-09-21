const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const voterRoutes = require('./routes/voterRoutes');
const verifyRoutes = require('./routes/verifyRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database Initialization
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/voter', voterRoutes);
app.use('/api/verify', verifyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'EvoTivity Node.js Express Backend API (Contributor 1)' });
});

app.listen(PORT, () => {
  console.log(`\n=======================================================`);
  console.log(`🚀 EvoTivity Express Backend API Server running on port ${PORT}`);
  console.log(`=======================================================\n`);
});
