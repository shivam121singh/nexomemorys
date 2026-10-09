const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Media URL is required']
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  uploader: {
    type: String,
    default: 'Anonymous Lorekeeper',
    trim: true
  },
  caption: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    default: 'General',
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Memory', MemorySchema);