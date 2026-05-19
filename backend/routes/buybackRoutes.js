const express = require('express');
const router = express.Router();
const { createBuyback, getBuybacks, updateBuybackStatus } = require('../controllers/buybackController');
const { getBuybackPricing, upsertBuybackPricing } = require('../controllers/buybackPricingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createBuyback)
  .get(protect, admin, getBuybacks);

router.route('/pricing')
  .get(getBuybackPricing)
  .post(protect, admin, upsertBuybackPricing);

router.put('/:id/status', protect, admin, updateBuybackStatus);

module.exports = router;
