const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  providerType: {
    type: String,
    enum: ['Vendor', 'Driver'],
    required: true,
    index: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'providerType',
    index: true,
  },
  providerName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Payout amount must be greater than zero'],
  },
  currency: {
    type: String,
    default: 'NGN',
  },
  bank: {
    name: { type: String, default: '' },
    code: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    accountName: { type: String, default: '' },
  },
  reference: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  flwTransferId: {
    type: Number,
    index: true,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'REVERSED'],
    default: 'PENDING',
    index: true,
  },
  narration: {
    type: String,
    default: 'Connecta Payout',
  },
  fee: {
    type: Number,
    default: 0,
  },
  flwResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  failureReason: {
    type: String,
    default: null,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  cycle: {
    type: String,
    enum: ['nightly_vendor', 'weekly_driver', 'manual'],
    required: true,
    index: true,
  },
  initiatedBy: {
    type: String,
    default: 'system',
  },
  processedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
