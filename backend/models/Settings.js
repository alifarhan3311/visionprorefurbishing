const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'VisionPro Refurbishing' },
  contactEmail: { type: String, default: 'support@visionpro.com' },
  currency: { type: String, default: 'CAD' },
  maintenanceMode: { type: Boolean, default: false },
  freeShippingThreshold: { type: Number, default: 500 },
  taxRate: { type: Number, default: 13 },
  footerText: { type: String, default: '© 2024 VisionPro Refurbishing. All Rights Reserved.' },
  apiCache: { type: Boolean, default: true },
  twoFactor: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);
