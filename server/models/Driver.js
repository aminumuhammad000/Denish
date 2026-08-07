const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: null },
  vehicleType: {
    type: String,
    enum: ['Bike', 'Bicycle', 'Car', 'Motorcycle'],
    default: 'Motorcycle',
  },
  vehicle: {
    type: { type: String, default: '' },
    make: { type: String, default: '' },
    plate: { type: String, default: '' },
    color: { type: String, default: '' },
  },
  bank: {
    name: { type: String, default: '' },
    bankCode: { type: String, default: '' },
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Suspended'],
    default: 'Pending',
  },
  isWarned: {
    type: Boolean,
    default: false,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  earnings: {
    totalEarned: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    totalTrips: { type: Number, default: 0 },
  },
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
