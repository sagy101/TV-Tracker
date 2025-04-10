const express = require('express');
const router = express.Router();
const Episode = require('../../models/Episode'); // Adjusted path

// Get all episodes (GET /api/episodes)
router.get('/', async (req, res, next) => {
  try {
    // Consider adding filtering or pagination if the number of episodes grows large
    const episodes = await Episode.find().sort({ showId: 1, season: 1, number: 1 }); // Sort by show, season, number
    console.log(`Found ${episodes.length} total episodes in database`);
    res.json(episodes);
  } catch (error) {
    console.error('Error in GET /api/episodes:', error);
    next(error); // Pass error to the central error handler
  }
});

// Update episode watched status (PATCH /api/episodes/:id)
router.patch('/:id', async (req, res, next) => {
  try {
    const episodeId = req.params.id;
    const { watched } = req.body;

    if (typeof watched !== 'boolean') {
      return res.status(400).json({ error: 'watched field must be a boolean' });
    }

    // Find episode by its own tvMazeId (assuming :id is tvMazeId)
    const episode = await Episode.findOne({ tvMazeId: episodeId });

    if (!episode) {
       // It might be better to search by _id if that's passed from the frontend
       // const episode = await Episode.findById(episodeId);
       // if (!episode) {
          console.log(`Episode not found with TVMaze ID: ${episodeId}`);
          return res.status(404).json({ error: 'Episode not found' });
       // }
    }

    // Only save if the watched status actually changes
    if (episode.watched !== watched) {
        episode.watched = watched;
        await episode.save();
        console.log(`Updated watch status for episode ${episode.name} (${episodeId}) to ${watched}`);
    } else {
        console.log(`Watch status for episode ${episode.name} (${episodeId}) is already ${watched}`);
    }

    res.json(episode); // Return the updated (or unchanged) episode
  } catch (error) {
    console.error('Error in PATCH /api/episodes/:id:', error);
    next(error); // Pass error to the central error handler
  }
});

module.exports = router; 