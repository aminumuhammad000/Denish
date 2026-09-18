const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  profile: {
    fullName: { type: String, default: "Denish Admin" },
    email: { type: String, default: "denishadmin@gmail.com" },
    phone: { type: String, default: "+234 813 048 5734" },
  },
  platform: {
    platformName: { type: String, default: "Denish" },
    currency: { type: String, default: "NGN" },
    deliveryModel: { type: String, enum: ["flat", "distance"], default: "flat" },
    baseFee: { type: String, default: "500" },
    commission: { type: String, default: "15" },
    deliveryFeeCommission: { type: String, default: "5" },
    autoCancelMin: { type: Number, default: 60 },
    deliveryDeadlineMin: { type: Number, default: 40 },
  },
  notifications: {
    vendorEmails: { type: Boolean, default: true },
    disputeAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    notificationEmail: { type: String, default: "denishadmin@gmail.com" },
  },
  payments: {
    gateway: { type: String, default: "Flutterwave" },
    vendorPayoutCycle: { type: String, default: "24_hours" }, // 24_hours (daily at 6:00 PM)
    vendorPayoutTime: { type: String, default: "18:00" }, // 6:00 PM WAT
    riderPayoutCycle: { type: String, default: "weekly" }, // weekly
    riderPayoutDay: { type: String, default: "Sunday" }, // Every Sunday
    riderPayoutTime: { type: String, default: "23:59" }, // 11:59 PM WAT
    vendorMinThreshold: { type: String, default: "5000" }, // ₦5,000
    riderMinThreshold: { type: String, default: "1000" }, // ₦1,000
    autoPayoutEnabled: { type: Boolean, default: true },
    payoutCycle: { type: String, default: "24_hours" }, // legacy fallback
    minThreshold: { type: String, default: "5000" }, // legacy fallback
  },
  security: {
    twoFactor: { type: Boolean, default: true },
    sessions: [{
      id: { type: String, default: '' },
      device: { type: String, default: '' },
      browser: { type: String, default: '' },
      location: { type: String, default: '' },
      ip: { type: String, default: '' },
      lastActive: { type: String, default: '' },
      current: { type: Boolean, default: false },
    }],
  },
  system: {
    maintenanceMode: { type: Boolean, default: false },
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
