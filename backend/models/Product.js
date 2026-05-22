const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  baseRetailPrice: { type: Number, required: true },
  
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  
  // Polymorphic Type Identifier
  productType: {
    type: String,
    required: true,
    enum: ['parts', 'preowned', 'components']
  },

  // --- Dynamic Fields (Stored inside a sub-object for cleanliness or directly) ---
  
  // 1. For Pre-Owned Devices
  preOwnedDetails: {
    imei: { type: String }, // Can be moved to an Inventory collection if multiple items share same SKU
    grade: { type: String, enum: ['Grade A', 'Grade B', 'Grade C'] },
    batteryHealth: { type: Number, min: 0, max: 100 },
    storage: { type: String },
    carrierStatus: { type: String }
  },

  // 2. For Board Components (ICs)
  componentDetails: {
    minimumOrderQuantity: { type: Number, default: 1 },
    bulkTierPrice: { type: Number }
  },

  // 3. For Standard Parts
  partDetails: {
    qualityType: { type: String },
    warrantyPeriod: { type: String }
  },

  stockQuantity: { type: Number, default: 10 },

  status: {
    type: String,
    enum: ['in_stock', 'out_of_stock', 'discontinued'],
    default: 'in_stock'
  },
  imageUrl: { type: String, default: '' },   // primary image (backward compat)
  images: { type: [String], default: [] },   // up to 4 images gallery
  badge: { 
    type: String, 
    enum: ['', 'New Arrival', 'Hot Seller', 'Genuine', 'Limited Stock'],
    default: ''
  },
  features: { type: [String], default: [] }

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
