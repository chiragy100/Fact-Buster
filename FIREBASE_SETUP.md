# Firebase Setup Guide for FactBuster

## 🔥 Firebase Project Configuration

### Step 1: Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **FactBuster** (factbuster-470b2)
3. Click on the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click "Add app" and select the web icon (</>)
7. Register your app with a nickname (e.g., "FactBuster Web")
8. Copy the configuration object

### Step 2: Update Firebase Config
Replace the placeholder values in `client/src/firebase/config.js` with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "factbuster-470b2.firebaseapp.com",
  projectId: "factbuster-470b2",
  storageBucket: "factbuster-470b2.appspot.com",
  messagingSenderId: "806487422529",
  appId: "your-actual-app-id"
};
```

### Step 3: Enable Authentication
1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### Step 4: Set up Firestore Database
1. In Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to your users
5. Click "Done"

### Step 5: Set up Security Rules (Optional)
In Firestore Database > Rules, you can set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read leaderboard data
    match /leaderboard/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Game data
    match /games/{gameId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Features Implemented

### ✅ Authentication Features
- **Email/Password Registration**: Users can create accounts with email and password
- **Email/Password Login**: Secure login with Firebase Auth
- **Password Reset**: Users can reset their password via email
- **User Profile Management**: Update user information and preferences
- **Anonymous Login**: Temporary guest accounts for quick play
- **Automatic Session Management**: Firebase handles user sessions

### ✅ User Data Storage
- **Firestore Database**: User profiles, stats, and preferences stored in Firestore
- **Real-time Updates**: User data syncs across devices
- **Secure Access**: Users can only access their own data

### ✅ Error Handling
- **Comprehensive Error Messages**: User-friendly error messages for all auth scenarios
- **Validation**: Client-side and server-side validation
- **Toast Notifications**: Real-time feedback for all actions

## 🔧 Configuration Files

### Firebase Config (`client/src/firebase/config.js`)
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config here
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Auth Service (`client/src/services/firebaseAuth.js`)
- `registerWithEmailAndPassword()`: Create new user accounts
- `loginWithEmailAndPassword()`: Authenticate existing users
- `logoutUser()`: Sign out users
- `getCurrentUser()`: Get current authenticated user
- `updateUserProfile()`: Update user information
- `resetPassword()`: Send password reset email

### Auth Context (`client/src/contexts/AuthContext.js`)
- Manages authentication state across the app
- Provides auth methods to all components
- Handles user session persistence

## 📱 User Interface

### Registration Page (`client/src/pages/Register.js`)
- Modern, responsive design with glassmorphism effects
- Real-time form validation
- Password visibility toggle
- Loading states and error handling
- Links to login and guest play

### Login Page (`client/src/pages/Login.js`)
- Clean, intuitive interface
- Email and password validation
- Password visibility toggle
- Loading states and error feedback
- Links to registration and password reset

## 🔒 Security Features

### Authentication Security
- **Password Requirements**: Minimum 6 characters
- **Email Validation**: Proper email format checking
- **Username Validation**: 3-20 characters, alphanumeric + underscores
- **Rate Limiting**: Firebase handles authentication rate limiting
- **Session Management**: Secure token-based sessions

### Data Security
- **User Isolation**: Users can only access their own data
- **Secure Storage**: Passwords are hashed by Firebase
- **Real-time Validation**: Client and server-side validation
- **Error Handling**: Secure error messages without exposing sensitive data

## 🎯 Next Steps

1. **Get Firebase Configuration**: Follow Step 1-2 above to get your actual Firebase config
2. **Update Config File**: Replace placeholder values in `client/src/firebase/config.js`
3. **Test Authentication**: Try registering and logging in with the new Firebase system
4. **Customize Security Rules**: Set up appropriate Firestore security rules for production
5. **Add Additional Providers**: Consider adding Google, Facebook, or other OAuth providers

## 🐛 Troubleshooting

### Common Issues
1. **"Firebase App not initialized"**: Make sure Firebase config is imported in `App.js`
2. **"Permission denied"**: Check Firestore security rules
3. **"Email already in use"**: User already has an account with that email
4. **"Weak password"**: Password must be at least 6 characters

### Debug Mode
Enable Firebase debug mode by adding this to your browser console:
```javascript
localStorage.setItem('debug', 'firebase:*');
```

## 📞 Support

If you encounter any issues:
1. Check the Firebase Console for error logs
2. Verify your configuration values
3. Ensure all required Firebase services are enabled
4. Check the browser console for detailed error messages

---

**Note**: This implementation replaces the previous backend authentication system with Firebase Authentication and Firestore for a more scalable and secure solution. 