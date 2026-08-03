require('dotenv').config();
const mongoose = require('mongoose');

const SAMPLE_MESSAGES = [
  {
    senderId: 'customer-101',
    senderName: 'John Doe (Customer)',
    recipientId: 'driver-1',
    recipientName: 'Bayo Adeyemi',
    text: "I'm standing by the white gate.",
    type: 'text',
    read: false,
  },
  {
    senderId: 'driver-1',
    senderName: 'Bayo Adeyemi',
    recipientId: 'customer-101',
    recipientName: 'John Doe (Customer)',
    text: "Okay, I'm almost there in 2 minutes.",
    type: 'text',
    read: true,
  },
  {
    senderId: 'vendor-201',
    senderName: 'Spice Avenue (Restaurant)',
    recipientId: 'driver-1',
    recipientName: 'Bayo Adeyemi',
    text: "Order is ready for pickup!",
    type: 'text',
    read: true,
  },
  {
    senderId: 'support-301',
    senderName: 'Denish Support',
    recipientId: 'driver-1',
    recipientName: 'Bayo Adeyemi',
    text: "We've received your inquiry. A representative will be with you.",
    type: 'text',
    read: true,
  }
];

const seedDriverChats = async ({ exitOnComplete = false } = {}) => {
  try {
    if (mongoose.connection.readyState === 0) {
      const connectDB = require('./config/db');
      await connectDB();
    }

    const Message = require('./models/Message');
    const existing = await Message.countDocuments({
      $or: [
        { senderName: 'John Doe (Customer)' },
        { recipientName: 'John Doe (Customer)' }
      ]
    });

    if (existing > 0) {
      console.log(`ℹ️ Driver chats already exist (${existing} messages). Skipping seed.`);
      if (exitOnComplete) process.exit(0);
      return true;
    }

    const now = Date.now();
    const withDates = SAMPLE_MESSAGES.map((m, idx) => ({
      ...m,
      createdAt: new Date(now - (30 - idx * 5) * 60 * 1000),
      updatedAt: new Date(now - (30 - idx * 5) * 60 * 1000),
    }));

    await Message.insertMany(withDates);
    console.log('✅ Driver chat messages seeded successfully!');

    if (exitOnComplete) process.exit(0);
    return true;
  } catch (error) {
    console.error('❌ Error seeding driver chats:', error);
    if (exitOnComplete) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedDriverChats({ exitOnComplete: true });
}

module.exports = { seedDriverChats };
