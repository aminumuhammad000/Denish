const mongoose = require('mongoose');

const systemContentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // 'terms_of_service', 'privacy_policy', 'help_and_support'
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    default: 'support@denish.com'
  },
  contactPhone: {
    type: String,
    default: '+234 800 336 4741'
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemContent', systemContentSchema);
