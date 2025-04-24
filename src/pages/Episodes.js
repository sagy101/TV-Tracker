import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Calendar, Clock, Eye, EyeOff, Circle, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaginationControls from '../components/PaginationControls';

function Episodes({ 
  shows = [],
  episodes = [],
  loading,
  onToggleWatched,
  isReleased
}) {
  // Load initial states from localStorage or use defaults
  const [watchedFilter, setWatchedFilter] = useState(() => 
    localStorage.getItem('episodes_watchedFilter') || 'all'
  );
  const [showIgnoredFilter, setShowIgnoredFilter] = useState(() => 
    localStorage.getItem('episodes_showIgnoredFilter') || 'all'
  );
  const [itemsPerPage, setItemsPerPage] = useState(() => 
    parseInt(localStorage.getItem('episodes_itemsPerPage')) || 10
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isSticky, setIsSticky] = useState(false);
  const [shouldStickToPage, setShouldStickToPage] = useState(false);

  // Save filter states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('episodes_watchedFilter', watchedFilter);
  }, [watchedFilter]);

  useEffect(() => {
    localStorage.setItem('episodes_showIgnoredFilter', showIgnoredFilter);
  }, [showIgnoredFilter]);

  useEffect(() => {
    localStorage.setItem('episodes_itemsPerPage', itemsPerPage.toString());
  }, [itemsPerPage]);

  const filteredEpisodes = episodes.filter(episode => {
    const show = shows.find(s => s.tvMazeId === episode.showId);
    
    // When filter is off (all), show only unignored shows
    // When filter is on (ignored), show all shows
    if (showIgnoredFilter === 'all' && show?.ignored) return false;

    // Filter by watched status
    return !(watchedFilter === 'unwatched' && episode.watched);
  });

  // Sort episodes by date and time
  const sortedEpisodes = [...filteredEpisodes].sort((a, b) => {
    // Compare dates first
    const dateA = new Date(a.airdate);
    const dateB = new Date(b.airdate);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;

    // If dates are equal, compare times
    if (a.airdate === b.airdate) {
      // Convert time to 24-hour format for comparison
      const timeA = a.airtime === 'TBA' ? '99:99' : a.airtime;
      const timeB = b.airtime === 'TBA' ? '99:99' : b.airtime;
      return timeA.localeCompare(timeB);
    }

    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedEpisodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEpisodes = sortedEpisodes.slice(startIndex, startIndex + itemsPerPage);

  // Effect to adjust current page if total pages decrease
  useEffect(() => {
    const newTotalPages = Math.ceil(sortedEpisodes.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && sortedEpisodes.length > 0) {
       // Handle case where filter results in zero items but previously there were items
       setCurrentPage(1); 
    } else if (currentPage === 0 && newTotalPages > 0) {
        // Ensure current page is at least 1 if there are pages
        setCurrentPage(1);
    }
  }, [sortedEpisodes, itemsPerPage, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // Check if pagination controls should be sticky
  useEffect(() => {
    const checkSticky = () => {
      const listContainer = document.getElementById('episodes-list-container');
      const headerContent = document.getElementById('header-content');
      if (!listContainer || !headerContent) return;

      const viewportHeight = window.innerHeight;
      const headerHeight = headerContent.offsetHeight;
      const listHeight = listContainer.offsetHeight;
      const contentHeight = headerHeight + listHeight;

      setIsSticky(contentHeight > viewportHeight);
      setShouldStickToPage(true);
    };

    checkSticky();
    window.addEventListener('resize', checkSticky);

    const resizeObserver = new ResizeObserver(checkSticky);
    const listElement = document.getElementById('episodes-list-container');
    const headerElement = document.getElementById('header-content');
    if (listElement) resizeObserver.observe(listElement);
    if (headerElement) resizeObserver.observe(headerElement);

    return () => {
       window.removeEventListener('resize', checkSticky);
       resizeObserver.disconnect();
    };
  }, [paginatedEpisodes.length]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* Header Content */}
        <div id="header-content">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Episodes</h1>
            <p className="text-gray-600">Track episodes from your favorite shows</p>
          </div>

          {/* Table Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 md:gap-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 w-full md:w-auto">
              {/* Items per page */}
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={100}>100 per page</option>
              </select>

              {/* Filter Icons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setWatchedFilter(watchedFilter === 'unwatched' ? 'all' : 'unwatched')}
                  className={`flex items-center gap-1 p-2 rounded-md text-sm ${
                    watchedFilter === 'unwatched' 
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={watchedFilter === 'unwatched' ? "Show All Episodes" : "Show Unwatched Episodes"}
                >
                  {watchedFilter === 'unwatched' ? <Circle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <span>{watchedFilter === 'unwatched' ? "Unwatched" : "All Watched"}</span>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowIgnoredFilter(showIgnoredFilter === 'ignored' ? 'all' : 'ignored')}
                  className={`flex items-center gap-1 p-2 rounded-md text-sm ${
                    showIgnoredFilter === 'ignored'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={showIgnoredFilter === 'ignored' ? "Show Only Unignored Shows" : "Show All Shows"}
                >
                  {showIgnoredFilter === 'ignored' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>{showIgnoredFilter === 'ignored' ? "All Shows" : "Unignored"}</span>
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-2 md:mt-0">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedEpisodes.length)} of {sortedEpisodes.length} episodes
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Episodes List Container (for both table and cards) */}
        <div id="episodes-list-container" className="mb-4">

          {/* Desktop Table (hidden on small screens) */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {/* Adjusted padding and text size for table headers */}
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Air Date & Time</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Show</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Episode</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Runtime</th>
                    <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {paginatedEpisodes.map((episode) => {
                      const show = shows.find(s => s.tvMazeId === episode.showId);
                      const released = isReleased(episode);
                      return (
                        <motion.tr
                          key={episode.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className={`${
                            episode.watched
                              ? 'bg-green-50'
                              : released
                                ? 'bg-yellow-50'
                                : 'bg-blue-50'
                          } hover:bg-gray-50 transition-colors`}
                        >
                          {/* Adjusted padding for table cells */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center text-xs">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              {episode.airdate}
                              <Clock className="h-4 w-4 ml-2 mr-1 text-gray-400" />
                              {episode.airtime}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {episode.showName}
                            {show?.ignored && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Ignored</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            S{episode.season.toString().padStart(2, '0')}E{episode.number.toString().padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {episode.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {episode.runtime ? `${episode.runtime} min` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <button
                              onClick={() => onToggleWatched(episode.id)}
                              className={`inline-flex items-center justify-center p-2 rounded-full transition-colors ${
                                episode.watched
                                  ? 'text-green-600 bg-green-100 hover:bg-green-200'
                                  : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {episode.watched ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List (visible on small screens) */}
          <div className="block md:hidden space-y-3">
             <AnimatePresence>
                {paginatedEpisodes.map((episode) => {
                  const show = shows.find(s => s.tvMazeId === episode.showId);
                  const released = isReleased(episode);
                  return (
                    <motion.div
                      key={episode.id}
                      layout // Animate layout changes
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-white rounded-lg shadow-sm p-4 ${
                        episode.watched ? 'border-l-4 border-green-500' : released ? 'border-l-4 border-yellow-500' : 'border-l-4 border-blue-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 leading-tight">{episode.name}</h3>
                          <p className="text-sm text-indigo-600 font-medium flex items-center">
                             <Tv className="h-4 w-4 mr-1 inline" /> {episode.showName}
                             {show?.ignored && <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Ignored</span>}
                           </p>
                          <p className="text-xs text-gray-500">
                            S{episode.season.toString().padStart(2, '0')}E{episode.number.toString().padStart(2, '0')}
                          </p>
                        </div>
                        <button
                          onClick={() => onToggleWatched(episode.id)}
                          className={`ml-3 flex-shrink-0 inline-flex items-center justify-center p-2 rounded-full transition-colors ${
                            episode.watched
                              ? 'text-green-600 bg-green-100 hover:bg-green-200'
                              : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {episode.watched ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" /> {episode.airdate}
                          <Clock className="h-3 w-3 ml-2 mr-1" /> {episode.airtime}
                        </span>
                        <span>{episode.runtime ? `${episode.runtime} min` : ''}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
           </div>

        </div>

        {/* Pagination Controls (should work for both layouts) */}
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

Episodes.propTypes = {
  shows: PropTypes.arrayOf(PropTypes.shape({
    tvMazeId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ignored: PropTypes.bool
  })).isRequired,
  episodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    showId: PropTypes.string.isRequired,
    season: PropTypes.number.isRequired,
    number: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    watched: PropTypes.bool.isRequired,
    airdate: PropTypes.string.isRequired,
    airtime: PropTypes.string.isRequired,
    runtime: PropTypes.number
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  onToggleWatched: PropTypes.func.isRequired,
  isReleased: PropTypes.func.isRequired
};

export default Episodes; 