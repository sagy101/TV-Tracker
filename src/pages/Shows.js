import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Trash2, Plus, Search, EyeOff, Eye } from 'lucide-react';
import SearchDrawer from '../components/SearchDrawer';

function Shows({ shows, episodes, onRemoveShow, onDeleteShow, onAddShow, onToggleIgnore }) {
  const [itemsPerPage, setItemsPerPage] = useState(() => 
    parseInt(localStorage.getItem('shows_itemsPerPage')) || 10
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isSticky, setIsSticky] = useState(false);
  const [shouldStickToPage, setShouldStickToPage] = useState(false);
  const [newShowId, setNewShowId] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showIgnoredFilter, setShowIgnoredFilter] = useState(() => 
    localStorage.getItem('shows_ignoredFilter') || 'all'
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Save items per page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shows_itemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  // Save ignored filter state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shows_ignoredFilter', showIgnoredFilter);
  }, [showIgnoredFilter]);

  const getShowStats = (showId) => {
    const showEpisodes = episodes.filter(ep => ep.showId === showId);
    const watchedEpisodes = showEpisodes.filter(ep => ep.watched);
    const seasons = [...new Set(showEpisodes.map(ep => ep.season))];
    
    // Assuming each episode is ~42 minutes
    const timeWatched = watchedEpisodes.length * 42;
    const hours = Math.floor(timeWatched / 60);
    const minutes = timeWatched % 60;
    
    return {
      seasons: seasons.length,
      totalEpisodes: showEpisodes.length,
      watchedEpisodes: watchedEpisodes.length,
      timeWatched: `${hours}h ${minutes}m`
    };
  };

  const handleInputChange = async (e) => {
    const query = e.target.value;
    setNewShowId(query);
    setError('');

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If it's a number, don't show the drawer
    if (/^\d+$/.test(query)) {
      setSearchResults([]);
      setIsDrawerOpen(false);
      return;
    }

    // For text search, wait 300ms before searching
    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/shows/search?q=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error('Search failed');
          const data = await response.json();
          setSearchResults(data);
          setIsDrawerOpen(true);
        } catch (err) {
          setError('Error searching for shows');
          setSearchResults([]);
          setIsDrawerOpen(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsDrawerOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (/^\d+$/.test(newShowId)) {
      try {
        const response = await fetch(`/api/shows/search?q=${newShowId}`);
        if (!response.ok) throw new Error('Show not found');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          await handleSelectShow(data[0].show);
        } else if (data.id) {
          await handleSelectShow(data);
        } else {
          throw new Error('Show not found');
        }
      } catch (err) {
        setError('Error adding show. Please check the ID and try again.');
      }
    }
  };

  const handleSelectShow = async (show) => {
    try {
      await onAddShow(show.id);
      setNewShowId('');
      setSearchResults([]);
      setIsDrawerOpen(false);
    } catch (err) {
      setError('Error adding show. Please try again.');
    }
  };

  const filteredShows = shows.filter(show => {
    // When filter is on (ignored), show only ignored shows
    // When filter is off (all), show only unignored shows
    return showIgnoredFilter === 'ignored' ? show.ignored : !show.ignored;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredShows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShows = filteredShows.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // Check if pagination controls should be sticky
  useEffect(() => {
    const checkSticky = () => {
      const tableContainer = document.getElementById('shows-table-container');
      const headerContent = document.getElementById('header-content');
      if (!tableContainer || !headerContent) return;

      const tableHeight = tableContainer.getBoundingClientRect().height;
      const headerHeight = headerContent.getBoundingClientRect().height;
      const viewportHeight = window.innerHeight;
      const contentHeight = tableHeight + headerHeight;
      const minTableRows = 5; // Minimum number of table rows to show
      const estimatedRowHeight = 53; // Height of one table row including padding
      const minTableHeight = estimatedRowHeight * minTableRows; // Minimum table height needed

      // If viewport is large enough (can show more than minimum rows × 2)
      if (viewportHeight > minTableHeight * 2) {
        setIsSticky(true);
        setShouldStickToPage(false);
        return;
      }

      // For small viewports, keep at page bottom
      setIsSticky(false);
      setShouldStickToPage(true);
    };

    checkSticky();
    window.addEventListener('resize', checkSticky);
    return () => window.removeEventListener('resize', checkSticky);
  }, [paginatedShows.length]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Header Content */}
        <div id="header-content">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Shows</h1>
            <p className="text-gray-600">Overview of all your tracked TV shows</p>
          </div>

          <SearchDrawer
            isOpen={isDrawerOpen}
            searchResults={searchResults}
            onSelectShow={handleSelectShow}
            onClose={() => setIsDrawerOpen(false)}
          />

          {/* Table Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              {/* Items per page */}
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-3 py-1"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={100}>100 per page</option>
              </select>

              {/* Filter Icons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowIgnoredFilter(showIgnoredFilter === 'ignored' ? 'all' : 'ignored')}
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    showIgnoredFilter === 'ignored'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={showIgnoredFilter === 'ignored' ? "Show Unignored Shows" : "Show Ignored Shows"}
                >
                  {showIgnoredFilter === 'ignored' ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  <span className="text-sm">Ignored Shows</span>
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredShows.length)} of {filteredShows.length} shows
            </div>
          </div>
        </div>

        {/* Shows Table */}
        <div id="shows-table-container" className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Series Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TVMaze ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seasons
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Episodes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Watched
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedShows.map((show) => {
                  const stats = getShowStats(show.tvMazeId);
                  return (
                    <tr key={show.tvMazeId} className={`hover:bg-gray-50 transition-colors ${show.ignored ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {show.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {show.tvMazeId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stats.seasons}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stats.totalEpisodes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-2">{stats.watchedEpisodes}</span>
                          <span className="text-gray-400">
                            ({Math.round((stats.watchedEpisodes / stats.totalEpisodes) * 100)}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {stats.timeWatched}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          show.status === 'Ended' 
                            ? 'bg-gray-100 text-gray-800'
                            : show.status === 'Running' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {show.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => onToggleIgnore(show.tvMazeId)}
                            className={`inline-flex items-center p-2 rounded-full ${
                              show.ignored 
                                ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            title={show.ignored ? 'Show in Episodes' : 'Hide from Episodes'}
                          >
                            {show.ignored ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={() => onDeleteShow(show.tvMazeId)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Delete Show"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 ${
            isSticky 
              ? 'fixed bottom-0 left-0 right-0 border-t border-gray-200 shadow-md z-10' 
              : shouldStickToPage 
                ? 'relative border-t border-gray-200 mt-4'
                : ''
          }`}>
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Previous
              </button>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Page</span>
                  <select
                    value={currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="border rounded px-3 py-1 bg-white w-16"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <option key={page} value={page} className="py-1">
                        {page}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-600">of {totalPages}</span>
                </div>
              )}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shows; 