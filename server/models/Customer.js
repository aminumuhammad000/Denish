const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: String,
  addresses: [{
    label: String,
    addr: String,
    tag: String
  }],
  paymentMethods: [{
    id: String,
    title: String,
    sub: String,
    icon: String,
    type: { type: String, default: 'card' }
  }],
  profilePic: String,
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active',
  },
  isWarned: {
    type: Boolean,
    default: false,
  },
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
