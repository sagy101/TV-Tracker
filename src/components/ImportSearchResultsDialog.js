import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';

function ImportSearchResultsDialog({ isOpen, onClose, onConfirm, results }) {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  // Calculate pagination
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const addShow = async (show, ignored) => {
    try {
      const response = await fetch(`/api/shows/${show.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ignored })
      });
      if (!response.ok) throw new Error(`Failed to add show: ${show.name}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return show;
    } catch (err) {
      console.error(`Error adding show ${show.name}:`, err);
      return null;
    }
  };

  const processShow = async ({ show, ignored }) => {
    const addedShow = await addShow(show, ignored);
    if (addedShow) {
      return { success: true, show: addedShow };
    }
    return { success: false };
  };

  const processBatch = async (batch) => {
    const results = [];
    for (const { show, ignored } of batch) {
      const result = await processShow({ show, ignored });
      results.push(result);
    }
    return results;
  };

  const handleConfirm = async () => {
    setIsImporting(true);
    setError(null);
    setImportProgress({ current: 0, total: results.length });

    try {
      const batchSize = 5;
      const addedShows = [];
      let hasErrors = false;

      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        const batchResults = await processBatch(batch);
        
        batchResults.forEach(result => {
          if (result.success) {
            addedShows.push(result.show);
          } else {
            hasErrors = true;
          }
        });

        setImportProgress(prev => ({ ...prev, current: i + batch.length }));
      }

      if (hasErrors) {
        setError('Some shows could not be added. Check the console for details.');
      }

      onConfirm(addedShows);
      onClose();
    } catch (err) {
      setError('Error importing shows. Some shows may not have been added.');
      console.error('Import error:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Running') return 'bg-green-100 text-green-800';
    if (status === 'Ended') return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="fixed z-20 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Import Search Results
                </h3>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, results.length)} of {results.length} results
                    </div>
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
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    {paginatedResults.map(({ show, searchName, ignored }) => (
                      <div
                        key={show.id}
                        className="w-full text-left px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 mb-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{show.name}</div>
                            <div className="text-xs text-gray-500">Search Name: {searchName}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {show.status && (
                              <span className={`text-xs px-2 py-0.5 rounded ${getStatusClass(show.status)}`}>
                                {show.status}
                              </span>
                            )}
                            <div className={`inline-flex items-center p-1 rounded-full ${
                              ignored ? 'text-gray-600 bg-gray-100' : 'text-gray-400'
                            }`}>
                              {ignored ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </div>
                          </div>
                        </div>
                        <div className="mt-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
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
                            <div className="text-xs text-gray-500 mt-1">
                              {show.genres.join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isImporting && (
            <div className="bg-gray-50 px-4 py-3">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Importing shows...</span>
                <span>{importProgress.current} of {importProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isImporting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ImportSearchResultsDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  results: PropTypes.arrayOf(PropTypes.shape({
    show: PropTypes.object.isRequired,
    searchName: PropTypes.string
  })).isRequired
};

export default ImportSearchResultsDialog; 