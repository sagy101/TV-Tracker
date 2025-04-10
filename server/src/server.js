require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const showRoutes = require('./routes/shows');
const episodeRoutes = require('./routes/episodes');

const app = express();
const PORT = 3001; // Hardcoding to 3001 to match the original proxy setup

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message });
});

// Routes
app.use('/api/shows', showRoutes);
app.use('/api/episodes', episodeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Clear all data endpoint
app.delete('/api/clear-all', async (req, res) => {
  try {
    console.log('Clearing all data from database...');
    const Show = require('./models/Show');
    const Episode = require('./models/Episode');
    
    await Show.deleteMany({});
    await Episode.deleteMany({});
    
    console.log('✅ Database cleared successfully');
    res.json({ message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ error: 'Failed to clear database' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`You can now access the TVmaze API through http://localhost:${PORT}/api/`);
}); 