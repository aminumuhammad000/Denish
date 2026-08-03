require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { seedAdmin } = require('./seedAdmin');
const { seedDrivers } = require('./seedDrivers');
const vendorRoutes = require('./routes/vendorRoutes');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: [
    'https://admin.denishng.com',
    'https://www.denishng.com',
    'https://api.denishng.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://0.0.0.0:3000',
    'http://0.0.0.0:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running normally' });
});

connectDB()
  .then(async () => {
    try {
      await seedAdmin();
      console.log('Admin seed check complete.');
    } catch (error) {
      console.error('Admin seed check failed:', error);
    }

    try {
      await seedDrivers();
      console.log('Driver seed check complete.');
    } catch (error) {
      console.error('Driver seed check failed:', error);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server started on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
