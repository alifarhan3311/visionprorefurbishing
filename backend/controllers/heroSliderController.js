const HeroSlider = require('../models/HeroSlider');

// @desc    Get all active slider slides (Public)
// @route   GET /api/v1/heroslider
// @access  Public
exports.getSlides = async (req, res) => {
  try {
    const slides = await HeroSlider.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: slides });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all slides including inactive (Admin)
// @route   GET /api/v1/heroslider/admin
// @access  Private/Admin
exports.getAdminSlides = async (req, res) => {
  try {
    const slides = await HeroSlider.find({}).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: slides });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a new slide (Admin)
// @route   POST /api/v1/heroslider
// @access  Private/Admin
exports.createSlide = async (req, res) => {
  try {
    const slide = await HeroSlider.create(req.body);
    res.status(201).json({ success: true, data: slide });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update a slide (Admin)
// @route   PUT /api/v1/heroslider/:id
// @access  Private/Admin
exports.updateSlide = async (req, res) => {
  try {
    const slide = await HeroSlider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: slide });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a slide (Admin)
// @route   DELETE /api/v1/heroslider/:id
// @access  Private/Admin
exports.deleteSlide = async (req, res) => {
  try {
    await HeroSlider.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Slide deleted' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
