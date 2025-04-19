import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Calendar, ChevronLeft, ChevronRight, Eye, EyeOff, Clock, Info, Tv, CheckCircle, Circle, Star, Tag } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, differenceInCalendarDays, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Modal component for showing all recent unwatched episodes
const FullEpisodeListModal = ({ isOpen, onClose, episodes, shows, onToggleWatched, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-4 max-h-96 overflow-y-auto">
                  <ul className="space-y-2">
                    {episodes.map(episode => {
                      const show = shows.find(s => s.tvMazeId === episode.showId);
                      return (
                        <li 
                          key={episode.id}
                          className="p-3 rounded-md bg-yellow-50 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{show?.name}</p>
                            <p className="text-sm text-gray-600">
                              S{episode.season}E{episode.number} - {episode.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Aired {format(parseISO(episode.airdate), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <button
                            onClick={() => onToggleWatched(episode.id)}
                            className="p-2 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          >
                            <Circle className="h-5 w-5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function UserHomePage({ episodes = [], shows = [], onToggleWatched, isReleased }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showIgnoredShows, setShowIgnoredShows] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMoreRecent, setShowMoreRecent] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [stats, setStats] = useState({
    totalShows: 0,
    watchedEpisodes: 0,
    totalEpisodes: 0,
    totalWatchTime: 0,
    upcomingEpisodes: 0
  });

  // Apply filters for shows using useMemo to avoid recreation on every render
  const filteredShows = useMemo(() => {
    return shows.filter(show => {
      if (!showIgnoredShows && show.ignored) return false;
      return true;
    });
  }, [shows, showIgnoredShows]);

  // Get episodes that belong to filtered shows using useMemo
  const filteredEpisodes = useMemo(() => {
    return episodes.filter(episode => {
      const show = shows.find(s => s.tvMazeId === episode.showId);
      if (!show) return false;
      if (!showIgnoredShows && show.ignored) return false;
      return true;
    });
  }, [episodes, shows, showIgnoredShows]);

  // Calculate stats
  useEffect(() => {
    const watchedEpisodes = filteredEpisodes.filter(ep => ep.watched).length;
    const totalWatchTime = watchedEpisodes * 42; // Assuming 42 minutes per episode
    const upcomingEpisodes = filteredEpisodes.filter(ep => {
      const epDate = parseISO(ep.airdate);
      const today = new Date();
      return epDate > today && !ep.watched;
    }).length;

    setStats({
      totalShows: filteredShows.length,
      watchedEpisodes,
      totalEpisodes: filteredEpisodes.length,
      totalWatchTime,
      upcomingEpisodes
    });
  }, [filteredEpisodes, filteredShows]);

  // Calendar navigation
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Get days for the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get episodes for each day
  const getEpisodesForDay = (day) => {
    return filteredEpisodes.filter(episode => {
      try {
        const epDate = parseISO(episode.airdate);
        return isSameDay(epDate, day);
      } catch (error) {
        return false;
      }
    });
  };

  // Get all episodes from the past 30 days that are unwatched
  const recentUnwatchedEpisodes = filteredEpisodes.filter(episode => {
    try {
      const epDate = parseISO(episode.airdate);
      const today = new Date();
      const daysDifference = differenceInCalendarDays(today, epDate);
      return daysDifference <= 30 && daysDifference >= 0 && !episode.watched && isReleased(episode);
    } catch (error) {
      return false;
    }
  }).sort((a, b) => parseISO(b.airdate) - parseISO(a.airdate));

  // Get all episodes in the next 30 days
  const upcomingEpisodes = filteredEpisodes.filter(episode => {
    try {
      const epDate = parseISO(episode.airdate);
      const today = new Date();
      const daysDifference = differenceInCalendarDays(epDate, today);
      return daysDifference <= 30 && daysDifference >= 0;
    } catch (error) {
      return false;
    }
  }).sort((a, b) => parseISO(a.airdate) - parseISO(b.airdate));

  // Handle day selection
  const handleSelectDay = (day) => {
    setSelectedDate(isSameDay(day, selectedDate) ? null : day);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Your personalized TV show tracking overview</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowIgnoredShows(!showIgnoredShows)}
              className={`mt-4 sm:mt-0 self-start sm:self-center flex items-center gap-2 p-2 rounded-md transition-colors duration-200 border ${
                showIgnoredShows
                  ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200'
              }`}
              title={showIgnoredShows ? "Hide Ignored Shows" : "Show Ignored Shows"}
            >
              {showIgnoredShows ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              <span className="text-sm">{showIgnoredShows ? "Including Ignored Shows" : "Excluding Ignored Shows"}</span>
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <Tv className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Shows</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalShows}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Episodes Watched</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.watchedEpisodes}/{stats.totalEpisodes}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-500">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Watch Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.floor(stats.totalWatchTime / 60)}h {stats.totalWatchTime % 60}m
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Upcoming Episodes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingEpisodes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Calendar */}
          <div className="w-full lg:w-7/12">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Episode Calendar</h2>
                <div className="flex space-x-2">
                  <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <h3 className="text-lg font-medium text-gray-700">
                    {format(currentDate, 'MMMM yyyy')}
                  </h3>
                  <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {/* Fill in empty cells before the first day of the month */}
                {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="h-24 p-1 text-center text-sm text-gray-300"></div>
                ))}
                
                {/* Calendar days */}
                {daysInMonth.map(day => {
                  const dayEpisodes = getEpisodesForDay(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleSelectDay(day)}
                      className={`h-24 p-1 border rounded-md cursor-pointer overflow-hidden transition-colors duration-200 ${
                        isToday ? 'bg-blue-50 border-blue-400 border-2' :
                        isSelected ? 'bg-indigo-100 border-indigo-500 border-2' :
                        'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-right text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="overflow-y-auto max-h-16">
                        {dayEpisodes.slice(0, 3).map(episode => {
                          const show = shows.find(s => s.tvMazeId === episode.showId);
                          return (
                            <div
                              key={episode.id}
                              className={`text-xs p-1 mb-1 rounded truncate ${
                                episode.watched ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                              title={`${show?.name} - S${episode.season}E${episode.number}: ${episode.name}`}
                            >
                              {show?.name} - S{episode.season}E{episode.number}
                            </div>
                          );
                        })}
                        {dayEpisodes.length > 3 && (
                          <div className="text-xs text-center text-gray-500">
                            +{dayEpisodes.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Fill in empty cells after the last day of the month */}
                {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                  <div key={`empty-end-${index}`} className="h-24 p-1 text-center text-sm text-gray-300"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar with episode lists */}
          <div className="w-full lg:w-5/12">
            {/* Selected day details */}
            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white shadow rounded-lg p-6 mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Episodes on {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  
                  {getEpisodesForDay(selectedDate).length === 0 ? (
                    <p className="text-gray-500 text-sm">No episodes on this day.</p>
                  ) : (
                    <ul className="space-y-2">
                      {getEpisodesForDay(selectedDate).map(episode => {
                        const show = shows.find(s => s.tvMazeId === episode.showId);
                        return (
                          <li 
                            key={episode.id}
                            className={`p-3 rounded-md flex items-center justify-between ${
                              episode.watched ? 'bg-green-50' : 'bg-yellow-50'
                            }`}
                          >
                            <div>
                              <p className="font-medium">{show?.name}</p>
                              <p className="text-sm text-gray-600">
                                S{episode.season}E{episode.number} - {episode.name}
                              </p>
                            </div>
                            <button
                              onClick={() => onToggleWatched(episode.id)}
                              className={`p-2 rounded-full ${
                                episode.watched 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              }`}
                            >
                              {episode.watched ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent unwatched episodes */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recently Aired (Unwatched)
              </h3>
              
              {recentUnwatchedEpisodes.length === 0 ? (
                <p className="text-gray-500 text-sm">No unwatched episodes from the past 30 days.</p>
              ) : (
                <ul className="space-y-2">
                  {recentUnwatchedEpisodes.slice(0, 5).map(episode => {
                    const show = shows.find(s => s.tvMazeId === episode.showId);
                    return (
                      <li 
                        key={episode.id}
                        className="p-3 rounded-md bg-yellow-50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{show?.name}</p>
                          <p className="text-sm text-gray-600">
                            S{episode.season}E{episode.number} - {episode.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Aired {format(parseISO(episode.airdate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <button
                          onClick={() => onToggleWatched(episode.id)}
                          className="p-2 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        >
                          <Circle className="h-5 w-5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              
              {recentUnwatchedEpisodes.length > 5 && (
                <div className="mt-3 text-center">
                  <button onClick={() => setShowMoreRecent(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    View {recentUnwatchedEpisodes.length - 5} more episodes
                  </button>
                </div>
              )}
            </div>

            {/* Upcoming episodes */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Coming Soon
              </h3>
              
              {upcomingEpisodes.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming episodes in the next 30 days.</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingEpisodes.slice(0, 5).map(episode => {
                    const show = shows.find(s => s.tvMazeId === episode.showId);
                    const daysUntil = differenceInCalendarDays(parseISO(episode.airdate), new Date());
                    return (
                      <li 
                        key={episode.id}
                        className="p-3 rounded-md bg-blue-50 flex items-start justify-between"
                      >
                        <div>
                          <p className="font-medium">{show?.name}</p>
                          <p className="text-sm text-gray-600">
                            S{episode.season}E{episode.number} - {episode.name}
                          </p>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-right text-gray-500 flex-shrink-0">
                          {format(parseISO(episode.airdate), 'MMM d, yyyy')}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              
              {upcomingEpisodes.length > 5 && (
                <div className="mt-3 text-center">
                  <button onClick={() => setShowAllUpcoming(true)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    View {upcomingEpisodes.length - 5} more episodes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>

            {/* Genre-based Recommendations */}
            <div>
              <div className="flex items-center mb-4">
                <Tag className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Based on Your Favorite Genres</h3>
              </div>

              {filteredShows.length === 0 ? (
                <p className="text-gray-500">Add more shows to get personalized recommendations.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Filter to exclude shows that are already in the user's shows */}
                  {filteredShows
                    .filter(show => !shows.some(userShow => userShow.tvMazeId === show.tvMazeId))
                    .filter(show => !show.ignored)
                    .filter(show => show.genres && show.genres.length > 0)
                    .sort((a, b) => {
                      // First sort by genres that match watched shows
                      const watchedShowGenres = new Set();
                      filteredShows
                        .filter(s => episodes.some(e => e.showId === s.tvMazeId && e.watched))
                        .forEach(s => {
                          if (s.genres) s.genres.forEach(g => watchedShowGenres.add(g));
                        });
                        
                      const aMatchCount = a.genres.filter(g => watchedShowGenres.has(g)).length;
                      const bMatchCount = b.genres.filter(g => watchedShowGenres.has(g)).length;
                      
                      if (aMatchCount !== bMatchCount) return bMatchCount - aMatchCount;
                      
                      // Then by popularity
                      return (b.popularity || 0) - (a.popularity || 0);
                    })
                    .slice(0, 4)
                    .map(show => (
                      <Link
                        key={show.tvMazeId}
                        to={`/shows/${show.tvMazeId}`}
                        className="bg-indigo-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div>
                          <div className="h-40 bg-indigo-200 relative">
                            {show.image ? (
                              <img 
                                src={show.image} 
                                alt={show.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-indigo-100">
                                <Tv className="h-12 w-12 text-indigo-300" />
                              </div>
                            )}
                            
                            {show.genres && show.genres.length > 0 && (
                              <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                                {show.genres.slice(0, 2).map(genre => (
                                  <span 
                                    key={genre} 
                                    className="px-2 py-1 bg-indigo-600 bg-opacity-80 rounded text-xs font-medium text-white"
                                  >
                                    {genre}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium text-indigo-900 truncate">{show.name}</h4>
                            
                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-xs text-indigo-700">
                                {show.status}
                              </div>
                              {show.rating && show.rating.average && (
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                  <span className="text-xs font-medium">{show.rating.average}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FullEpisodeListModal
        isOpen={showMoreRecent}
        onClose={() => setShowMoreRecent(false)}
        episodes={recentUnwatchedEpisodes}
        shows={shows}
        onToggleWatched={onToggleWatched}
        title="Recently Aired Episodes (Unwatched)"
      />

      <FullEpisodeListModal
        isOpen={showAllUpcoming}
        onClose={() => setShowAllUpcoming(false)}
        episodes={upcomingEpisodes}
        shows={shows}
        onToggleWatched={onToggleWatched}
        title="Upcoming Episodes"
      />
    </div>
  );
}

UserHomePage.propTypes = {
  episodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      showId: PropTypes.string.isRequired,
      season: PropTypes.number.isRequired,
      number: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      airdate: PropTypes.string.isRequired,
      watched: PropTypes.bool.isRequired
    })
  ),
  shows: PropTypes.arrayOf(
    PropTypes.shape({
      tvMazeId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.string,
      ignored: PropTypes.bool
    })
  ),
  onToggleWatched: PropTypes.func.isRequired,
  isReleased: PropTypes.func.isRequired
};

export default UserHomePage; 