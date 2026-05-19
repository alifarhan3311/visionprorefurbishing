const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name']
  },
  company: {
    type: String,
    required: false
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add feedback text']
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
