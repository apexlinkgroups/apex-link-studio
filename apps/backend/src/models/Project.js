const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  url:         String,
  publicId:    String,
  originalName:String,
  size:        Number,
  format:      String,
}, { _id: false });

const projectSchema = new mongoose.Schema({
  client:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  type:        { type: String, enum: ['photo-editing','video-editing','color-grading','retouching','composite','other'], required: true },
  status:      { type: String, enum: ['pending','in-review','in-progress','revision','completed','delivered','cancelled'], default: 'pending' },
  priority:    { type: String, enum: ['standard','urgent','rush'], default: 'standard' },
  description: { type: String, trim: true },
  notes:       { type: String },            // admin notes
  clientNotes: { type: String },            // client additional notes
  deadline:    { type: Date },
  inputFiles:  [fileSchema],
  outputFiles: [fileSchema],
  pricing: {
    plan:        String,
    basePrice:   Number,
    discount:    { type: Number, default: 0 },
    total:       Number,
    currency:    { type: String, default: 'USD' },
  },
  payment: {
    status:    { type: String, enum: ['unpaid','paid','refunded'], default: 'unpaid' },
    stripeId:  String,
    paidAt:    Date,
  },
  progress:    { type: Number, min: 0, max: 100, default: 0 },
  revisions:   { type: Number, default: 0 },
  maxRevisions:{ type: Number, default: 2 },
  timeline: [{
    status:    String,
    message:   String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
