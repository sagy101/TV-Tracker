const Show = require('../../models/Show'); // Adjusted path
const Episode = require('../../models/Episode'); // Adjusted path
const fetchFromTVMaze = require('./tvmaze'); // Assuming tvmaze.js is in the same utils folder
const UserShowSettings = require('../../models/UserShowSettings'); // Adjusted path

// Helper function to update show details
async function updateShowDetails(show, showData) {
  const updates = {};
  if (showData.name !== show.name) updates.name = showData.name;
  if (showData.status !== show.status) updates.status = showData.status;
  // Ensure image comparison handles null/undefined correctly
  const newImage = showData.image?.medium || null;
  if (newImage !== show.image) updates.image = newImage;

  if (Object.keys(updates).length > 0) {
    await Show.updateOne({ tvMazeId: show.tvMazeId }, { $set: updates });
    console.log(`Updated show details for ${show.name} (${show.tvMazeId})`);
    return true; // Indicate that an update occurred
  }
  return false;
}

// Helper function to update episode details
async function updateEpisodeDetails(ep, existingEp) {
  const updates = {};
  // Normalize 'TBA' and null/undefined for comparison and storage
  const airdate = ep.airdate || 'TBA';
  const airtime = ep.airtime || 'TBA';
  const runtime = ep.runtime || null;

  if (ep.name !== existingEp.name) updates.name = ep.name;
  if (airdate !== existingEp.airdate) updates.airdate = airdate;
  if (airtime !== existingEp.airtime) updates.airtime = airtime;
  if (runtime !== existingEp.runtime) updates.runtime = runtime;

  if (Object.keys(updates).length > 0) {
    await Episode.updateOne(
      { tvMazeId: ep.id.toString() },
      { $set: updates }
    );
    console.log(`Updated episode S${ep.season}E${ep.number} - ${ep.name} (${ep.id})`);
    return true; // Indicate update
  }
  return false;
}

// Helper function to create new episode
async function createNewEpisode(ep, showId) {
  try {
      await Episode.create({
        tvMazeId: ep.id.toString(),
        showId: showId,
        season: ep.season,
        number: ep.number,
        name: ep.name,
        airdate: ep.airdate || 'TBA',
        airtime: ep.airtime || 'TBA',
        runtime: ep.runtime || null,
        watched: false // New episodes are unwatched by default
      });
      console.log(`Added new episode S${ep.season}E${ep.number} - ${ep.name} (${ep.id}) for show ${showId}`);
      return true; // Indicate creation
  } catch (error) {
      if (error.code === 11000) { // Handle potential duplicate key error gracefully
          console.log(`Attempted to add duplicate episode ${ep.id} for show ${showId}. Skipping.`);
      } else {
          console.error(`Error creating new episode ${ep.name} (${ep.id}) for show ${showId}:`, error);
      }
      return false; // Indicate failure or skip
  }
}

// Helper function to process a single show for refresh
async function processShow(show) {
  let showUpdated = false;
  let episodesUpdated = 0;
  let episodesAdded = 0;

  try {
    console.log(`Refreshing show: ${show.name} (${show.tvMazeId})`);
    const showData = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${show.tvMazeId}`);
    showUpdated = await updateShowDetails(show, showData);

    const tvMazeEpisodes = await fetchFromTVMaze(`https://api.tvmaze.com/shows/${show.tvMazeId}/episodes`);
    if (!Array.isArray(tvMazeEpisodes)) {
         console.warn(`Invalid episode data received from TVMaze for show ${show.tvMazeId}. Skipping episode update.`);
         // Decide if this should count as an error for the show refresh
         // return { success: false, ... } might be appropriate if episodes are critical
         throw new Error('Invalid episode data format');
    }

    const existingEpisodes = await Episode.find({ showId: show.tvMazeId });
    const existingEpisodeMap = new Map(existingEpisodes.map(ep => [ep.tvMazeId, ep]));

    for (const ep of tvMazeEpisodes) {
      const epIdStr = ep.id.toString();
      const existingEp = existingEpisodeMap.get(epIdStr);
      if (existingEp) {
        // Update existing episode if necessary
        if (await updateEpisodeDetails(ep, existingEp)) {
            episodesUpdated++;
        }
        // Remove from map to track episodes no longer present in API (though we don't delete them here)
        existingEpisodeMap.delete(epIdStr);
      } else {
        // Add new episode
        if (await createNewEpisode(ep, show.tvMazeId)) {
            episodesAdded++;
        }
      }
    }

     // Log if any episodes were removed from TVMaze (optional)
     if (existingEpisodeMap.size > 0) {
         console.log(`Note: ${existingEpisodeMap.size} episodes previously tracked for show ${show.tvMazeId} were not found in the latest API fetch.`);
         // Decide if action is needed - e.g., mark them as potentially removed, or just log.
     }

    console.log(`Refresh details for ${show.name}: Show details updated: ${showUpdated}, Episodes updated: ${episodesUpdated}, Episodes added: ${episodesAdded}`);
    return { success: true, showId: show.tvMazeId, showUpdated, episodesAdded, episodesUpdated };

  } catch (error) {
    console.error(`Error refreshing show ${show.name} (${show.tvMazeId}):`, error);
    // Return detailed error information
    return {
      success: false,
      showId: show.tvMazeId,
      showName: show.name,
      error: error.message
    };
  }
}

// Function to refresh multiple active shows
async function refreshActiveShows() {
  console.log('Starting refresh of active (non-Ended) shows...');
  
  // Get shows not marked as 'Ended'
  const activeShows = await Show.find({ status: { $ne: 'Ended' } });
  console.log(`Found ${activeShows.length} active shows to refresh`);
  
  // Get shows that are marked as ignored by any user
  const ignoredSettings = await UserShowSettings.find({
    ignored: true,
    showTvMazeId: { $in: activeShows.map(show => show.tvMazeId) }
  });
  
  // Create a map of ignored showIds
  const ignoredShowIds = new Set();
  ignoredSettings.forEach(setting => {
    ignoredShowIds.add(setting.showTvMazeId);
  });
  
  // Check for legacy ignored status in Show model (for backward compatibility)
  const legacyIgnoredShows = await Show.find({ 
    status: { $ne: 'Ended' }, 
    ignored: true 
  });
  
  legacyIgnoredShows.forEach(show => {
    ignoredShowIds.add(show.tvMazeId);
  });
  
  // Filter out shows that are ignored
  const nonIgnoredShows = activeShows.filter(show => 
    !ignoredShowIds.has(show.tvMazeId)
  );
  
  console.log(`Found ${nonIgnoredShows.length} active and non-ignored shows to refresh`);

  const results = {
    processed: 0,
    showsUpdated: 0,
    episodesAdded: 0,
    episodesUpdated: 0,
    errors: []
  };

  // Process shows sequentially or in parallel (consider API rate limits)
  // Sequential processing:
  for (const show of nonIgnoredShows) {
      const result = await processShow(show);
      results.processed++;
      if (result.success) {
          if (result.showUpdated) results.showsUpdated++;
          results.episodesAdded += result.episodesAdded;
          results.episodesUpdated += result.episodesUpdated;
      } else {
          results.errors.push({
              showId: result.showId,
              showName: result.showName,
              error: result.error
          });
      }
  }

  // Parallel processing (example with Promise.allSettled):
  /*
  const refreshPromises = nonIgnoredShows.map(show => processShow(show));
  const settledResults = await Promise.allSettled(refreshPromises);

  settledResults.forEach(settledResult => {
      results.processed++;
      if (settledResult.status === 'fulfilled') {
          const result = settledResult.value;
          if (result.success) {
               if (result.showUpdated) results.showsUpdated++;
               results.episodesAdded += result.episodesAdded;
               results.episodesUpdated += result.episodesUpdated;
          } else {
              results.errors.push({ showId: result.showId, showName: result.showName, error: result.error });
          }
      } else {
          // Handle rejected promises (errors not caught within processShow)
          console.error('Unhandled error during show refresh:', settledResult.reason);
          // Attempt to find showId/Name if possible from context, otherwise log generic error
          results.errors.push({ showId: 'unknown', showName: 'unknown', error: settledResult.reason?.message || 'Unhandled exception' });
      }
  });
  */

  console.log('Refresh completed.', `Processed: ${results.processed}, Shows Updated: ${results.showsUpdated}, Episodes Added: ${results.episodesAdded}, Episodes Updated: ${results.episodesUpdated}, Errors: ${results.errors.length}`);
  if (results.errors.length > 0) {
      console.warn('Errors occurred during refresh:', results.errors);
  }
  return results;
}

module.exports = {
    updateShowDetails,
    updateEpisodeDetails,
    createNewEpisode,
    processShow,
    refreshActiveShows
}; 