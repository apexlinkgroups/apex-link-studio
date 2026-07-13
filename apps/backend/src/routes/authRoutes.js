const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',         ctrl.register);
router.post('/login',            ctrl.login);
router.post('/refresh',          ctrl.refreshToken);
router.post('/forgot-password',  ctrl.forgotPassword);
router.put('/reset-password/:token', ctrl.resetPassword);

// Protected
router.get('/me',                protect, ctrl.getMe);
router.put('/update-profile',    protect, ctrl.updateProfile);
router.put('/change-password',   protect, ctrl.changePassword);

module.exports = router;
