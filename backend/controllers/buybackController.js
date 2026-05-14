const Buyback = require('../models/Buyback');
const { sendSMS } = require('../utils/smsService');

exports.createBuyback = async (req, res) => {
  try {
    const buyback = new Buyback(req.body);
    await buyback.save();
    res.status(201).json({ success: true, data: buyback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getBuybacks = async (req, res) => {
  try {
    const buybacks = await Buyback.find().populate('user', 'name email companyName').sort('-createdAt');
    res.status(200).json({ success: true, data: buybacks });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateBuybackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const buyback = await Buyback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!buyback) {
      return res.status(404).json({ success: false, error: 'Buyback not found' });
    }

    // Send SMS Notification
    if (buyback.phone) {
      await sendSMS(buyback.phone, `MobileSentrix: Your LCD Buyback ticket status has been updated to: ${status}.`);
    }

    res.status(200).json({ success: true, data: buyback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
