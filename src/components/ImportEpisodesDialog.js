import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Download } from 'lucide-react';

function ImportEpisodesDialog({ isOpen, onClose, onImport, shows }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
  };

  const handleFinish = () => {
    onClose();
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').slice(1);
      const episodes = lines
        .filter(line => line.trim())
        .map(line => {
          const [showname, season, episode, name, status, runtime, date, airtime, airdate] = line.split(',');
          return {
            showname: showname.trim(),
            season: parseInt(season.trim()),
            episode: parseInt(episode.trim()),
            name: name.trim().replace(/^"|"$/g, ''),
            status: parseInt(status.trim()),
            runtime: parseInt(runtime.trim()),
            date: date.trim(),
            airtime: airtime.trim(),
            airdate: airdate.trim().replace(/^"|"$/g, '')
          };
        })
        .filter(episode => episode.showname && !isNaN(episode.season) && !isNaN(episode.episode));

      onImport(episodes);
      onClose();
    } catch (err) {
      console.error('Error processing episodes file:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-[100] inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Import Episodes Status
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You can optionally import episode data from a CSV file. The file should contain the following columns:
                    showname, season, episode, name, status, runtime, date, airtime, airdate.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This step is optional and can be skipped by pressing Finish.
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
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleImport}
              disabled={!selectedFile}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Importing
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ImportEpisodesDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  shows: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default ImportEpisodesDialog; 