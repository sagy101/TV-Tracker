import React, { useState, useEffect, useCallback, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Home, List, Trash2, Plus, RefreshCw, Tv, ArrowLeftRight, Play, Circle, CheckCircle, ArrowUpDown, Infinity, Download, LogIn, LogOut, LayoutDashboard, Menu, X as IconX } from 'lucide-react';
import Episodes from './pages/Episodes';
import Shows from './pages/Shows';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import UserHomePage from './pages/UserHomePage';
import ShowDetail from './pages/ShowDetail';
import SearchDrawer from './components/SearchDrawer';
import ImportDialog from './components/ImportDialog';
import ActionsMenu from './components/ActionsMenu';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
// Import API functions
import * as api from './api'; // Assuming api.js is in the same directory

function App() {
  const location = useLocation();
  const [shows, setShows] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUnwatchedOnly, setShowUnwatchedOnly] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, isLoading: isAuthLoading, user, token } = useContext(AuthContext);
  
  // Fetch all shows and their episodes using the API function
  const fetchAllData = useCallback(async () => { // Renamed from fetchAllShows for clarity
    if (!isAuthenticated || !token) {
      setShows([]);
      setEpisodes([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const { shows: showsData, episodes: episodesData } = await api.fetchAllShowsAndEpisodes(token);

      // Process episodes (ensure correct structure for frontend state)
      // The api function now adds showId, showName, id
      // Ensure other fields match what the Episodes component expects
      const processedEpisodes = episodesData.map(ep => ({
        id: ep.id, // Already mapped in api.js
        showId: ep.showId, // Already added in api.js
        showName: ep.showName, // Already added in api.js
        season: ep.season,
        number: ep.number,
        name: ep.name,
        airdate: ep.airdate,
        airtime: ep.airtime,
        runtime: ep.runtime,
        watched: ep.watched,
      }));

      setShows(showsData);
      setEpisodes(processedEpisodes);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || 'Failed to load data. Please try again.'); // User-friendly error
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Load saved data on startup or when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Authenticated, fetching initial data...");
      fetchAllData(); // Use the renamed fetch function
    } else {
      console.log("Not authenticated, clearing data...");
      setShows([]);
      setEpisodes([]);
    }
  }, [isAuthenticated, fetchAllData]); // Use fetchAllData here
  
  // Use API functions for adding a show and its episodes
  const handleAddShow = async (showIdFromSearch) => {
    if (!isAuthenticated || !token) return;

    setLoading(true); // Indicate loading state
    setError(null);
    try {
      // 1. Fetch show details (using the search result ID)
      // Ensure showIdFromSearch is the actual ID (e.g., tvMazeId)
      const id = typeof showIdFromSearch === 'object' ? showIdFromSearch.id : showIdFromSearch;
      const showDetails = await api.fetchShowDetails(id, token);

      // 2. Add the show to the database
      const addResult = await api.addShow(id, showDetails, token);

      if (!addResult || addResult.skipped) {
         console.log(`Show ${id} was already in the database or skipped.`);
         // Optionally fetch all data again if needed, or just close drawer
         setIsDrawerOpen(false); // Close drawer after adding/skipping
         setLoading(false);
         // Maybe show a notification that it was already added?
         // Consider refetching if the show existed but might have new episodes
         await fetchAllData(); // Refresh data in case of updates or if skipped means "check for updates"
         return;
      }

      // 3. Show was added, now fetch its episodes
      const newEpisodesData = await api.fetchEpisodesForShow(id, token);

      // 4. Update state
      // Add the new show (use details fetched earlier)
      setShows(prevShows => [...prevShows, {
          tvMazeId: id, // Use the correct ID
          name: showDetails.name,
          image: showDetails.image?.medium || null,
          // Include other relevant fields from showDetails or addResult if needed
          ignored: addResult.show?.ignored ?? false // Assuming addResult.show contains the added show data
      }]);

      // Add the new episodes
      if (Array.isArray(newEpisodesData) && newEpisodesData.length > 0) {
         const processedNewEpisodes = newEpisodesData.map(ep => ({
             id: ep.tvMazeId,
             showId: id,
             showName: showDetails.name,
             season: ep.season,
             number: ep.number,
             name: ep.name,
             airdate: ep.airdate,
             airtime: ep.airtime,
             runtime: ep.runtime,
             watched: ep.watched // Assuming default is false from backend
         }));
         setEpisodes(prevEpisodes => [...prevEpisodes, ...processedNewEpisodes]);
      }

      setIsDrawerOpen(false); // Close drawer after successful add

    } catch (error) {
      console.error('Error adding show:', error);
      setError(error.message || 'Failed to add show.'); // Show error to user
      // Don't close drawer on error? Or provide feedback
    } finally {
       setLoading(false); // Ensure loading is turned off
    }
  };

  const handleDeleteShow = async (showId) => {
    if (!isAuthenticated || !token) return;

    // Optimistic update (keep as is)
    const originalShows = [...shows];
    const originalEpisodes = [...episodes];
    setShows(prevShows => prevShows.filter(show => show.tvMazeId !== showId));
    setEpisodes(prevEpisodes => prevEpisodes.filter(episode => episode.showId !== showId));

    try {
      await api.deleteShow(showId, token); // Call API function
      // Success - state already updated
    } catch (error) {
      console.error('Error deleting show:', error);
      setError(error.message || 'Failed to delete show.'); // Show error
      // Restore state on failure
      setShows(originalShows);
      setEpisodes(originalEpisodes);
    }
  };

  // Use API function for toggling ignore status
   const handleToggleIgnore = async (showId) => {
     if (!isAuthenticated || !token) return;
     // Find the current status for potential optimistic update (optional)
     const currentShow = shows.find(show => show.tvMazeId === showId);
     const currentIgnored = currentShow?.ignored;

     // Optimistic Update (optional but good UX)
     setShows(prevShows => prevShows.map(show =>
       show.tvMazeId === showId ? { ...show, ignored: !show.ignored } : show
     ));

     try {
       const updatedShow = await api.toggleShowIgnore(showId, token); // Call API function
       // Update state with confirmed data from server
       setShows(prevShows => prevShows.map(show =>
         show.tvMazeId === showId.toString() // Ensure comparison works (API might return string ID)
           ? { ...show, ignored: updatedShow.ignored }
           : show
       ));
     } catch (error) {
       console.error('Error updating show status:', error);
       setError(error.message || 'Failed to update show status.');
       // Revert optimistic update on error
       setShows(prevShows => prevShows.map(show =>
        show.tvMazeId === showId ? { ...show, ignored: currentIgnored } : show
      ));
     }
   };

  // Use API function for toggling watched status
  const handleToggleWatched = async (episodeId) => {
    if (!isAuthenticated || !token) return;

    const episode = episodes.find(ep => ep.id === episodeId);
    if (!episode) return; // Should not happen usually

    const newWatchedStatus = !episode.watched;

    // Optimistic Update
    const originalEpisodes = episodes.map(ep => ({ ...ep })); // Deep copy for rollback if needed
    setEpisodes(prevEpisodes => prevEpisodes.map(ep =>
      ep.id === episodeId ? { ...ep, watched: newWatchedStatus } : ep
    ));


    try {
      // API function expects data object { watched: boolean }
      await api.updateEpisode(episodeId, { watched: newWatchedStatus }, token);
      // Success - state already updated optimistically.
      // No need to map again unless the API returns the updated episode and we want to use that.
    } catch (err) {
      console.error("Error updating episode:", err);
      setError(err.message || 'Failed to update episode status.');
      // Rollback optimistic update
      setEpisodes(originalEpisodes);
    }
  };

  const isReleased = (episode) => {
    const today = new Date();
    // Ensure airdate is valid before creating Date object
    if (!episode?.airdate) return false;
    try {
       const epDate = new Date(episode.airdate);
       // Check if epDate is valid
       if (isNaN(epDate.getTime())) {
         console.warn("Invalid airdate for episode:", episode);
         return false;
       }
       return epDate < today;
    } catch (e) {
        console.warn("Error parsing airdate:", episode.airdate, e);
        return false; // Treat parse error as not released
    }
  };

  // Use API function for clearing data
  const handleClearAllData = async () => {
    if (!isAuthenticated || !token) return;
    setLoading(true); // Show loading indicator
    setError(null);
    try {
      await api.clearAllData(token); // Call API function
      console.log('Clear database successful via API.');

      // Clear local state
      setShows([]);
      setEpisodes([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing data:', error);
      setError(error.message || 'Failed to clear data.');
    } finally {
       setLoading(false);
    }
  };

  // Use API function for refreshing shows
  const handleRefreshShows = async () => {
    if (!isAuthenticated || !token) return;
    try {
      setIsRefreshing(true);
      setRefreshError(null);

      const result = await api.refreshShows(token); // Call API function
      console.log('Refresh result:', result);

      // Refresh the shows and episodes data by calling fetchAllData
      await fetchAllData();

      // Handle errors reported by the API during refresh
      if (result?.errors && result.errors.length > 0) {
        setRefreshError(`Some shows failed to refresh: ${result.errors.map(e => e.showName || e.showId || 'Unknown').join(', ')}`);
      } else if (result?.message) {
         // Handle potential success message if needed
         console.log("Refresh completed:", result.message);
      }

    } catch (error) {
      console.error('Error refreshing shows:', error);
      setRefreshError(error.message || 'An error occurred during refresh.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refactor import logic - currently just refetches all data
  // If a backend import endpoint exists, call api.importShowsAndEpisodes here instead
  const handleImportShows = async (importedShows, importedEpisodes = []) => {
     if (!isAuthenticated || !token) return;
     setLoading(true);
     setError(null);
     try {
       console.log("Import triggered. Refetching all data.");
       // For now, simply refresh all data after import dialog closes
       // In future, could call a specific backend import endpoint:
       // await api.importShowsAndEpisodes({ shows: importedShows, episodes: importedEpisodes }, token);
       await fetchAllData();
       setShowImportDialog(false); // Close dialog on success
     } catch (err) {
       console.error('Error during import/refresh:', err);
       setError(err.message || 'Failed to process import.');
     } finally {
       setLoading(false);
     }
   };

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Authentication...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center mr-4">
                <img src="/logo2.2.png" alt="TrackTV Logo" className="h-8 w-auto object-contain" />
              </div>
              {isAuthenticated && (
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <NavLink
                    to="/user-home"
                    className={({ isActive }) =>
                      `inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`
                    }
                  >
                    <LayoutDashboard className="h-5 w-5 mr-1" />
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/episodes"
                    className={({ isActive }) =>
                      `inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`
                    }
                  >
                    <List className="h-5 w-5 mr-1" />
                    Episodes
                  </NavLink>
                  <NavLink
                    to="/shows"
                    className={({ isActive }) =>
                      `inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`
                    }
                  >
                    <Tv className="h-5 w-5 mr-1" />
                    Shows
                  </NavLink>
                </div>
              )}
            </div>

            <div className="hidden md:flex md:items-center md:space-x-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-5 w-5 mr-1" />
                    Add Show
                  </button>
                  <ActionsMenu
                    onRefresh={handleRefreshShows}
                    onImport={() => setShowImportDialog(true)}
                    onClear={() => setShowClearConfirm(true)}
                    isRefreshing={isRefreshing}
                  />
                  <button
                    onClick={logout}
                    className="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                location.pathname === '/login' ? (
                  <NavLink
                    to="/home"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Home className="h-5 w-5 mr-1" />
                    Home
                  </NavLink>
                ) : (
                  <NavLink
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <LogIn className="h-5 w-5 mr-1" />
                    Login
                  </NavLink>
                )
              )}
            </div>

            <div className="-mr-2 flex items-center md:hidden">
               {isAuthenticated ? (
                 <button
                   onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                   className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                   aria-expanded={isMobileMenuOpen}
                 >
                   <span className="sr-only">Open main menu</span>
                   {isMobileMenuOpen ? (
                     <IconX className="block h-6 w-6" aria-hidden="true" />
                   ) : (
                     <Menu className="block h-6 w-6" aria-hidden="true" />
                   )}
                 </button>
               ) : (
                  location.pathname === '/login' ? (
                    <NavLink to="/home" className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <Home className="h-5 w-5 mr-1" /> Home
                    </NavLink>
                  ) : (
                    <NavLink to="/login" className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <LogIn className="h-5 w-5 mr-1" /> Login
                    </NavLink>
                  )
               )}
            </div>
          </div>
        </div>

        {isMobileMenuOpen && isAuthenticated && (
          <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg z-30">
             <div className="pt-2 pb-3 space-y-1 px-2">
               <NavLink to="/user-home" className={({ isActive }) => `block rounded-md px-3 py-2 text-base font-medium ${isActive ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}><LayoutDashboard className="inline h-5 w-5 mr-2" />Dashboard</NavLink>
               <NavLink to="/episodes" className={({ isActive }) => `block rounded-md px-3 py-2 text-base font-medium ${isActive ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}><List className="inline h-5 w-5 mr-2" />Episodes</NavLink>
               <NavLink to="/shows" className={({ isActive }) => `block rounded-md px-3 py-2 text-base font-medium ${isActive ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}><Tv className="inline h-5 w-5 mr-2" />Shows</NavLink>
             </div>
             <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-5 mb-3">
                  <button
                      onClick={() => { setIsDrawerOpen(true); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                     <Plus className="h-5 w-5 mr-2" /> Add Show
                  </button>
                </div>
                <div className="px-2 space-y-1">
                   <button onClick={() => { handleRefreshShows(); setIsMobileMenuOpen(false); }} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"><RefreshCw className={`inline h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />Refresh Shows</button>
                   <button onClick={() => { setShowImportDialog(true); setIsMobileMenuOpen(false); }} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"><Download className="inline h-5 w-5 mr-2" />Import</button>
                   <button onClick={() => { setShowClearConfirm(true); setIsMobileMenuOpen(false); }} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-800"><Trash2 className="inline h-5 w-5 mr-2" />Clear All Data</button>
                </div>
                <div className="mt-3 px-2">
                   <button
                     onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                     className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                   >
                     <LogOut className="inline h-5 w-5 mr-2" />
                     Logout
                   </button>
                </div>
             </div>
           </div>
        )}
      </nav>

      {isAuthenticated && (
        <SearchDrawer
          isOpen={isDrawerOpen}
          onSelectShow={handleAddShow} // Pass the refactored handler
          onClose={() => setIsDrawerOpen(false)}
          existingShows={shows}
          // SearchDrawer needs its internal fetch logic updated to use api.searchTvMaze
        />
      )}
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImportShows} // Pass the refactored handler
      />
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

      {refreshError && (
        <div className="fixed top-20 right-4 z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{refreshError}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setRefreshError(null)}>
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </span>
          </div>
        </div>
      )}

      <main className="py-10">
        {loading && !isAuthLoading && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-lg z-50">Loading Data...</div>}
        {error && <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        
        {!isAuthLoading && (
          <div className="min-h-[calc(100vh-12rem)] relative overflow-hidden">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={isAuthenticated ? <Navigate to="/user-home" replace /> : <HomePage />} />
                <Route path="/episodes" element={isAuthenticated ? <Episodes episodes={episodes} onToggleWatched={handleToggleWatched} showUnwatchedOnly={showUnwatchedOnly} setShowUnwatchedOnly={setShowUnwatchedOnly} loading={loading} isReleased={isReleased} shows={shows} /> : <HomePage />} />
                <Route path="/shows" element={isAuthenticated ? <Shows shows={shows} episodes={episodes} onDeleteShow={handleDeleteShow} onToggleIgnore={handleToggleIgnore} onAddShow={handleAddShow} loading={loading} /> : <HomePage />} />
                <Route path="/shows/:id" element={isAuthenticated ? <ShowDetail /> : <Navigate to="/login" replace />} />
                <Route path="/user-home" element={isAuthenticated ? <UserHomePage episodes={episodes} shows={shows} onToggleWatched={handleToggleWatched} isReleased={isReleased} /> : <HomePage />} />
              </Routes>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}

export default AppWrapper;