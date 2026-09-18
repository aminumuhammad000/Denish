const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, default: 'Anonymous' },
  customerEmail: { type: String },
  customerPhone: { type: String },
  address: { type: String, default: 'No address' },
  deliveryAddress: { type: String },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorName: { type: String, default: 'Unknown Vendor' },
  vendorEmail: { type: String },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  driverName: { type: String },
  driverPhone: { type: String },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  totalAmount: { type: Number },
  deliveryFee: { type: Number, default: 500 },
  paymentMethod: { type: String, default: 'Card' },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'ready', 'on the way', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  processingEmailSent: { type: Boolean, default: false },
  deliveredEmailSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
