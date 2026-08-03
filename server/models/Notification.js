const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['dispute', 'driver', 'order', 'payment', 'system', 'promo'],
    default: 'system'
  },
  recipient: {
    type: String,
    enum: ['admin', 'driver', 'vendor', 'customer', 'all'],
    default: 'admin'
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
