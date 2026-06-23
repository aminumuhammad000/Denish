require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const connectDB = require('./config/db');

const seedNotifications = async () => {
  try {
    await connectDB();
    
    // Clear existing notifications
    await Notification.deleteMany({});
    
    const demoNotifications = [
      {
        title: "New Dispute Filed",
        message: "Customer Aisha Mohammed filed a dispute for Order ORD-001.",
        type: "dispute",
        read: false
      },
      {
        title: "Driver Registration",
        message: "New driver Bayo Adeyemi submitted registration documents.",
        type: "driver",
        read: false
      },
      {
        title: "Payout Completed",
        message: "Weekly vendor payout of N245K processed successfully.",
        type: "payment",
        read: true
      },
      {
        title: "Low Inventory Alert",
        message: "Vendor 'Mama's Kitchen' is running low on 3 popular items.",
        type: "system",
        read: false
      },
      {
        title: "Server Maintenance",
        message: "Scheduled maintenance tonight at 2:00 AM (WAT).",
        type: "system",
        read: false
      }
    ];
    
    await Notification.insertMany(demoNotifications);
    console.log('Demo notifications seeded successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
};

seedNotifications();
