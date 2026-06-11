require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const adminEmail = 'denish@admin.com';
    const adminPassword = 'Admin@123456';
    
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists. Updating password...');
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log('Admin password updated successfully.');
    } else {
      const newAdmin = new Admin({
        email: adminEmail,
        password: adminPassword,
        name: 'Denish Admin'
      });
      await newAdmin.save();
      console.log('Admin created successfully.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
