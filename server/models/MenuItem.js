const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  available: { type: Boolean, default: true },
  category: { type: String, required: true, default: 'All' },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
