import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "project-kairos-2885a.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: "project-kairos-2885a.appspot.com",
  messagingSenderId: "440436108418",
  appId: "1:440436108418:web:610387a40685c87fe9589b",
  measurementId: "G-3Z1M32KD86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

// Initialise Authentication
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence); // User Login Persistence

export { db, auth };
