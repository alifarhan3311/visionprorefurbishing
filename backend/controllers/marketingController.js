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
    const assetData = { ...req.body };
    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        assetData.fileUrl = `/uploads/${req.files.file[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        assetData.thumbnailUrl = `/uploads/${req.files.thumbnail[0].filename}`;
      }
    }
    const asset = await MarketingAsset.create(assetData);
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
    const updateData = { ...req.body };
    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        updateData.fileUrl = `/uploads/${req.files.file[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        updateData.thumbnailUrl = `/uploads/${req.files.thumbnail[0].filename}`;
      }
    }
    const asset = await MarketingAsset.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
