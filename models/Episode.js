const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  tvMazeId: {
    type: String,
    required: true,
    unique: true
  },
  showId: {
    type: String,
    required: true
  },
  season: {
    type: Number,
    required: true
  },
  number: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  airdate: {
    type: String,
    required: true
  },
  airtime: {
    type: String,
    required: true
  },
  runtime: {
    type: Number,
    default: null
  },
  watched: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create a compound index for showId and season/number
episodeSchema.index({ showId: 1, season: 1, number: 1 });

module.exports = mongoose.model('Episode', episodeSchema); 