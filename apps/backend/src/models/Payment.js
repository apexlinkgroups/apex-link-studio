const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  client:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  amount:      { type: Number, required: true },
  currency:    { type: String, default: 'USD' },
  method:      { type: String, enum: ['stripe','paypal'], required: true },
  status:      { type: String, enum: ['pending','completed','failed','refunded'], default: 'pending' },
  stripePaymentIntentId: String,
  stripeChargeId:        String,
  paypalOrderId:         String,
  paypalCaptureId:       String,
  receiptUrl:  String,
  refundedAt:  Date,
  refundReason:String,
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
