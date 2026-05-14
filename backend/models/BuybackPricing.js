const mongoose = require('mongoose');

const buybackPricingSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  conditions: [{
    grade: { type: String, required: true }, // e.g., 'Grade A', 'Grade B'
    price: { type: Number, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('BuybackPricing', buybackPricingSchema);
