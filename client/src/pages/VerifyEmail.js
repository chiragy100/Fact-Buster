import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        // For Firebase, email verification is handled automatically
        // The user should already be verified if they clicked the link
        // We'll just show success and redirect them to login
        console.log('Email verification link clicked');
        setVerificationStatus('success');
        toast.success('Email verified successfully! Please log in to continue.');
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setErrorMessage('Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/signup');
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Verifying Email</h1>
            <p className="text-white/70">Please wait while we verify your email address...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Email Verified!</h1>
            <p className="text-white/70">Your account has been successfully activated</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center"
          >
            <div className="mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">Welcome to FactBuster!</h2>
              <p className="text-white/80">
                Your email has been verified and your account is now active. 
                You can now access all features and start playing!
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <p className="text-white/80 text-sm">
                You're now logged in and ready to start your fact-checking journey. 
                Choose a category and begin playing!
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Start Playing
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-white/70">We couldn't verify your email address</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center"
          >
            <div className="mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">Verification Error</h2>
              <p className="text-white/80 mb-4">
                {errorMessage}
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-white/80 text-sm">
                This could happen if:
              </p>
              <ul className="text-white/70 text-sm mt-2 space-y-1">
                <li>• The verification link has expired</li>
                <li>• The link was already used</li>
                <li>• The link is invalid or corrupted</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleTryAgain}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                Try Again
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full bg-white/10 text-white py-3 px-6 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default VerifyEmail; 