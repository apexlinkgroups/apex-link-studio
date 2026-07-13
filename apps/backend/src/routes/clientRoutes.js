const router = require('express').Router();
const ctrl   = require('../controllers/clientController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/',              ctrl.getAll);
router.get('/:id',           ctrl.getOne);
router.put('/:id/toggle',    ctrl.toggleActive);
router.delete('/:id',        ctrl.remove);

module.exports = router;
