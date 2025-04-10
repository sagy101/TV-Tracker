const express = require('express');
const router = express.Router();
const { fetchFromTVMaze } = require('../services/tvmaze');
const Show = require('../models/Show');
const Episode = require('../models/Episode');

// Search shows
router.get('/search', async (req, res) => {
  const abortController = new AbortController();
  const signal = abortController.signal;
  let isCancelled = false;
  
  req.on('close', () => {
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

    const searchUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
    const results = await fetchFromTVMaze(searchUrl, { signal });
    
    if (!Array.isArray(results)) {
      throw new Error('Invalid response from TVMaze API');
    }
    
    console.log(`Found ${results.length} results for "${query}"`);
    return res.json(results);
  } catch (error) {
    if (error.name === 'AbortError' && isCancelled) {
      return res.status(499).json({ error: 'Search cancelled by client' });
    }
    console.error('Error searching shows:', error);
    return res.status(500).json({ 
      error: 'Failed to search shows',
      details: error.message 
    });
  }
});

// Get all shows
router.get('/', async (req, res) => {
  try {
    const shows = await Show.find();
    console.log(`Found ${shows.length} shows in database`);
    res.json(shows);
  } catch (error) {
    console.error('Error in GET /shows:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single show
router.get('/:id', async (req, res) => {
  try {
    const data = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${req.params.id}`);
    console.log(`Successfully fetched show: ${data.name}`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching show:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add show
router.post('/:id', async (req, res) => {
  try {
    const showId = req.params.id;
    const { ignored, searchName } = req.body;

    let existingShow = await Show.findOne({ tvMazeId: showId });
    if (existingShow) {
      return res.json({ show: existingShow, skipped: true });
    }

    const showData = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${showId}`);
    const newShow = new Show({
      tvMazeId: showId,
      name: showData.name,
      searchName: searchName || showData.name,
      image: showData.image?.medium || null,
      status: showData.status || 'Unknown',
      ignored: ignored || false
    });

    await newShow.save();

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
    res.json({ show: newShow, skipped: false });
  } catch (error) {
    console.error('Error adding show:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete show
router.delete('/:id', async (req, res) => {
  try {
    await Show.findOneAndDelete({ tvMazeId: req.params.id });
    await Episode.deleteMany({ showId: req.params.id });
    console.log(`Deleted show and episodes for show ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /shows:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle show ignore status
router.put('/:id/ignore', async (req, res) => {
  try {
    const show = await Show.findOne({ tvMazeId: req.params.id });
    if (!show) {
      return res.status(404).json({ error: 'Show not found' });
    }

    show.ignored = !show.ignored;
    await show.save();
    res.json(show);
  } catch (error) {
    console.error('Error toggling show ignore status:', error);
    res.status(500).json({ error: 'Failed to update show status' });
  }
});

module.exports = router; 