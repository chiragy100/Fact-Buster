const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

try {
  // In production, use environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT environment variable not set. Using development mode.');
  }
} catch (error) {
  console.warn('⚠️ Firebase Admin SDK not initialized - running in development mode');
  console.warn('Error details:', error.message);
}

// Firebase authentication middleware
const firebaseAuth = async (req, res, next) => {
  try {
    // Get the ID token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No valid authorization token provided' 
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!firebaseInitialized) {
      // If Firebase Admin is not initialized, use a mock authentication for development
      console.warn('⚠️ Firebase Admin not initialized - using mock authentication');
      req.user = {
        id: 'mock-user-id',
        username: 'mock-user',
        email: 'mock@example.com',
        emailVerified: true
      };
      return next();
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Add user information to the request
    req.user = {
      id: decodedToken.uid,
      username: decodedToken.name || decodedToken.display_name || 'User',
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false
    };

    next();
  } catch (error) {
    console.error('❌ Firebase authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        message: 'Token has expired. Please sign in again.' 
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ 
        message: 'Token has been revoked. Please sign in again.' 
      });
    }
    
    return res.status(401).json({ 
      message: 'Invalid authentication token' 
    });
  }
};

// Optional authentication middleware (for routes that can work with or without auth)
const optionalFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!firebaseInitialized) {
      // Mock authentication for development
      req.user = {
        id: 'mock-user-id',
        username: 'mock-user',
        email: 'mock@example.com',
        emailVerified: true
      };
      return next();
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.user = {
      id: decodedToken.uid,
      username: decodedToken.name || decodedToken.display_name || 'User',
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false
    };

    next();
  } catch (error) {
    console.error('❌ Optional Firebase authentication error:', error);
    // For optional auth, we don't fail the request, just set user to null
    req.user = null;
    next();
  }
};

// Guest-friendly authentication middleware
const guestAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, create a guest user
      req.user = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: req.body.username || 'Guest',
        email: null,
        emailVerified: false,
        isGuest: true
      };
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!firebaseInitialized) {
      // Mock authentication for development
      req.user = {
        id: 'mock-user-id',
        username: req.body.username || 'mock-user',
        email: 'mock@example.com',
        emailVerified: true,
        isGuest: false
      };
      return next();
    }

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.user = {
      id: decodedToken.uid,
      username: decodedToken.name || decodedToken.display_name || req.body.username || 'User',
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false,
      isGuest: false
    };

    next();
  } catch (error) {
    console.error('❌ Guest authentication error:', error);
    
    // For guest auth, if token verification fails, create a guest user
    req.user = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: req.body.username || 'Guest',
      email: null,
      emailVerified: false,
      isGuest: true
    };
    next();
  }
};

module.exports = { firebaseAuth, optionalFirebaseAuth, guestAuth }; 