const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  tierLevel: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4], // 1: Main Brand, 2: Device Type, 3: Series, 4: Specific Model
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  // Specific to Tier 1
  navIconUrl: {
    type: String,
    default: ''
  },
  promoBannerUrl: {
    type: String,
    default: ''
  },
  promoBannerLink: {
    type: String,
    default: ''
  },
  // Specific to Tier 4
  highlightThumbnail: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

// Index for faster queries when building the mega menu
categorySchema.index({ parentCategory: 1, tierLevel: 1 });

module.exports = mongoose.model('Category', categorySchema);
