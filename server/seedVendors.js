require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Vendor = require('./models/Vendor');

const seedVendors = async () => {
  try {
    await connectDB();

    const vendorCredentials = [
      {
        name: 'John Doe',
        businessName: "Mama's Kitchen",
        email: 'vendor@kitchen.com',
        phone: '08130000001',
        password: 'password123',
        status: 'Approved',
        category: 'Local dishes',
        address: '15 Admiralty Way, Lekki Phase 1, Lagos'
      },
      {
        name: 'Jane Smith',
        businessName: 'Burger King',
        email: 'vendor@burger.com',
        phone: '08130000002',
        password: 'password123',
        status: 'Approved',
        category: 'Fast food',
        address: '42 Isaac John Street, Ikeja, Lagos'
      },
      {
        name: 'Bolu Wat',
        businessName: 'Spicy Chops',
        email: 'vendor@spicy.com',
        phone: '08130000003',
        password: 'password123',
        status: 'Approved',
        category: 'Snacks & Fast food',
        address: '8 Allen Avenue, Ikeja, Lagos'
      }
    ];

    for (const data of vendorCredentials) {
      await Vendor.findOneAndUpdate(
        { email: data.email },
        data,
        { upsert: true, new: true }
      );
    }

    console.log('----------------------------------------------------');
    console.log(' VENDOR SEED COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('Use any of the following vendor credentials to log in:');
    console.log('');
    vendorCredentials.forEach((v, i) => {
      console.log(`${i + 1}. ${v.businessName} (${v.name})`);
      console.log(`   Email:    ${v.email}`);
      console.log(`   Password: ${v.password}`);
      console.log(`   Category: ${v.category}`);
      console.log(`   Status:   ${v.status}`);
      console.log('----------------------------------------------------');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding vendors:', error);
    process.exit(1);
  }
};

seedVendors();
