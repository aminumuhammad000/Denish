try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional
}

const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
const connectDB = require('./config/db');

const email = process.argv[2] || 'aminumuhammad00015@gmail.com';
const amount = parseFloat(process.argv[3]) || 20000;
const password = process.argv[4] || 'Vendor@123456';
const businessName = process.argv[5] || 'Aminu Vendor';

const createOrCreditVendor = async () => {
  try {
    await connectDB();

    const cleanEmail = email.trim().toLowerCase();
    let vendor = await Vendor.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (vendor) {
      console.log(`\n[+] Found existing vendor: "${vendor.businessName || vendor.name}" (${vendor.email})`);
      const oldBalance = vendor.earnings?.availableBalance || 0;
      
      if (!vendor.earnings) {
        vendor.earnings = { availableBalance: 0, weeklyRevenue: 0, totalOrders: 0, avgOrders: 0 };
      }
      
      vendor.earnings.availableBalance = (vendor.earnings.availableBalance || 0) + amount;
      vendor.status = 'Approved';
      vendor.isVerified = true;
      await vendor.save();

      console.log(`[+] Vendor status: Approved`);
      console.log(`[+] Previous Balance: ₦${oldBalance.toLocaleString()}`);
      console.log(`[+] Credited:         ₦${amount.toLocaleString()}`);
      console.log(`[+] New Balance:      ₦${vendor.earnings.availableBalance.toLocaleString()}\n`);
    } else {
      console.log(`\n[+] Creating new vendor account for ${cleanEmail}...`);
      vendor = await Vendor.create({
        name: businessName,
        businessName: businessName,
        email: cleanEmail,
        password: password,
        phone: '08000000000',
        category: 'Local dishes',
        status: 'Approved',
        isVerified: true,
        earnings: {
          availableBalance: amount,
          weeklyRevenue: amount,
          totalOrders: 0,
          avgOrders: 0
        },
        deliveryTime: '20-30 min',
        deliveryFee: 500,
        rating: 5.0
      });

      console.log(`\n========================================`);
      console.log(`  Vendor Created & Credited Successfully!`);
      console.log(`========================================`);
      console.log(`ID:               ${vendor._id}`);
      console.log(`Email:            ${vendor.email}`);
      console.log(`Password:         ${password}`);
      console.log(`Business Name:    ${vendor.businessName}`);
      console.log(`Status:           ${vendor.status}`);
      console.log(`Available Balance: ₦${vendor.earnings.availableBalance.toLocaleString()}`);
      console.log(`========================================\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('[-] Error creating/crediting vendor:', error.message);
    process.exit(1);
  }
};

createOrCreditVendor();
