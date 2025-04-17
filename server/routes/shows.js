const express = require('express');
const router = express.Router();
const Show = require('../../models/Show'); // Adjusted path
const Episode = require('../../models/Episode'); // Adjusted path
const fetchFromTVMaze = require('../utils/tvmaze'); // Adjusted path
const UserShowSettings = require('../../models/UserShowSettings');
const { getCurrentUser } = require('../middleware/authMiddleware');

// Apply the getCurrentUser middleware to all routes in this router
router.use(getCurrentUser);

// Search shows (GET /api/shows/search)
router.get('/search', async (req, res) => {
  const abortController = new AbortController();
  const signal = abortController.signal;

  // Set up cleanup on client disconnect
  let isCancelled = false;

  req.on('close', () => {
    // Only consider it a cancellation if the response hasn't been sent yet
    if (!res.headersSent) {
      isCancelled = true;
      console.log('Client disconnected, cancelling search for:', req.query.q);
      abortController.abort();
    }
  });

  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // First try to parse as ID
    if (/^\d+$/.test(query)) {
      try {
        const show = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${query}`, { signal });
        console.log('Found show by ID:', show.name);
        return res.json([{ show }]);
      } catch (error) {
        if (error.name === 'AbortError' && isCancelled) {
          console.log('Search cancelled by client for ID:', query);
          return res.status(499).json({ error: 'Search cancelled by client' });
        }
        console.log('Show not found by ID, searching by name...');
      }
    }

    // Search by name
    console.log(`Searching for show by name: ${query}`);
    const searchUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
    const results = await fetchFromTVMaze(searchUrl, { signal });

    if (!Array.isArray(results)) {
      console.error('Invalid response format:', results);
      throw new Error('Invalid response from TVMaze API');
    }

    console.log(`Found ${results.length} results for "${query}"`);
    return res.json(results);
  } catch (error) {
    if (error.name === 'AbortError' && isCancelled) {
      console.log('Search cancelled by client for query:', req.query.q);
      return res.status(499).json({ error: 'Search cancelled by client' });
    }
    console.error('Error searching shows:', error);
    // Use next to pass error to central handler if needed, or return specific response
    return res.status(500).json({
      error: 'Failed to search shows',
      details: error.message
    });
  }
});

// Get specific show details (GET /api/shows/:id)
router.get('/:id', async (req, res, next) => {
  try {
    console.log(`Fetching show with ID: ${req.params.id}`);
    const data = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${req.params.id}`);
    console.log(`Successfully fetched show: ${data.name}`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching show:', error);
    next(error); // Pass error to the central error handler
  }
});

// Get episodes for a show (GET /api/shows/:id/episodes)
router.get('/:id/episodes', async (req, res, next) => {
  try {
    const showId = req.params.id;
    console.log(`Looking for episodes of show: ${showId}`);

    // First check if we already have episodes in our database
    let existingEpisodes = await Episode.find({ showId: showId });

    if (existingEpisodes.length > 0) {
      console.log(`Found ${existingEpisodes.length} existing episodes for show ${showId}`);
      // Sort episodes before sending
      existingEpisodes.sort((a, b) => a.season - b.season || a.number - b.number);
      return res.json(existingEpisodes);
    }

    // If not, fetch from TVMaze and save to our database
    console.log('No existing episodes found, fetching from TVMaze...');
    const tvMazeEpisodes = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}/episodes`);
    console.log(`Fetched ${tvMazeEpisodes.length} episodes from TVMaze for show ${showId}`);

    if (!Array.isArray(tvMazeEpisodes)) {
      throw new Error('Invalid response from TVMaze API: episodes data is not an array');
    }

    // Transform and save episodes
    const episodes = tvMazeEpisodes.map(ep => ({
      tvMazeId: ep.id.toString(),
      showId: showId,
      season: ep.season,
      number: ep.number,
      name: ep.name,
      airdate: ep.airdate || 'TBA',
      airtime: ep.airtime || 'TBA',
      runtime: ep.runtime || null,
      watched: false
    }));

    // Save episodes to database if any exist
    if (episodes.length > 0) {
        try {
            await Episode.insertMany(episodes, { ordered: false }); // Use ordered: false to continue on duplicate errors if any
            console.log(`✅ Attempted to save ${episodes.length} episodes to database for show ${showId}`);
        } catch (dbError) {
            // Ignore duplicate key errors (code 11000) as we might re-fetch
            if (dbError.code !== 11000) {
                console.error('Error saving episodes to database (non-duplicate error):', dbError);
                throw dbError; // Re-throw non-duplicate errors
            } else {
                 console.log(`Ignoring duplicate key errors during episode insertion for show ${showId}`);
            }
        }
        // Fetch again from DB to ensure we return the saved data including potential existing ones if fetch was triggered concurrently
        episodes = await Episode.find({ showId: showId });
        episodes.sort((a, b) => a.season - b.season || a.number - b.number);
    }

    res.json(episodes);
  } catch (error) {
    console.error(`Error in /api/shows/${req.params.id}/episodes:`, error);
    next(error); // Pass error to the central error handler
  }
});


// Add or Update show (POST /api/shows/:id) - Preferred method
router.post('/:id', async (req, res, next) => {
  try {
    const showId = req.params.id;
    const { ignored, searchName } = req.body;
    console.log(`Adding show with ID: ${showId}`);

    // Check if show already exists in our database
    let existingShow = await Show.findOne({ tvMazeId: showId });
    
    // Get userId if authenticated
    let userId = null;
    if (req.user) {
      userId = req.user._id;
    }
    
    // Default response object
    let responseIgnored = ignored || false;
    
    if (existingShow) {
      console.log(`Show ${showId} already exists in database`);
      
      // Handle ignored status based on authentication
      if (userId && ignored !== undefined) {
        // User is authenticated, store ignored status in UserShowSettings
        const userShowSettings = await UserShowSettings.findOneAndUpdate(
          { userId, showTvMazeId: showId },
          { $set: { ignored } },
          { upsert: true, new: true }
        );
        responseIgnored = userShowSettings.ignored;
        console.log(`Updated ignored status for user ${userId} and show ${showId} to ${responseIgnored}`);
      } else if (ignored !== undefined && existingShow.ignored !== ignored) {
        // Legacy: Update show.ignored for backward compatibility
        existingShow.ignored = ignored;
        await existingShow.save();
        console.log(`[Legacy] Updated ignored status for existing show ${showId} to ${ignored}`);
      }
      
      // Return the show with the appropriate ignored status
      const showResponse = existingShow.toObject();
      showResponse.ignored = responseIgnored;
      return res.json({ show: showResponse, skipped: true }); // Indicate it existed
    }

    // Fetch show details from TVMaze only if it doesn't exist
    let showData;
    try {
      showData = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}`);
    } catch (tvMazeError) {
       // If TVMaze API returns an error (e.g., 404 Not Found)
        console.log(`Show ${showId} not found in TVMaze API or failed to fetch: ${tvMazeError.message}`);
        // Decide if you want to create a "placeholder" show or just return an error
        // For now, returning an error status might be clearer
        return res.status(404).json({ error: `Show with ID ${showId} not found on TVMaze.` });
        // Original logic treated this as 'skipped: true', which might be confusing.
        // return res.json({ show: null, skipped: true }); // Consider if this behavior is desired
    }

    // Create new show in database (without the ignored field)
    const newShow = new Show({
      tvMazeId: showId,
      name: showData.name,
      searchName: searchName || showData.name, // Use provided searchName or default to show name
      image: showData.image?.medium || null,
      status: showData.status || 'Unknown'
    });

    await newShow.save();
    console.log(`✅ Added new show: ${showData.name} (${showId}) with status: ${showData.status}`);
    
    // Handle ignored status for new show
    if (userId && ignored !== undefined) {
      // User is authenticated, create UserShowSettings
      await UserShowSettings.create({
        userId,
        showTvMazeId: showId,
        ignored: ignored || false
      });
      console.log(`Created user settings for user ${userId} and show ${showId} with ignored: ${ignored || false}`);
    }

    // Fetch and save episodes associated with the new show - trigger the episode fetch endpoint logic might be cleaner
    // Or reuse the logic here (less ideal)
     try {
        const tvMazeEpisodes = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}/episodes`);
        if (Array.isArray(tvMazeEpisodes) && tvMazeEpisodes.length > 0) {
            const episodeDocs = tvMazeEpisodes.map(ep => ({
                tvMazeId: ep.id.toString(),
                showId: showId,
                season: ep.season,
                number: ep.number,
                name: ep.name,
                airdate: ep.airdate || 'TBA',
                airtime: ep.airtime || 'TBA',
                runtime: ep.runtime || null,
                watched: false
            }));
            await Episode.insertMany(episodeDocs, { ordered: false }); // Allow continuing if some duplicates exist
            console.log(`✅ Added ${episodeDocs.length} episodes for new show ${showId}`);
        } else {
             console.log(`No episodes found or invalid format from TVMaze for show ${showId}`);
        }
    } catch (epError) {
        // Log episode fetch/save error but don't fail the show creation
        console.error(`Error fetching/saving episodes for new show ${showId}:`, epError);
         if (epError.code !== 11000) { // Log non-duplicate errors more verbosely
             console.error('Episode saving error details:', epError);
         }
    }

    // Return the show with the appropriate ignored status
    const showResponse = newShow.toObject();
    showResponse.ignored = ignored || false;
    res.status(201).json({ show: showResponse, skipped: false }); // Use 201 Created status

  } catch (error) {
    console.error('Error adding show:', error);
    next(error); // Pass error to the central error handler
  }
});

// Legacy Add/Update Show (POST /api/shows) - Kept for backward compatibility
router.post('/', async (req, res, next) => {
  try {
    const { tvMazeId, name, image, status, ignored } = req.body;
    console.log(`Adding/updating show through legacy endpoint: ${name} (${tvMazeId})`);

    if (!tvMazeId || !name) {
      // Use return to stop execution and send error
      return res.status(400).json({ error: 'Missing required fields: tvMazeId and name are required' });
    }

    // Get userId if authenticated
    let userId = null;
    if (req.user) {
      userId = req.user._id;
    }

    // Find existing or create new show (without ignored field)
    const show = await Show.findOneAndUpdate(
      { tvMazeId },
      { $set: { tvMazeId, name, image, status } },
      { upsert: true, new: true, runValidators: true }
    );

    // Handle ignored status
    let responseIgnored = false;
    
    if (userId && ignored !== undefined) {
      // User is authenticated, update or create UserShowSettings
      const userShowSettings = await UserShowSettings.findOneAndUpdate(
        { userId, showTvMazeId: tvMazeId },
        { $set: { ignored: !!ignored } },
        { upsert: true, new: true }
      );
      responseIgnored = userShowSettings.ignored;
      console.log(`Legacy endpoint: Updated user show settings for user ${userId} and show ${tvMazeId}, ignored: ${responseIgnored}`);
    } else if (ignored !== undefined) {
      // Legacy compatibility - update the show.ignored field
      show.ignored = !!ignored;
      await show.save();
      responseIgnored = show.ignored;
      console.log(`[Legacy] Legacy endpoint: Updated show ${show.name} (${tvMazeId}), ignored: ${responseIgnored}`);
    }

    console.log(`Legacy endpoint processed show: ${show.name} (${show.tvMazeId})`);
    
    // Return the show with the ignored status
    const showResponse = show.toObject();
    showResponse.ignored = responseIgnored;
    res.json(showResponse);
  } catch (error) {
    console.error('Error in legacy show addition:', error);
    next(error); // Pass error to the central error handler
  }
});


// Get all tracked shows (GET /api/shows)
router.get('/', async (req, res, next) => {
  try {
    const shows = await Show.find().sort({ name: 1 }); // Sort shows alphabetically by name
    console.log(`Found ${shows.length} shows in database`);
    
    let userId = null;
    if (req.user) {
      userId = req.user._id;
    }

    // Get the shows with user-specific ignored status
    let showsWithSettings;
    
    if (userId) {
      // If authenticated, get user-specific settings
      const userShowSettings = await UserShowSettings.find({ 
        userId, 
        showTvMazeId: { $in: shows.map(show => show.tvMazeId) } 
      });
      
      // Create a map of showTvMazeId -> ignored status for quick lookup
      const userSettingsMap = userShowSettings.reduce((map, setting) => {
        map[setting.showTvMazeId] = setting.ignored;
        return map;
      }, {});
      
      // Add ignored status to shows
      showsWithSettings = shows.map(show => {
        const showObj = show.toObject();
        // Use user-specific setting if available, otherwise default to false
        showObj.ignored = userSettingsMap[show.tvMazeId] || false;
        return showObj;
      });
      
      console.log(`Returned ${shows.length} shows with user-specific settings for user ${userId}`);
    } else {
      // For backwards compatibility
      showsWithSettings = shows;
      console.log(`Returned ${shows.length} shows with legacy settings (no authenticated user)`);
    }
    
    res.json(showsWithSettings);
  } catch (error) {
    console.error('Error in GET /api/shows:', error);
    next(error); // Pass error to the central error handler
  }
});

// Delete a show and its episodes (DELETE /api/shows/:id)
router.delete('/:id', async (req, res, next) => {
  try {
      const showId = req.params.id;
      console.log(`Attempting to delete show and episodes for show ID: ${showId}`);

      // Use findOneAndDelete to potentially get the show details if needed for logging
      const deletedShow = await Show.findOneAndDelete({ tvMazeId: showId });

      if (!deletedShow) {
          console.log(`Show with ID ${showId} not found for deletion.`);
          return res.status(404).json({ error: 'Show not found' });
      }

      console.log(`Deleted show: ${deletedShow.name} (${showId})`);

      // Delete associated episodes
      const deletionResult = await Episode.deleteMany({ showId: showId });
      console.log(`Deleted ${deletionResult.deletedCount} episodes for show ${showId}`);
      
      // Delete associated user settings
      const settingsResult = await UserShowSettings.deleteMany({ showTvMazeId: showId });
      console.log(`Deleted ${settingsResult.deletedCount} user show settings for show ${showId}`);

      res.status(204).send(); // No content response
  } catch (error) {
      console.error('Error in DELETE /api/shows/:id:', error);
      next(error); // Pass error to the central error handler
  }
});


// Toggle show ignore status (PUT /api/shows/:id/ignore)
router.put('/:id/ignore', async (req, res, next) => {
  try {
    const showId = req.params.id;
    console.log('Attempting to toggle ignore status for show:', showId);

    // Find the show using string ID
    const show = await Show.findOne({ tvMazeId: showId });
    if (!show) {
      console.error('Show not found:', showId);
      return res.status(404).json({ error: 'Show not found' });
    }

    let userId = null;
    if (req.user) {
      userId = req.user._id;
    } else {
      // For backwards compatibility, allow non-authenticated users
      // This would be removed once all clients use authentication
      console.log('No authenticated user, using anonymous ignore status');
    }

    let userShowSettings;
    let ignored;

    if (userId) {
      // Find existing user show settings
      userShowSettings = await UserShowSettings.findOne({
        userId,
        showTvMazeId: showId
      });

      if (userShowSettings) {
        // Toggle the ignored status
        userShowSettings.ignored = !userShowSettings.ignored;
        await userShowSettings.save();
        ignored = userShowSettings.ignored;
        console.log(`Toggled existing setting: show ${show.name} (${show.tvMazeId}) ignored status to ${ignored} for user ${userId}`);
      } else {
        // When creating new settings, start with ignored=false and then toggle to true
        // This ensures the first click always toggles from false->true
        const initialState = false;
        userShowSettings = await UserShowSettings.create({
          userId,
          showTvMazeId: showId,
          ignored: !initialState // Toggle from the initial state
        });
        ignored = !initialState;
        console.log(`Created new setting: show ${show.name} (${show.tvMazeId}) ignored status set to ${ignored} for user ${userId}`);
      }
    } else {
      // For backwards compatibility - this would be removed once all clients use authentication
      show.ignored = !show.ignored; // Temporary for non-authenticated users
      await show.save();
      ignored = show.ignored;
      console.log(`[Legacy] Updated show ${show.name} (${show.tvMazeId}), ignored: ${ignored}`);
    }

    // Return the show object with the updated ignored status
    // This maintains backwards compatibility with frontend
    res.json({ 
      ...show.toObject(), 
      ignored 
    });
  } catch (error) {
    console.error('Error toggling show ignore status:', error);
    // Pass error to the central error handler instead of custom response
    next(error);
  }
});


module.exports = router; 