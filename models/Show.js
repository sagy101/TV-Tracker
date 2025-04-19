const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  tvMazeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  searchName: { type: String },
  image: { type: String },
  status: { type: String, default: 'Unknown' },
  summary: { type: String },
  genres: [{ type: String }],
  language: { type: String },
  premiered: { type: String },
  rating: { 
    average: { type: Number } 
  },
  network: { 
    name: { type: String },
    country: {
      name: { type: String },
      code: { type: String }
    }
  },
  runtime: { type: Number },
  officialSite: { type: String },
  cast: [{
    personName: { type: String },
    characterName: { type: String },
    personId: { type: String },
    personImage: { type: String }
  }],
  popularity: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Show', showSchema); 