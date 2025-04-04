import React, { useState, useRef } from 'react';

const SearchDrawer = ({ isOpen, onSelectShow, onClose }) => {
  const [searchInput, setSearchInput] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);

  const handleInputChange = async (e) => {
    const query = e.target.value;
    setSearchInput(query);
    setError('');

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // For text search, wait 300ms before searching
    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/shows/search?q=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error('Search failed');
          const data = await response.json();
          setSearchResults(data);
        } catch (err) {
          setError('Error searching for shows');
          setSearchResults([]);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  // Filter results by year if yearFilter is set
  const filteredResults = searchResults.filter(({ show }) => {
    if (!yearFilter) return true;
    const premiereYear = show.premiered?.split('-')[0];
    return premiereYear === yearFilter;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (/^\d+$/.test(searchInput)) {
      try {
        const response = await fetch(`/api/shows/search?q=${searchInput}`);
        if (!response.ok) throw new Error('Show not found');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          await onSelectShow(data[0].show);
        } else if (data.id) {
          await onSelectShow(data);
        } else {
          throw new Error('Show not found');
        }
      } catch (err) {
        setError('Error adding show. Please check the ID and try again.');
      }
    }
  };

  const handleSelectResult = async (show) => {
    try {
      await onSelectShow(show);
      setSearchInput('');
      setYearFilter('');
      setSearchResults([]);
      onClose();
    } catch (err) {
      setError('Error adding show. Please try again.');
    }
  };

  // Get unique years from search results
  const availableYears = [...new Set(searchResults
    .map(({ show }) => show.premiered?.split('-')[0])
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
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchInput}
                        onChange={handleInputChange}
                        placeholder="Enter TVMaze ID or search by name"
                        className="flex-1 border rounded px-3 py-1"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!(/^\d+$/.test(searchInput))}
                        className="px-3 py-1 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        title={/^\d+$/.test(searchInput) ? "Add show by ID" : "Search by name and select from results"}
                      >
                        Add
                      </button>
                    </div>

                    {searchResults.length > 0 && !(/^\d+$/.test(searchInput)) && (
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

                  {!(/^\d+$/.test(searchInput)) && searchInput.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      Type to search by name and select a show from the results below
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
                        {filteredResults.slice(0, 8).map(({ show }) => (
                          <button
                            key={show.id}
                            onClick={() => handleSelectResult(show)}
                            className="w-full text-left px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <div className="flex justify-between items-start">
                              <div className="font-medium">{show.name}</div>
                              {show.status && (
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  show.status === 'Running' ? 'bg-green-100 text-green-800' :
                                  show.status === 'Ended' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {show.status}
                                </span>
                              )}
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
                        ))}
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

export default SearchDrawer; 