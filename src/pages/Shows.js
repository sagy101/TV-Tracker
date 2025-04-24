import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Clock, Trash2, EyeOff, Eye, CheckCircle, Circle, ChevronUp, ChevronDown, Tv, Film, Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaginationControls from '../components/PaginationControls';
import { Link } from 'react-router-dom';

function Shows({ shows = [], episodes = [], onDeleteShow, onToggleIgnore }) {
  const [itemsPerPage, setItemsPerPage] = useState(() => parseInt(localStorage.getItem('shows_itemsPerPage')) || 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSticky, setIsSticky] = useState(false);
  const [shouldStickToPage, setShouldStickToPage] = useState(false);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showIgnoredFilter, setShowIgnoredFilter] = useState(() => localStorage.getItem('shows_ignoredFilter') || 'all');
  const [showWatchedFilter, setShowWatchedFilter] = useState(() => localStorage.getItem('shows_watchedFilter') || 'all');

  useEffect(() => { localStorage.setItem('shows_itemsPerPage', itemsPerPage.toString()); }, [itemsPerPage]);
  useEffect(() => { localStorage.setItem('shows_ignoredFilter', showIgnoredFilter); }, [showIgnoredFilter]);
  useEffect(() => { localStorage.setItem('shows_watchedFilter', showWatchedFilter); }, [showWatchedFilter]);

  const getShowStats = (showId) => {
    const showEpisodes = episodes.filter(ep => ep.showId === showId);
    const watchedEpisodes = showEpisodes.filter(ep => ep.watched);
    const seasons = [...new Set(showEpisodes.map(ep => ep.season))];
    const totalRuntimeMinutes = watchedEpisodes.reduce((sum, ep) => sum + (ep.runtime || 42), 0);
    const hours = Math.floor(totalRuntimeMinutes / 60);
    const minutes = totalRuntimeMinutes % 60;
    const watchedPercentage = showEpisodes.length > 0 ? Math.round((watchedEpisodes.length / showEpisodes.length) * 100) : 0;
    return {
      seasons: seasons.length,
      totalEpisodes: showEpisodes.length,
      watchedEpisodes: watchedEpisodes.length,
      watchedPercentage: watchedPercentage,
      timeWatched: `${hours}h ${minutes}m`
    };
  };

  const filteredShows = shows.filter(show => {
    if (showIgnoredFilter === 'ignored' ? !show.ignored : show.ignored) return false;
    if (showWatchedFilter !== 'all') {
      const stats = getShowStats(show.tvMazeId);
      const isFullyWatched = stats.totalEpisodes > 0 && stats.watchedEpisodes === stats.totalEpisodes;
      if (isFullyWatched) return false;
    }
    return true;
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIndicator = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 inline-block ml-1" /> : 
      <ChevronDown className="h-4 w-4 inline-block ml-1" />;
  };

  const SortableHeader = ({ column, children, className = "" }) => (
    <th 
      scope="col" 
      className={`px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIndicator column={column} />
      </div>
    </th>
  );

  const sortedShows = [...filteredShows].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const statsA = getShowStats(a.tvMazeId);
    const statsB = getShowStats(b.tvMazeId);
    switch (sortColumn) {
      case 'name': return direction * a.name.localeCompare(b.name);
      case 'tvMazeId': return direction * (parseInt(a.tvMazeId) - parseInt(b.tvMazeId));
      case 'seasons': return direction * (statsA.seasons - statsB.seasons);
      case 'episodes': return direction * (statsA.totalEpisodes - statsB.totalEpisodes);
      case 'watched': return direction * (statsA.watchedPercentage - statsB.watchedPercentage);
      case 'timeSpent':
        const timeA = statsA.watchedEpisodes * (a.runtime || 42);
        const timeB = statsB.watchedEpisodes * (b.runtime || 42);
        return direction * (timeA - timeB);
      case 'status': return direction * (a.status || '').localeCompare(b.status || '');
      default: return 0;
    }
  });

  const totalPages = Math.ceil(sortedShows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShows = sortedShows.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const newTotalPages = Math.ceil(sortedShows.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    } else if (newTotalPages === 0 && sortedShows.length > 0) {
       setCurrentPage(1); 
    } else if (currentPage === 0 && newTotalPages > 0) {
        setCurrentPage(1);
    }
  }, [sortedShows, itemsPerPage, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const checkSticky = () => {
      const listContainer = document.getElementById('shows-list-container');
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
    const listElement = document.getElementById('shows-list-container');
    const headerElement = document.getElementById('header-content');
    if (listElement) resizeObserver.observe(listElement);
    if (headerElement) resizeObserver.observe(headerElement);

    return () => {
      window.removeEventListener('resize', checkSticky);
      resizeObserver.disconnect();
    };
  }, [paginatedShows.length]);

  const getStatusClass = (status) => {
    if (status === 'Ended') return 'bg-gray-100 text-gray-800';
    if (status === 'Running') return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div id="header-content">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Shows</h1>
            <p className="text-gray-600">Overview of all your tracked TV shows</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 md:gap-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 w-full md:w-auto">
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

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowIgnoredFilter(showIgnoredFilter === 'ignored' ? 'all' : 'ignored')}
                  className={`flex items-center gap-1 p-2 rounded-md text-sm transition-colors duration-200 ${
                    showIgnoredFilter === 'ignored'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={showIgnoredFilter === 'ignored' ? "Show Unignored Shows" : "Show Ignored Shows"}
                >
                  {showIgnoredFilter === 'ignored' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>{showIgnoredFilter === 'ignored' ? "Ignored" : "Unignored"}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWatchedFilter(showWatchedFilter === 'unwatched' ? 'all' : 'unwatched')}
                  className={`flex items-center gap-1 p-2 rounded-md text-sm transition-colors duration-200 ${
                    showWatchedFilter === 'unwatched'
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  title={showWatchedFilter === 'unwatched' ? "Show All Shows" : "Show Incomplete Shows"}
                >
                  {showWatchedFilter === 'unwatched' ? <Circle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <span>{showWatchedFilter === 'unwatched' ? "Incomplete" : "All Progress"}</span>
                </motion.button>
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-2 md:mt-0">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedShows.length)} of {sortedShows.length} shows
            </div>
          </div>
        </div>

        <div id="shows-list-container" className="mb-4">
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div 
                key={`table-container-${showIgnoredFilter}-${showWatchedFilter}`}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <SortableHeader column="name" className="pl-4 w-56">Series</SortableHeader>
                        <SortableHeader column="tvMazeId">ID</SortableHeader>
                        <SortableHeader column="seasons">Seasons</SortableHeader>
                        <SortableHeader column="episodes">Episodes</SortableHeader>
                        <SortableHeader column="watched">Watched</SortableHeader>
                        <SortableHeader column="timeSpent">Time Spent</SortableHeader>
                        <SortableHeader column="status">Status</SortableHeader>
                        <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider pr-4">Actions</th>
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
                              isFullyWatched ? 'bg-green-50' : show.ignored ? 'bg-gray-50' : ''
                            }`}
                          >
                            <td className="pl-4 pr-2 py-3 max-w-xs overflow-hidden">
                              <div className="flex items-center max-w-full">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {show.image ? (
                                    <img className="h-10 w-10 rounded-full object-cover" src={show.image} alt={show.name} />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <Tv className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-3 min-w-0 max-w-full overflow-hidden">
                                  <Link 
                                    to={`/shows/${show.tvMazeId}`} 
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline block truncate max-w-full"
                                    title={show.name}
                                  >
                                    {show.name}
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{show.tvMazeId}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{stats.seasons}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{stats.totalEpisodes}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center justify-center">
                                <span className="mr-1">{stats.watchedEpisodes}</span>
                                <span className="text-gray-400">({stats.watchedPercentage}%)</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center justify-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                {stats.timeWatched}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(show.status)}`}>
                                {show.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-4 pr-4 py-3 whitespace-nowrap">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() => onToggleIgnore(show.tvMazeId)}
                                  className={`inline-flex items-center p-1.5 rounded-full ${
                                    show.ignored ? 'text-gray-600 bg-gray-200 hover:bg-gray-300' : 'text-gray-500 hover:bg-gray-100'
                                  }`}
                                  title={show.ignored ? 'Show in Episodes' : 'Hide from Episodes'}
                                >
                                  {show.ignored ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => onDeleteShow(show.tvMazeId)}
                                  className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  title="Delete Show"
                                >
                                  <Trash2 className="h-4 w-4" />
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
          </div>

          <div className="block md:hidden space-y-3">
            <AnimatePresence>
              {paginatedShows.map((show) => {
                const stats = getShowStats(show.tvMazeId);
                const isFullyWatched = stats.totalEpisodes > 0 && stats.watchedEpisodes === stats.totalEpisodes;
                return (
                  <motion.div
                    key={show.tvMazeId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white rounded-lg shadow-sm overflow-hidden ${isFullyWatched ? 'border-l-4 border-green-500' : show.ignored ? 'border-l-4 border-gray-400' : 'border-l-4 border-indigo-500'}`}
                  >
                    <div className="p-4 flex items-start gap-4">
                       <div className="flex-shrink-0 h-16 w-16">
                          {show.image ? (
                            <img className="h-16 w-16 rounded object-cover" src={show.image} alt={show.name} />
                          ) : (
                            <div className="h-16 w-16 rounded bg-gray-200 flex items-center justify-center">
                              <Tv className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <Link to={`/shows/${show.tvMazeId}`} className="text-base font-semibold text-indigo-700 hover:underline leading-tight truncate pr-2">
                              {show.name}
                            </Link>
                            <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(show.status)}`}>
                              {show.status || 'Unknown'}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                             <span className="inline-flex items-center"><Film className="h-3 w-3 mr-1" /> {stats.totalEpisodes} Ep / {stats.seasons} S</span>
                             <span className="inline-flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> {stats.watchedPercentage}% Watched</span>
                             <span className="inline-flex items-center"><Clock className="h-3 w-3 mr-1" /> {stats.timeWatched}</span>
                          </div>
                       </div>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end items-center space-x-2">
                       <button
                         onClick={() => onToggleIgnore(show.tvMazeId)}
                         className={`inline-flex items-center px-2 py-1 rounded text-xs ${ 
                           show.ignored ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                         }`}
                         title={show.ignored ? 'Show in Episodes' : 'Hide from Episodes'}
                       >
                         {show.ignored ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                       </button>
                       <button
                         onClick={() => onDeleteShow(show.tvMazeId)}
                         className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                         title="Delete Show"
                       >
                         <Trash2 className="h-4 w-4 mr-1" /> Delete
                       </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

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
    ignored: PropTypes.bool,
    image: PropTypes.string
  })).isRequired,
  episodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    showId: PropTypes.string.isRequired,
    season: PropTypes.number.isRequired,
    number: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    watched: PropTypes.bool.isRequired,
    runtime: PropTypes.number
  })).isRequired,
  onDeleteShow: PropTypes.func.isRequired,
  onToggleIgnore: PropTypes.func.isRequired
};

export default Shows; 