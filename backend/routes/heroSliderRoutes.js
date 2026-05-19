const express = require('express');
const router = express.Router();
const { 
  getSlides, 
  getAdminSlides, 
  createSlide, 
  updateSlide, 
  deleteSlide 
} = require('../controllers/heroSliderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to fetch active slides for Home slider
router.get('/', getSlides);

// Admin CRUD routes
router.get('/admin', protect, admin, getAdminSlides);
router.post('/', protect, admin, createSlide);

router.route('/:id')
  .put(protect, admin, updateSlide)
  .delete(protect, admin, deleteSlide);

module.exports = router;
