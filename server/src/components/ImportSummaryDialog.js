import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import StatusList from './StatusList';

function ImportSummaryDialog({ isOpen, onClose, results }) {
  const [showSuccessList, setShowSuccessList] = useState(false);
  const [showFailedList, setShowFailedList] = useState(false);
  const [showSkippedList, setShowSkippedList] = useState(false);

  if (!isOpen) return null;

  const successResults = results.filter(r => r.success && !r.skipped);
  const failedResults = results.filter(r => !r.success);
  const skippedResults = results.filter(r => r.success && r.skipped);

  return (
    <div className="fixed z-[100] inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-visible shadow-xl transform transition-all sm:my-6 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-4 pb-3 sm:p-5">
            <div className="sm:flex sm:items-start">
              <div className="mt-2 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-3" id="modal-title">
                  Import Summary
                </h3>
                <div className="flex flex-col gap-3">
                  <StatusList
                    type="success"
                    count={successResults.length}
                    items={successResults}
                    isExpanded={showSuccessList}
                    onToggle={() => setShowSuccessList(!showSuccessList)}
                    itemRenderer={({ show }) => show.name}
                  />

                  <StatusList
                    type="failure"
                    count={failedResults.length}
                    items={failedResults}
                    isExpanded={showFailedList}
                    onToggle={() => setShowFailedList(!showFailedList)}
                  />

                  <StatusList
                    type="info"
                    count={skippedResults.length}
                    items={skippedResults}
                    isExpanded={showSkippedList}
                    onToggle={() => setShowSkippedList(!showSkippedList)}
                    itemRenderer={({ show }) => show.name}
                    description="These shows were already in your database and were skipped."
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ImportSummaryDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  results: PropTypes.arrayOf(PropTypes.shape({
    success: PropTypes.bool.isRequired,
    skipped: PropTypes.bool.isRequired,
    show: PropTypes.object
  })).isRequired
};

export default ImportSummaryDialog; 