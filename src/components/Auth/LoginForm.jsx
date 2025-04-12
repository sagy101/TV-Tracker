import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust path if needed

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

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

    setIsLoading(true);
    setError('');

    try {
      // TODO: Create the /login endpoint on the backend
      const data = await apiCall('login', 'POST', { email, password });
      console.log('Login successful:', data);

      // Use the login function from AuthContext
      login(data.user, data.token);

      // Redirect to dashboard or shows page
      navigate('/shows'); // Or maybe navigate(-1) to go back?

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
    // No finally block needed if navigation happens on success
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          id="login-email"
          name="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          required
          disabled={isLoading}
          placeholder="you@example.com"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
        />
      </div>

      <div>
        <label htmlFor="login-password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="login-password"
          name="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          required
          disabled={isLoading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
        />
        {/* TODO: Add Forgot Password link? */}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging In...' : 'Login'}
        </button>
      </div>

       {/* Link to Sign Up (Optional, could be handled by LoginPage) */}
      {/* <div className="text-sm text-center">
        <p>Don't have an account? <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</Link></p>
      </div> */}
    </form>
  );
}

export default LoginForm; 