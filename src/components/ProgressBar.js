import React from 'react';
import PropTypes from 'prop-types';

function ProgressBar({ 
  current, 
  total, 
  message = '', 
  success = null, 
  failed = null,
  height = 'h-2',
  showCount = true
}) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="bg-gray-50 px-4 py-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">{message}</span>
        {(success !== null || failed !== null) && (
          <span className="text-sm text-gray-600">
            {success !== null && `Success: ${success}`}
            {success !== null && failed !== null && ' | '}
            {failed !== null && `Failed: ${failed}`}
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
  height: PropTypes.string,
  showCount: PropTypes.bool
};

export default ProgressBar; 