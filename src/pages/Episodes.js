import React, { useState, useEffect } from 'react';
import { Filter, CheckCircle, Info, Calendar, Clock, Eye, EyeOff, Circle } from 'lucide-react';

function Episodes({ 
  shows,
  episodes,
  loading,
  error,
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
    if (watchedFilter === 'unwatched' && episode.watched) return false;

    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredEpisodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEpisodes = filteredEpisodes.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // Helper function to get page options
  const getPageOptions = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let pages = [];
    const currentPageInt = parseInt(currentPage);

    // Always include first and last page
    pages.push(1);
    
    // Calculate range around current page
    let start = Math.max(2, currentPageInt - 2);
    let end = Math.min(totalPages - 1, currentPageInt + 2);

    // Adjust range if at edges
    if (currentPageInt <= 4) {
      end = Math.min(6, totalPages - 1);
    } else if (currentPageInt >= totalPages - 3) {
      start = Math.max(2, totalPages - 5);
    }

    // Add ellipsis and pages
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);

    return pages;
  };

  // Check if pagination controls should be sticky
  useEffect(() => {
    const checkSticky = () => {
      const tableContainer = document.getElementById('episodes-table-container');
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
                  onClick={() => setWatchedFilter(watchedFilter === 'unwatched' ? 'all' : 'unwatched')}
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    watchedFilter === 'unwatched' 
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={watchedFilter === 'unwatched' ? "Show All Episodes" : "Show Unwatched Episodes"}
                >
                  {watchedFilter === 'unwatched' ? <Circle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  <span className="text-sm">Watched</span>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowIgnoredFilter(showIgnoredFilter === 'ignored' ? 'all' : 'ignored')}
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    showIgnoredFilter === 'ignored'
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={showIgnoredFilter === 'ignored' ? "Show Only Unignored Shows" : "Show All Shows"}
                >
                  {showIgnoredFilter === 'ignored' ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  <span className="text-sm">Show Ignored</span>
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEpisodes.length)} of {filteredEpisodes.length} episodes
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Episodes Table */}
        <div id="episodes-table-container" className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Air Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Show
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Episode
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Runtime
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEpisodes.map((episode) => {
                  const show = shows.find(s => s.tvMazeId === episode.showId);
                  const released = isReleased(episode);
                  return (
                    <tr
                      key={episode.id}
                      className={`${
                        released
                          ? episode.watched
                            ? 'bg-green-50'
                            : 'bg-yellow-50'
                          : 'bg-white'
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {episode.airdate}
                          <Clock className="h-4 w-4 mx-2 text-gray-400" />
                          {episode.airtime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {episode.showName}
                        {show?.ignored && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Ignored
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        S{episode.season.toString().padStart(2, '0')}E{episode.number.toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {episode.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {episode.runtime ? `${episode.runtime} min` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
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

export default Episodes; 