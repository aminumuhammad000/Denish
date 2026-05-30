const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String }, // In real app, hash this
  businessName: { type: String },
  logoUrl: { type: String },
  coverUrl: { type: String },
  earnings: {
    availableBalance: { type: Number, default: 0 },
    weeklyRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    avgOrders: { type: Number, default: 0 }
  },
  dailyBreakdown: [
    {
      day: String,
      orders: Number,
      amount: Number
    }
  ],
  barData: [Number], // e.g. for weekly chart [22, 30, 28, 14, 35, 28, 25]
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Suspended'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
