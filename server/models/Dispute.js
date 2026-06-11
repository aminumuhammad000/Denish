const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'investigating', 'escalated', 'resolved', 'closed'],
    default: 'open',
  },
  complaintId: {
    type: String,
    required: true,
    unique: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  against: {
    type: String,
    required: true,
  },
  messageCount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
