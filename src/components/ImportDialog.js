import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Download } from 'lucide-react';
import ImportSearchResultsDialog from './ImportSearchResultsDialog';
import ProgressBar from './ProgressBar';

function ImportDialog({ isOpen, onClose, onImport }) {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [progress, setProgress] = useState({ total: 0, current: 0, success: 0, failed: 0, failedNames: [] });
  const [selectedFile, setSelectedFile] = useState(null);
  const [delayTimer, setDelayTimer] = useState(null);
  const abortControllerRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
  };

  const processSearchResults = (data, showName) => {
    if (Array.isArray(data) && data.length > 0) {
      return { show: data[0].show, searchName: showName };
    } else if (data.id) {
      return { show: data, searchName: showName };
    }
    return null;
  };

  const searchForShow = async (showName) => {
    try {
      const response = await fetch(`/api/shows/search?q=${encodeURIComponent(showName)}`, {
        signal: abortControllerRef.current.signal
      });
      if (!response.ok) {
        if (response.status === 499) {
          console.log('Search cancelled by user');
          return null;
        }
        throw new Error('Search failed');
      }
      return await response.json();
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Search cancelled by user');
        return null;
      }
      console.error(`Error searching for show: ${showName}`, err);
      return null;
    }
  };

  const processBatch = async (batch) => {
    const results = [];
    for (const { name, ignored } of batch) {
      if (abortControllerRef.current.signal.aborted) break;
      
      const data = await searchForShow(name);
      if (data) {
        const result = processSearchResults(data, name);
        if (result) {
          results.push({ ...result, ignored });
          setProgress(prev => ({ ...prev, success: prev.success + 1 }));
        } else {
          setProgress(prev => ({ ...prev, failed: prev.failed + 1, failedNames: [...prev.failedNames, name] }));
        }
      } else {
        setProgress(prev => ({ ...prev, failed: prev.failed + 1, failedNames: [...prev.failedNames, name] }));
      }
      setProgress(prev => ({ ...prev, current: prev.current + 1 }));
    }
    return results;
  };

  const processFile = async (file) => {
    const text = await file.text();
    const lines = text.split('\n').slice(1);
    return lines
      .filter(line => line.trim())
      .map(line => {
        const [name, ignored = '0'] = line.split(',');
        return {
          name: name.trim(),
          ignored: ignored.trim() === '1' || ignored.trim().toLowerCase() === 'true'
        };
      })
      .filter(({ name }) => name);
  };

  const waitForRateLimit = async () => {
    for (let seconds = 10; seconds > 0; seconds--) {
      if (abortControllerRef.current.signal.aborted) break;
      setDelayTimer(seconds);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setDelayTimer(null);
  };

  const handleConfirm = async (file) => {
    if (!file) return;
    
    setIsSearching(true);
    setSearchResults([]);
    setProgress({ total: 0, current: 0, success: 0, failed: 0, failedNames: [] });
    abortControllerRef.current = new AbortController();
    
    try {
      const searchNames = await processFile(file);
      setProgress(prev => ({ ...prev, total: searchNames.length }));
      
      const batchSize = 20;
      let allResults = [];
      
      for (let i = 0; i < searchNames.length; i += batchSize) {
        if (abortControllerRef.current.signal.aborted) break;
        
        const batch = searchNames.slice(i, i + batchSize);
        const batchResults = await processBatch(batch);
        allResults = [...allResults, ...batchResults];
        
        if (i + batchSize < searchNames.length && !abortControllerRef.current.signal.aborted) {
          await waitForRateLimit();
        }
      }
      
      if (!abortControllerRef.current.signal.aborted) {
        setSearchResults(allResults);
        setShowResultsDialog(true);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error processing file:', err);
      }
    } finally {
      setIsSearching(false);
      setDelayTimer(null);
    }
  };

  const handleCancel = () => {
    if (isSearching && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Import Shows
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Select a CSV file containing shows to import. Each line should contain:
                  </p>
                  <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                    <li>TVMaze ID or show name (required)</li>
                    <li>Ignored status (optional, true/false)</li>
                  </ul>
                  <p className="mt-2 text-sm text-gray-500">
                    Example format:
                  </p>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs text-gray-600">
                    showname,ignored,status,classification,country,network,runtime,airtime,timezone{'\n'}
                    07-Ghost,0,Ended,Animation,JP,"Chiba TV",25,13:40:00,Asia/Tokyo{'\n'}
                    "3Below: Tales of Arcadia",0,Ended,Animation,,,24,00:01:00,America/Los_Angeles{'\n'}
                    86,1,Ended,Animation,JP,"Tokyo MX",25,00:00:00,Asia/Tokyo
                  </pre>
                  <p className="mt-2 text-sm text-gray-500">
                    The first line must be the header indicating field positions. All fields are optional except showname.
                  </p>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {isSearching && (
              <div className="mt-4">
                <ProgressBar
                  current={progress.current}
                  total={progress.total}
                  message={`Search Progress: ${progress.current} of ${progress.total}`}
                  success={progress.success}
                  failed={progress.failed}
                  height="h-2.5"
                />
                <div className="h-[52px] flex items-center justify-center">
                  {delayTimer ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
                      Waiting for rate limit: {delayTimer} seconds remaining...
                    </div>
                  ) : (
                    <div className="invisible bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
                      Placeholder for rate limit timer
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Processing in batches of 20 shows with 10-second delays to respect API rate limits...
                </p>
              </div>
            )}

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => handleConfirm(selectedFile)}
                disabled={!selectedFile || isSearching}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Searching
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImportSearchResultsDialog
        isOpen={showResultsDialog}
        onClose={() => {
          setShowResultsDialog(false);
          onClose();
        }}
        onNext={(shows) => {
          onImport(shows);
          onClose();
        }}
        results={searchResults}
        progress={progress}
      />
    </>
  );
}

ImportDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired
};

export default ImportDialog; 