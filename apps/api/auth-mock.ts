import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyIdToken } from './lib/firebase-admin'

// Mock user data for development when Prisma has issues
const MOCK_USER = {
  id: 'mock-user-123',
  email: 'dev@projectkairos.com',
  displayName: 'Development User',
  photoURL: null,
  firebaseUid: 'mock-firebase-uid',
  createdAt: new Date().toISOString(),
  workspaces: [
    {
      id: 'mock-workspace-123',
      name: 'My Development Workspace',
      createdAt: new Date().toISOString(),
    },
  ],
}

// POST /api/auth/verify
export async function verify(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { idToken } = req.body

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' })
    }

    // Try to verify the Firebase token
    try {
      const decodedToken = await verifyIdToken(idToken)
      console.log('Firebase token verified for:', decodedToken.email)
    } catch (error) {
      console.log('Using mock auth due to Firebase error:', error)
    }

    // Return mock user for development
    return res.status(200).json({
      user: {
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        displayName: MOCK_USER.displayName,
        photoURL: MOCK_USER.photoURL,
        createdAt: MOCK_USER.createdAt,
      },
    })
  } catch (error) {
    console.error('Mock auth error:', error)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// GET /api/auth/me
export async function me(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Return mock user with workspaces
  return res.status(200).json({
    user: {
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      displayName: MOCK_USER.displayName,
      photoURL: MOCK_USER.photoURL,
      createdAt: MOCK_USER.createdAt,
      workspaces: MOCK_USER.workspaces,
    },
  })
}

// POST /api/auth/logout
export async function logout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.status(200).json({ success: true, message: 'Logged out successfully' })
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { pathname } = new URL(req.url!, `http://${req.headers.host}`)

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Route to appropriate handler
  if (pathname.endsWith('/verify')) {
    return verify(req, res)
  } else if (pathname.endsWith('/me')) {
    return me(req, res)
  } else if (pathname.endsWith('/logout')) {
    return logout(req, res)
  } else {
    return res.status(404).json({ error: 'Not found' })
  }
}
