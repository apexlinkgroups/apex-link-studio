const router = require('express').Router();
const ctrl   = require('../controllers/portfolioController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public
router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getOne);

// Admin
router.post('/',    protect, adminOnly, upload.fields([
  { name: 'beforeImage', maxCount: 1 },
  { name: 'afterImage',  maxCount: 1 },
  { name: 'image',       maxCount: 1 },
  { name: 'video',       maxCount: 1 },
]), ctrl.create);

router.put('/:id',  protect, adminOnly, upload.fields([
  { name: 'beforeImage', maxCount: 1 },
  { name: 'afterImage',  maxCount: 1 },
  { name: 'image',       maxCount: 1 },
  { name: 'video',       maxCount: 1 },
]), ctrl.update);

router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
