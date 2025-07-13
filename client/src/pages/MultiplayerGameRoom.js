import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MultiplayerGameRoom = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to coming soon page
    navigate('/coming-soon');
  }, [navigate]);

  // Don't render anything since we're redirecting
  return null;
};

export default MultiplayerGameRoom; 