const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  tvMazeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  searchName: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: 'Unknown'
  },
  ignored: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Show', showSchema); 