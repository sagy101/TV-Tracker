const express = require('express');
const router = express.Router();
const Show = require('../../models/Show'); // Adjusted path
const Episode = require('../../models/Episode'); // Adjusted path
const UserShowSettings = require('../../models/UserShowSettings'); // Adjusted path

// Clear all data (DELETE /api/admin/clear-all)
router.delete('/clear-all', async (req, res, next) => {
  try {
    // Consider adding authentication/authorization for this sensitive endpoint
    console.warn('ADMIN ACTION: Clearing all show and episode data from database...');

    // Delete all shows and episodes
    const showDeletionResult = await Show.deleteMany({});
    const episodeDeletionResult = await Episode.deleteMany({});
    const settingsDeletionResult = await UserShowSettings.deleteMany({});

    const message = `Database cleared successfully. Deleted ${showDeletionResult.deletedCount} shows, ${episodeDeletionResult.deletedCount} episodes, and ${settingsDeletionResult.deletedCount} user show settings.`;
    console.log('✅', message);
    res.json({ message });
  } catch (error) {
    console.error('Error clearing database:', error);
    // Pass error to the central error handler
    next(error);
  }
});

module.exports = router; 