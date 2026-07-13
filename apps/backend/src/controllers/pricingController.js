const Pricing = require('../models/Pricing');

exports.getAll = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    const plans = await Pricing.find(filter).sort({ order: 1 });
    res.json({ success: true, plans });
  } catch (err) { next(err); }
};

exports.adminGetAll = async (req, res, next) => {
  try {
    const plans = await Pricing.find().sort({ order: 1 });
    res.json({ success: true, plans });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const plan = await Pricing.create(req.body);
    res.status(201).json({ success: true, plan });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const plan = await Pricing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, plan });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const plan = await Pricing.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) { next(err); }
};
