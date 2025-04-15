import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // Loading state for verification
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Too weak', color: 'bg-red-500' });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isSignUpDisabled, setIsSignUpDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Loading state for signup
  const [error, setError] = useState(''); // General form error
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // TODO: Access login function from AuthContext if used
  // const { login } = useContext(AuthContext);

  // --- Email Validation ---
  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle email change with validation
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Clear any previous errors
    setError('');
  };

  // Validate email on blur to ensure validation happens if user tabs away
  const handleEmailBlur = () => {
    if (email !== '' && !isEmailValid(email)) {
      setError('Please enter a valid email address.');
    }
  };

  // --- Password Strength Calculation ---
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: 'Too weak', color: 'bg-red-500' };

    if (password.length >= 8) score++;
    if (password.length >= 12) score++; // Bonus for length
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++; // Special character

    let label = 'Too weak';
    let color = 'bg-red-500';
    if (score >= 5) { label = 'Very Good'; color = 'bg-green-500'; }
    else if (score >= 4) { label = 'Good'; color = 'bg-yellow-500'; }
    else if (score === 3) { label = 'Average'; color = 'bg-orange-500'; }

    return { score, label, color };
  };

  // --- Effects ---
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
    setPasswordsMatch(password === confirmPassword || confirmPassword === '');
  }, [password, confirmPassword]);

  useEffect(() => {
    // Enable sign up only when email is verified, passwords match and meet minimum strength
    setIsSignUpDisabled(
      !isEmailVerified ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword ||
      passwordStrength.score < 3 // Require at least 'Average' strength
    );
  }, [isEmailVerified, password, confirmPassword, passwordStrength, passwordsMatch]);

  // --- API Service ---
  // Consider moving API calls to a dedicated service file (e.g., src/services/authService.js)
  const apiCall = async (endpoint, method, body) => {
    try {
      const response = await fetch(`/api/auth/${endpoint}`, { // Uses proxy defined in package.json
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error; // Re-throw to be caught by handlers
    }
  };

  // --- Handlers ---
  const handleSendVerification = async (e) => {
    e.preventDefault();
    if (!isEmailValid(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    setVerificationError('');
    try {
      await apiCall('send-verification', 'POST', { email });
      setIsVerificationSent(true);
      // Don't set verified yet, wait for code input
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (enteredCode) => {
    // This function is called when code reaches 5 digits
    setVerificationCode(enteredCode);
    setVerificationError('');

    if (enteredCode.length === 5) {
      setIsVerifying(true);
      try {
        await apiCall('verify-email', 'POST', { email, verificationCode: enteredCode });
        setIsEmailVerified(true);
        setVerificationError(''); // Clear error on success
      } catch (err) {
        setIsEmailVerified(false);
        // Use the error message from the backend
        setVerificationError(err.message || 'Verification failed.');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (isSignUpDisabled || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await apiCall('signup', 'POST', { email, password, confirmPassword });

      console.log('Sign up successful:', data);

      // Call login from context to update global state and store token
      login(data.user, data.token);

      // Redirect to the shows page (or dashboard)
      navigate('/shows');

    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
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

      {/* Email Section */}
      <div>
        <div className={`relative rounded-md border ${email && !isEmailValid(email) ? 'border-red-500' : 'border-gray-300'} px-3 py-3 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600`}>
          <label htmlFor="email" className={`absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium ${email && !isEmailValid(email) ? 'text-red-500' : 'text-gray-900'}`}>
            Email Address
          </label>
          <div className="flex">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              required
              disabled={isVerificationSent || isLoading}
              placeholder="you@example.com"
              className={`block w-full border-0 p-0 ${email && !isEmailValid(email) ? 'text-red-500 placeholder-red-300' : 'text-gray-900 placeholder-gray-400'} focus:ring-0 focus:outline-none sm:text-sm disabled:text-gray-500`}
            />
            {!isVerificationSent && (
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={!isEmailValid(email) || isLoading}
                className="ml-2 inline-flex items-center px-3 py-1 border border-gray-300 text-xs rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
              >
                {isLoading && !isVerificationSent ? 'Sending...' : 'Verify'}
              </button>
            )}
          </div>
        </div>
        
        {email && !isEmailValid(email) && !error && (
          <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
        )}
        
        {isVerificationSent && !isEmailVerified && (
          <div className="mt-3">
            <div className="relative rounded-md border border-gray-300 px-3 py-3 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
              <label className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-gray-900">
                Verification Code
              </label>
              <input
                type="text"
                maxLength="5"
                placeholder="Enter 5-digit code"
                value={verificationCode}
                onChange={(e) => handleVerifyCode(e.target.value)}
                disabled={isVerifying || isLoading}
                className="block w-full border-0 p-0 text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none sm:text-sm tracking-wider font-mono disabled:text-gray-500"
                aria-label="Email verification code"
                aria-invalid={!!verificationError}
              />
            </div>
            {verificationError && (
              <p className="mt-1 text-sm text-red-600">{verificationError}</p>
            )}
          </div>
        )}
        
        {isEmailVerified && (
          <div className="mt-2 flex items-center">
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-sm text-green-700">Email verified</span>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="mt-4">
        <div className="relative rounded-md border border-gray-300 px-3 py-3 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
          <label htmlFor="password" className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-gray-900">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full border-0 p-0 text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none sm:text-sm"
          />
        </div>
        
        {/* Password Strength Meter */}
        {password && (
          <div className="mt-1">
            <div className="h-1.5 w-full bg-gray-200 rounded">
              <div
                className={`h-full rounded ${passwordStrength.color}`}
                style={{ width: `${passwordStrength.score * 20}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1 text-gray-500">Strength: {passwordStrength.label}</p>
          </div>
        )}
      </div>

      {/* Confirm Password Section */}
      <div className="mt-4">
        <div className="relative rounded-md border border-gray-300 px-3 py-3 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
          <label htmlFor="confirmPassword" className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-gray-900">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`block w-full border-0 p-0 text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none sm:text-sm ${!passwordsMatch && confirmPassword ? 'text-red-500' : ''}`}
          />
        </div>
        {!passwordsMatch && confirmPassword && (
          <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
        )}
      </div>

      {/* Sign Up Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSignUpDisabled || isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  );
}

export default SignUpForm; 