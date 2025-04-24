import React, { useState, useRef, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { X, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import * as api from '../api'; // Import centralized API functions


const SearchDrawer = ({ isOpen, onSelectShow, onClose, existingShows = [] }) => {
  const { token } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false); // Add loading state for search
  const searchTimeoutRef = useRef(null);

  // Create a Set of existing show IDs for quick lookup
  const existingShowIds = new Set(existingShows.map(show => show.tvMazeId?.toString()));

  // Check if a show is already in the user's collection
  const isShowInCollection = (showId) => {
    return existingShowIds.has(showId?.toString());
  };

  // Use api.searchTvMaze for searching
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchInput(query);
    setError('');
    setLoadingSearch(true); // Start loading indicator

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 1) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          // Use the imported API function
          const data = await api.searchTvMaze(query, token);
          
          // Handle response format (assuming it might be single object for ID or array for name search)
          if (data && data.id && !Array.isArray(data)) {
             // Wrap single object result in array for consistent handling
             setSearchResults([{ show: data }]);
          } else if (Array.isArray(data)) {
             setSearchResults(data);
          } else {
             // Handle unexpected format or empty results
             setSearchResults([]);
          }
        } catch (err) {
          console.error("Search Error:", err); // Log the actual error
          // Check for specific error messages if needed
          if (err.message && err.message.includes('Failed to fetch')) {
             setError('Network error searching for shows. Please check connection.');
          } else {
            setError('Error searching for shows. Please try again.');
          }
          setSearchResults([]);
        } finally {
            setLoadingSearch(false); // Stop loading indicator
        }
      }, 300);
    } else {
      setSearchResults([]);
      setLoadingSearch(false); // Stop loading if query is cleared
    }
  };

  // Filter results by year if yearFilter is set
  const filteredResults = searchResults.filter(({ show }) => {
    if (!yearFilter) return true;
    const premiereYear = show?.premiered?.split('-')[0];
    return premiereYear === yearFilter;
  });

  // Simplify handleSubmit - just trigger onSelectShow if it's an ID
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check if input looks like an ID
    if (/^\d+$/.test(searchInput)) {
      const showId = searchInput; // The ID itself
      // Check if already added locally to prevent unnecessary action
      if (isShowInCollection(showId)) {
         setError('This show is already in your collection (or recently added).');
         return;
      }
      // Pass the ID to the parent handler
      onSelectShow(showId); 
      // Don't reset/close here, let the parent handle it after adding
    } else {
       // If not an ID, maybe trigger search immediately or show message?
       setError('Please select a show from the search results below, or enter a valid TVMaze ID.')
    }
  };

  // Simplify handleSelectResult - just call onSelectShow
  const handleSelectResult = (show) => {
    // Pass the selected show object (or just its ID) to the parent
    // App.js's handleAddShow expects the ID
    onSelectShow(show.id); 
    // Resetting state here might be premature if add fails in parent
    // Let parent handle closing/resetting
    // setSearchInput('');
    // setYearFilter('');
    // setSearchResults([]);
    // onClose();
  };

  // Get unique years from search results
  const availableYears = [...new Set(searchResults
    .map(({ show }) => show?.premiered?.split('-')[0])
    .filter(year => year)
  )].sort().reverse();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="pointer-events-auto w-[32rem]">
            <div className="flex h-full flex-col bg-white shadow-xl">
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Add Show</h2>
                  <button
                    type="button"
                    className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-8">
                  <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={searchInput}
                        onChange={handleInputChange}
                        placeholder="Enter TVMaze ID or search by name"
                        className="flex-1 border rounded px-3 py-1"
                        autoFocus
                      />
                      {loadingSearch && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>}
                    </div>

                    {searchResults.length > 0 && (
                      <div className="flex gap-2 items-center">
                        <label htmlFor="year-filter" className="text-sm text-gray-600">
                          Filter by year:
                        </label>
                        <select
                          id="year-filter"
                          value={yearFilter}
                          onChange={(e) => setYearFilter(e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="">All years</option>
                          {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </form>

                  {searchInput.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      Select a show from the results below to add it
                    </p>
                  )}

                  {error && (
                    <div className="mt-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {filteredResults.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Select a show to add:
                        {yearFilter && <span className="text-gray-500 ml-2">({filteredResults.length} shows from {yearFilter})</span>}
                      </h3>
                      <div className="space-y-2">
                        {filteredResults.slice(0, 8).map(({ show }) => {
                          const alreadyAdded = isShowInCollection(show.id);
                          
                          return (
                            <button
                              key={show.id}
                              onClick={() => !alreadyAdded && handleSelectResult(show)}
                              className={`w-full text-left px-4 py-2 border rounded-md ${
                                alreadyAdded 
                                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                                  : 'border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                              }`}
                              disabled={alreadyAdded}
                            >
                              <div className="flex justify-between items-start">
                                <div className="font-medium">{show.name}</div>
                                <div className="flex items-center gap-2">
                                  {show.status && (
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      show.status === 'Running' ? 'bg-green-100 text-green-800' :
                                      show.status === 'Ended' ? 'bg-gray-100 text-gray-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {show.status}
                                    </span>
                                  )}
                                  {alreadyAdded && (
                                    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Added
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 space-y-1">
                                <div className="flex items-center gap-2">
                                  {show.network?.name && (
                                    <span>
                                      {show.network.name}
                                      {show.network.country?.code && ` (${show.network.country.code})`}
                                    </span>
                                  )}
                                  {show.premiered && (
                                    <span>• {show.premiered.split('-')[0]}</span>
                                  )}
                                  {show.language && (
                                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                                      {show.language}
                                    </span>
                                  )}
                                </div>
                                {show.genres && show.genres.length > 0 && (
                                  <div className="text-xs">
                                    {show.genres.join(' • ')}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SearchDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSelectShow: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  existingShows: PropTypes.array
};

export default SearchDrawer; 