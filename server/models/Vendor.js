const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String }, // In real app, hash this
  businessName: { type: String, default: '' },
  category: { type: String, default: 'Local dishes' },
  address: { type: String, default: '' },
  about: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  coverUrl: { type: String, default: '' },
  openingHours: {
     type: Array,
     default: []
  },
  payoutAccount: {
     bank: { type: String, default: '' },
     bankCode: { type: String, default: '' },
     accountName: { type: String, default: '' },
     accountNumber: { type: String, default: '' }
  },
  deliveryLocations: {
     type: [String],
     default: []
  },
  notifications: {
     newOrders: { type: Boolean, default: true },
     statusUpdates: { type: Boolean, default: true },
     payouts: { type: Boolean, default: false },
     promotions: { type: Boolean, default: true }
  },
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
    enum: ['Pending', 'Approved', 'Suspended', 'pending', 'approved', 'suspended'],
    default: 'Pending',
    set: function(val) {
      if (typeof val === 'string') {
        return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
      }
      return val;
    }
  },
  rating: { type: Number, default: 4.8 },
  deliveryTime: { type: String, default: '25-35 min' },
  deliveryFee: { type: Number, default: 500 },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
