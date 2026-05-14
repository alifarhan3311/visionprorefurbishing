const express = require('express');
const router = express.Router();
const { createRMA, getRMAs, updateRMAStatus } = require('../controllers/rmaController');

router.post('/', createRMA);
router.get('/', getRMAs);
router.put('/:id/status', updateRMAStatus);

module.exports = router;
