import { doc, getDoc, updateDoc, setDoc, serverTimestamp, enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';
import { db } from '../firebase/config';

// Check if Firebase is properly initialized
const isFirebaseInitialized = () => {
  try {
    return db && typeof db === 'object';
  } catch (error) {
    console.error('Firebase not initialized:', error);
    return false;
  }
};

// Check if Firebase is online with better error handling
const isFirebaseOnline = async () => {
  try {
    if (!isFirebaseInitialized()) {
      console.warn('Firebase not initialized');
      return false;
    }
    
    // Try to enable network and check connectivity
    await enableNetwork(db);
    
    // Try a simple operation to test connectivity
    const testDoc = doc(db, '_test', 'connection');
    await getDoc(testDoc);
    
    return true;
  } catch (error) {
    console.warn('Firebase appears to be offline or misconfigured:', error);
    
    // Check for specific error types
    if (error.code === 'unavailable' || error.code === 'permission-denied') {
      console.error('Firebase service unavailable or permission denied');
    } else if (error.message.includes('offline')) {
      console.error('Firebase client is offline');
    } else if (error.message.includes('not-found')) {
      console.error('Firestore database not found - check if database is created');
    }
    
    return false;
  }
};

// Fallback to localStorage when Firebase is offline
const getLocalStreakData = (userId, categoryId) => {
  try {
    const key = `streak_${userId}_${categoryId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const setLocalStreakData = (userId, categoryId, data) => {
  try {
    const key = `streak_${userId}_${categoryId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

// Get user's streak data for a specific category
export const getUserStreak = async (userId, categoryId) => {
  try {
    console.log(`Getting streak for user ${userId}, category ${categoryId}`);
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      console.log('Firebase not initialized, using localStorage fallback');
      const localData = getLocalStreakData(userId, categoryId);
      if (localData) {
        return localData;
      } else {
        const defaultStreak = {
          userId,
          categoryId,
          currentStreak: 0,
          longestStreak: 0,
          totalCorrect: 0,
          totalAttempts: 0,
          lastPlayed: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setLocalStreakData(userId, categoryId, defaultStreak);
        return defaultStreak;
      }
    }
    
    // Check if Firebase is online
    const isOnline = await isFirebaseOnline();
    
    if (!isOnline) {
      console.log('Firebase offline, using localStorage fallback');
      const localData = getLocalStreakData(userId, categoryId);
      if (localData) {
        console.log(`Found local streak data for ${categoryId}:`, localData);
        return localData;
      } else {
        console.log(`No local streak data found for ${categoryId}, creating default`);
        const defaultStreak = {
          userId,
          categoryId,
          currentStreak: 0,
          longestStreak: 0,
          totalCorrect: 0,
          totalAttempts: 0,
          lastPlayed: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setLocalStreakData(userId, categoryId, defaultStreak);
        return defaultStreak;
      }
    }
    
    const streakDoc = await getDoc(doc(db, 'userStreaks', `${userId}_${categoryId}`));
    
    if (streakDoc.exists()) {
      const data = streakDoc.data();
      console.log(`Found streak data for ${categoryId}:`, data);
      // Also save to localStorage as backup
      setLocalStreakData(userId, categoryId, data);
      return data;
    } else {
      console.log(`No streak data found for ${categoryId}, creating default`);
      // Create default streak data if it doesn't exist
      const defaultStreak = {
        userId,
        categoryId,
        currentStreak: 0,
        longestStreak: 0,
        totalCorrect: 0,
        totalAttempts: 0,
        lastPlayed: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'userStreaks', `${userId}_${categoryId}`), defaultStreak);
      console.log(`Created default streak for ${categoryId}:`, defaultStreak);
      // Also save to localStorage
      setLocalStreakData(userId, categoryId, defaultStreak);
      return defaultStreak;
    }
  } catch (error) {
    console.error('Error getting user streak:', error);
    
    // If Firebase fails, try localStorage
    if (error.message.includes('offline') || error.message.includes('network') || 
        error.code === 'unavailable' || error.code === 'permission-denied') {
      console.log('Firebase error detected, falling back to localStorage');
      const localData = getLocalStreakData(userId, categoryId);
      if (localData) {
        return localData;
      }
    }
    
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCorrect: 0,
      totalAttempts: 0
    };
  }
};

// Update user's streak after answering a question
export const updateUserStreak = async (userId, categoryId, isCorrect) => {
  try {
    console.log(`Updating streak for user ${userId}, category ${categoryId}, correct: ${isCorrect}`);
    
    // Check if Firebase is online
    const isOnline = await isFirebaseOnline();
    
    if (!isOnline) {
      console.log('Firebase offline, updating localStorage only');
      const localData = getLocalStreakData(userId, categoryId) || {
        currentStreak: 0,
        longestStreak: 0,
        totalCorrect: 0,
        totalAttempts: 0
      };
      
      // Update streak based on answer
      if (isCorrect) {
        localData.currentStreak += 1;
        localData.totalCorrect += 1;
        if (localData.currentStreak > localData.longestStreak) {
          localData.longestStreak = localData.currentStreak;
        }
      } else {
        localData.currentStreak = 0;
      }
      
      localData.totalAttempts += 1;
      localData.updatedAt = new Date().toISOString();
      
      setLocalStreakData(userId, categoryId, localData);
      return localData;
    }
    
    const streakRef = doc(db, 'userStreaks', `${userId}_${categoryId}`);
    const streakDoc = await getDoc(streakRef);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let totalCorrect = 0;
    let totalAttempts = 0;
    
    if (streakDoc.exists()) {
      const data = streakDoc.data();
      currentStreak = data.currentStreak || 0;
      longestStreak = data.longestStreak || 0;
      totalCorrect = data.totalCorrect || 0;
      totalAttempts = data.totalAttempts || 0;
      console.log(`Current streak data:`, { currentStreak, longestStreak, totalCorrect, totalAttempts });
    } else {
      console.log(`No existing streak data, starting fresh`);
    }
    
    // Update streak based on answer
    if (isCorrect) {
      currentStreak += 1;
      totalCorrect += 1;
      
      // Update longest streak if current streak is longer
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        console.log(`🎉 New longest streak: ${longestStreak}!`);
      }
    } else {
      // Reset current streak if answer is wrong
      currentStreak = 0;
      console.log(`❌ Wrong answer, streak reset to 0`);
    }
    
    totalAttempts += 1;
    
    // Update the document
    const updateData = {
      userId,
      categoryId,
      currentStreak,
      longestStreak,
      totalCorrect,
      totalAttempts,
      lastPlayed: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    if (!streakDoc.exists()) {
      updateData.createdAt = serverTimestamp();
    }
    
    console.log(`Saving updated streak data:`, updateData);
    await setDoc(streakRef, updateData);
    console.log(`✅ Streak updated successfully`);
    
    // Also save to localStorage as backup
    setLocalStreakData(userId, categoryId, updateData);
    
    return {
      currentStreak,
      longestStreak,
      totalCorrect,
      totalAttempts
    };
  } catch (error) {
    console.error('Error updating user streak:', error);
    
    // If Firebase fails, try localStorage
    if (error.message.includes('offline') || error.message.includes('network')) {
      console.log('Firebase error detected, falling back to localStorage update');
      const localData = getLocalStreakData(userId, categoryId) || {
        currentStreak: 0,
        longestStreak: 0,
        totalCorrect: 0,
        totalAttempts: 0
      };
      
      if (isCorrect) {
        localData.currentStreak += 1;
        localData.totalCorrect += 1;
        if (localData.currentStreak > localData.longestStreak) {
          localData.longestStreak = localData.currentStreak;
        }
      } else {
        localData.currentStreak = 0;
      }
      
      localData.totalAttempts += 1;
      localData.updatedAt = new Date().toISOString();
      
      setLocalStreakData(userId, categoryId, localData);
      return localData;
    }
    
    throw error;
  }
};

// Get all user streaks for display
export const getAllUserStreaks = async (userId) => {
  try {
    console.log('Getting all streaks for user:', userId);
    const categories = [
      'general', 'science', 'history', 'geography', 
      'entertainment', 'sports', 'technology', 'nature'
    ];
    
    const streaks = {};
    
    // Check if Firebase is online first
    const isOnline = await isFirebaseOnline();
    
    if (!isOnline) {
      console.log('Firebase offline, loading all streaks from localStorage');
      for (const categoryId of categories) {
        const localData = getLocalStreakData(userId, categoryId);
        if (localData) {
          streaks[categoryId] = localData;
        } else {
          // Create default data for missing categories
          const defaultStreak = {
            userId,
            categoryId,
            currentStreak: 0,
            longestStreak: 0,
            totalCorrect: 0,
            totalAttempts: 0,
            lastPlayed: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setLocalStreakData(userId, categoryId, defaultStreak);
          streaks[categoryId] = defaultStreak;
        }
      }
      console.log('All streaks loaded from localStorage:', streaks);
      return streaks;
    }
    
    for (const categoryId of categories) {
      console.log('Getting streak for category:', categoryId);
      const streakData = await getUserStreak(userId, categoryId);
      streaks[categoryId] = streakData;
    }
    
    console.log('All streaks loaded:', streaks);
    return streaks;
  } catch (error) {
    console.error('Error getting all user streaks:', error);
    
    // If Firebase fails, try localStorage for all categories
    if (error.message.includes('offline') || error.message.includes('network')) {
      console.log('Firebase error detected, falling back to localStorage for all streaks');
      const categories = [
        'general', 'science', 'history', 'geography', 
        'entertainment', 'sports', 'technology', 'nature'
      ];
      
      const streaks = {};
      for (const categoryId of categories) {
        const localData = getLocalStreakData(userId, categoryId);
        if (localData) {
          streaks[categoryId] = localData;
        } else {
          streaks[categoryId] = {
            currentStreak: 0,
            longestStreak: 0,
            totalCorrect: 0,
            totalAttempts: 0
          };
        }
      }
      return streaks;
    }
    
    return {};
  }
};

// Reset streak for a category (for testing purposes)
export const resetUserStreak = async (userId, categoryId) => {
  try {
    const resetData = {
      userId,
      categoryId,
      currentStreak: 0,
      longestStreak: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      lastPlayed: null,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'userStreaks', `${userId}_${categoryId}`), resetData);
    return resetData;
  } catch (error) {
    console.error('Error resetting user streak:', error);
    throw error;
  }
};

// Sync localStorage data back to Firebase when connection is restored
export const syncLocalDataToFirebase = async (userId) => {
  try {
    console.log('Attempting to sync localStorage data to Firebase...');
    
    const isOnline = await isFirebaseOnline();
    if (!isOnline) {
      console.log('Firebase still offline, cannot sync');
      return false;
    }
    
    const categories = ['general', 'science', 'history', 'geography', 'entertainment', 'sports', 'technology', 'nature'];
    let syncedCount = 0;
    
    for (const categoryId of categories) {
      const localData = getLocalStreakData(userId, categoryId);
      if (localData) {
        try {
          // Convert ISO string timestamps back to serverTimestamp for Firebase
          const firebaseData = {
            ...localData,
            lastPlayed: localData.lastPlayed ? serverTimestamp() : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          await setDoc(doc(db, 'userStreaks', `${userId}_${categoryId}`), firebaseData);
          syncedCount++;
          console.log(`Synced ${categoryId} to Firebase`);
        } catch (error) {
          console.error(`Failed to sync ${categoryId}:`, error);
        }
      }
    }
    
    console.log(`✅ Synced ${syncedCount} categories to Firebase`);
    return syncedCount > 0;
  } catch (error) {
    console.error('Error syncing local data to Firebase:', error);
    return false;
  }
};

// Test function to create sample streak data
export const createTestStreakData = async (userId) => {
  try {
    const categories = ['general', 'science', 'history', 'geography', 'entertainment', 'sports', 'technology', 'nature'];
    
    for (const categoryId of categories) {
      const testData = {
        userId,
        categoryId,
        currentStreak: Math.floor(Math.random() * 5),
        longestStreak: Math.floor(Math.random() * 15) + 5,
        totalCorrect: Math.floor(Math.random() * 50) + 10,
        totalAttempts: Math.floor(Math.random() * 80) + 20,
        lastPlayed: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'userStreaks', `${userId}_${categoryId}`), testData);
      console.log(`Created test data for ${categoryId}:`, testData);
    }
    
    console.log('✅ Test streak data created successfully');
  } catch (error) {
    console.error('Error creating test streak data:', error);
  }
}; 