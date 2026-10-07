const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
  senderId: { type: String, required: true, index: true },
  senderModel: { type: String, enum: ['Customer', 'Driver', 'Vendor', 'Admin'], default: 'Customer' },
  senderName: { type: String, required: true },
  recipientId: { type: String, required: true, index: true },
  recipientModel: { type: String, enum: ['Customer', 'Driver', 'Vendor', 'Admin'], default: 'Customer' },
  recipientName: { type: String, required: true },
  text: { type: String, trim: true, maxlength: 2000, default: '' },
  imageUrl: { type: String, default: null },
  type: { type: String, enum: ['text', 'image', 'call'], default: 'text' },
  subText: { type: String, default: '' },
  read: { type: Boolean, default: false, index: true },
  readAt: { type: Date, default: null }
}, { timestamps: true });

messageSchema.index({ senderId: 1, recipientId: 1 });
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
