const Review = require('../models/Review');

// @desc    Get only approved reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a new review (pending validation)
// @route   POST /api/v1/reviews
// @access  Public
exports.createReview = async (req, res) => {
  try {
    const review = await Review.create({
      fullName: req.body.fullName,
      company: req.body.company,
      rating: req.body.rating,
      comment: req.body.comment,
      approved: false // default false for admin approval flow
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all reviews for moderation
// @route   GET /api/v1/reviews/admin
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Toggle review approval
// @route   PUT /api/v1/reviews/:id/approve
// @access  Private/Admin
exports.toggleReviewApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    review.approved = !review.approved;
    await review.save();
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
