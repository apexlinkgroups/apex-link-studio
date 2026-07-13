const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  category:    { type: String, enum: ['photo-editing','video-editing','color-grading','retouching','composite'], required: true },
  description: { type: String, trim: true },
  beforeImage: { type: String },   // Cloudinary URL
  afterImage:  { type: String, required: true },
  video:       { type: String },   // Cloudinary URL for video pieces
  tags:        [String],
  featured:    { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
