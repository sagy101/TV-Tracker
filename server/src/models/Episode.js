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
    default: 'TBA'
  },
  airtime: {
    type: String,
    default: 'TBA'
  },
  runtime: {
    type: Number,
    default: null
  },
  watched: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Episode', episodeSchema); 