const User    = require('../models/User');
const Pricing = require('../models/Pricing');

const defaultPlans = [
  {
    name: 'Starter', category: 'photo-editing', price: 29, billingCycle: 'one-time',
    description: 'Basic photo editing for individuals',
    features: ['Up to 10 photos', '2 revisions', '3-day delivery', 'Color correction', 'Basic retouching'],
    maxFiles: 10, maxRevisions: 2, deliveryDays: 3, order: 0,
  },
  {
    name: 'Pro', category: 'photo-editing', price: 79, billingCycle: 'one-time', isPopular: true,
    description: 'Advanced editing for professionals',
    features: ['Up to 50 photos', '5 revisions', '2-day delivery', 'Advanced retouching', 'Color grading', 'Background removal'],
    maxFiles: 50, maxRevisions: 5, deliveryDays: 2, order: 1,
  },
  {
    name: 'Premium', category: 'photo-editing', price: 149, billingCycle: 'one-time',
    description: 'Full-service editing studio treatment',
    features: ['Unlimited photos', 'Unlimited revisions', '1-day delivery', 'Full composite work', 'Dedicated editor', 'Source files included'],
    maxFiles: 999, maxRevisions: 99, deliveryDays: 1, order: 2,
  },
  {
    name: 'Video Basic', category: 'video-editing', price: 99, billingCycle: 'one-time',
    description: 'Clean video editing for social & content',
    features: ['Up to 10 min footage', '2 revisions', '5-day delivery', 'Basic color grade', 'Music sync'],
    maxFiles: 5, maxRevisions: 2, deliveryDays: 5, order: 3,
  },
  {
    name: 'Video Pro', category: 'video-editing', price: 249, billingCycle: 'one-time', isPopular: true,
    description: 'Cinematic video production quality',
    features: ['Up to 60 min footage', '5 revisions', '3-day delivery', 'Cinematic color grade', 'Motion graphics', 'Sound design'],
    maxFiles: 20, maxRevisions: 5, deliveryDays: 3, order: 4,
  },
];

module.exports = async function seed() {
  try {
    /* Seed admin */
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@apexlinkstudio.com';
    const existing   = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({
        name: 'APEX Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Apex@Studio#2026',
        role: 'admin',
      });
      console.log('✅  Admin user seeded:', adminEmail);
    }

    /* Seed pricing only if empty */
    const count = await Pricing.countDocuments();
    if (count === 0) {
      await Pricing.insertMany(defaultPlans);
      console.log('✅  Default pricing plans seeded');
    }
  } catch (err) {
    console.error('❌  Seed error:', err.message);
  }
};
