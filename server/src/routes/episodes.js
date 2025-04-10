const express = require('express');
const router = express.Router();
const { fetchFromTVMaze } = require('../services/tvmaze');
const Episode = require('../models/Episode');

// Get all episodes
router.get('/', async (req, res) => {
  try {
    const episodes = await Episode.find();
    console.log(`Found ${episodes.length} total episodes in database`);
    res.json(episodes);
  } catch (error) {
    console.error('Error in GET /episodes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get episodes for a show
router.get('/show/:id', async (req, res) => {
  try {
    const existingEpisodes = await Episode.find({ showId: req.params.id });
    
    if (existingEpisodes.length > 0) {
      console.log(`Found ${existingEpisodes.length} existing episodes for show ${req.params.id}`);
      return res.json(existingEpisodes);
    }
    
    const tvMazeEpisodes = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${req.params.id}/episodes`);
    console.log(`Fetched ${tvMazeEpisodes.length} episodes from TVMaze for show ${req.params.id}`);
    
    if (!Array.isArray(tvMazeEpisodes)) {
      throw new Error('Invalid response from TVMaze API: episodes data is not an array');
    }
    
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
    
    await Episode.insertMany(episodes);
    res.json(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update episode watch status
router.patch('/:id', async (req, res) => {
  try {
    const episode = await Episode.findOne({ tvMazeId: req.params.id });
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    episode.watched = req.body.watched;
    await episode.save();
    console.log(`Updated watch status for episode ${req.params.id} to ${req.body.watched}`);
    res.json(episode);
  } catch (error) {
    console.error('Error updating episode:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 