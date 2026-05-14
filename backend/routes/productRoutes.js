const express = require('express');
const router = express.Router();
const { createProduct, getProducts, validateSKUs, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', getProducts);
router.post('/validate-skus', validateSKUs);

// Admin Routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
