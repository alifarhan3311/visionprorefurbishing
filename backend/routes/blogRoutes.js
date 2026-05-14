const express = require('express');
const router = express.Router();
const { getPosts, createPost, updatePost, deletePost } = require('../controllers/blogController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPosts)
  .post(protect, admin, createPost);

router.route('/:id')
  .put(protect, admin, updatePost)
  .delete(protect, admin, deletePost);

module.exports = router;
