const router  = require('express').Router();
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Project = require('../models/Project');

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    try {
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'completed', stripeChargeId: intent.latest_charge },
      );
      await Project.findByIdAndUpdate(intent.metadata.projectId, {
        'payment.status': 'paid', 'payment.paidAt': new Date(),
      });
    } catch (e) { console.error('Webhook handler error:', e); }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    try {
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'failed' },
      );
    } catch (e) { console.error('Webhook handler error:', e); }
  }

  res.json({ received: true });
});

module.exports = router;
