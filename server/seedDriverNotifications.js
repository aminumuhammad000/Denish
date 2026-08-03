require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Notification = require('./models/Notification');

const seedDriverNotifications = async () => {
  try {
    await connectDB();

    const now = new Date();
    const minutesAgo = (m) => new Date(now - m * 60 * 1000);
    const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);
    const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000);

    const notifications = [
      {
        title: 'New Delivery Available',
        message: 'Order #ORD-2451 from Mama\'s Kitchen is ready for pickup. Delivery to Lekki Phase 1.',
        type: 'order',
        recipient: 'driver',
        read: false,
        createdAt: minutesAgo(2),
      },
      {
        title: 'Earnings Credited',
        message: '₦850 has been added to your wallet for delivering Order #ORD-2449.',
        type: 'payment',
        recipient: 'driver',
        read: false,
        createdAt: minutesAgo(45),
      },
      {
        title: 'Order Assigned',
        message: 'You have been assigned Order #ORD-2448 from Spicy Chops. Customer: Aisha Mohammed.',
        type: 'order',
        recipient: 'driver',
        read: false,
        createdAt: hoursAgo(2),
      },
      {
        title: 'Withdrawal Successful',
        message: 'Your withdrawal of ₦25,000 to GTBank account ending in 6789 was successful.',
        type: 'payment',
        recipient: 'driver',
        read: true,
        createdAt: hoursAgo(5),
      },
      {
        title: 'New Promo Available',
        message: 'Complete 10 deliveries this week and earn a ₦5,000 bonus! Offer valid till Sunday.',
        type: 'promo',
        recipient: 'driver',
        read: true,
        createdAt: hoursAgo(8),
      },
      {
        title: 'Order Delivered Successfully',
        message: 'Order #ORD-2445 has been marked as delivered. Great job!',
        type: 'order',
        recipient: 'driver',
        read: true,
        createdAt: daysAgo(1),
      },
      {
        title: 'App Update Available',
        message: 'A new version of the Denish Driver app is available. Please update for the best experience.',
        type: 'system',
        recipient: 'all',
        read: true,
        createdAt: daysAgo(2),
      },
      {
        title: 'Terms of Service Updated',
        message: 'We have updated our terms of service and privacy policy. Please review the changes.',
        type: 'system',
        recipient: 'all',
        read: true,
        createdAt: daysAgo(3),
      },
    ];

    // Remove old driver notifications and insert fresh ones
    await Notification.deleteMany({ recipient: { $in: ['driver', 'all'] } });
    await Notification.insertMany(notifications);

    console.log('');
    console.log('====================================================');
    console.log('  ✅  DRIVER NOTIFICATIONS SEEDED!');
    console.log(`  Inserted ${notifications.length} notifications`);
    console.log('====================================================');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding driver notifications:', error);
    process.exit(1);
  }
};

seedDriverNotifications();
