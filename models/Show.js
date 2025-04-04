const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  tvMazeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  status: { type: String, default: 'Unknown' },
  ignored: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Show', showSchema); 