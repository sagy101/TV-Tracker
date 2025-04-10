import React, { useState } from 'react';
import { MoreVertical, RefreshCw, Download, Trash2 } from 'lucide-react';

function ActionsMenu({ 
  onRefresh, 
  onImport, 
  onClear, 
  isRefreshing 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickOutside = (e) => {
    if (!e.target.closest('.actions-menu')) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative actions-menu ml-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-center w-12 h-12 text-gray-700 rounded-full focus:outline-none border border-gray-200 ${isOpen ? 'bg-gray-100 bg-opacity-60 hover:bg-gray-200' : 'bg-white hover:bg-gray-50'}`}
        title="Show Actions"
      >
        <MoreVertical className="h-7 w-7" />
      </button>

      {isOpen && (
        <div className="fixed mt-2 w-[500px] min-w-[500px] max-w-none rounded-lg bg-white shadow-xl py-3 z-[100]" style={{right: '10px', top: '60px', width: '500px !important', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'}}>
          <button
            onClick={() => {
              onRefresh();
              setIsOpen(false);
            }}
            disabled={isRefreshing}
            className="flex items-center w-full px-6 py-3 text-[16px] text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            <div className="w-12 flex justify-start">
              <RefreshCw className={`h-6 w-6 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex justify-start pl-4">
              <span>Refresh Shows</span>
            </div>
          </button>
          <button
            onClick={() => {
              onImport();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-6 py-3 text-[16px] text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            <div className="w-12 flex justify-start">
              <Download className="h-6 w-6 text-gray-500" />
            </div>
            <div className="flex justify-start pl-4">
              <span>Import Shows</span>
            </div>
          </button>
          <button
            onClick={() => {
              onClear();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-6 py-3 text-[16px] text-red-500 hover:bg-gray-100"
            role="menuitem"
          >
            <div className="w-12 flex justify-start">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex justify-start pl-4">
              <span>Clear All Data</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default ActionsMenu; 