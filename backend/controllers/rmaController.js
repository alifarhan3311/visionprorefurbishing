const RMA = require('../models/RMA');
const { sendSMS } = require('../utils/smsService');

exports.createRMA = async (req, res) => {
  try {
    const rma = new RMA(req.body);
    await rma.save();
    res.status(201).json({ success: true, data: rma });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getRMAs = async (req, res) => {
  try {
    const rmas = await RMA.find().sort('-createdAt');
    res.status(200).json({ success: true, data: rmas });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateRMAStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rma = await RMA.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!rma) {
      return res.status(404).json({ success: false, error: 'RMA not found' });
    }

    // Send SMS Notification
    if (rma.phone) {
      await sendSMS(rma.phone, `MobileSentrix: Your RMA ticket status has been updated to: ${status}.`);
    }

    res.status(200).json({ success: true, data: rma });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
