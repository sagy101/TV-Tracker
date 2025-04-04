import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { Home, List, Trash2, Plus } from 'lucide-react';
import Episodes from './pages/Episodes';
import Shows from './pages/Shows';
import SearchDrawer from './components/SearchDrawer';

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

function App() {
  const [shows, setShows] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [newShowId, setNewShowId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUnwatchedOnly, setShowUnwatchedOnly] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Fetch all shows and their episodes from the database
  const fetchAllShows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/shows`);
      const showsData = await handleApiResponse(response);
      setShows(showsData);
      
      // Fetch episodes for all shows
      const episodesPromises = showsData.map(show => 
        fetch(`${API_BASE_URL}/shows/${show.tvMazeId}/episodes`)
          .then(handleApiResponse)
      );
      
      const allEpisodesData = await Promise.all(episodesPromises);
      const processedEpisodes = allEpisodesData.flat().map(ep => ({
        id: ep.tvMazeId,
        showId: ep.showId,
        showName: showsData.find(s => s.tvMazeId === ep.showId)?.name,
        season: ep.season,
        number: ep.number,
        name: ep.name,
        airdate: ep.airdate,
        airtime: ep.airtime,
        runtime: ep.runtime,
        watched: ep.watched
      }));
      
      setEpisodes(processedEpisodes);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const fetchEpisodesForShow = useCallback(async (showId) => {
    try {
      setLoading(true);
      setError(null);
      
      const showResponse = await fetch(`${API_BASE_URL}/shows/${showId}`);
      const showData = await handleApiResponse(showResponse);
      
      // Add show to database
      const addShowResponse = await fetch(`${API_BASE_URL}/shows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tvMazeId: showId,
          name: showData.name,
          image: showData.image?.medium || null,
          status: showData.status || 'Unknown'
        }),
      });
      
      await handleApiResponse(addShowResponse);
      
      const epResponse = await fetch(`${API_BASE_URL}/shows/${showId}/episodes`);
      const epData = await handleApiResponse(epResponse);
      
      // Update state with new show
      setShows(prevShows => {
        if (!prevShows.some(s => s.tvMazeId === showId)) {
          return [...prevShows, {
            tvMazeId: showId,
            name: showData.name,
            image: showData.image?.medium || null
          }];
        }
        return prevShows;
      });
      
      // Update episodes state
      const processedEpisodes = epData.map(ep => ({
        id: ep.tvMazeId,
        showId: showId,
        showName: showData.name,
        season: ep.season,
        number: ep.number,
        name: ep.name,
        airdate: ep.airdate,
        airtime: ep.airtime,
        runtime: ep.runtime,
        watched: ep.watched
      }));
      
      setEpisodes(prevEpisodes => {
        const filteredPrevEpisodes = prevEpisodes.filter(ep => ep.showId !== showId);
        return [...filteredPrevEpisodes, ...processedEpisodes];
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching show:", err);
      setError(err.message);
      setLoading(false);
    }
  }, []);
  
  // Load saved data on startup
  useEffect(() => {
    fetchAllShows();
  }, [fetchAllShows]);
  
  const handleAddShow = async (showId) => {
    try {
      // Extract numeric ID if an object was passed
      const id = typeof showId === 'object' ? showId.id : showId;
      
      // Use our proxy server to fetch show details
      const response = await fetch(`${API_BASE_URL}/shows/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to add show');
      }

      await fetchAllShows();
    } catch (error) {
      console.error('Error adding show:', error);
      throw new Error(error.message);
    }
  };

  const handleDeleteShow = async (showId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shows/${showId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete show');
      }

      // Fetch updated shows and episodes
      await fetchAllShows();
    } catch (error) {
      console.error('Error deleting show:', error);
    }
  };

  const handleToggleIgnore = async (showId) => {
    try {
      console.log('Toggling ignore status for show:', showId);
      const response = await fetch(`${API_BASE_URL}/shows/${showId}/ignore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const updatedShow = await handleApiResponse(response);
      console.log('Show updated:', updatedShow);
      
      setShows(shows.map(show => 
        show.tvMazeId === showId.toString()
          ? { ...show, ignored: updatedShow.ignored }
          : show
      ));
    } catch (error) {
      console.error('Error updating show status:', error);
    }
  };

  const handleToggleWatched = async (episodeId) => {
    try {
      const episode = episodes.find(ep => ep.id === episodeId);
      const newWatchedStatus = !episode.watched;
      
      const response = await fetch(`${API_BASE_URL}/episodes/${episodeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ watched: newWatchedStatus }),
      });
      
      await handleApiResponse(response);
      
      setEpisodes(episodes.map(episode => 
        episode.id === episodeId 
          ? { ...episode, watched: newWatchedStatus } 
          : episode
      ));
    } catch (err) {
      console.error("Error updating episode:", err);
      setError(err.message);
    }
  };

  const isReleased = (episode) => {
    const today = new Date();
    const epDate = new Date(episode.airdate);
    return epDate < today;
  };

  const handleClearAllData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clear-all`, {
        method: 'DELETE'
      });

      const result = await handleApiResponse(response);
      console.log('Clear database result:', result);

      // Clear local state
      setShows([]);
      setEpisodes([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing data:', error);
      // Keep the dialog open if there's an error
      // You might want to show an error message to the user here
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  <Home className="h-5 w-5 mr-2" />
                  Episodes
                </NavLink>
                <NavLink
                  to="/shows"
                  className={({ isActive }) =>
                    `inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                  }
                >
                  Shows
                </NavLink>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Show
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Search Drawer */}
        <SearchDrawer
          isOpen={isDrawerOpen}
          onSelectShow={handleAddShow}
          onClose={() => setIsDrawerOpen(false)}
        />

        {/* Confirmation Dialog */}
        {showClearConfirm && (
          <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Clear All Data
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to clear all data? This action cannot be undone and will remove all your shows and episodes.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleClearAllData}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Clear All Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="py-10">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Routes>
              <Route
                path="/"
                element={
                  <Episodes
                    episodes={episodes}
                    shows={shows}
                    loading={loading}
                    error={error}
                    showUnwatchedOnly={showUnwatchedOnly}
                    onAddShow={handleAddShow}
                    onNewShowIdChange={setNewShowId}
                    onToggleUnwatched={() => setShowUnwatchedOnly(!showUnwatchedOnly)}
                    onToggleWatched={handleToggleWatched}
                    isReleased={isReleased}
                  />
                }
              />
              <Route
                path="/shows"
                element={
                  <Shows
                    shows={shows}
                    episodes={episodes}
                    onAddShow={handleAddShow}
                    onDeleteShow={handleDeleteShow}
                    onToggleIgnore={handleToggleIgnore}
                  />
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;