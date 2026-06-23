const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerName: { type: String, default: 'Anonymous' },
  address: { type: String, default: 'No address' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  vendorName: { type: String, default: 'Unknown Vendor' },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'ready', 'on the way', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
