import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tv, List, Calendar, User, Shield, Sparkles, PaintBucket, TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';

function HomePage() {
  const [trendingShows, setTrendingShows] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch trending shows when component mounts
  useEffect(() => {
    const fetchTrendingShows = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shows?sort=popularity');
        
        if (!response.ok) {
          throw new Error('Failed to fetch trending shows');
        }
        
        const shows = await response.json();
        // Keep all fetched shows for desktop, slice later for mobile
        setTrendingShows(shows);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending shows:', error);
        setLoading(false);
      }
    };
    
    fetchTrendingShows();
  }, []);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section (Adjust padding/text size for mobile) */}
      <div className="pt-12 md:pt-16 pb-16 md:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Track Your TV Shows <span className="text-indigo-600">Effortlessly</span>
            </h1>
            <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-500">
              Never miss an episode again. Keep track of what you've watched and discover new shows.
            </p>
          </motion.div>

          <motion.div 
            className="mt-8 md:mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link 
              to="/login" 
              className="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 border border-transparent text-sm md:text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Trending Shows Section (Adjust grid and slicing for mobile) */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-indigo-600 mr-2 md:mr-3" />
                <span>Trending Shows</span>
              </h2>
              <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-base md:text-xl text-gray-500">
                Popular shows being tracked by our community.
              </p>
            </motion.div>
          </div>

          <div className="mt-8 md:mt-10">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : trendingShows.length > 0 ? (
              <motion.div 
                // Responsive grid: 1 col mobile, 2 sm, 3 lg
                className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Slice shows: 4 on mobile/sm, 6 on lg+ */}
                {trendingShows.slice(0, window.innerWidth < 1024 ? 4 : 6).map((show) => (
                  <motion.div key={show.tvMazeId} className="group" variants={itemVariants}>
                    {/* Show Card - Adjusted height/padding slightly */}
                    <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="h-40 sm:h-48 w-full bg-gray-200 relative">
                        {show.image ? (
                          <img src={show.image} alt={show.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tv className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
                          </div>
                        )}
                        {/* Genre tags (keep as is, looks okay) */}
                        {show.genres && show.genres.length > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 md:p-3">
                            <div className="flex flex-wrap gap-1">
                              {show.genres.slice(0, 2).map(genre => ( /* Show only 2 genres max */
                                <span key={genre} className="px-1.5 md:px-2 py-0.5 md:py-1 bg-indigo-600 bg-opacity-80 rounded text-[10px] md:text-xs font-medium text-white">
                                  {genre}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 truncate" title={show.name}>{show.name}</h3>
                        <div className="flex items-center justify-between text-xs md:text-sm">
                          <span className="text-gray-500">{show.status}</span>
                          {show.rating?.average && (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 mr-1" />
                              <span className="font-medium text-gray-700">{show.rating.average}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-center text-gray-500">No trending shows available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Features Section (Adjust grid gap and text size) */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Everything you need</h2>
            <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-base md:text-xl text-gray-500">Designed for TV enthusiasts</p>
          </motion.div>

          <motion.div 
            className="mt-10 md:mt-12 grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Feature Cards - Adjust padding/text size */}
            <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4 md:p-6 shadow-sm">
              <div className="rounded-full bg-indigo-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-3 md:mb-4">
                <Tv className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900">Show Management</h3>
              <p className="mt-2 text-sm md:text-base text-gray-500">Track shows, progress, and time-spent stats.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4 md:p-6 shadow-sm">
              <div className="rounded-full bg-indigo-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-3 md:mb-4">
                <List className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900">Episode Tracking</h3>
              <p className="mt-2 text-sm md:text-base text-gray-500">Mark episodes as watched and keep track of your progress with color-coded status indicators.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4 md:p-6 shadow-sm">
              <div className="rounded-full bg-indigo-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-3 md:mb-4">
                <User className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900">User Authentication</h3>
              <p className="mt-2 text-sm md:text-base text-gray-500">Secure signup with email verification and modern login interface with persistent sessions.</p>
            </motion.div>

            {/* Planned Features */}
            <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-amber-400">
              <div className="flex justify-between items-start">
                <div className="rounded-full bg-indigo-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-3 md:mb-4">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Planned</span>
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900">Release Calendar</h3>
              <p className="mt-2 text-sm md:text-base text-gray-500">Visual calendar display of upcoming episode air dates with month, week, and day view options.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-amber-400">
              <div className="flex justify-between items-start">
                <div className="rounded-full bg-indigo-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-3 md:mb-4">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Planned</span>
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900">AI Show Assistant</h3>
              <p className="mt-2 text-sm md:text-base text-gray-500">Personalized show recommendations based on your watching history and viewing pattern analysis.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4 md:p-6 shadow-sm border-l-4 border-amber-400">
              <div className="flex justify-between items-start">
                <div className="rounded-full bg-indigo-100 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mb-3 md:mb-4">
                  <PaintBucket className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Planned</span>
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900">Visual Customization</h3>
              <p className="mt-2 text-sm md:text-base text-gray-500">Dark mode, user-defined UI color schemes, and visual density controls for a personalized experience.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* About Project Section (Adjust text size) */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">About This Project</h2>
            <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-base md:text-lg text-gray-500">
              TrackTV is a comprehensive solution for TV show tracking.
            </p>
          </div>
          
          <div className="mt-10 md:mt-12 bg-white rounded-lg shadow-sm p-4 md:p-6">
             <div className="prose prose-sm md:prose-base prose-indigo max-w-none">
               <h3 className="text-xl font-semibold text-gray-900 mb-3">Technology Stack</h3>
               <div className="flex flex-wrap gap-3 mb-8">
                 <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium shadow-sm">React</span>
                 <span className="px-4 py-2 bg-green-50 text-green-700 rounded-md text-sm font-medium shadow-sm">Node.js</span>
                 <span className="px-4 py-2 bg-gray-50 text-gray-700 rounded-md text-sm font-medium shadow-sm">Express</span>
                 <span className="px-4 py-2 bg-green-50 text-green-700 rounded-md text-sm font-medium shadow-sm">MongoDB</span>
                 <span className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-md text-sm font-medium shadow-sm">Tailwind CSS</span>
                 <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium shadow-sm">Framer Motion</span>
                 <span className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md text-sm font-medium shadow-sm">JWT Auth</span>
                 <span className="px-4 py-2 bg-red-50 text-red-700 rounded-md text-sm font-medium shadow-sm">TVMaze API</span>
                 <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-md text-sm font-medium shadow-sm">Axios</span>
               </div>
               
               <h3 className="text-xl font-semibold text-gray-900 mb-3">Development</h3>
               <p className="text-gray-600">
                 This is an open-source project designed to showcase modern web development practices. 
                 The project is maintained by a community of developers dedicated to creating useful, 
                 accessible tools for TV enthusiasts.
               </p>
               
               <div className="mt-6 flex justify-center">
                 <a 
                   href="https://github.com/sagy101/TV-Tracker" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700"
                 >
                   <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                     <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                   </svg>
                   GitHub
                 </a>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Footer (Adjust padding) */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} TV Tracker. All rights reserved.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="https://github.com/sagy101/TV-Tracker" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage; 