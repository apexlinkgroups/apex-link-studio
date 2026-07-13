const router = require('express').Router();
const ctrl   = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Client routes
router.use(protect);
router.post('/',                   ctrl.createProject);
router.get('/my',                  ctrl.myProjects);
router.get('/:id',                 ctrl.getProject);
router.post('/:id/upload',         upload.array('files', 20), ctrl.uploadFiles);

// Admin routes
router.get('/',                    adminOnly, ctrl.adminGetAll);
router.get('/stats/overview',      adminOnly, ctrl.adminStats);
router.put('/:id',                 adminOnly, ctrl.adminUpdate);
router.post('/:id/output',         adminOnly, upload.array('files', 20), ctrl.adminUploadOutput);
router.delete('/:id',              adminOnly, ctrl.adminDelete);

module.exports = router;
