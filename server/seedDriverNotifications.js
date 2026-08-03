require('dotenv').config();
const mongoose = require('mongoose');

const DRIVER_NOTIFICATIONS = [
  {
    title: 'New Delivery Available',
    message: "Order #ORD-2451 from Mama's Kitchen is ready for pickup. Delivery to Lekki Phase 1.",
    type: 'order',
    recipient: 'driver',
    read: false,
  },
  {
    title: 'Earnings Credited',
    message: '₦850 has been added to your wallet for delivering Order #ORD-2449.',
    type: 'payment',
    recipient: 'driver',
    read: false,
  },
  {
    title: 'Order Assigned',
    message: 'You have been assigned Order #ORD-2448 from Spicy Chops. Customer: Aisha Mohammed.',
    type: 'order',
    recipient: 'driver',
    read: false,
  },
  {
    title: 'Withdrawal Successful',
    message: 'Your withdrawal of ₦25,000 to GTBank account ending in 6789 was successful.',
    type: 'payment',
    recipient: 'driver',
    read: true,
  },
  {
    title: 'Bonus Promo Available',
    message: 'Complete 10 deliveries this week and earn a ₦5,000 bonus! Offer valid till Sunday.',
    type: 'promo',
    recipient: 'driver',
    read: true,
  },
  {
    title: 'Order Delivered Successfully',
    message: 'Order #ORD-2445 has been marked as delivered. Great job!',
    type: 'order',
    recipient: 'driver',
    read: true,
  },
  {
    title: 'App Update Available',
    message: 'A new version of the Denish Driver app is available. Please update for the best experience.',
    type: 'system',
    recipient: 'all',
    read: true,
  },
  {
    title: 'Terms of Service Updated',
    message: 'We have updated our terms of service and privacy policy. Please review the changes.',
    type: 'system',
    recipient: 'all',
    read: true,
  },
];

/**
 * Seeds driver notification data idempotently.
 * Only seeds if there are no driver notifications in the DB yet.
 */
const seedDriverNotifications = async ({ exitOnComplete = false } = {}) => {
  try {
    if (mongoose.connection.readyState === 0) {
      const connectDB = require('./config/db');
      await connectDB();
    }

    const Notification = require('./models/Notification');

    // Only seed if no driver notifications exist yet
    const existing = await Notification.countDocuments({ recipient: { $in: ['driver', 'all'] } });
    if (existing > 0) {
      console.log(`ℹ️  Driver notifications already exist (${existing} found). Skipping seed.`);
      if (exitOnComplete) process.exit(0);
      return true;
    }

    // Add timestamps spread across last 3 days for realism
    const now = new Date();
    const withTimestamps = DRIVER_NOTIFICATIONS.map((n, i) => ({
      ...n,
      createdAt: new Date(now - i * 3 * 60 * 60 * 1000), // each 3 hours apart
      updatedAt: new Date(now - i * 3 * 60 * 60 * 1000),
    }));

    await Notification.insertMany(withTimestamps);
    console.log(`✅ Seeded ${withTimestamps.length} driver notifications.`);

    if (exitOnComplete) {
      console.log('====================================================');
      console.log('  ✅  DRIVER NOTIFICATIONS SEEDED SUCCESSFULLY!');
      console.log('====================================================');
      process.exit(0);
    }

    return true;
  } catch (error) {
    console.error('❌ Error seeding driver notifications:', error);
    if (exitOnComplete) process.exit(1);
    throw error;
  }
};

// Allow standalone: node seedDriverNotifications.js
if (require.main === module) {
  seedDriverNotifications({ exitOnComplete: true });
}

module.exports = { seedDriverNotifications };
