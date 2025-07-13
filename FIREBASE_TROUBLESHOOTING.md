# Firebase Troubleshooting Guide

## 🔍 Quick Diagnostic

If you're seeing "Failed to get document because the client is offline", follow these steps:

### Step 1: Run Diagnostics
1. Go to the Categories page
2. Click the "🔍 Run Diagnostics" button
3. Check the browser console for detailed results

### Step 2: Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **factbuster-470b2**
3. Check if these services are enabled:

#### ✅ Authentication
- Go to "Authentication" → "Sign-in method"
- Make sure "Email/Password" is enabled

#### ✅ Firestore Database
- Go to "Firestore Database"
- If you see "Create database", click it and:
  - Choose "Start in test mode"
  - Select a location (preferably close to your users)
  - Click "Done"

### Step 3: Check Security Rules
In Firestore Database → Rules, make sure you have:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users under any document
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Note**: This is for development only. For production, use proper security rules.

### Step 4: Verify Configuration
Check your `client/src/firebase/config.js` file:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAOKIRmzlC-CiqfUF3R1sD4-uxBADfLcww",
  authDomain: "factbuster-470b2.firebaseapp.com",
  projectId: "factbuster-470b2",
  storageBucket: "factbuster-470b2.appspot.com",
  messagingSenderId: "806487422529",
  appId: "1:806487422529:web:039f956a290cdb2cd738c0"
};
```

## 🚨 Common Issues & Solutions

### Issue 1: "Firestore database not found"
**Solution**: Create the Firestore database in Firebase Console

### Issue 2: "Permission denied"
**Solution**: Update security rules to allow access (see Step 3 above)

### Issue 3: "Service unavailable"
**Solution**: Check if your Firebase project is active and billing is set up

### Issue 4: "Invalid API key"
**Solution**: Verify your API key in the Firebase Console

## 🔧 Manual Setup Steps

### 1. Create Firestore Database
1. Go to Firebase Console → Firestore Database
2. Click "Create database"
3. Choose "Start in test mode"
4. Select location (e.g., "us-central1")
5. Click "Done"

### 2. Enable Authentication
1. Go to Firebase Console → Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Click "Save"

### 3. Update Security Rules
1. Go to Firestore Database → Rules
2. Replace the rules with the test mode rules above
3. Click "Publish"

### 4. Test Connection
1. Go to your app's Categories page
2. Click "🔍 Run Diagnostics"
3. Check console for results

## 📱 Testing the Fix

After completing the setup:

1. **Refresh your app**
2. **Go to Categories page**
3. **Click "🔍 Run Diagnostics"**
4. **Check console output**

You should see:
```
✅ Firebase diagnostics passed!
Database Check: { exists: true, error: null }
Operations Test: { read: true, write: true, errors: [] }
```

## 🆘 Still Having Issues?

If the problem persists:

1. **Check browser console** for specific error messages
2. **Verify internet connection**
3. **Try in incognito mode** to rule out browser cache issues
4. **Check Firebase Console** for any service outages
5. **Verify project ID** matches in config and console

## 📞 Support

If you need help:
1. Copy the diagnostic results from the console
2. Check the Firebase Console for any error messages
3. Verify all steps above have been completed

---

**Note**: The app will work offline using localStorage as a fallback, but for full functionality, Firebase needs to be properly configured. 