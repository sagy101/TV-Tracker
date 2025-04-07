import React from 'react';
import { Download } from 'lucide-react';

function ImportDialog({ isOpen, onClose, onImport }) {
  if (!isOpen) return null;

  return (
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        onImport(file);
                      }
                    }}
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
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportDialog; 