const express = require('express');
const router = express.Router();
const { createCloverCharge } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/v1/payment/clover-charge
router.post('/clover-charge', protect, createCloverCharge);

module.exports = router;
