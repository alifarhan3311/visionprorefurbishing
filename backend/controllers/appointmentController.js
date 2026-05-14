const Appointment = require('../models/Appointment');
const { sendSMS } = require('../utils/smsService');

exports.createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      userId: req.user._id // Assuming authenticated user
    });
    await appointment.save();

    // Send SMS Confirmation
    if (appointment.phone) {
      await sendSMS(appointment.phone, `MobileSentrix: Your repair appointment for ${appointment.serviceType} is confirmed for ${appointment.date} at ${appointment.time}.`);
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('user', 'name email companyName').sort('-createdAt');
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Send SMS on status change
    if (appointment.phone) {
      await sendSMS(appointment.phone, `MobileSentrix: Your appointment status has been updated to: ${status}.`);
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
