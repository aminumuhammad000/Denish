require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Message = require('./models/Message');

const seedDriverChats = async () => {
  try {
    await connectDB();

    const sampleMessages = [
      {
        senderId: 'customer-101',
        senderName: 'John Doe (Customer)',
        recipientId: 'driver-1',
        recipientName: 'Bayo Adeyemi',
        text: "I'm standing by the white gate.",
        type: 'text',
        read: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        senderId: 'driver-1',
        senderName: 'Bayo Adeyemi',
        recipientId: 'customer-101',
        recipientName: 'John Doe (Customer)',
        text: "Okay, I'm almost there in 2 minutes.",
        type: 'text',
        read: true,
        createdAt: new Date(Date.now() - 14 * 60 * 1000)
      },
      {
        senderId: 'vendor-201',
        senderName: 'Spice Avenue (Restaurant)',
        recipientId: 'driver-1',
        recipientName: 'Bayo Adeyemi',
        text: "Order is ready for pickup!",
        type: 'text',
        read: true,
        createdAt: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        senderId: 'support-301',
        senderName: 'Denish Support',
        recipientId: 'driver-1',
        recipientName: 'Bayo Adeyemi',
        text: "We've received your inquiry. A representative will be with you.",
        type: 'text',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    for (const msg of sampleMessages) {
      await Message.create(msg);
    }

    console.log('✅ Driver chat messages seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding driver chats:', error);
    process.exit(1);
  }
};

seedDriverChats();
