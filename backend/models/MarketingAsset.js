const mongoose = require('mongoose');

const marketingAssetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Flyers', 'Price Lists', 'Social Media', 'Banners', 'Technical Documents'],
    default: 'Flyers'
  },
  fileUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  fileType: { type: String }, // e.g., 'PDF', 'JPG', 'ZIP'
  fileSize: { type: String },
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('MarketingAsset', marketingAssetSchema);
