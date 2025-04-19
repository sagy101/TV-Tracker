import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import PaginationControls from './PaginationControls';
import ImportEpisodesDialog from './ImportEpisodesDialog';
import ImportSummaryDialog from './ImportSummaryDialog';
import StatusList from './StatusList';
import ProgressBar from './ProgressBar';
import { AuthContext } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3001/api';

function ImportSearchResultsDialog({ isOpen, onClose, onNext, results, progress }) {
  const { token } = useContext(AuthContext);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ 
    current: 0, 
    total: 0, 
    message: '',
    success: 0,
    failed: 0,
    skipped: 0
  });
  const [error, setError] = useState(null);
  const [showSuccessList, setShowSuccessList] = useState(false);
  const [showFailedList, setShowFailedList] = useState(false);
  const [showEpisodesDialog, setShowEpisodesDialog] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [importedShows, setImportedShows] = useState([]);
  const [importResults, setImportResults] = useState([]);

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
      const response = await fetch(`${API_BASE_URL}/shows/${show.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ignored: ignored
        })
      });
      if (!response.ok) throw new Error(`Failed to add show: ${show.name}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data; // Return the server response directly which includes { show, skipped }
    } catch (err) {
      console.error(`Error adding show ${show.name}:`, err);
      throw err; // Rethrow the error to be caught in processShow
    }
  };

  const processShow = async ({ show, ignored }) => {
    try {
      const result = await addShow(show, ignored);
      // Preserve the ignored status on the show object
      if (result.show) {
        result.show.ignored = ignored;
      }
      return { success: true, show: result.show, skipped: result.skipped, name: show.name };
    } catch (err) {
      console.error(`Error processing show ${show.name}:`, err);
      return { success: false, name: show.name, error: err.message };
    }
  };

  const processBatch = async (batch) => {
    const results = [];
    for (const { show, ignored } of batch) {
      const result = await processShow({ show, ignored });
      results.push(result);
    }
    return results;
  };

  const handleNext = async () => {
    setIsImporting(true);
    setError(null);
    setImportProgress({ 
      current: 0, 
      total: results.length, 
      message: 'Starting import...', 
      success: 0,
      failed: 0,
      skipped: 0
    });

    try {
      const batchSize = 5;
      const addedShows = [];
      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      const importResults = [];

      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        setImportProgress(prev => ({ 
          ...prev, 
          current: i,
          message: `Processing in batches of ${batchSize} shows to respect API rate limits... (Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(results.length/batchSize)})`,
          success: successCount,
          failed: failedCount,
          skipped: skippedCount
        }));
        
        const batchResults = await processBatch(batch);
        
        batchResults.forEach(result => {
          if (result.success) {
            if (result.skipped) {
              skippedCount++;
            } else {
              addedShows.push(result.show);
              successCount++;
            }
          } else {
            failedCount++;
          }
          importResults.push(result);
        });
      }

      setImportProgress(prev => ({ 
        ...prev, 
        current: results.length,
        message: 'Import completed!',
        success: successCount,
        failed: failedCount,
        skipped: skippedCount
      }));

      if (failedCount > 0) {
        setError(`${failedCount} shows could not be added. Check the console for details.`);
      }

      setImportResults(importResults);
      setImportedShows(addedShows);
      setShowSummaryDialog(true);
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
    <>
      <div className="fixed z-[100] inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-6 sm:align-middle sm:max-w-4xl sm:w-full">
            <div className="bg-white px-4 pt-4 pb-3 sm:p-5">
              <div className="sm:flex sm:items-start">
                <div className="mt-2 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-3" id="modal-title">
                    Import Search Results
                  </h3>
                  <div className="flex flex-col gap-3">
                    <StatusList
                      type="success"
                      count={progress?.success || results.length}
                      items={results}
                      isExpanded={showSuccessList}
                      onToggle={() => setShowSuccessList(!showSuccessList)}
                      itemRenderer={({ show, searchName }) => (
                        <>
                          {show.name} <span className="text-gray-500">(Searched as: {searchName})</span>
                        </>
                      )}
                    />

                    <StatusList
                      type="failure"
                      count={progress?.failed || 0}
                      items={progress?.failedNames}
                      isExpanded={showFailedList}
                      onToggle={() => setShowFailedList(!showFailedList)}
                    />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-3">
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
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={15}>15 per page</option>
                      </select>
                    </div>
                    <div className="max-h-[35vh] overflow-y-auto">
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
                    <div className="mt-3 mb-4">
                      <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        transparent={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {isImporting && (
              <ProgressBar
                current={importProgress.current}
                total={importProgress.total}
                message={importProgress.message}
                success={importProgress.success}
                failed={importProgress.failed}
                skipped={importProgress.skipped}
              />
            )}
            {error && (
              <div className="bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleNext}
                disabled={isImporting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? 'Importing...' : 'Next'}
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

      <ImportSummaryDialog
        isOpen={showSummaryDialog}
        onClose={() => {
          setShowSummaryDialog(false);
          onNext(importedShows);
          onClose();
          setShowEpisodesDialog(true);
        }}
        results={importResults}
      />
      <ImportEpisodesDialog
        isOpen={showEpisodesDialog}
        onClose={() => {
          setShowEpisodesDialog(false);
          onNext(importedShows);
        }}
        onImport={(episodes) => {
          onNext(importedShows, episodes);
        }}
        shows={importedShows}
      />
    </>
  );
}

ImportSearchResultsDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  results: PropTypes.arrayOf(PropTypes.shape({
    show: PropTypes.object.isRequired,
    searchName: PropTypes.string
  })).isRequired,
  progress: PropTypes.shape({
    total: PropTypes.number.isRequired,
    success: PropTypes.number.isRequired,
    failed: PropTypes.number.isRequired
  })
};

export default ImportSearchResultsDialog; 