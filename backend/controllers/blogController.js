const BlogPost = require('../models/BlogPost');

// @desc    Get all posts
// @route   GET /api/v1/blog
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a new post
// @route   POST /api/v1/blog
// @access  Private/Admin
exports.createPost = async (req, res) => {
  try {
    const post = await BlogPost.create(req.body);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update a post
// @route   PUT /api/v1/blog/:id
// @access  Private/Admin
exports.updatePost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/v1/blog/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
