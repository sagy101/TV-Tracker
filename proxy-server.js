// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./server/config/db'); // Path to db config

// Import routes
const showRoutes = require('./server/routes/shows');
const episodeRoutes = require('./server/routes/episodes');
const refreshRoutes = require('./server/routes/refresh'); // Import refresh routes
const adminRoutes = require('./server/routes/admin'); // Import admin routes

// Connect to Database
connectDB();

const app = express();
// Force port 3001 for the backend server to avoid conflict with frontend dev server
const PORT = 3001; 

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust as needed for production)
app.use(express.json()); // Parse JSON bodies

// Define API routes
app.use('/api/shows', showRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/refresh', refreshRoutes); // Use the refresh routes
app.use('/api/admin', adminRoutes); // Use the admin routes

// Health check endpoint (kept in main server file)
app.get('/api/health', (req, res) => {
  // Check mongoose connection state directly
  const mongoose = require('mongoose'); // Keep mongoose require here for this specific check
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handling Middleware
// This should be defined AFTER all other app.use() and routes
app.use((err, req, res, next) => {
  console.error('Server error encountered:', err); // Log the full error

  // Check if the error is a known type (e.g., validation error) or use a generic message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Avoid sending detailed stack traces in production environment
  const errorResponse = {
      error: message
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
      errorResponse.stack = err.stack; // Include stack trace in development
  }

  res.status(statusCode).json(errorResponse);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
});