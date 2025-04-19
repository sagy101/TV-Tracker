// Import any modules needed for scheduled tasks
const cron = require('node-cron');
const fetch = require('node-fetch');

// Inside the server setup, after routes are configured but before the app.listen call,
// add the scheduled task for updating show popularity

// Schedule daily update of show popularity at 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('Running scheduled show popularity update...');
  try {
    const response = await fetch('http://localhost:3001/api/shows/update-popularity', {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update popularity: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Scheduled show popularity update completed:', result);
  } catch (error) {
    console.error('Error in scheduled show popularity update:', error);
  }
}); 