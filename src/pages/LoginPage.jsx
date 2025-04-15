import React, { useState } from 'react';
import SignUpForm from '../components/Auth/SignUpForm';
import LoginForm from '../components/Auth/LoginForm';
import { motion, AnimatePresence } from 'framer-motion';

function LoginPage() {
  const [showLogin, setShowLogin] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const formVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 250 : -250,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 250 : -250,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 }
      }
    })
  };

  // Direction of animation (1 for right, -1 for left)
  const direction = showLogin ? -1 : 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 3H4C2.89543 3 2 3.89543 2 5V17C2 18.1046 2.89543 19 4 19H5V21L9 19H20C21.1046 19 22 18.1046 22 17V5C22 3.89543 21.1046 3 20 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">TVTracker</span>
            </div>
          </div>
          
          <motion.h2 
            className="text-center text-2xl font-normal text-gray-900 mb-4"
            key={showLogin ? "login-title" : "signup-title"}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {showLogin ? 'Sign in' : 'Create your account'}
          </motion.h2>

          <div className="relative" style={{ minHeight: showLogin ? '300px' : '360px' }}>
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={showLogin ? "login" : "signup"}
                custom={direction}
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute w-full"
              >
                {showLogin ? <LoginForm /> : <SignUpForm />}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="mt-4 text-center text-sm">
            <AnimatePresence>
              <motion.div
                key={showLogin ? "to-signup" : "to-login"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {showLogin ? (
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setShowLogin(false)} 
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Create account
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <button 
                      onClick={() => setShowLogin(true)} 
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <a href="https://github.com/sagy101/TV-Tracker/blob/master/docs/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">Contribute</a>
            <a href="https://github.com/sagy101/TV-Tracker" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">GitHub</a>
            <a 
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-indigo-600"
            >
              Secret Features
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 