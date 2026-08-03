require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Driver = require('./models/Driver');

const seedDrivers = async () => {
  try {
    await connectDB();

    const drivers = [
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

    for (const driverData of drivers) {
      await Driver.findOneAndUpdate(
        { email: driverData.email },
        driverData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('');
    console.log('====================================================');
    console.log('  ✅  DRIVER SEED COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('  Use any of the following credentials to log in:');
    console.log('');
    drivers.forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.name}`);
      console.log(`     Email:    ${d.email}`);
      console.log(`     Phone:    ${d.phone}`);
      console.log(`     Password: ${d.password}`);
      console.log(`     Vehicle:  ${d.vehicle.color} ${d.vehicle.make} (${d.vehicle.plate})`);
      console.log(`     Status:   ${d.status}`);
      console.log('');
    });
    console.log('====================================================');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding drivers:', error);
    process.exit(1);
  }
};

seedDrivers();
