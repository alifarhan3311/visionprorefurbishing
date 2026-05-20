const express = require('express');
const router = express.Router();
const { getAssets, createAsset, deleteAsset, updateAsset } = require('../controllers/marketingController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadDocument } = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getAssets)
  .post(protect, admin, uploadDocument.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createAsset);

router.route('/:id')
  .put(protect, admin, uploadDocument.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateAsset)
  .delete(protect, admin, deleteAsset);

module.exports = router;
