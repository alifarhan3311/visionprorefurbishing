const express = require('express');
const router = express.Router();
const { createCategory, getMegaMenu, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes
router.get('/mega-menu', getMegaMenu);
router.get('/', getCategories);

// Admin Routes
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
