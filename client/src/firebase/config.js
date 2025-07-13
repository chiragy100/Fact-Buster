import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOKIRmzlC-CiqfUF3R1sD4-uxBADfLcww",
  authDomain: "factbuster-470b2.firebaseapp.com",
  projectId: "factbuster-470b2",
  storageBucket: "factbuster-470b2.appspot.com",
  messagingSenderId: "806487422529",
  appId: "1:806487422529:web:039f956a290cdb2cd738c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 