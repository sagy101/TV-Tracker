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
    <form onSubmit={handleSignUp} className="space-y-4 max-w-md mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-center">Create Account</h2>

      {/* General Error Display */}
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      {/* Email Section */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            required
            disabled={isVerificationSent || isLoading}
            placeholder="you@example.com"
            className={`flex-1 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
            aria-describedby="email-verification-status"
          />
          {!isVerificationSent && (
            <button
              type="button"
              onClick={handleSendVerification}
              disabled={!isEmailValid(email) || isLoading}
              className="relative inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              {isLoading && !isVerificationSent ? 'Sending...' : 'Verify Email'}
            </button>
          )}
          {isVerificationSent && !isEmailVerified && (
             <input
               type="text"
               maxLength="5"
               placeholder="_ _ _ _ _"
               value={verificationCode}
               onChange={(e) => handleVerifyCode(e.target.value)}
               disabled={isVerifying || isLoading}
               className={`w-28 text-center px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white text-gray-900 text-sm focus:ring-indigo-500 focus:border-indigo-500 tracking-[0.3em] font-mono disabled:bg-gray-100 ${verificationError ? 'border-red-500' : ''}`}
               aria-label="Email verification code"
               aria-invalid={!!verificationError}
             />
          )}
           {isEmailVerified && (
             <span id="email-verification-status" className="inline-flex items-center px-3 py-2 border border-l-0 border-green-300 rounded-r-md bg-green-100 text-green-700 text-sm font-medium">
               Verified ✓
             </span>
          )}
        </div>
         {/* Verification Status/Error */}
         {isVerificationSent && !isEmailVerified && (
            <div className="mt-1 text-sm text-red-600">{verificationError}</div>
         )}
      </div>

      {/* Password Section */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {/* Password Strength Meter */}
        {password && (
          <div className="mt-2">
            <div className="h-2 w-full bg-gray-200 rounded">
              <div
                className={`h-2 rounded ${passwordStrength.color}`}
                style={{ 
                  width: `${Math.min(passwordStrength.score * 20, 100)}%`,
                }}
              ></div> 
            </div>
            <p className="text-xs mt-1 text-gray-500">Strength: {passwordStrength.label}</p>
          </div>
        )}
      </div>

      {/* Confirm Password Section */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${!passwordsMatch && confirmPassword ? 'border-red-500' : ''}`}
        />
        {!passwordsMatch && confirmPassword && (
          <p className="mt-1 text-sm text-red-600">Passwords do not match.</p>
        )}
      </div>

      {/* Sign Up Button */}
      <div>
        <button
          type="submit"
          disabled={isSignUpDisabled || isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </div>
    </form>
  );
}

export default SignUpForm; 