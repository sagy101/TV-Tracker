const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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

module.exports = fetchFromTVMaze; 