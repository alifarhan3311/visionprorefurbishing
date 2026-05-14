const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mobilesentrix_super_secret_key', {
    expiresIn: '30d',
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      companyName,
      // Temporarily making the first user an admin for testing purposes
      role: email === 'admin@mobilesentrix.com' ? 'admin' : 'user'
    });

    res.status(201).json({
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
    console.error('Registration Error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
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
