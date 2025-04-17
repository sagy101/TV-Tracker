const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  tvMazeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  searchName: { type: String },
  image: { type: String },
  status: { type: String, default: 'Unknown' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Show', showSchema); 