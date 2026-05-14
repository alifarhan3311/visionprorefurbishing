const MarketingAsset = require('../models/MarketingAsset');

// @desc    Get all active assets
// @route   GET /api/v1/marketing
// @access  Private
exports.getAssets = async (req, res) => {
  try {
    const assets = await MarketingAsset.find({ status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: assets });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a new asset (Admin)
// @route   POST /api/v1/marketing
// @access  Private/Admin
exports.createAsset = async (req, res) => {
  try {
    const asset = await MarketingAsset.create(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete an asset (Admin)
// @route   DELETE /api/v1/marketing/:id
// @access  Private/Admin
exports.deleteAsset = async (req, res) => {
  try {
    await MarketingAsset.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update an asset (Admin)
// @route   PUT /api/v1/marketing/:id
// @access  Private/Admin
exports.updateAsset = async (req, res) => {
  try {
    const asset = await MarketingAsset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
