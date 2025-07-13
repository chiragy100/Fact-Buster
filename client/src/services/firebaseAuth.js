import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Register user with email and password
export const registerWithEmailAndPassword = async (email, password, username) => {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with username
    await updateProfile(user, {
      displayName: username
    });

    // Send email verification
    await sendEmailVerification(user);

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      username: username,
      email: email,
      emailVerified: false,
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
      },
      isAnonymous: false,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        username: username,
        emailVerified: user.emailVerified
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Registration failed. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled.';
        break;
      default:
        errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Login with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    // Update last active timestamp
    await updateDoc(doc(db, 'users', user.uid), {
      lastActive: serverTimestamp()
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        username: userData?.username || user.displayName,
        emailVerified: user.emailVerified,
        stats: userData?.stats || {},
        preferences: userData?.preferences || {}
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      default:
        errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document for Google sign-in
      await setDoc(doc(db, 'users', user.uid), {
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
        },
        isAnonymous: false,
        lastActive: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      // Update last active timestamp
      await updateDoc(doc(db, 'users', user.uid), {
        lastActive: serverTimestamp()
      });
    }

    const userData = userDoc.exists() ? userDoc.data() : {};

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        username: userData?.username || user.displayName,
        emailVerified: user.emailVerified,
        stats: userData?.stats || {},
        preferences: userData?.preferences || {}
      }
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    let errorMessage = 'Google sign-in failed. Please try again.';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in was cancelled.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Sign-in was cancelled.';
        break;
      default:
        errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Logout failed. Please try again.'
    };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Update user profile
export const updateUserProfile = async (uid, updates) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: 'Failed to update profile. Please try again.'
    };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    let errorMessage = 'Failed to send password reset email.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      default:
        errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Resend email verification
export const resendEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      return { success: true };
    } else {
      return {
        success: false,
        error: 'No user is currently signed in.'
      };
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      error: 'Failed to resend verification email. Please try again.'
    };
  }
};

// Auth state listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
}; 