// Import required Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Firebase configuration parameters
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "project-kairos-2885a.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: "project-kairos-2885a.appspot.com",
  messagingSenderId: "440436108418",
  appId: "1:440436108418:web:610387a40685c87fe9589b",
  measurementId: "G-3Z1M32KD86"
};

// Initialize Firebase with the given configuration
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Firestore for database interactions
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firebase Authentication and set session persistence
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    // Handle Errors here.
    // var errorCode = error.code;
    // var errorMessage = error.message;
  });

// Export Firestore and Authentication for use in other parts of the app
export { db, auth };
