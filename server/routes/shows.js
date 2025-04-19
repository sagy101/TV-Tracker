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
    const showId = req.params.id;
    console.log(`Fetching show with ID: ${showId}`);
    
    // First check if we have this show in our database
    let show = await Show.findOne({ tvMazeId: showId });
    let tvMazeData;
    
    // If not in our database or data is stale, fetch from TVMaze
    if (!show) {
      console.log(`Show ${showId} not found in database, fetching from TVMaze`);
      tvMazeData = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}`);
    }
    
    // If we have user authentication, get the user-specific ignored status
    let ignored = false;
    if (req.user && (show || tvMazeData)) {
      const userSettings = await UserShowSettings.findOne({
        userId: req.user._id,
        showTvMazeId: showId
      });
      
      if (userSettings) {
        ignored = userSettings.ignored;
        console.log(`Found user settings for ${showId}, ignored: ${ignored}`);
      }
    }
    
    // If we have the show in database, return it with ignore status
    if (show) {
      const showData = show.toObject();
      showData.ignored = ignored;
      return res.json(showData);
    }
    
    // Otherwise, return the TVMaze data
    if (tvMazeData) {
      console.log(`Successfully fetched show from TVMaze: ${tvMazeData.name}`);
      // Add the ignored status to the TVMaze data
      tvMazeData.ignored = ignored;
      return res.json(tvMazeData);
    }
    
    // If we get here, we couldn't find the show
    throw new Error(`Show with ID ${showId} not found`);
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
    const episodeData = tvMazeEpisodes.map(ep => ({
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
    let savedEpisodes = [];
    if (episodeData.length > 0) {
        try {
            await Episode.insertMany(episodeData, { ordered: false }); // Use ordered: false to continue on duplicate errors if any
            console.log(`✅ Attempted to save ${episodeData.length} episodes to database for show ${showId}`);
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
        savedEpisodes = await Episode.find({ showId: showId });
        savedEpisodes.sort((a, b) => a.season - b.season || a.number - b.number);
    }

    res.json(savedEpisodes);
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
      
      // Check if show data needs to be refreshed (older than 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      if (!existingShow.lastUpdated || existingShow.lastUpdated < oneWeekAgo) {
        console.log(`Show ${showId} data is older than 7 days, refreshing from TVMaze`);
        try {
          // Fetch updated show data and cast information
          const [showData, castData] = await Promise.all([
            fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}`),
            fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}/cast`)
          ]);
          
          // Update show with new data
          existingShow.name = showData.name;
          existingShow.image = showData.image?.medium || null;
          existingShow.status = showData.status || 'Unknown';
          existingShow.summary = showData.summary;
          existingShow.genres = showData.genres || [];
          existingShow.language = showData.language;
          existingShow.premiered = showData.premiered;
          existingShow.rating = { average: showData.rating?.average };
          existingShow.network = showData.network ? {
            name: showData.network.name,
            country: showData.network.country ? {
              name: showData.network.country.name,
              code: showData.network.country.code
            } : null
          } : null;
          existingShow.runtime = showData.runtime;
          existingShow.officialSite = showData.officialSite;
          
          // Process cast data
          if (Array.isArray(castData)) {
            existingShow.cast = castData.slice(0, 10).map(castMember => ({
              personName: castMember.person.name,
              characterName: castMember.character.name,
              personId: castMember.person.id.toString(),
              personImage: castMember.person.image?.medium || null
            }));
          }
          
          existingShow.lastUpdated = new Date();
          await existingShow.save();
          console.log(`✅ Refreshed data for show: ${showData.name} (${showId})`);
        } catch (refreshError) {
          console.error(`Error refreshing show data for ${showId}:`, refreshError);
          // Continue with existing show data
        }
      }
      
      // Return the show with the appropriate ignored status
      const showResponse = existingShow.toObject();
      showResponse.ignored = responseIgnored;
      return res.json({ show: showResponse, skipped: true }); // Indicate it existed
    }

    // Fetch show details and cast from TVMaze
    let showData, castData;
    try {
      [showData, castData] = await Promise.all([
        fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}`),
        fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}/cast`)
      ]);
    } catch (tvMazeError) {
       // If TVMaze API returns an error (e.g., 404 Not Found)
        console.log(`Show ${showId} not found in TVMaze API or failed to fetch: ${tvMazeError.message}`);
        return res.status(404).json({ error: `Show with ID ${showId} not found on TVMaze.` });
    }

    // Process cast data
    const cast = Array.isArray(castData) 
      ? castData.slice(0, 10).map(castMember => ({
          personName: castMember.person.name,
          characterName: castMember.character.name,
          personId: castMember.person.id.toString(),
          personImage: castMember.person.image?.medium || null
        }))
      : [];

    // Create new show in database with enhanced data
    const newShow = new Show({
      tvMazeId: showId,
      name: showData.name,
      searchName: searchName || showData.name,
      image: showData.image?.medium || null,
      status: showData.status || 'Unknown',
      summary: showData.summary,
      genres: showData.genres || [],
      language: showData.language,
      premiered: showData.premiered,
      rating: { average: showData.rating?.average },
      network: showData.network ? {
        name: showData.network.name,
        country: showData.network.country ? {
          name: showData.network.country.name,
          code: showData.network.country.code
        } : null
      } : null,
      runtime: showData.runtime,
      officialSite: showData.officialSite,
      cast: cast,
      lastUpdated: new Date()
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

    // Fetch and save episodes associated with the new show
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
            await Episode.insertMany(episodeDocs, { ordered: false });
            console.log(`✅ Added ${episodeDocs.length} episodes for new show ${showId}`);
        } else {
             console.log(`No episodes found or invalid format from TVMaze for show ${showId}`);
        }
    } catch (epError) {
        console.error(`Error fetching/saving episodes for new show ${showId}:`, epError);
        if (epError.code !== 11000) {
             console.error('Episode saving error details:', epError);
        }
    }

    // Return the show with the appropriate ignored status
    const showResponse = newShow.toObject();
    showResponse.ignored = ignored || false;
    res.status(201).json({ show: showResponse, skipped: false });

  } catch (error) {
    console.error('Error adding show:', error);
    next(error);
  }
});

// Utility function to update show popularity
async function updateShowPopularity() {
  try {
    console.log('Updating show popularity metrics...');
    const allShows = await Show.find();
    const allEpisodes = await Episode.find();
    
    // Map episodes to their shows
    const showEpisodeMap = {};
    allEpisodes.forEach(episode => {
      if (!showEpisodeMap[episode.showId]) {
        showEpisodeMap[episode.showId] = [];
      }
      showEpisodeMap[episode.showId].push(episode);
    });
    
    // Get all user settings
    const allUserSettings = await UserShowSettings.find();
    
    // Map user settings to shows
    const showUserMap = {};
    allUserSettings.forEach(setting => {
      if (!showUserMap[setting.showTvMazeId]) {
        showUserMap[setting.showTvMazeId] = [];
      }
      showUserMap[setting.showTvMazeId].push(setting);
    });
    
    // Calculate popularity for each show
    for (const show of allShows) {
      const showId = show.tvMazeId;
      const episodes = showEpisodeMap[showId] || [];
      const userSettings = showUserMap[showId] || [];
      
      // Calculate metrics
      const watchedEpisodes = episodes.filter(ep => ep.watched).length;
      const totalEpisodes = episodes.length;
      const watchPercentage = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;
      const userCount = userSettings.length;
      const nonIgnoredUserCount = userSettings.filter(setting => !setting.ignored).length;
      
      // Calculate weighted popularity score
      // 40% from watch percentage, 30% from user count, 30% from non-ignored ratio
      const watchScore = watchPercentage * 0.4;
      const userScore = Math.min(userCount * 5, 100) * 0.3; // Cap at 20 users for max score
      const ignoredRatio = userCount > 0 ? (nonIgnoredUserCount / userCount) * 100 : 100;
      const ignoredScore = ignoredRatio * 0.3;
      
      // Combine scores and add rating bonus if available
      let popularityScore = watchScore + userScore + ignoredScore;
      
      // Add bonus from TVMaze rating if available (up to 10% bonus)
      if (show.rating && show.rating.average) {
        const ratingBonus = (show.rating.average / 10) * 10; // Rating is out of 10
        popularityScore += ratingBonus;
      }
      
      // Add genre diversity bonus
      if (show.genres && show.genres.length > 0) {
        const genreBonus = Math.min(show.genres.length * 2, 10); // Up to 10% bonus
        popularityScore += genreBonus;
      }
      
      // Update show popularity
      show.popularity = Math.round(popularityScore * 10) / 10; // Round to 1 decimal place
      await show.save();
    }
    
    console.log(`✅ Updated popularity for ${allShows.length} shows`);
    return true;
  } catch (error) {
    console.error('Error updating show popularity:', error);
    return false;
  }
}

// Route to trigger popularity update (POST /api/shows/update-popularity)
router.post('/update-popularity', async (req, res, next) => {
  try {
    const success = await updateShowPopularity();
    if (success) {
      res.json({ message: 'Show popularity updated successfully' });
    } else {
      res.status(500).json({ error: 'Failed to update show popularity' });
    }
  } catch (error) {
    console.error('Error in /api/shows/update-popularity:', error);
    next(error);
  }
});

// Update the "Get all tracked shows" route to include sorting by popularity
router.get('/', async (req, res, next) => {
  try {
    // Optional sorting parameter, default to alphabetical
    const sortBy = req.query.sort || 'name';
    let sortQuery = {};
    
    // Define sorting options
    if (sortBy === 'popularity') {
      sortQuery = { popularity: -1, name: 1 }; // Descending popularity, then alphabetical
    } else if (sortBy === 'rating') {
      sortQuery = { 'rating.average': -1, name: 1 }; // Descending rating, then alphabetical
    } else {
      sortQuery = { name: 1 }; // Default alphabetical
    }
    
    const shows = await Show.find().sort(sortQuery);
    console.log(`Found ${shows.length} shows in database, sorted by ${sortBy}`);
    
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
    next(error);
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

    // Require authentication
    if (!req.user) {
      console.error('Authentication required to toggle ignore status');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user._id;
    console.log(`User ${userId} toggling ignore status for show ${showId}`);

    // Find the show using string ID
    let show = await Show.findOne({ tvMazeId: showId });
    
    // If show doesn't exist in our database, try to add it
    if (!show) {
      console.log(`Show ${showId} not found in database. Trying to add it first.`);
      try {
        // Fetch show data from TVMaze
        const showData = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}`);
        
        // Create a basic show record
        show = new Show({
          tvMazeId: showId,
          name: showData.name,
          searchName: showData.name,
          image: showData.image?.medium || null,
          status: showData.status || 'Unknown',
          lastUpdated: new Date()
        });
        
        await show.save();
        console.log(`Added show ${showData.name} to database for ignore toggle`);
      } catch (fetchError) {
        console.error(`Failed to add show ${showId} to database:`, fetchError);
        return res.status(404).json({ error: 'Show not found and could not be added' });
      }
    }
    
    // Find existing user show settings
    let userShowSettings = await UserShowSettings.findOne({
      userId,
      showTvMazeId: showId
    });

    let ignored;
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

    // Return the show object with the updated ignored status
    res.json({ 
      ...show.toObject(), 
      ignored 
    });
  } catch (error) {
    console.error('Error toggling show ignore status:', error);
    next(error);
  }
});


module.exports = router; 