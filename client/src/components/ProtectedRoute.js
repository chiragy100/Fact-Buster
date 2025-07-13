import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requireEmailVerification = false }) => {
  const { isAuthenticated, loading, isEmailVerified } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <LoadingSpinner />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to email verification if required but not verified
  if (requireEmailVerification && !isEmailVerified) {
    return <Navigate to="/verify-email-pending" state={{ from: location }} replace />;
  }

  // Render the protected content
  return children;
};

export default ProtectedRoute; 