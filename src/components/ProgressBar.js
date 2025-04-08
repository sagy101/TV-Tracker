import React from 'react';
import PropTypes from 'prop-types';

function ProgressBar({ current, total, statusText }) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="bg-gray-50 px-4 py-3">
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>{statusText}</span>
        <span>{current} of {total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  statusText: PropTypes.string.isRequired
};

export default ProgressBar; 