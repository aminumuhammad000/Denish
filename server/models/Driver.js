const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
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
  vehicleType: {
    type: String,
    enum: ['Bike', 'Bicycle', 'Car'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Suspended'],
    default: 'Pending',
  },
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
