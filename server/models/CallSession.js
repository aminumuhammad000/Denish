const mongoose = require('mongoose');

const callSessionSchema = new mongoose.Schema({
  callerId: { type: String, required: true, index: true },
  callerName: { type: String, required: true },
  callerRole: { type: String, enum: ['Customer', 'Driver', 'Vendor', 'Admin'], default: 'Customer' },
  callerPhone: { type: String, default: '' },
  receiverId: { type: String, required: true, index: true },
  receiverName: { type: String, required: true, index: true },
  receiverRole: { type: String, enum: ['Customer', 'Driver', 'Vendor', 'Admin'], default: 'Driver' },
  receiverPhone: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['ringing', 'accepted', 'declined', 'ended', 'missed'], 
    default: 'ringing',
    index: true
  },
  orderId: { type: String, default: 'Order Call' },
  subtitle: { type: String, default: '' },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  durationSeconds: { type: Number, default: 0 }
}, { timestamps: true });

// Auto expire call sessions after 10 minutes in DB
callSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('CallSession', callSessionSchema);
