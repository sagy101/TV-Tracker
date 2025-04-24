// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to handle API responses
async function handleApiResponse(response) {
  // Prevent reading the body of a response that has already been consumed
  if (response.bodyUsed && !response.ok) {
    // If body is used but response is not ok, try to clone and read text
    try {
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      let error;
      try {
        const json = JSON.parse(text);
        error = new Error(json.error || 'API request failed');
      } catch {
        error = new Error(`API request failed: ${text}`);
      }
      error.status = response.status;
      throw error;
    } catch (cloneError) {
       // If cloning fails, throw a generic error
       const error = new Error(`API request failed with status ${response.status}`);
       error.status = response.status;
       throw error;
    }
  } else if (response.bodyUsed) {
     // Body already used, but response was ok (e.g., handled by caller)
     // Or maybe it was a HEAD request or similar without a body to parse
     // Return null or an empty object, depending on expected downstream handling
     return null; 
  }

  const text = await response.text(); // Read the response body once

  if (!response.ok) {
    let error;
    try {
      const json = JSON.parse(text);
      error = new Error(json.error || 'API request failed');
    } catch {
      error = new Error(`API request failed: ${text}`);
    }
    error.status = response.status;
    throw error;
  }

  // Handle empty responses gracefully
  if (!text) {
    return null; // Or return {}; depending on expected response format
  }

  try {
    return JSON.parse(text); // Parse the same text we already read
  } catch (error) {
    console.error('Invalid JSON response:', text);
    throw new Error('Invalid JSON response from API');
  }
}

export async function fetchShows(token) {
  const response = await fetch(`${API_BASE_URL}/shows`, {
     headers: {
       'Authorization': `Bearer ${token}` // Add token if needed
     }
  });
  return handleApiResponse(response);
}

export async function fetchEpisodes(token) {
  const response = await fetch(`${API_BASE_URL}/episodes`, {
     headers: {
       'Authorization': `Bearer ${token}`
     }
  });
  return handleApiResponse(response);
}

export async function updateEpisode(episodeId, data, token) {
  const response = await fetch(`${API_BASE_URL}/episodes/${episodeId}`, {
    method: 'PATCH', // Use PATCH for partial updates as per App.js
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function updateShow(showId, data) {
  const response = await fetch(`${API_BASE_URL}/shows/${showId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function clearAllData(token) {
  const response = await fetch(`${API_BASE_URL}/admin/clear-all`, { // Correct endpoint from App.js
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleApiResponse(response);
}

export async function toggleShowIgnore(showId, token) {
  const response = await fetch(`${API_BASE_URL}/shows/${showId}/ignore`, {
    method: 'PUT', // Method from App.js
    headers: {
      'Content-Type': 'application/json', // Added header from App.js
      'Authorization': `Bearer ${token}`
    }
  });
  // No need to manually handle 401 here, handleApiResponse should cover it
  return handleApiResponse(response);
}

export async function fetchEpisodesForShow(showId, token) {
   const response = await fetch(`${API_BASE_URL}/shows/${showId}/episodes`, {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   return handleApiResponse(response);
 }

export async function addShow(showId, showData, token) {
  // This function tells the backend to add a specific show, potentially by its ID.
  // The backend route seems to be POST /shows/:id, not POST /shows.
  const addResponse = await fetch(`${API_BASE_URL}/shows/${showId}`, { // Corrected endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    // The body might or might not be needed depending on backend implementation.
    // Sending details we already fetched seems reasonable if backend creates the record directly.
    // If the backend uses the ID to fetch from TVMaze itself, the body might be ignored or different.
    body: JSON.stringify({
      // Keep sending details fetched in App.js as the backend might expect them
      tvMazeId: showId,
      name: showData.name,
      image: showData.image?.medium || null,
      status: showData.status || 'Unknown'
    }),
  });
  // handleApiResponse will throw on failure
  const addResult = await handleApiResponse(addResponse);

  // If successful (or skipped), fetch episodes (caller should handle state updates)
  // The addResponse might return the added show data, potentially including episodes
  // depending on backend implementation. Assuming it doesn't return episodes for now.
  // Let caller decide if they need to call fetchEpisodesForShow separately.

  return addResult; // Return result which might indicate { skipped: true } or the added show data
}

export async function fetchShowDetails(showId, token) {
   // Fetches details from the backend proxy/TVMaze, not necessarily our DB show record
    const response = await fetch(`${API_BASE_URL}/shows/${showId}`, { // Endpoint might differ if fetching from external API via backend
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleApiResponse(response);
}

export async function deleteShow(showId, token) {
  const response = await fetch(`${API_BASE_URL}/shows/${showId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  // App.js checks response.ok, handleApiResponse does this too
  // Return value might not be needed if caller just needs success/fail status
  return handleApiResponse(response); // Returns null on success (204 No Content usually) or throws error
}

export async function refreshShows(token) {
  const response = await fetch(`${API_BASE_URL}/refresh/shows`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleApiResponse(response); // Returns result object { errors: [...] }
}

// Assuming handleImportShows in App.js calls the backend correctly
// We might need dedicated import endpoints in the backend/API
// For now, let's assume import primarily triggers a refresh/refetch on the frontend
// Or, if there's a backend import endpoint:
/*
export async function importShowsAndEpisodes(data, token) {
  const response = await fetch(`${API_BASE_URL}/import`, { // Hypothetical endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return handleApiResponse(response);
}
*/

// --- Add Search Functionality ---
export async function searchTvMaze(query, token) {
  // Use the correct search endpoint found in SearchDrawer.js
  const response = await fetch(`${API_BASE_URL}/shows/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
  });
  return handleApiResponse(response);
}

// --- Add API functions moved from App.js ---

export async function fetchAllShowsAndEpisodes(token) {
  // 1. Fetch all shows
  const showsResponse = await fetch(`${API_BASE_URL}/shows`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const showsData = await handleApiResponse(showsResponse);
  if (!showsData || !Array.isArray(showsData)) {
      console.error("Invalid shows data received:", showsData);
      throw new Error('Failed to fetch valid show data.');
  }

  // 2. Fetch episodes for all fetched shows
  const allEpisodesData = [];
  for (const show of showsData) {
    try {
      const epResponse = await fetch(`${API_BASE_URL}/shows/${show.tvMazeId}/episodes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // handleApiResponse will throw if epResponse is not ok
      const epData = await handleApiResponse(epResponse);
      if (Array.isArray(epData)) {
        // Add showId and showName to each episode for easier state management
        const episodesWithShowInfo = epData.map(ep => ({
          ...ep,
          showId: show.tvMazeId,
          showName: show.name,
          // Map backend fields (e.g., tvMazeId) to frontend fields (e.g., id) if necessary
          id: ep.tvMazeId, 
        }));
        allEpisodesData.push(...episodesWithShowInfo);
      } else {
        console.warn(`Invalid episode data format for show ${show.name} (ID: ${show.tvMazeId}):`, epData);
      }
    } catch (epError) {
      console.error(`Error fetching or processing episodes for show ${show.name} (ID: ${show.tvMazeId}):`, epError);
      // Decide if you want to throw here or continue fetching for other shows
      // Continuing for now
    }
  }

  return { shows: showsData, episodes: allEpisodesData };
}

// ... rest of api.js ... 