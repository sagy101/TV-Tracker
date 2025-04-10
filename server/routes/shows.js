const express = require('express');
const router = express.Router();
const Show = require('../../models/Show'); // Adjusted path
const Episode = require('../../models/Episode'); // Adjusted path
const fetchFromTVMaze = require('../utils/tvmaze'); // Adjusted path

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
    if (existingShow) {
      console.log(`Show ${showId} already exists in database`);
       // Optionally update 'ignored' status if provided
       if (ignored !== undefined && existingShow.ignored !== ignored) {
           existingShow.ignored = ignored;
           await existingShow.save();
           console.log(`Updated ignored status for existing show ${showId} to ${ignored}`);
       }
      return res.json({ show: existingShow, skipped: true }); // Indicate it existed
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

    // Create new show in database
    const newShow = new Show({
      tvMazeId: showId,
      name: showData.name,
      searchName: searchName || showData.name, // Use provided searchName or default to show name
      image: showData.image?.medium || null,
      status: showData.status || 'Unknown',
      ignored: ignored || false // Default ignored to false if not provided
    });

    await newShow.save();
    console.log(`✅ Added new show: ${showData.name} (${showId}) with status: ${showData.status}, ignored: ${newShow.ignored}`);

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


    res.status(201).json({ show: newShow, skipped: false }); // Use 201 Created status

  } catch (error) {
    console.error('Error adding show:', error);
    next(error); // Pass error to the central error handler
  }
});

// Legacy Add/Update Show (POST /api/shows) - Kept for backward compatibility
router.post('/', async (req, res, next) => {
  try {
    const { tvMazeId, name, image, status } = req.body;
    console.log(`Adding/updating show through legacy endpoint: ${name} (${tvMazeId})`);

    if (!tvMazeId || !name) {
      // Use return to stop execution and send error
      return res.status(400).json({ error: 'Missing required fields: tvMazeId and name are required' });
    }

    // Find existing or create new, ensure 'ignored' defaults reasonably (e.g., false)
    const show = await Show.findOneAndUpdate(
      { tvMazeId },
      { $set: { tvMazeId, name, image, status }, $setOnInsert: { ignored: false } }, // Use $set and $setOnInsert
      { upsert: true, new: true, runValidators: true } // Added runValidators
    );

    console.log(`Legacy endpoint processed show: ${show.name} (${show.tvMazeId})`);
    res.json(show);
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
    res.json(shows);
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

    // Toggle the ignored status
    show.ignored = !show.ignored;
    await show.save();
    console.log(`Updated show ${show.name} (${show.tvMazeId}), ignored: ${show.ignored}`);

    res.json(show); // Return the updated show object
  } catch (error) {
    console.error('Error toggling show ignore status:', error);
    // Pass error to the central error handler instead of custom response
    next(error);
  }
});


module.exports = router; 