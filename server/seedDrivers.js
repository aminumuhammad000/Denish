require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./models/Driver');

const DRIVER_ACCOUNTS = [
  {
    name: 'Bayo Adeyemi',
    email: 'driver@denish.ng',
    phone: '08012345678',
    password: 'driver123',
    profilePic: null,
    vehicleType: 'Motorcycle',
    vehicle: {
      type: 'Motorcycle',
      make: 'Honda CB500',
      plate: 'LAG-234-BA',
      color: 'Red',
    },
    bank: {
      name: 'GTBank',
      accountName: 'Bayo Adeyemi',
      accountNumber: '0123456789',
    },
    status: 'Active',
    earnings: {
      totalEarned: 248000,
      availableBalance: 62500,
      totalTrips: 97,
    },
  },
  {
    name: 'Chukwuemeka Eze',
    email: 'driver2@denish.ng',
    phone: '08098765432',
    password: 'driver123',
    profilePic: null,
    vehicleType: 'Bike',
    vehicle: {
      type: 'Bike',
      make: 'TVS Apache 200',
      plate: 'ABJ-110-CK',
      color: 'Black',
    },
    bank: {
      name: 'Access Bank',
      accountName: 'Chukwuemeka Eze',
      accountNumber: '0987654321',
    },
    status: 'Active',
    earnings: {
      totalEarned: 185000,
      availableBalance: 41000,
      totalTrips: 73,
    },
  },
];

/**
 * Seeds driver accounts idempotently.
 * Can be called at server startup OR run standalone via `node seedDrivers.js`
 */
const seedDrivers = async ({ exitOnComplete = false } = {}) => {
  try {
    // Only connect to DB if not already connected (standalone CLI mode)
    if (mongoose.connection.readyState === 0) {
      const connectDB = require('./config/db');
      await connectDB();
    }

    for (const driverData of DRIVER_ACCOUNTS) {
      const existing = await Driver.findOne({ email: driverData.email });
      if (!existing) {
        await Driver.create(driverData);
        console.log(`✅ Driver created: ${driverData.name} (${driverData.email})`);
      } else {
        console.log(`ℹ️  Driver already exists: ${driverData.name} (${driverData.email})`);
      }
    }

    if (exitOnComplete) {
      console.log('');
      console.log('====================================================');
      console.log('  ✅  DRIVER SEED COMPLETED SUCCESSFULLY!');
      console.log('====================================================');
      console.log('  Driver Login Credentials:');
      console.log('');
      DRIVER_ACCOUNTS.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.name}`);
        console.log(`     Email:    ${d.email}`);
        console.log(`     Phone:    ${d.phone}`);
        console.log(`     Password: ${d.password}`);
        console.log(`     Vehicle:  ${d.vehicle.color} ${d.vehicle.make} (${d.vehicle.plate})`);
        console.log(`     Status:   ${d.status}`);
        console.log('');
      });
      console.log('====================================================');
      process.exit(0);
    }

    return true;
  } catch (error) {
    console.error('❌ Error seeding drivers:', error);
    if (exitOnComplete) process.exit(1);
    throw error;
  }
};

// Allow running standalone: node seedDrivers.js
if (require.main === module) {
  seedDrivers({ exitOnComplete: true });
}

module.exports = { seedDrivers };
