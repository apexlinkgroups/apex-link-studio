const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const User      = require('../models/User');
const nodemailer = require('nodemailer');

/* ─── helpers ─── */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });

const sendTokens = (res, user, statusCode = 200) => {
  const token        = signToken(user._id);
  const refreshToken = signRefresh(user._id);
  const safe = { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
  res.status(statusCode).json({ success: true, token, refreshToken, user: safe });
};

/* ─── Register ─── */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, country } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, country });
    sendTokens(res, user, 201);
  } catch (err) { next(err); }
};

/* ─── Login ─── */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokens(res, user);
  } catch (err) { next(err); }
};

/* ─── Refresh Token ─── */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    res.json({ success: true, token: signToken(user._id) });
  } catch { res.status(401).json({ success: false, message: 'Invalid refresh token' }); }
};

/* ─── Get Me ─── */
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

/* ─── Update Profile ─── */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, country } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, country },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

/* ─── Change Password ─── */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();
    sendTokens(res, user);
  } catch (err) { next(err); }
};

/* ─── Forgot Password ─── */
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken  = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"APEX LINK Studio" <${process.env.EMAIL_USER}>`,
      to:   user.email,
      subject: 'Password Reset - APEX LINK Studio',
      html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a><br>Link expires in 30 minutes.</p>`,
    });

    res.json({ success: true, message: 'Reset email sent' });
  } catch (err) {
    // clean token on failure
    await User.findOneAndUpdate({ email: req.body.email }, { $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } });
    next(err);
  }
};

/* ─── Reset Password ─── */
exports.resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user   = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired' });

    user.password           = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire= undefined;
    await user.save();
    sendTokens(res, user);
  } catch (err) { next(err); }
};
