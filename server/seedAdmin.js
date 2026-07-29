require('dotenv').config();
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

const seedAdmin = async ({ exitOnComplete = false } = {}) => {
  try {
    await connectDB();

    const adminEmail = 'admin@denish.com';
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

    if (exitOnComplete) process.exit(0);
    return true;
  } catch (error) {
    console.error('Error seeding admin:', error);
    if (exitOnComplete) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedAdmin({ exitOnComplete: true });
}

module.exports = { seedAdmin };
