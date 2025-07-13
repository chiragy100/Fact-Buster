import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Mail, 
  ArrowLeft,
  Send,
  CheckCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmailPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { email, username, verificationUrl } = location.state || {};

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    setLoading(true);

    try {
      // Use Firebase's resendEmailVerification instead of backend API
      const { resendEmailVerification } = await import('firebase/auth');
      const { auth } = await import('../firebase/config');
      
      await resendEmailVerification(auth.currentUser);
      toast.success('Verification email sent successfully!');
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    // This would typically check if the user has verified their email
    // For now, we'll just redirect to login
    navigate('/login');
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Invalid Access</h1>
            <p className="text-white/70 mb-6">This page requires email verification data.</p>
            
            <Link 
              to="/signup"
              className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Signup
            </Link>
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
          
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-white/70">We've sent a verification link to your email</p>
        </motion.div>

        {/* Verification Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Account Created Successfully!</h2>
            <p className="text-white/80 mb-4">
              Welcome to FactBuster, <span className="text-blue-400 font-medium">{username}</span>!
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-white/80 text-sm mb-2">
              We've sent a verification email to:
            </p>
            <p className="text-blue-400 font-medium text-center">{email}</p>
            
            {verificationUrl && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-white/80 text-sm mb-2">
                  <strong>For demo purposes:</strong> Click the link below to verify your email:
                </p>
                <a 
                  href={verificationUrl}
                  className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {verificationUrl}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Check your inbox</p>
                <p className="text-white/70 text-sm">Look for an email from FactBuster</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Click the verification link</p>
                <p className="text-white/70 text-sm">This will activate your account</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Start playing!</p>
                <p className="text-white/70 text-sm">You'll be redirected to your dashboard</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-medium text-sm">Important</span>
            </div>
            <p className="text-white/80 text-sm">
              The verification link will expire in 24 hours. If you don't see the email, 
              check your spam folder or request a new verification email.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>
            
            <button
              onClick={handleCheckVerification}
              className="w-full bg-white/10 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200"
            >
              I've Verified My Email
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-white/70">
              Already verified?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmailPending; 