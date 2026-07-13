const router = require('express').Router();
const ctrl   = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/stripe/intent',   protect, ctrl.createStripeIntent);
router.post('/stripe/confirm',  protect, ctrl.confirmStripe);

// Admin
router.get('/',                 protect, adminOnly, ctrl.adminGetAll);
router.post('/:id/refund',      protect, adminOnly, ctrl.refund);

module.exports = router;
