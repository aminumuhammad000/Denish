const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userModel: { type: String, enum: ['Customer', 'Driver', 'Vendor', 'Admin'], default: 'Customer' },
  name: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, default: 'Customer' },
  unreadCount: { type: Number, default: 0 }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  participants: [participantSchema],
  participantIds: [{ type: String, index: true }],
  lastMessage: {
    text: { type: String, default: '' },
    imageUrl: { type: String, default: null },
    type: { type: String, default: 'text' },
    subText: { type: String, default: '' },
    senderId: { type: String, default: '' },
    senderName: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });

conversationSchema.index({ participantIds: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
