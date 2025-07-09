import * as admin from 'firebase-admin'

let isInitialized = false

// Initialize Firebase Admin SDK
function initializeFirebase() {
  if (!admin.apps.length && !isInitialized) {
    try {
      // Check if required environment variables are present
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn('Firebase Admin SDK: Missing required environment variables')
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Firebase configuration missing in production')
        }
        return false
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
      isInitialized = true
      return true
    } catch (error) {
      console.error('Firebase admin initialization error:', error)
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Failed to initialize Firebase Admin SDK')
      }
      return false
    }
  }
  return isInitialized
}

// Initialize on module load if not in test environment
if (process.env.NODE_ENV !== 'test') {
  initializeFirebase()
}

// Lazy getter for auth to ensure Firebase is initialized when needed
export const getAuth = () => {
  if (process.env.NODE_ENV !== 'test' && !isInitialized) {
    const success = initializeFirebase()
    if (!success && process.env.NODE_ENV === 'development') {
      // Return a mock auth for development without Firebase
      console.warn('Using mock Firebase auth in development')
      return {
        verifyIdToken: async () => {
          throw new Error('Firebase not initialized - please check environment variables')
        },
        getUser: async () => {
          throw new Error('Firebase not initialized - please check environment variables')
        },
        createCustomToken: async () => {
          throw new Error('Firebase not initialized - please check environment variables')
        },
      } as unknown as admin.auth.Auth
    }
  }
  return admin.auth()
}

/**
 * Verifies a Firebase ID token and returns the decoded token
 * @param idToken - The Firebase ID token to verify
 * @returns The decoded token if valid
 * @throws Error if the token is invalid or expired
 */
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error)
    throw new Error('Invalid or expired token')
  }
}

/**
 * Gets a Firebase user by UID
 * @param uid - The user's Firebase UID
 * @returns The Firebase user record
 */
export async function getUser(uid: string) {
  try {
    const userRecord = await getAuth().getUser(uid)
    return userRecord
  } catch (error) {
    console.error('Error fetching user from Firebase:', error)
    throw new Error('User not found')
  }
}

/**
 * Creates a custom token for a user (useful for testing or special auth flows)
 * @param uid - The user's Firebase UID
 * @param claims - Optional custom claims to include in the token
 * @returns A custom Firebase token
 */
export async function createCustomToken(uid: string, claims?: object) {
  try {
    const customToken = await getAuth().createCustomToken(uid, claims)
    return customToken
  } catch (error) {
    console.error('Error creating custom token:', error)
    throw new Error('Failed to create custom token')
  }
}

export default admin
