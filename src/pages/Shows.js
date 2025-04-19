import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Clock, Trash2, EyeOff, Eye, CheckCircle, Circle, ChevronUp, ChevronDown, Tv } from 'lucide-react';
import SearchDrawer from '../components/SearchDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import PaginationControls from '../components/PaginationControls';
import { Link } from 'react-router-dom';

function Shows({ shows = [], episodes = [], onDeleteShow, onAddShow, onToggleIgnore }) {
  const [itemsPerPage, setItemsPerPage] = useState(() => 
    parseInt(localStorage.getItem('shows_itemsPerPage')) || 10
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isSticky, setIsSticky] = useState(false);
  const [shouldStickToPage, setShouldStickToPage] = useState(false);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [newShowId, setNewShowId] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showIgnoredFilter, setShowIgnoredFilter] = useState(() => 
    localStorage.getItem('shows_ignoredFilter') || 'all'
  );
  const [showWatchedFilter, setShowWatchedFilter] = useState(() => 
    localStorage.getItem('shows_watchedFilter') || 'all'
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Save items per page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shows_itemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  // Save filter states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shows_ignoredFilter', showIgnoredFilter);
  }, [showIgnoredFilter]);

  useEffect(() => {
    localStorage.setItem('shows_watchedFilter', showWatchedFilter);
  }, [showWatchedFilter]);

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
    if (showIgnoredFilter === 'ignored' ? !show.ignored : show.ignored) return false;

    // Filter by watched status
    if (showWatchedFilter !== 'all') {
      const stats = getShowStats(show.tvMazeId);
      const isFullyWatched = stats.totalEpisodes > 0 && stats.watchedEpisodes === stats.totalEpisodes;
      // When filter is on, show only not fully watched shows
      if (isFullyWatched) return false;
    }

    return true;
  });

  // Add sorting function
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Add sort indicator component
  const SortIndicator = ({ column }) => {
    if (sortColumn !== column) {
      return null;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 inline-block ml-1" /> : 
      <ChevronDown className="h-4 w-4 inline-block ml-1" />;
  };

  // Add sortable column header component
  const SortableHeader = ({ column, children }) => (
    <th 
      scope="col" 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIndicator column={column} />
      </div>
    </th>
  );

  // Sort the filtered shows
  const sortedShows = [...filteredShows].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const statsA = getShowStats(a.tvMazeId);
    const statsB = getShowStats(b.tvMazeId);

    switch (sortColumn) {
      case 'name':
        return direction * a.name.localeCompare(b.name);
      case 'tvMazeId':
        return direction * (parseInt(a.tvMazeId) - parseInt(b.tvMazeId));
      case 'seasons':
        return direction * (statsA.seasons - statsB.seasons);
      case 'episodes':
        return direction * (statsA.totalEpisodes - statsB.totalEpisodes);
      case 'watched':
        const watchedPercentA = statsA.totalEpisodes ? (statsA.watchedEpisodes / statsA.totalEpisodes) : 0;
        const watchedPercentB = statsB.totalEpisodes ? (statsB.watchedEpisodes / statsB.totalEpisodes) : 0;
        return direction * (watchedPercentA - watchedPercentB);
      case 'timeSpent':
        const timeA = statsA.watchedEpisodes * 42; // 42 minutes per episode
        const timeB = statsB.watchedEpisodes * 42;
        return direction * (timeA - timeB);
      case 'status':
        return direction * (a.status || '').localeCompare(b.status || '');
      default:
        return 0;
    }
  });

  // Update pagination to use sorted shows
  const totalPages = Math.ceil(sortedShows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShows = sortedShows.slice(startIndex, startIndex + itemsPerPage);

  // Effect to adjust current page if total pages decrease
  useEffect(() => {
    const newTotalPages = Math.ceil(sortedShows.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && sortedShows.length > 0) {
       // Handle case where filter results in zero items but previously there were items
       setCurrentPage(1); 
    } else if (currentPage === 0 && newTotalPages > 0) {
        // Ensure current page is at least 1 if there are pages
        setCurrentPage(1);
    }
  }, [sortedShows, itemsPerPage, currentPage]);

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

      const viewportHeight = window.innerHeight;
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

    // Use a small delay to ensure the table container has been rendered
    const timerId = setTimeout(checkSticky, 100);
    window.addEventListener('resize', checkSticky);
    
    return () => {
      clearTimeout(timerId);
      window.removeEventListener('resize', checkSticky);
    };
  }, [paginatedShows.length, showIgnoredFilter, showWatchedFilter]);

  const getStatusClass = (status) => {
    if (status === 'Ended') return 'bg-gray-100 text-gray-800';
    if (status === 'Running') return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

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
              <div className="flex items-center gap-6">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Immediately set the filter state for a faster visual response
                    setShowIgnoredFilter(showIgnoredFilter === 'ignored' ? 'all' : 'ignored');
                  }}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ${
                    showIgnoredFilter === 'ignored'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={showIgnoredFilter === 'ignored' ? "Show Unignored Shows" : "Show Ignored Shows"}
                >
                  {showIgnoredFilter === 'ignored' ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  <span className="text-sm">{showIgnoredFilter === 'ignored' ? "Ignored Shows" : "Unignored Shows"}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowWatchedFilter(showWatchedFilter === 'unwatched' ? 'all' : 'unwatched');
                  }}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors duration-200 ${
                    showWatchedFilter === 'unwatched'
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={showWatchedFilter === 'unwatched' ? "Show All Shows" : "Show Incomplete Shows"}
                >
                  {showWatchedFilter === 'unwatched' ? <Circle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  <span className="text-sm">{showWatchedFilter === 'unwatched' ? "Incomplete Shows" : "All Progress"}</span>
                </motion.button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedShows.length)} of {sortedShows.length} shows
            </div>
          </div>
        </div>

        {/* Shows Table */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div 
            key={`table-container-${showIgnoredFilter}-${showWatchedFilter}`}
            id="shows-table-container" 
            className="bg-white rounded-lg shadow-sm overflow-hidden mb-4"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <SortableHeader column="name">Series Name</SortableHeader>
                    <SortableHeader column="tvMazeId">TVMaze ID</SortableHeader>
                    <SortableHeader column="seasons">Seasons</SortableHeader>
                    <SortableHeader column="episodes">Episodes</SortableHeader>
                    <SortableHeader column="watched">Watched</SortableHeader>
                    <SortableHeader column="timeSpent">Time Spent</SortableHeader>
                    <SortableHeader column="status">Status</SortableHeader>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedShows.map((show) => {
                    const stats = getShowStats(show.tvMazeId);
                    const isFullyWatched = stats.totalEpisodes > 0 && stats.watchedEpisodes === stats.totalEpisodes;
                    return (
                      <tr
                        key={`${show.tvMazeId}-${stats.watchedEpisodes}`}
                        className={`hover:bg-gray-50 transition-colors ${
                          isFullyWatched
                            ? 'bg-green-50'
                            : show.ignored
                              ? 'bg-gray-50'
                              : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {show.image ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={show.image} alt={show.name} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Tv className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <Link to={`/shows/${show.tvMazeId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline">
                                {show.name}
                              </Link>
                            </div>
                          </div>
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(show.status)}`}>
                            {show.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
          </motion.div>
        </AnimatePresence>

        {/* Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isSticky={isSticky}
          shouldStickToPage={shouldStickToPage}
        />
      </div>
    </div>
  );
}

Shows.propTypes = {
  shows: PropTypes.arrayOf(PropTypes.shape({
    tvMazeId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string,
    ignored: PropTypes.bool
  })).isRequired,
  episodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    showId: PropTypes.string.isRequired,
    season: PropTypes.number.isRequired,
    number: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    watched: PropTypes.bool.isRequired
  })).isRequired,
  onDeleteShow: PropTypes.func.isRequired,
  onAddShow: PropTypes.func.isRequired,
  onToggleIgnore: PropTypes.func.isRequired
};

export default Shows; 