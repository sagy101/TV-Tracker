import React from 'react';
import PropTypes from 'prop-types';

function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange,
  isSticky = false,
  shouldStickToPage = false,
  transparent = false
}) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 ${
      transparent 
        ? '' 
        : 'bg-gray-50'
    } ${
      isSticky 
        ? 'fixed bottom-0 left-0 right-0 border-t border-gray-200 shadow-md z-[5]' 
        : shouldStickToPage 
          ? 'relative border-t border-gray-200 mt-4'
          : ''
    }`}>
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <button
          onClick={() => onPageChange(currentPage - 1)}
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
              onChange={(e) => onPageChange(Number(e.target.value))}
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
          onClick={() => onPageChange(currentPage + 1)}
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
  );
}

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  isSticky: PropTypes.bool,
  shouldStickToPage: PropTypes.bool,
  transparent: PropTypes.bool
};

export default PaginationControls; 