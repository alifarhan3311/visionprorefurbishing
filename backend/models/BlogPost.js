const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/800x400'
  },
  category: {
    type: String,
    default: 'General'
  },
  author: {
    type: String,
    default: 'Admin'
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
