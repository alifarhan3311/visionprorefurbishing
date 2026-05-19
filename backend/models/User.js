const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  tier: { type: String, enum: ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'], default: 'Tier 1' },
  companyName: { type: String },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationOtp: String,
  emailVerificationOtpExpire: Date,
  resetPasswordOtp: String,
  resetPasswordOtpExpire: Date,
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Generate Email Verification OTP
UserSchema.methods.getEmailVerificationOtp = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.emailVerificationOtpExpire = Date.now() + 10 * 60 * 1000;
  return otp;
};

// Generate Password Reset OTP
UserSchema.methods.getResetPasswordOtp = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;
  return otp;
};

module.exports = mongoose.model('User', UserSchema);
