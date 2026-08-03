const mongoose = require('mongoose');

const callSessionSchema = new mongoose.Schema({
  callerId: { type: String, required: true },
  callerName: { type: String, required: true },
  receiverId: { type: String, required: true },
  receiverName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['ringing', 'accepted', 'declined', 'ended'], 
    default: 'ringing' 
  },
  orderId: { type: String, default: 'Order ORD-005' },
  subtitle: { type: String, default: '3.5 km | ₦750' }
}, { timestamps: true });

module.exports = mongoose.model('CallSession', callSessionSchema);
