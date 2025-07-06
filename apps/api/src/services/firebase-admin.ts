import * as admin from 'firebase-admin'

// Lazy initialization - only initialize when first accessed
let isInitialized = false

function initializeAdmin() {
  if (isInitialized || admin.apps.length > 0) {
    return
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin SDK credentials')
    console.error('FIREBASE_PROJECT_ID:', projectId ? 'set' : 'missing')
    console.error('FIREBASE_CLIENT_EMAIL:', clientEmail ? 'set' : 'missing')
    console.error('FIREBASE_PRIVATE_KEY:', privateKey ? 'set' : 'missing')
    throw new Error('Firebase Admin SDK credentials not configured')
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })

  isInitialized = true
}

// Export getters that initialize on first access
export const auth = new Proxy({} as admin.auth.Auth, {
  get(target, prop, receiver) {
    initializeAdmin()
    const authInstance = admin.auth()
    return Reflect.get(authInstance, prop, authInstance)
  },
})

export const firestore = new Proxy({} as admin.firestore.Firestore, {
  get(target, prop, receiver) {
    initializeAdmin()
    const firestoreInstance = admin.firestore()
    return Reflect.get(firestoreInstance, prop, firestoreInstance)
  },
})

export default admin
