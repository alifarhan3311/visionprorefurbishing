const express = require('express');
const router = express.Router();
const { createBuyback, getBuybacks, updateBuybackStatus } = require('../controllers/buybackController');
const { getBuybackPricing, upsertBuybackPricing } = require('../controllers/buybackPricingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(createBuyback)
  .get(getBuybacks);

router.route('/pricing')
  .get(getBuybackPricing)
  .post(protect, admin, upsertBuybackPricing);

router.put('/:id/status', updateBuybackStatus);

module.exports = router;
