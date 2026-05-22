const express = require('express');
const router = express.Router();
const { createProduct, getProducts, validateSKUs, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadProductImages } = require('../middleware/uploadMiddleware');

// field config: image0..image3 (4 slots)
const productImageFields = [
  { name: 'image0', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
];

// Public Routes
router.get('/', getProducts);
router.post('/validate-skus', validateSKUs);

// Admin Routes
router.post('/', protect, admin, uploadProductImages.fields(productImageFields), createProduct);
router.put('/:id', protect, admin, uploadProductImages.fields(productImageFields), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
