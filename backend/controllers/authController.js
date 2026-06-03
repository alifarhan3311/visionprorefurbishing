const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mobilesentrix_super_secret_key', {
    expiresIn: '30d',
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, companyName, role, houseAddress } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      if (!userExists.isEmailVerified) {
        const otp = userExists.getEmailVerificationOtp();
        await userExists.save({ validateBeforeSave: false });

        await sendEmail({
          to: userExists.email,
          subject: 'Vision PRO - Email Verification OTP',
          html: `
            <h2>Vision PRO Email Verification</h2>
            <p>Hello ${userExists.name || "User"},</p>
            <p>Your OTP for email verification is:</p>
            <h1>${otp}</h1>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you did not request this, ignore this email.</p>
          `
        });

        return res.status(200).json({
          success: true,
          message: 'OTP resent to email. Please verify.',
          email: userExists.email
        });
      }

      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    const allowedRoles = ['user', 'admin', 'retailer'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    const user = await User.create({
      name,
      email,
      password,
      companyName,
      role: userRole,
      houseAddress,
      isEmailVerified: false
    });

    const otp = user.getEmailVerificationOtp();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Vision PRO - Email Verification OTP',
      html: `
        <h2>Welcome to Vision PRO</h2>
        <p>Hello ${name || "User"},</p>
        <p>Thank you for registering.</p>
        <p>Your OTP for email verification is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not create this account, ignore this email.</p>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify OTP sent to email.',
      email: user.email
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, error: 'Email already verified' });
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    if (user.emailVerificationOtp !== hashedOtp || user.emailVerificationOtpExpire < Date.now()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isEmailVerified && user.role !== 'admin' && user.email !== 'dealer@example.com') {
         return res.status(403).json({ success: false, error: 'Please verify your email first', email: user.email, unverified: true });
      }

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tier: user.tier,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};



exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    
    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, data: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
