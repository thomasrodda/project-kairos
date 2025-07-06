import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate configuration
if (!firebaseConfig.apiKey) {
  console.error('Firebase configuration error: Missing API key')
  console.error('Environment variables:', {
    apiKey: firebaseConfig.apiKey ? 'set' : 'missing',
    authDomain: firebaseConfig.authDomain ? 'set' : 'missing',
    projectId: firebaseConfig.projectId ? 'set' : 'missing',
    storageBucket: firebaseConfig.storageBucket ? 'set' : 'missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'set' : 'missing',
    appId: firebaseConfig.appId ? 'set' : 'missing',
  })
  console.error('Make sure your .env.local file contains all required VITE_FIREBASE_* variables')
}

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} catch (error) {
  console.error('Firebase initialization error:', error)
  throw error
}

// Export Firebase services
export { auth, db, storage }

// Export the app instance
export default app
