import React, { createContext, useState, useEffect, useCallback } from 'react';

// Create the context
export const AuthContext = createContext({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // Add loading state for initial check
  login: (userData, token) => {},
  logout: () => {},
});

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading

  // Function to handle login
  const login = useCallback((userData, receivedToken) => {
    setToken(receivedToken);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', receivedToken);
    // Optionally store user data in localStorage too, but be mindful of size/sensitivity
    localStorage.setItem('authUser', JSON.stringify(userData));
    console.log('AuthContext: User logged in', userData);
  }, []);

  // Function to handle logout
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    console.log('AuthContext: User logged out');
    // TODO: Redirect to login page or home page after logout?
  }, []);

  // Effect to check for existing token on initial load
  useEffect(() => {
    console.log('AuthContext: Checking for existing token...');
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      console.log('AuthContext: Found token in storage.');
      // TODO: Optionally verify the token with the backend here
      // For now, assume the stored token is valid if present
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