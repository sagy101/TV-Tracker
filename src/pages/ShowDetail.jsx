import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Globe, 
  Star, 
  Video, 
  User, 
  Database, 
  ExternalLink,
  ChevronLeft,
  Eye, 
  EyeOff,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

function ShowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSeasons, setExpandedSeasons] = useState({});
  const [posterError, setPosterError] = useState(false);
  const [castImageErrors, setCastImageErrors] = useState({});

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        
        // Get authentication token from localStorage and sessionStorage
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const authHeaders = {
          'Authorization': token ? `Bearer ${token}` : ''
        };
        
        // Fetch show details
        const response = await fetch(`/api/shows/${id}`, {
          headers: authHeaders
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch show details');
        }
        
        const showData = await response.json();
        setShow(showData);
        
        // Fetch episodes
        const episodesResponse = await fetch(`/api/shows/${id}/episodes`, {
          headers: authHeaders
        });
        
        if (!episodesResponse.ok) {
          throw new Error('Failed to fetch episodes');
        }
        
        const episodesData = await episodesResponse.json();
        setEpisodes(episodesData);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchShowDetails();
  }, [id]);

  // Initialize expanded seasons when episodes are loaded
  useEffect(() => {
    if (episodes.length > 0) {
      const initialExpandedState = {};
      const episodesBySeason = {};
      
      // Group episodes by season
      episodes.forEach(episode => {
        if (!episodesBySeason[episode.season]) {
          episodesBySeason[episode.season] = [];
        }
        episodesBySeason[episode.season].push(episode);
      });
      
      // Find the first season with unwatched episodes
      let seasonWithUnwatchedEpisode = null;
      Object.keys(episodesBySeason).forEach(season => {
        if (!seasonWithUnwatchedEpisode && episodesBySeason[season].some(ep => !ep.watched)) {
          seasonWithUnwatchedEpisode = season;
        }
      });
      
      // Set only that season to be expanded by default
      Object.keys(episodesBySeason).forEach(season => {
        initialExpandedState[season] = season === seasonWithUnwatchedEpisode;
      });
      
      setExpandedSeasons(initialExpandedState);
    }
  }, [episodes]);

  const handleToggleIgnore = async () => {
    try {
      // Reset any previous errors
      setError(null);
      
      // Get authentication token - check both localStorage and sessionStorage with the correct key
      let token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      // Check if we have a token before proceeding
      if (!token) {
        console.error('Authentication token not found. Please log in again.');
        setError('Authentication required. Please log in to toggle show status.');
        return;
      }
      
      console.log('Found authentication token. Sending toggle ignore request...');
      
      // First, ensure the show exists in the database
      const addResponse = await fetch(`/api/shows/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      
      if (!addResponse.ok) {
        console.error('Failed to ensure show exists in database:', addResponse.status);
        // Continue anyway, maybe it does exist
      } else {
        console.log('Show added/confirmed in database');
      }
      
      // Now toggle the ignore status
      const response = await fetch(`/api/shows/${id}/ignore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        console.error('Authentication failed. Please log in again.');
        setError('Authentication required. Please log in to toggle show status.');
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to toggle show status:', response.status, errorText);
        throw new Error(errorText || 'Failed to toggle ignored status');
      }
      
      const updatedShow = await response.json();
      
      // Update the local state with the new ignored status
      setShow(prev => {
        if (!prev) return prev;
        return { ...prev, ignored: updatedShow.ignored };
      });
      
      console.log(`Show ${id} ignored status changed to: ${updatedShow.ignored}`);
    } catch (err) {
      console.error('Error toggling ignored status:', err);
      setError(err.message || 'Failed to update show status. Please try again.');
    }
  };

  const handleToggleEpisodeWatched = async (episodeId) => {
    try {
      const episode = episodes.find(ep => ep.id === episodeId);
      if (!episode) return;
      
      const newWatchedStatus = !episode.watched;
      
      // Get authentication token
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      // Match the format used in the main App.js toggle function
      const response = await fetch(`/api/episodes/${episodeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ 
          watched: newWatchedStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update episode');
      }
      
      // Update local state
      setEpisodes(prevEpisodes => 
        prevEpisodes.map(ep => 
          ep.id === episodeId ? { ...ep, watched: newWatchedStatus } : ep
        )
      );
    } catch (err) {
      console.error('Error updating episode:', err);
    }
  };

  const handleMarkSeasonWatched = async (season) => {
    try {
      const seasonEpisodes = episodes.filter(ep => ep.season === season);
      const unwatchedEpisodes = seasonEpisodes.filter(ep => !ep.watched);
      
      if (unwatchedEpisodes.length === 0) return;
      
      // Get authentication token
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      // Update all unwatched episodes in this season one by one with the same format
      const updatePromises = unwatchedEpisodes.map(episode => 
        fetch(`/api/episodes/${episode.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ 
            watched: true
          }),
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setEpisodes(prevEpisodes => 
        prevEpisodes.map(ep => 
          ep.season === season ? { ...ep, watched: true } : ep
        )
      );
    } catch (err) {
      console.error('Error marking season as watched:', err);
    }
  };

  const toggleSeasonExpanded = (season) => {
    setExpandedSeasons(prev => ({
      ...prev,
      [season]: !prev[season]
    }));
  };

  // Group episodes by season
  const episodesBySeason = episodes.reduce((acc, episode) => {
    if (!acc[episode.season]) {
      acc[episode.season] = [];
    }
    acc[episode.season].push(episode);
    return acc;
  }, {});

  // Sort seasons
  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg shadow">
          <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 p-6 rounded-lg shadow">
          <h2 className="text-yellow-800 text-xl font-semibold mb-2">Show Not Found</h2>
          <p className="text-yellow-700">The requested show could not be found.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to Shows</span>
        </button>
      </div>

      {/* Show Hero Section */}
      <div 
        className="w-full bg-gradient-to-r from-indigo-700 to-indigo-900 py-12 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row">
            {/* Show Poster */}
            <div className="flex-shrink-0 flex justify-center lg:justify-start mb-8 lg:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-lg overflow-hidden shadow-2xl border-4 border-white h-80 w-56"
              >
                {show.image && !posterError ? (
                  <img 
                    src={show.image} 
                    alt={`${show.name} Poster`} 
                    className="h-full w-full object-cover"
                    onError={() => setPosterError(true)}
                  />
                ) : (
                  <div className="h-full w-full bg-gray-800 flex items-center justify-center text-gray-500">
                    <Video className="h-16 w-16" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Show Information */}
            <div className="lg:ml-8 flex-1 text-white">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{show.name}</h1>
                  <button
                    onClick={handleToggleIgnore}
                    className={`rounded-full p-2 ${show.ignored ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    title={show.ignored ? "Show is being ignored" : "Show is being tracked"}
                  >
                    {show.ignored ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-indigo-200">
                  {show.status && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      show.status === 'Running' ? 'bg-green-500 text-white' :
                      show.status === 'Ended' ? 'bg-gray-700 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {show.status}
                    </span>
                  )}
                  
                  {show.premiered && (
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {show.premiered}
                    </span>
                  )}
                  
                  {show.rating && show.rating.average && (
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      {show.rating.average}/10
                    </span>
                  )}
                  
                  {show.runtime && (
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {show.runtime} mins
                    </span>
                  )}
                  
                  {show.language && (
                    <span className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      {show.language}
                    </span>
                  )}
                </div>

                {show.genres && show.genres.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {show.genres.map(genre => (
                        <span 
                          key={genre} 
                          className="px-3 py-1 bg-indigo-800 rounded-full text-xs font-medium"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {show.summary && (
                  <div className="mt-4">
                    <div 
                      className="prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: show.summary }}
                    />
                  </div>
                )}

                {show.network && show.network.name && (
                  <div className="mt-4 flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    <span>{show.network.name}</span>
                    {show.network.country && show.network.country.name && (
                      <span className="ml-1">({show.network.country.name})</span>
                    )}
                  </div>
                )}

                {show.officialSite && (
                  <div className="mt-2">
                    <a 
                      href={show.officialSite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-300 hover:text-indigo-100 flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Official Website
                    </a>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('episodes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'episodes' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Episodes
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="bg-white shadow rounded-lg p-6">
            {/* User Stats Section */}
            <div className="border-t-0 pt-0">
              <h2 className="text-xl font-bold mb-4">Your Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-800 font-medium">Episodes Watched</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {episodes.filter(ep => ep.watched).length}/{episodes.length}
                      </p>
                    </div>
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="bg-indigo-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${episodes.length > 0 ? (episodes.filter(ep => ep.watched).length / episodes.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-medium">Watch Status</p>
                      <p className="text-3xl font-bold text-green-600">
                        {episodes.length > 0 && episodes.filter(ep => ep.watched).length === episodes.length 
                          ? 'Completed' 
                          : episodes.filter(ep => ep.watched).length > 0 
                            ? 'In Progress' 
                            : 'Not Started'}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      {episodes.length > 0 && episodes.filter(ep => ep.watched).length === episodes.length ? (
                        <Check className="h-6 w-6 text-green-600" />
                      ) : episodes.filter(ep => ep.watched).length > 0 ? (
                        <Clock className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-800 font-medium">Status</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {show.status || 'Unknown'}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      {show.status === 'Running' ? (
                        <Video className="h-6 w-6 text-blue-600" />
                      ) : show.status === 'Ended' ? (
                        <Database className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Clock className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Episode to Watch */}
              {episodes.length > 0 && episodes.some(ep => !ep.watched) && (
                <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Next Episode to Watch</h3>
                  {(() => {
                    const nextEpisode = episodes
                      .filter(ep => !ep.watched)
                      .sort((a, b) => {
                        if (a.season !== b.season) return a.season - b.season;
                        return a.number - b.number;
                      })[0];
                    
                    return nextEpisode ? (
                      <div className="flex items-center">
                        <div className="bg-yellow-100 p-2 rounded mr-3">
                          <Video className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">S{nextEpisode.season} E{nextEpisode.number}: {nextEpisode.name}</p>
                          {nextEpisode.airdate && (
                            <p className="text-sm text-gray-600">Aired: {nextEpisode.airdate}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => handleToggleEpisodeWatched(nextEpisode.id)}
                          className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Mark as Watched
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
            
            {show._embedded && show._embedded.cast && show._embedded.cast.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {show._embedded.cast.slice(0, 10).map((castMember) => (
                    <div key={castMember.person.id} className="bg-gray-50 rounded-lg p-3 flex flex-col items-center">
                      <div className="w-full aspect-square rounded overflow-hidden mb-2">
                        {castMember.person.image && !castImageErrors[castMember.person.id] ? (
                          <img 
                            src={castMember.person.image.medium} 
                            alt={castMember.person.name}
                            className="w-full h-full object-cover"
                            onError={() => setCastImageErrors(prev => ({...prev, [castMember.person.id]: true}))}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <User className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{castMember.person.name}</p>
                        <p className="text-sm text-gray-500">{castMember.character.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'episodes' && (
          <div className="bg-white shadow rounded-lg p-6">
            {episodes.length > 0 ? (
              <div>
                {seasons.map((season) => (
                  <div key={season} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="bg-gray-100 p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSeasonExpanded(season)}
                    >
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium">Season {season}</h3>
                        <div className="ml-4 text-sm text-gray-500">
                          {episodesBySeason[season].length} episodes
                        </div>
                        <div className="ml-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {episodesBySeason[season].filter(ep => ep.watched).length}/{episodesBySeason[season].length} watched
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {episodesBySeason[season].some(ep => !ep.watched) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkSeasonWatched(season);
                            }}
                            className="mr-4 text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Mark all as watched
                          </button>
                        )}
                        {expandedSeasons[season] ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                    
                    {expandedSeasons[season] && (
                      <div className="divide-y divide-gray-200">
                        {episodesBySeason[season].map((episode) => (
                          <div key={episode.id} className="p-4 flex items-center">
                            <button
                              onClick={() => handleToggleEpisodeWatched(episode.id)}
                              className={`mr-3 ${episode.watched ? 'text-green-500' : 'text-gray-300'}`}
                            >
                              {episode.watched ? (
                                <CheckCircle className="h-6 w-6" />
                              ) : (
                                <Circle className="h-6 w-6" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-baseline">
                                <span className="text-gray-500 text-sm mr-2">E{episode.number}</span>
                                <h4 className="font-medium">{episode.name}</h4>
                              </div>
                              {episode.airdate && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {episode.airdate}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Video className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No episodes available</h3>
                <p className="text-gray-500">We couldn't find any episodes for this show.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowDetail;