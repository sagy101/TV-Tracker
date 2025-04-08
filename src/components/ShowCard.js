import React from 'react';

function ShowCard({ show, searchName, onClick, className = '' }) {
  return (
    <div
      className={`w-full text-left px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 mb-2 ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">{show.name}</div>
          {searchName && (
            <div className="text-xs text-gray-500">Search Name: {searchName}</div>
          )}
        </div>
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
  );
}

export default ShowCard; 