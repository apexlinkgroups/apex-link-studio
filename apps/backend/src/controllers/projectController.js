const Project = require('../models/Project');
const { cloudinary } = require('../middleware/upload');

/* ─── Client: Create Project ─── */
exports.createProject = async (req, res, next) => {
  try {
    const { title, type, description, deadline, pricingPlan, basePrice } = req.body;

    const project = await Project.create({
      client: req.user._id,
      title, type, description,
      deadline: deadline ? new Date(deadline) : undefined,
      pricing: { plan: pricingPlan, basePrice, total: basePrice },
      timeline: [{ status: 'pending', message: 'Project submitted. Awaiting review.' }],
    });

    res.status(201).json({ success: true, project });
  } catch (err) { next(err); }
};

/* ─── Client: Upload Files to Project ─── */
exports.uploadFiles = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, client: req.user._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const files = (req.files || []).map(f => ({
      url: f.path, publicId: f.filename,
      originalName: f.originalname, size: f.size, format: f.mimetype,
    }));

    project.inputFiles.push(...files);
    await project.save();
    res.json({ success: true, inputFiles: project.inputFiles });
  } catch (err) { next(err); }
};

/* ─── Client: My Projects ─── */
exports.myProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ client: req.user._id })
      .sort({ createdAt: -1 })
      .select('-inputFiles -outputFiles');
    res.json({ success: true, count: projects.length, projects });
  } catch (err) { next(err); }
};

/* ─── Client: Single Project ─── */
exports.getProject = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, client: req.user._id };

    const project = await Project.findOne(query).populate('client', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) { next(err); }
};

/* ─── Admin: All Projects ─── */
exports.adminGetAll = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type)   filter.type   = type;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('client', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Project.countDocuments(filter),
    ]);

    res.json({ success: true, total, pages: Math.ceil(total / limit), projects });
  } catch (err) { next(err); }
};

/* ─── Admin: Update Project ─── */
exports.adminUpdate = async (req, res, next) => {
  try {
    const { status, progress, notes, priority, revisions } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (status && status !== project.status) {
      project.status = status;
      project.timeline.push({ status, message: req.body.message || `Status updated to ${status}` });
    }
    if (progress !== undefined) project.progress = progress;
    if (notes     !== undefined) project.notes    = notes;
    if (priority  !== undefined) project.priority = priority;
    if (revisions !== undefined) project.revisions= revisions;

    await project.save();
    res.json({ success: true, project });
  } catch (err) { next(err); }
};

/* ─── Admin: Upload Output Files ─── */
exports.adminUploadOutput = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const files = (req.files || []).map(f => ({
      url: f.path, publicId: f.filename,
      originalName: f.originalname, size: f.size, format: f.mimetype,
    }));

    project.outputFiles.push(...files);
    if (project.status !== 'delivered') {
      project.status = 'completed';
      project.progress = 100;
      project.timeline.push({ status: 'completed', message: 'Deliverables uploaded. Ready for client review.' });
    }
    await project.save();
    res.json({ success: true, outputFiles: project.outputFiles });
  } catch (err) { next(err); }
};

/* ─── Admin: Delete Project ─── */
exports.adminDelete = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    // optionally delete Cloudinary assets here
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};

/* ─── Admin: Stats ─── */
exports.adminStats = async (req, res, next) => {
  try {
    const stats = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } },
    ]);
    const total  = await Project.countDocuments();
    const revenue = await Project.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);
    res.json({ success: true, total, revenue: revenue[0]?.total || 0, breakdown: stats });
  } catch (err) { next(err); }
};
