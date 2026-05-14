const express = require('express');
const router = express.Router();
const { getAssets, createAsset, deleteAsset, updateAsset } = require('../controllers/marketingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAssets)
  .post(protect, admin, createAsset);

router.route('/:id')
  .put(protect, admin, updateAsset)
  .delete(protect, admin, deleteAsset);

module.exports = router;
