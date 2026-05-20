const express = require('express');
const router = express.Router();
const { createCategory, getMegaMenu, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');

// Public Routes
router.get('/mega-menu', getMegaMenu);
router.get('/', getCategories);

// Admin Routes
router.post('/', protect, admin, uploadImage.fields([{ name: 'icon', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), createCategory);
router.put('/:id', protect, admin, uploadImage.fields([{ name: 'icon', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
