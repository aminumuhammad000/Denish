const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true, // e.g., 'Order Payment', 'Vendor Payout', 'Driver Payout'
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    default: 'Card', // Card, Bank Transfer, Wallet
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Pending',
  },
  reference: {
    type: String,
    unique: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
