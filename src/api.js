const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to handle API responses
async function handleApiResponse(response) {
  if (!response.ok) {
    const text = await response.text();
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
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Invalid JSON response:', text);
    throw new Error('Invalid JSON response from API');
  }
}

export async function fetchShows() {
  const response = await fetch(`${API_BASE_URL}/shows`);
  return handleApiResponse(response);
}

export async function fetchEpisodes() {
  const response = await fetch(`${API_BASE_URL}/episodes`);
  return handleApiResponse(response);
}

export async function updateEpisode(episodeId, data) {
  const response = await fetch(`${API_BASE_URL}/episodes/${episodeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
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

export async function clearAllData() {
  const response = await fetch(`${API_BASE_URL}/clear`, {
    method: 'POST',
  });
  return handleApiResponse(response);
}

export async function toggleShowIgnore(showId) {
  try {
    // Get authentication token from localStorage
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication required. Please log in to toggle show status.');
    }
    
    const response = await fetch(`${API_BASE_URL}/shows/${showId}/ignore`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in to toggle show status.');
    }
    
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error toggling show ignore status:', error);
    throw error;
  }
} 