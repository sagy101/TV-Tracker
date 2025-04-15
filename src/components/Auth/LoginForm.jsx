import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust path if needed

function LoginForm() {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Email validation function
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle email change with validation
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Only show validation error if there's actually input (avoid showing error for empty field)
    setIsEmailValid(newEmail === '' || validateEmail(newEmail));
    setError('');
  };

  // Validate email on blur to ensure validation happens if user tabs away
  const handleEmailBlur = () => {
    if (email !== '') {
      setIsEmailValid(validateEmail(email));
    }
  };

  // TODO: Move API call logic to a shared service file
  const apiCall = async (endpoint, method, body) => {
    try {
      const response = await fetch(`/api/auth/${endpoint}`, { // Uses proxy
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!validateEmail(email)) {
      setIsEmailValid(false);
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Include rememberMe in the login request
      const data = await apiCall('login', 'POST', { email, password, rememberMe });
      console.log('Login successful:', data);

      // Use the login function from AuthContext
      login(data.user, data.token, rememberMe);

      // Redirect to dashboard or shows page
      navigate('/shows'); // Or maybe navigate(-1) to go back?

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
    // No finally block needed if navigation happens on success
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className={`relative rounded-md border ${!isEmailValid ? 'border-red-500' : 'border-gray-300'} px-3 py-3 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600`}>
          <label htmlFor="login-email" className={`absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium ${!isEmailValid ? 'text-red-500' : 'text-gray-900'}`}>
            Email
          </label>
          <input
            type="email"
            id="login-email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            required
            disabled={isLoading}
            placeholder="you@example.com"
            className={`block w-full border-0 p-0 ${!isEmailValid ? 'text-red-500 placeholder-red-300' : 'text-gray-900 placeholder-gray-400'} focus:ring-0 focus:outline-none sm:text-sm`}
          />
        </div>
        {!isEmailValid && (
          <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
        )}
      </div>

      <div className="mt-4">
        <div className="relative rounded-md border border-gray-300 px-3 py-3 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
          <label htmlFor="login-password" className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-gray-900">
            Password
          </label>
          <input
            type="password"
            id="login-password"
            name="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            required
            disabled={isLoading}
            className="block w-full border-0 p-0 text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none sm:text-sm"
          />
        </div>
      </div>

      <div className="mt-4 text-sm">
        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
          Forgot password?
        </a>
      </div>

      <div className="mt-4 flex items-center">
        <input
          id="remember_me"
          name="remember_me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
          Stay signed in
        </label>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isLoading || (!isEmailValid && email !== '')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}

export default LoginForm; 