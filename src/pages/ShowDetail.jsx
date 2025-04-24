import React, { useState, useEffect, useContext } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import * as api from '../api';

function ShowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
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
      if (!token) {
          setError('Authentication required.');
          setLoading(false);
          return;
      }
      try {
        setLoading(true);
        setError(null);
        
        const showData = await api.fetchShowDetails(id, token);
        setShow(showData);
        
        const episodesData = await api.fetchEpisodesForShow(id, token);
        setEpisodes(episodesData || []);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching show details or episodes:", err);
        setError(err.message || 'Failed to load show data.');
        setLoading(false);
      }
    };
    
    fetchShowDetails();
  }, [id, token]);

  useEffect(() => {
    if (episodes.length > 0) {
      const initialExpandedState = {};
      const episodesBySeason = {};
      
      episodes.forEach(episode => {
        if (!episodesBySeason[episode.season]) {
          episodesBySeason[episode.season] = [];
        }
        episodesBySeason[episode.season].push(episode);
      });
      
      let seasonWithUnwatchedEpisode = null;
      Object.keys(episodesBySeason).forEach(season => {
        if (!seasonWithUnwatchedEpisode && episodesBySeason[season].some(ep => !ep.watched)) {
          seasonWithUnwatchedEpisode = season;
        }
      });
      
      Object.keys(episodesBySeason).forEach(season => {
        initialExpandedState[season] = season === seasonWithUnwatchedEpisode;
      });
      
      setExpandedSeasons(initialExpandedState);
    }
  }, [episodes]);

  const handleToggleIgnore = async () => {
    if (!token) {
        setError('Authentication required.');
        return;
    }
    try {
      setError(null);
      
      const updatedShow = await api.toggleShowIgnore(id, token);
      
      setShow(prev => ({ ...prev, ignored: updatedShow.ignored }));
      console.log(`Show ${id} ignored status changed to: ${updatedShow.ignored}`);
    } catch (err) {
      console.error('Error toggling ignored status:', err);
      setError(err.message || 'Failed to update show status.');
    }
  };

  const handleToggleEpisodeWatched = async (episodeId) => {
    if (!token) {
       setError('Authentication required.');
       return; 
    }
    try {
      const episode = episodes.find(ep => ep.id === episodeId);
      if (!episode) return;
      const newWatchedStatus = !episode.watched;
      
      await api.updateEpisode(episodeId, { watched: newWatchedStatus }, token);
      
      setEpisodes(prevEpisodes => 
        prevEpisodes.map(ep => 
          ep.id === episodeId ? { ...ep, watched: newWatchedStatus } : ep
        )
      );
    } catch (err) {
      console.error('Error updating episode:', err);
      setError(err.message || 'Failed to update episode status.');
    }
  };

  const handleMarkSeasonWatched = async (season) => {
    if (!token) {
       setError('Authentication required.');
       return; 
    }
    try {
      const seasonEpisodes = episodes.filter(ep => ep.season === season);
      const unwatchedEpisodes = seasonEpisodes.filter(ep => !ep.watched);
      if (unwatchedEpisodes.length === 0) return;
      
      const updatePromises = unwatchedEpisodes.map(episode => 
        api.updateEpisode(episode.id, { watched: true }, token)
      );
      await Promise.all(updatePromises);
      
      setEpisodes(prevEpisodes => 
        prevEpisodes.map(ep => 
          ep.season === season ? { ...ep, watched: true } : ep
        )
      );
    } catch (err) {
      console.error('Error marking season as watched:', err);
       setError(err.message || 'Failed to mark season as watched.');
    }
  };

  const toggleSeasonExpanded = (season) => {
    setExpandedSeasons(prev => ({
      ...prev,
      [season]: !prev[season]
    }));
  };

  const episodesBySeason = episodes.reduce((acc, episode) => {
    if (!acc[episode.season]) {
      acc[episode.season] = [];
    }
    acc[episode.season].push(episode);
    return acc;
  }, {});

  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);

  const isReleased = (episode) => {
    if (!episode?.airdate) return false;
    try {
      const epDate = new Date(episode.airdate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return epDate <= today;
    } catch (e) {
      return false;
    }
  };

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
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to Shows</span>
        </button>
      </div>

      <div 
        className="w-full bg-gradient-to-r from-indigo-700 to-indigo-900 py-12 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="bg-white shadow rounded-lg p-4 md:p-6">
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
          <div className="bg-white shadow rounded-lg p-4 md:p-6">
            {episodes.length > 0 ? (
              <div>
                {seasons.map((season) => {
                  const seasonEpisodes = episodesBySeason[season];
                  const isSeasonWatched = seasonEpisodes.every(ep => ep.watched);
                  const canMarkAll = seasonEpisodes.some(ep => !ep.watched);
                  return (
                     <div key={season} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                       <div 
                         className="bg-gray-100 p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer gap-2 md:gap-0"
                         onClick={() => toggleSeasonExpanded(season)}
                       >
                         <div className="flex items-center">
                           <h3 className="text-base md:text-lg font-medium">Season {season}</h3>
                           <div className="ml-3 md:ml-4 text-xs md:text-sm text-gray-500">
                             {seasonEpisodes.length} episodes
                           </div>
                           <div className="ml-3 md:ml-4">
                             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isSeasonWatched ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                               {seasonEpisodes.filter(ep => ep.watched).length}/{seasonEpisodes.length} watched
                             </span>
                           </div>
                         </div>
                         <div className="flex items-center self-end md:self-center">
                           {canMarkAll && (
                             <button
                               onClick={(e) => { e.stopPropagation(); handleMarkSeasonWatched(season); }}
                               className="mr-2 md:mr-4 text-xs md:text-sm text-indigo-600 hover:text-indigo-800"
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
                         <div>
                           <div className="hidden md:block divide-y divide-gray-200">
                             {seasonEpisodes.map((episode) => (
                               <div key={episode.id} className="px-4 py-3 flex items-center">
                                 <button
                                   onClick={() => handleToggleEpisodeWatched(episode.id)}
                                   className={`mr-3 flex-shrink-0 ${episode.watched ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                                 >
                                   {episode.watched ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                 </button>
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-baseline">
                                     <span className="text-gray-500 text-sm mr-2 w-10 text-right">E{episode.number}</span>
                                     <h4 className="font-medium text-sm truncate" title={episode.name}>{episode.name}</h4>
                                   </div>
                                 </div>
                                 <div className="ml-4 text-sm text-gray-500 w-28 text-right">
                                     {episode.airdate || '-'} 
                                 </div>
                               </div>
                             ))}
                           </div>

                           <div className="block md:hidden divide-y divide-gray-100">
                               <AnimatePresence>
                                  {seasonEpisodes.map((episode) => {
                                     const released = isReleased(episode);
                                     return (
                                        <motion.div
                                           key={episode.id}
                                           layout
                                           initial={{ opacity: 0, height: 0 }}
                                           animate={{ opacity: 1, height: 'auto' }}
                                           exit={{ opacity: 0, height: 0 }}
                                           transition={{ duration: 0.2 }}
                                           className={`p-3 flex items-start ${episode.watched ? 'bg-green-50' : 'bg-white'}`}
                                         >
                                          <button
                                            onClick={() => handleToggleEpisodeWatched(episode.id)}
                                            className={`mr-3 mt-1 flex-shrink-0 ${episode.watched ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                                          >
                                            {episode.watched ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                          </button>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 leading-snug">{episode.name}</p>
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                               <span>E{episode.number}</span>
                                               {episode.airdate && <span><Calendar className="h-3 w-3 inline mr-0.5" /> {episode.airdate}</span>}
                                               {episode.runtime && <span><Clock className="h-3 w-3 inline mr-0.5" /> {episode.runtime}m</span>}
                                            </div>
                                          </div>
                                         </motion.div>
                                     );
                                  })}
                               </AnimatePresence>
                           </div>
                         </div>
                       )}
                     </div>
                  );
                })}
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