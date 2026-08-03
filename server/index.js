require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { seedAdmin } = require('./seedAdmin');
const { seedDrivers } = require('./seedDrivers');
const { seedDriverNotifications } = require('./seedDriverNotifications');
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

// One-time protected endpoint to seed driver accounts into production DB
app.get('/api/seed-drivers', async (req, res) => {
  if (req.query.token !== 'DenishSeed2024') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const Driver = require('./models/Driver');
    const DRIVER_ACCOUNTS = [
      {
        name: 'Bayo Adeyemi',
        email: 'driver@denish.ng',
        phone: '08012345678',
        password: 'driver123',
        vehicleType: 'Motorcycle',
        vehicle: { type: 'Motorcycle', make: 'Honda CB500', plate: 'LAG-234-BA', color: 'Red' },
        bank: { name: 'GTBank', accountName: 'Bayo Adeyemi', accountNumber: '0123456789' },
        status: 'Active',
        earnings: { totalEarned: 248000, availableBalance: 62500, totalTrips: 97 },
      },
      {
        name: 'Chukwuemeka Eze',
        email: 'driver2@denish.ng',
        phone: '08098765432',
        password: 'driver123',
        vehicleType: 'Bike',
        vehicle: { type: 'Bike', make: 'TVS Apache 200', plate: 'ABJ-110-CK', color: 'Black' },
        bank: { name: 'Access Bank', accountName: 'Chukwuemeka Eze', accountNumber: '0987654321' },
        status: 'Active',
        earnings: { totalEarned: 185000, availableBalance: 41000, totalTrips: 73 },
      },
    ];
    const results = [];
    for (const d of DRIVER_ACCOUNTS) {
      const existing = await Driver.findOne({ email: d.email });
      if (!existing) {
        await Driver.create(d);
        results.push({ email: d.email, action: 'created' });
      } else {
        // Update password and status in case they changed
        existing.password = d.password;
        existing.status = d.status;
        await existing.save();
        results.push({ email: d.email, action: 'updated' });
      }
    }
    return res.status(200).json({
      success: true,
      message: 'Drivers seeded successfully',
      results,
      loginDetails: DRIVER_ACCOUNTS.map(d => ({
        name: d.name,
        email: d.email,
        phone: d.phone,
        password: d.password,
        status: d.status,
      })),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
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

    try {
      await seedDriverNotifications();
      console.log('Driver notification seed check complete.');
    } catch (error) {
      console.error('Driver notification seed check failed:', error);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server started on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
