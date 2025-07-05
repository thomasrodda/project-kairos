import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
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
}

export const auth = admin.auth()
export const firestore = admin.firestore()

export default admin
