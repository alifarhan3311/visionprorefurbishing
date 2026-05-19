const express = require('express');
const router = express.Router();
const { createRMA, getRMAs, updateRMAStatus } = require('../controllers/rmaController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createRMA);
router.get('/', protect, admin, getRMAs);
router.put('/:id/status', protect, admin, updateRMAStatus);

module.exports = router;
