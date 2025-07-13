import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { db } from '../firebase/config';

// Diagnostic function to check Firebase setup
export const diagnoseFirebase = async () => {
  const diagnostics = {
    configLoaded: false,
    firestoreInitialized: false,
    authInitialized: false,
    firestoreAccessible: false,
    authAccessible: false,
    errors: []
  };

  try {
    // Check if config is loaded
    if (db) {
      diagnostics.configLoaded = true;
      diagnostics.firestoreInitialized = true;
    } else {
      diagnostics.errors.push('Firebase config not loaded');
    }

    // Check if auth is initialized
    const auth = getAuth();
    if (auth) {
      diagnostics.authInitialized = true;
    } else {
      diagnostics.errors.push('Firebase Auth not initialized');
    }

    // Test Firestore access
    if (diagnostics.firestoreInitialized) {
      try {
        const testDoc = doc(db, '_diagnostics', 'test');
        await getDoc(testDoc);
        diagnostics.firestoreAccessible = true;
      } catch (error) {
        diagnostics.errors.push(`Firestore access failed: ${error.message}`);
        
        // Try to create a test document
        try {
          const testDoc = doc(db, '_diagnostics', 'test');
          await setDoc(testDoc, {
            timestamp: serverTimestamp(),
            test: true
          });
          diagnostics.firestoreAccessible = true;
        } catch (createError) {
          diagnostics.errors.push(`Firestore write failed: ${createError.message}`);
        }
      }
    }

    // Test Auth access
    if (diagnostics.authInitialized) {
      try {
        await signInAnonymously(auth);
        diagnostics.authAccessible = true;
      } catch (error) {
        diagnostics.errors.push(`Auth access failed: ${error.message}`);
      }
    }

  } catch (error) {
    diagnostics.errors.push(`General error: ${error.message}`);
  }

  console.log('Firebase Diagnostics:', diagnostics);
  return diagnostics;
};

// Function to check if Firestore database exists
export const checkFirestoreDatabase = async () => {
  try {
    // Try to access a system collection
    const testDoc = doc(db, '_system', 'health');
    await getDoc(testDoc);
    return { exists: true, error: null };
  } catch (error) {
    return { 
      exists: false, 
      error: error.message,
      code: error.code 
    };
  }
};

// Function to test basic Firestore operations
export const testFirestoreOperations = async () => {
  const results = {
    read: false,
    write: false,
    errors: []
  };

  try {
    // Test write
    const testDoc = doc(db, '_test', 'operations');
    await setDoc(testDoc, {
      test: true,
      timestamp: serverTimestamp()
    });
    results.write = true;

    // Test read
    const readResult = await getDoc(testDoc);
    if (readResult.exists()) {
      results.read = true;
    }

  } catch (error) {
    results.errors.push(error.message);
  }

  return results;
};

// Function to get Firebase project info
export const getFirebaseProjectInfo = () => {
  try {
    const auth = getAuth();
    return {
      projectId: auth.app.options.projectId,
      authDomain: auth.app.options.authDomain,
      apiKey: auth.app.options.apiKey ? 'Present' : 'Missing',
      appId: auth.app.options.appId
    };
  } catch (error) {
    return { error: error.message };
  }
}; 