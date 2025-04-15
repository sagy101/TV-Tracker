import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create the context
export const AuthContext = createContext({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // Add loading state for initial check
  login: (userData, token, rememberMe) => {},
  logout: () => {},
});

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading

  // Function to handle login
  const login = useCallback((userData, receivedToken, rememberMe = false) => {
    setToken(receivedToken);
    setUser(userData);
    setIsAuthenticated(true);
    
    if (rememberMe) {
      // If rememberMe is true, store in localStorage (persists between sessions)
      localStorage.setItem('authToken', receivedToken);
      localStorage.setItem('authUser', JSON.stringify(userData));
      console.log('AuthContext: User logged in with "Remember Me"', userData);
    } else {
      // If rememberMe is false, store in sessionStorage (cleared when tab/browser closes)
      sessionStorage.setItem('authToken', receivedToken);
      sessionStorage.setItem('authUser', JSON.stringify(userData));
      console.log('AuthContext: User logged in for this session only', userData);
    }
  }, []);

  // Function to handle logout
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // Clear both storage types
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
    console.log('AuthContext: User logged out');
    // TODO: Redirect to login page or home page after logout?
  }, []);

  // Effect to check for existing token on initial load
  useEffect(() => {
    console.log('AuthContext: Checking for existing token...');
    
    // First check localStorage (persisted login)
    let storedToken = localStorage.getItem('authToken');
    let storedUser = localStorage.getItem('authUser');
    let isPersisted = true;
    
    // If not in localStorage, check sessionStorage (session-only login)
    if (!storedToken || !storedUser) {
      storedToken = sessionStorage.getItem('authToken');
      storedUser = sessionStorage.getItem('authUser');
      isPersisted = false;
    }

    if (storedToken && storedUser) {
      console.log(`AuthContext: Found token in ${isPersisted ? 'localStorage' : 'sessionStorage'}.`);
      // TODO: Optionally verify the token with the backend here
      try {
         const parsedUser = JSON.parse(storedUser);
         setToken(storedToken);
         setUser(parsedUser);
         setIsAuthenticated(true);
         console.log('AuthContext: Restored session from storage.');
      } catch (error) {
          console.error('AuthContext: Failed to parse stored user data.', error);
          // Clear potentially corrupted storage
          logout();
      }
    } else {
        console.log('AuthContext: No token found in storage.');
    }
    setIsLoading(false); // Finished initial loading check
  }, [logout]); // Include logout in dependency array as it's used indirectly

  // Value provided by the context
  const contextValue = {
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 