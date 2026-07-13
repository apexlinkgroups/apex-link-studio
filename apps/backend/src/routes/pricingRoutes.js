const router = require('express').Router();
const ctrl   = require('../controllers/pricingController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',           ctrl.getAll);             // public
router.get('/admin/all',  protect, adminOnly, ctrl.adminGetAll);
router.post('/',          protect, adminOnly, ctrl.create);
router.put('/:id',        protect, adminOnly, ctrl.update);
router.delete('/:id',     protect, adminOnly, ctrl.remove);

module.exports = router;
