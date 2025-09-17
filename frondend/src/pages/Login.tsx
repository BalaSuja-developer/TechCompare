import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle, Smartphone, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Import your AuthContext

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  // Use AuthContext instead of manual localStorage checks
  const { user, isAuthenticated, login } = useAuth();

  // Check if user is already logged in using AuthContext
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User already logged in, redirecting...", user);
      handleRedirect(user);
    }
  }, [isAuthenticated, user, navigate]);

  const handleRedirect = (user: any) => {
    console.log("Handling redirect for user:", user);
    
    setTimeout(() => {
      if (user.role === 'admin') {
        console.log("Redirecting to admin dashboard");
        navigate('/admin', { replace: true });
      } else {
        console.log("Redirecting to home page");
        navigate(from, { replace: true });
      }
    }, 100);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log("Attempting login...");
      
      // Use AuthContext login method instead of manual fetch
      const success = await login(username, password);
      
      if (success) {
        console.log("Login successful via AuthContext");
        // The useEffect will handle the redirect when user state updates
      } else {
        console.log("Login failed");
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      console.log("Attempting signup...");
      
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        // After successful signup, log them in using AuthContext
        const loginSuccess = await login(username, password);
        if (loginSuccess) {
          console.log("Signup and auto-login successful");
          // The useEffect will handle the redirect
        } else {
          setError('Signup successful but auto-login failed. Please try logging in.');
        }
      } else {
        const errorMsg = data?.error || 'Signup failed. Please try again.';
        console.log("Signup failed:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-white p-3 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
            <Smartphone className="h-10 w-10 text-blue-600 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to TechCompare
          </h2>
          <p className="text-blue-100">
            {isLogin ? 'Sign in to access your account' : 'Create a new account'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Toggle */}
          <div className="flex justify-center mb-6 space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`px-4 py-2 rounded-lg font-medium ${isLogin ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`px-4 py-2 rounded-lg font-medium ${!isLogin ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 mb-6">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            // Signup Form
            <form className="space-y-6" onSubmit={handleSignup}>
              <div>
                <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="signup-username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Choose a username"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Choose a password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing up...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Sign Up</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;