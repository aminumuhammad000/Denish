const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  discount: { type: String, required: true },
  minOrder: { type: String, required: true },
  usage: { type: String, required: true }, // e.g. "342/500"
  status: { type: String, enum: ["active", "expired"], default: "active" },
  period: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
