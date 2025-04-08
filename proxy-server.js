require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const Show = require('./models/Show');
const Episode = require('./models/Episode');

// Helper function to fetch from TVMaze API
async function fetchFromTVMaze(url, options = {}) {
  try {
    console.log('Fetching from TVMaze:', url);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.error('TVMaze API error:', {
        status: response.status,
        statusText: response.statusText,
        url: url
      });
      throw new Error(`TVMaze API error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON response:', text);
      throw new Error('Invalid JSON response from TVMaze API');
    }
  } catch (error) {
    console.error('TVMaze API fetch error:', {
      message: error.message,
      url: url
    });
    throw error;
  }
}

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Database connection with better error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tv-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // 5 second timeout
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('Database name:', mongoose.connection.name);
  console.log('Database host:', mongoose.connection.host);
  console.log('Database port:', mongoose.connection.port);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code
  });
  process.exit(1);
});

// Monitor MongoDB connection
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message });
});

// Routes
app.get('/api/shows/search', async (req, res) => {
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
    return res.status(500).json({ 
      error: 'Failed to search shows',
      details: error.message 
    });
  }
});

app.get('/api/shows/:id', async (req, res, next) => {
  try {
    console.log(`Fetching show with ID: ${req.params.id}`);
    const data = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${req.params.id}`);
    console.log(`Successfully fetched show: ${data.name}`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching show:', error);
    next(error);
  }
});

app.get('/api/shows/:id/episodes', async (req, res, next) => {
  try {
    console.log(`Looking for episodes of show: ${req.params.id}`);
    
    // First check if we already have episodes in our database
    const existingEpisodes = await Episode.find({ showId: req.params.id });
    
    if (existingEpisodes.length > 0) {
      console.log(`Found ${existingEpisodes.length} existing episodes for show ${req.params.id}`);
      return res.json(existingEpisodes);
    }
    
    // If not, fetch from TVMaze and save to our database
    console.log('No existing episodes found, fetching from TVMaze...');
    const tvMazeEpisodes = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${req.params.id}/episodes`);
    console.log(`Fetched ${tvMazeEpisodes.length} episodes from TVMaze for show ${req.params.id}`);
    
    if (!Array.isArray(tvMazeEpisodes)) {
      throw new Error('Invalid response from TVMaze API: episodes data is not an array');
    }
    
    // Transform and save episodes
    const episodes = tvMazeEpisodes.map(ep => ({
      tvMazeId: ep.id.toString(),
      showId: req.params.id,
      season: ep.season,
      number: ep.number,
      name: ep.name,
      airdate: ep.airdate || 'TBA',
      airtime: ep.airtime || 'TBA',
      runtime: ep.runtime || null,
      watched: false
    }));
    
    // Save episodes to database
    try {
      await Episode.insertMany(episodes);
      console.log(`✅ Saved ${episodes.length} episodes to database for show ${req.params.id}`);
    } catch (dbError) {
      console.error('Error saving episodes to database:', dbError);
      throw dbError;
    }
    
    res.json(episodes);
  } catch (error) {
    console.error('Error in /api/shows/:id/episodes:', error);
    next(error);
  }
});

// Database routes
app.post('/api/shows/:id', async (req, res, next) => {
  try {
    const showId = req.params.id;
    const { ignored, searchName } = req.body;
    console.log(`Adding show with ID: ${showId}`);

    // Check if show already exists
    let existingShow = await Show.findOne({ tvMazeId: showId });
    if (existingShow) {
      console.log(`Show ${showId} already exists`);
      return res.json(existingShow);
    }

    // Fetch show details from TVMaze
    const showData = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}`);
    
    // Create new show in database
    const newShow = new Show({
      tvMazeId: showId,
      name: showData.name,
      searchName: searchName || showData.name,
      image: showData.image?.medium || null,
      status: showData.status || 'Unknown',
      ignored: ignored || false
    });

    await newShow.save();
    console.log(`✅ Added new show: ${showData.name} (${showId}) with status: ${showData.status}, ignored: ${ignored}`);

    // Fetch and save episodes
    const episodes = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}/episodes`);
    
    const episodeDocs = episodes.map(ep => ({
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

    await Episode.insertMany(episodeDocs);
    console.log(`✅ Added ${episodeDocs.length} episodes for show ${showId}`);

    res.json(newShow);
  } catch (error) {
    console.error('Error adding show:', error);
    next(error);
  }
});

// Keep the existing POST /api/shows route for backward compatibility
app.post('/api/shows', async (req, res, next) => {
  try {
    const { tvMazeId, name, image, status } = req.body;
    console.log(`Adding/updating show through legacy endpoint: ${name} (${tvMazeId})`);
    
    if (!tvMazeId || !name) {
      throw new Error('Missing required fields: tvMazeId and name are required');
    }
    
    const show = await Show.findOneAndUpdate(
      { tvMazeId },
      { tvMazeId, name, image, status, ignored: false },
      { upsert: true, new: true }
    );
    
    res.json(show);
  } catch (error) {
    console.error('Error in legacy show addition:', error);
    next(error);
  }
});

app.get('/api/shows', async (req, res, next) => {
  try {
    const shows = await Show.find();
    console.log(`Found ${shows.length} shows in database`);
    res.json(shows);
  } catch (error) {
    console.error('Error in GET /api/shows:', error);
    next(error);
  }
});

app.delete('/api/shows/:id', async (req, res, next) => {
  try {
    await Show.findOneAndDelete({ tvMazeId: req.params.id });
    await Episode.deleteMany({ showId: req.params.id });
    console.log(`Deleted show and episodes for show ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /api/shows:', error);
    next(error);
  }
});

app.get('/api/episodes', async (req, res, next) => {
  try {
    const episodes = await Episode.find();
    console.log(`Found ${episodes.length} total episodes in database`);
    res.json(episodes);
  } catch (error) {
    console.error('Error in GET /api/episodes:', error);
    next(error);
  }
});

app.patch('/api/episodes/:id', async (req, res, next) => {
  try {
    const episode = await Episode.findOne({ tvMazeId: req.params.id });
    if (!episode) {
      throw new Error('Episode not found');
    }
    
    episode.watched = req.body.watched;
    await episode.save();
    console.log(`Updated watch status for episode ${req.params.id} to ${req.body.watched}`);
    res.json(episode);
  } catch (error) {
    console.error('Error in PATCH /api/episodes:', error);
    next(error);
  }
});

// PUT endpoint to toggle show ignore status
app.put('/api/shows/:id/ignore', async (req, res) => {
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

    res.json(show);
  } catch (error) {
    console.error('Error toggling show ignore status:', error);
    res.status(500).json({ error: 'Failed to update show status' });
  }
});

// DELETE endpoint to clear all data
app.delete('/api/clear-all', async (req, res) => {
  try {
    console.log('Clearing all data from database...');
    
    // Delete all shows and episodes
    await Show.deleteMany({});
    await Episode.deleteMany({});
    
    console.log('✅ Database cleared successfully');
    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ error: 'Failed to clear database' });
  }
});

// Helper function to update show details
async function updateShowDetails(show, showData) {
  const updates = {};
  if (showData.name !== show.name) updates.name = showData.name;
  if (showData.status !== show.status) updates.status = showData.status;
  if (showData.image?.medium !== show.image) updates.image = showData.image?.medium;
  
  if (Object.keys(updates).length > 0) {
    await Show.updateOne({ tvMazeId: show.tvMazeId }, updates);
    console.log(`Updated show details for ${show.name}`);
  }
}

// Helper function to update episode details
async function updateEpisodeDetails(ep, existingEp) {
  const updates = {};
  if (ep.name !== existingEp.name) updates.name = ep.name;
  if (ep.airdate !== existingEp.airdate) updates.airdate = ep.airdate || 'TBA';
  if (ep.airtime !== existingEp.airtime) updates.airtime = ep.airtime || 'TBA';
  if (ep.runtime !== existingEp.runtime) updates.runtime = ep.runtime || null;
  
  if (Object.keys(updates).length > 0) {
    await Episode.updateOne(
      { tvMazeId: ep.id.toString() },
      { $set: updates }
    );
    console.log(`Updated episode ${ep.name}`);
  }
}

// Helper function to create new episode
async function createNewEpisode(ep, showId) {
  await Episode.create({
    tvMazeId: ep.id.toString(),
    showId: showId,
    season: ep.season,
    number: ep.number,
    name: ep.name,
    airdate: ep.airdate || 'TBA',
    airtime: ep.airtime || 'TBA',
    runtime: ep.runtime || null,
    watched: false
  });
  console.log(`Added new episode ${ep.name}`);
}

// Helper function to process a single show
async function processShow(show) {
  try {
    const showData = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${show.tvMazeId}`);
    await updateShowDetails(show, showData);

    const episodes = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${show.tvMazeId}/episodes`);
    const existingEpisodes = await Episode.find({ showId: show.tvMazeId });
    const existingEpisodeMap = new Map(existingEpisodes.map(ep => [ep.tvMazeId, ep]));

    for (const ep of episodes) {
      const existingEp = existingEpisodeMap.get(ep.id.toString());
      if (existingEp) {
        await updateEpisodeDetails(ep, existingEp);
      } else {
        await createNewEpisode(ep, show.tvMazeId);
      }
    }

    return { success: true, showId: show.tvMazeId };
  } catch (error) {
    console.error(`Error refreshing show ${show.name}:`, error);
    return { 
      success: false, 
      showId: show.tvMazeId, 
      showName: show.name, 
      error: error.message 
    };
  }
}

// PUT endpoint to refresh active shows
app.put('/api/shows/refresh', async (req, res) => {
  try {
    console.log('Refreshing active shows...');
    const activeShows = await Show.find({ status: { $ne: 'Ended' } });
    console.log(`Found ${activeShows.length} active shows to refresh`);

    const results = {
      updated: 0,
      errors: []
    };

    for (const show of activeShows) {
      const result = await processShow(show);
      if (result.success) {
        results.updated++;
      } else {
        results.errors.push({
          showId: result.showId,
          showName: result.showName,
          error: result.error
        });
      }
    }

    console.log('Refresh completed:', results);
    res.json(results);
  } catch (error) {
    console.error('Error in /api/shows/refresh:', error);
    res.status(500).json({ error: 'Failed to refresh shows' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`You can now access the TVmaze API through http://localhost:${PORT}/api/`);
});