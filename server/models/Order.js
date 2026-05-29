const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  customerName: { type: String, required: true },
  itemsCount: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['new', 'preparing', 'ready', 'delivered'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
