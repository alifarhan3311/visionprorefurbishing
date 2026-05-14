const mongoose = require('mongoose');

const BuybackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  screens: [{
    brand: String,
    model: String,
    condition: String,
    qty: Number
  }],
  estimatedValue: Number,
  phone: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Buyback', BuybackSchema);
