import React, { useState } from 'react';
import SignUpForm from '../components/Auth/SignUpForm';
import LoginForm from '../components/Auth/LoginForm';

function LoginPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>

        <div className="text-center text-sm">
          {showLogin ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setShowLogin(false)} className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setShowLogin(true)} className="font-medium text-indigo-600 hover:text-indigo-500">
                Log In
              </button>
            </p>
          )}
        </div>

        {showLogin ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  );
}

export default LoginPage; 