const Settings = require('../models/Settings');

// @desc    Get system settings
// @route   GET /api/v1/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/v1/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
      settings.updatedAt = Date.now();
    }
    await settings.save();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
