const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 8, select: false },
  phone:     { type: String, trim: true },
  country:   { type: String, trim: true },
  role:      { type: String, enum: ['client', 'admin'], default: 'client' },
  avatar:    { type: String },
  isActive:  { type: Boolean, default: true },
  resetPasswordToken:   String,
  resetPasswordExpire:  Date,
  lastLogin:            Date,
}, { timestamps: true });

/* Hash password before save */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* Compare password */
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
