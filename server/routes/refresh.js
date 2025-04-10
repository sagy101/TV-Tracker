const express = require('express');
const router = express.Router();
const { refreshActiveShows } = require('../utils/refresh'); // Adjusted path

// Refresh active shows (PUT /api/refresh/shows)
router.put('/shows', async (req, res, next) => {
  try {
    // Note: Renamed endpoint from /api/shows/refresh to /api/refresh/shows for clarity
    console.log('Received request to refresh active shows...');
    const results = await refreshActiveShows(); // Call the imported utility function
    console.log('Show refresh process initiated and completed.');
    res.json(results); // Send back the summary results
  } catch (error) {
    // Catch any unexpected errors from refreshActiveShows or the route handler itself
    console.error('Error in PUT /api/refresh/shows:', error);
    // Pass error to the central error handler
    next(error); // Ensure errors are handled centrally
  }
});

module.exports = router; 