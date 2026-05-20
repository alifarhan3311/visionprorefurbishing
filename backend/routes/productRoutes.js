const express = require('express');
const router = express.Router();
const { createProduct, getProducts, validateSKUs, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');

// Public Routes
router.get('/', getProducts);
router.post('/validate-skus', validateSKUs);

// Admin Routes
router.post('/', protect, admin, uploadImage.single('image'), createProduct);
router.put('/:id', protect, admin, uploadImage.single('image'), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
