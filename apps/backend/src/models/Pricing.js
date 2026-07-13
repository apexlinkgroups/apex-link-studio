const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },   // e.g. "Basic", "Pro", "Premium"
  category:    { type: String, enum: ['photo-editing','video-editing','color-grading','retouching','composite','bundle'], required: true },
  price:       { type: Number, required: true },
  currency:    { type: String, default: 'USD' },
  billingCycle:{ type: String, enum: ['one-time','monthly','yearly'], default: 'one-time' },
  description: { type: String },
  features:    [String],
  maxFiles:    { type: Number, default: 10 },
  maxRevisions:{ type: Number, default: 2 },
  deliveryDays:{ type: Number, default: 3 },
  isPopular:   { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Pricing', pricingSchema);
