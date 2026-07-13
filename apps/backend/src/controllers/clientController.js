const User    = require('../models/User');
const Project = require('../models/Project');
const Payment = require('../models/Payment');

/* ─── Admin: All Clients ─── */
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'client' };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const [clients, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, total, pages: Math.ceil(total / limit), clients });
  } catch (err) { next(err); }
};

/* ─── Admin: Single Client with their projects ─── */
exports.getOne = async (req, res, next) => {
  try {
    const [client, projects, payments] = await Promise.all([
      User.findById(req.params.id),
      Project.find({ client: req.params.id }).select('title type status progress pricing createdAt').sort({ createdAt: -1 }),
      Payment.find({ client: req.params.id }).select('amount currency status method createdAt').sort({ createdAt: -1 }),
    ]);

    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, client, projects, payments });
  } catch (err) { next(err); }
};

/* ─── Admin: Toggle Active ─── */
exports.toggleActive = async (req, res, next) => {
  try {
    const client = await User.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    client.isActive = !client.isActive;
    await client.save({ validateBeforeSave: false });
    res.json({ success: true, isActive: client.isActive });
  } catch (err) { next(err); }
};

/* ─── Admin: Delete Client ─── */
exports.remove = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Client deleted' });
  } catch (err) { next(err); }
};
