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
    payoutCycle: { type: String, enum: ["weekly", "monthly"], default: "weekly" },
    minThreshold: { type: String, default: "5000" },
  },
  security: {
    twoFactor: { type: Boolean, default: true },
  },
  system: {
    maintenanceMode: { type: Boolean, default: false },
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
