import React from 'react';
import PropTypes from 'prop-types';

function ProgressBar({ 
  current, 
  total, 
  message = '', 
  success = null, 
  failed = null,
  skipped = null,
  height = 'h-2',
  showCount = true
}) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  const renderStatusCounters = () => {
    const counters = [];
    if (success !== null) counters.push(`Success: ${success}`);
    if (failed !== null) counters.push(`Failed: ${failed}`);
    if (skipped !== null) counters.push(`Skipped: ${skipped}`);
    return counters.join(' | ');
  };

  return (
    <div className="bg-gray-50 px-4 py-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">{message}</span>
        {(success !== null || failed !== null || skipped !== null) && (
          <span className="text-sm text-gray-600">
            {renderStatusCounters()}
          </span>
        )}
      </div>
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {showCount && (
        <div className="flex justify-end mt-1">
          <span className="text-sm text-gray-500">
            {current} of {total}
          </span>
        </div>
      )}
    </div>
  );
}

ProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  message: PropTypes.string,
  success: PropTypes.number,
  failed: PropTypes.number,
  skipped: PropTypes.number,
  height: PropTypes.string,
  showCount: PropTypes.bool
};

export default ProgressBar; 