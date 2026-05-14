const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  serviceType: { type: String, required: true }, 
  date: { type: String, required: true },
  time: { type: String, required: true },
  notes: String,
  status: { type: String, default: 'Scheduled' }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
