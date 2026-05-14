const BuybackPricing = require('../models/BuybackPricing');

// @desc    Get all buyback prices
// @route   GET /api/v1/buybacks/pricing
// @access  Public
exports.getBuybackPricing = async (req, res) => {
  try {
    const pricing = await BuybackPricing.find();
    res.status(200).json({ success: true, data: pricing });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create/Update buyback price (Admin)
// @route   POST /api/v1/buybacks/pricing
// @access  Private/Admin
exports.upsertBuybackPricing = async (req, res) => {
  try {
    const { brand, model, conditions } = req.body;
    const pricing = await BuybackPricing.findOneAndUpdate(
      { brand, model },
      { brand, model, conditions },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: pricing });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
