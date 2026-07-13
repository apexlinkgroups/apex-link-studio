const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Project = require('../models/Project');

/* ─── Stripe: Create Payment Intent ─── */
exports.createStripeIntent = async (req, res, next) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findOne({ _id: projectId, client: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const amount = Math.round((project.pricing.total || 0) * 100); // cents
    if (amount < 50) return res.status(400).json({ success: false, message: 'Amount too low' });

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: (project.pricing.currency || 'USD').toLowerCase(),
      metadata: { projectId: projectId, clientId: req.user._id.toString() },
    });

    res.json({ success: true, clientSecret: intent.client_secret, intentId: intent.id });
  } catch (err) { next(err); }
};

/* ─── Stripe: Confirm Payment (after front-end confirms) ─── */
exports.confirmStripe = async (req, res, next) => {
  try {
    const { projectId, intentId } = req.body;
    const intent = await stripe.paymentIntents.retrieve(intentId);

    if (intent.status !== 'succeeded')
      return res.status(400).json({ success: false, message: 'Payment not successful' });

    const [payment, project] = await Promise.all([
      Payment.create({
        client: req.user._id, project: projectId,
        amount: intent.amount / 100, currency: intent.currency.toUpperCase(),
        method: 'stripe', status: 'completed',
        stripePaymentIntentId: intentId,
        stripeChargeId: intent.latest_charge,
        receiptUrl: intent.charges?.data?.[0]?.receipt_url,
      }),
      Project.findByIdAndUpdate(projectId, {
        'payment.status': 'paid',
        'payment.stripeId': intentId,
        'payment.paidAt': new Date(),
      }, { new: true }),
    ]);

    res.json({ success: true, payment, project });
  } catch (err) { next(err); }
};

/* ─── Admin: All Payments ─── */
exports.adminGetAll = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('client', 'name email')
      .populate('project', 'title type')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, payments });
  } catch (err) { next(err); }
};

/* ─── Admin: Refund ─── */
exports.refund = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Only completed payments can be refunded' });

    if (payment.method === 'stripe') {
      await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
    }

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundReason = req.body.reason || 'Admin-initiated refund';
    await payment.save();

    await Project.findByIdAndUpdate(payment.project, { 'payment.status': 'refunded' });
    res.json({ success: true, payment });
  } catch (err) { next(err); }
};
