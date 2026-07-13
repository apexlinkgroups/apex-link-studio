const Portfolio = require('../models/Portfolio');

/* ─── Public: Get All (active) ─── */
exports.getAll = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const items = await Portfolio.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) { next(err); }
};

/* ─── Public: Single Item ─── */
exports.getOne = async (req, res, next) => {
  try {
    const item = await Portfolio.findOne({ _id: req.params.id, isActive: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, item });
  } catch (err) { next(err); }
};

/* ─── Admin: Create ─── */
exports.create = async (req, res, next) => {
  try {
    const { title, category, description, tags, featured, order } = req.body;
    const files = req.files || {};

    const item = await Portfolio.create({
      title, category, description,
      tags: tags ? JSON.parse(tags) : [],
      featured: featured === 'true',
      order: Number(order) || 0,
      beforeImage: files.beforeImage?.[0]?.path,
      afterImage:  files.afterImage?.[0]?.path  || files.image?.[0]?.path,
      video:       files.video?.[0]?.path,
    });

    res.status(201).json({ success: true, item });
  } catch (err) { next(err); }
};

/* ─── Admin: Update ─── */
exports.update = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.tags) updates.tags = JSON.parse(updates.tags);
    if (updates.featured) updates.featured = updates.featured === 'true';

    const files = req.files || {};
    if (files.beforeImage?.[0]) updates.beforeImage = files.beforeImage[0].path;
    if (files.afterImage?.[0])  updates.afterImage  = files.afterImage[0].path;
    if (files.video?.[0])       updates.video       = files.video[0].path;

    const item = await Portfolio.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, item });
  } catch (err) { next(err); }
};

/* ─── Admin: Delete ─── */
exports.remove = async (req, res, next) => {
  try {
    const item = await Portfolio.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Portfolio item deleted' });
  } catch (err) { next(err); }
};
