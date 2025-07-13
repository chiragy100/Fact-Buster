import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChange, 
  getCurrentUser,
  logoutUser 
} from '../services/firebaseAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      if (user) {
        console.log('Setting current user:', user);
        setCurrentUser(user);
        
        // Get user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            console.log('User data from Firestore:', userDoc.data());
            setUserData(userDoc.data());
          } else {
            // If user document doesn't exist, create basic user data
            const basicUserData = {
              uid: user.uid,
              username: user.displayName || 'User',
              email: user.email,
              emailVerified: user.emailVerified,
              stats: {
                gamesPlayed: 0,
                totalScore: 0,
                correctAnswers: 0,
                totalAnswers: 0,
                bestStreak: 0,
                averageResponseTime: 0
              },
              preferences: {
                favoriteCategories: [],
                difficulty: 'medium'
              }
            };
            console.log('Setting basic user data:', basicUserData);
            setUserData(basicUserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          const fallbackUserData = {
            uid: user.uid,
            username: user.displayName || 'User',
            email: user.email,
            emailVerified: user.emailVerified,
            stats: {
              gamesPlayed: 0,
              totalScore: 0,
              correctAnswers: 0,
              totalAnswers: 0,
              bestStreak: 0,
              averageResponseTime: 0
            },
            preferences: {
              favoriteCategories: [],
              difficulty: 'medium'
            }
          };
          console.log('Setting fallback user data:', fallbackUserData);
          setUserData(fallbackUserData);
        }
      } else {
        console.log('Clearing user data');
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserData = (newData) => {
    setUserData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const value = {
    currentUser,
    userData,
    loading,
    logout,
    updateUserData,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 