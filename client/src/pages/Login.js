import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  AlertCircle,
  ArrowLeft,
  Send,
  Chrome
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { loginWithEmailAndPassword, signInWithGoogle, resetPassword } from '../services/firebaseAuth';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Redirect authenticated users to categories
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('User is already authenticated, redirecting to categories');
      navigate('/categories');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await loginWithEmailAndPassword(
        formData.email.trim().toLowerCase(),
        formData.password
      );

      if (result.success) {
        console.log('Login successful:', result.user);
        if (!result.user.emailVerified) {
          setNeedsVerification(true);
          setVerificationEmail(result.user.email);
          toast.error('Please verify your email before logging in');
        } else {
          toast.success('Login successful!');
          console.log('Redirecting to categories in 500ms...');
          // Add a small delay to ensure authentication state is updated
          setTimeout(() => {
            console.log('Navigating to categories now');
            navigate('/categories');
          }, 500);
        }
      } else {
        console.log('Login failed:', result.error);
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      // Use Firebase's resendEmailVerification instead of backend API
      const { resendEmailVerification } = await import('firebase/auth');
      const { auth } = await import('../firebase/config');
      
      await resendEmailVerification(auth.currentUser);
      toast.success('Verification email sent successfully!');
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Failed to send verification email');
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      toast.error('Please enter your email address first');
      return;
    }

    try {
      const result = await resetPassword(formData.email.trim().toLowerCase());
      
      if (result.success) {
        toast.success('Password reset email sent! Please check your inbox.');
      } else {
        toast.error(result.error || 'Failed to send password reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send password reset email');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        console.log('Google sign-in successful:', result.user);
        toast.success('Signed in with Google successfully!');
        console.log('Redirecting to categories in 500ms...');
        // Add a small delay to ensure authentication state is updated
        setTimeout(() => {
          console.log('Navigating to categories now');
          navigate('/categories');
        }, 500);
      } else {
        console.log('Google sign-in failed:', result.error);
        toast.error(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Link to="/" className="inline-flex items-center text-white/70 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Email Verification Required</h1>
            <p className="text-white/70">Please verify your email address to continue</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center"
          >
            <p className="text-white/80 mb-6">
              We sent a verification email to <span className="text-blue-400 font-medium">{verificationEmail}</span>. 
              Please check your inbox and click the verification link.
            </p>
            
            <button
              onClick={handleResendVerification}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 mb-4 flex items-center justify-center"
            >
              <Send className="w-5 h-5 mr-2" />
              Resend Verification Email
            </button>
            
            <button
              onClick={() => setNeedsVerification(false)}
              className="w-full bg-white/10 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200"
            >
              Back to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center text-white/70 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/70">Sign in to continue your fact-checking journey!</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white/80 mb-2 font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors ${
                    errors.email ? 'border-red-400' : 'border-white/20'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white/80 mb-2 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors ${
                    errors.password ? 'border-red-400' : 'border-white/20'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/10 text-white/50">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continue with Google
          </button>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-white/70">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 