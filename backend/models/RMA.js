const mongoose = require('mongoose');

const RMASchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: String, default: 'user-123' }, // Mock user ID for now
  searchMethod: String,
  searchValue: String,
  itemDetails: String,
  reason: String,
  description: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RMA', RMASchema);
