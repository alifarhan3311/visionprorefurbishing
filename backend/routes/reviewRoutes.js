const express = require('express');
const router = express.Router();
const { 
  getApprovedReviews, 
  createReview, 
  getAllReviews, 
  toggleReviewApproval, 
  deleteReview 
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getApprovedReviews)
  .post(createReview);

router.route('/admin')
  .get(protect, admin, getAllReviews);

router.route('/:id/approve')
  .put(protect, admin, toggleReviewApproval);

router.route('/:id')
  .delete(protect, admin, deleteReview);

module.exports = router;
