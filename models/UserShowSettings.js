const mongoose = require('mongoose');

const userShowSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  showTvMazeId: {
    type: String,
    required: true
  },
  ignored: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create a compound index to ensure uniqueness of user-show combinations
userShowSettingsSchema.index({ userId: 1, showTvMazeId: 1 }, { unique: true });

module.exports = mongoose.model('UserShowSettings', userShowSettingsSchema); 