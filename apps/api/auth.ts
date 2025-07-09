import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyIdToken } from './lib/firebase-admin'
import { prisma } from '@kairos/database'

// POST /api/auth/verify
// Verify Firebase token and create/update user
export async function verify(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { idToken } = req.body

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' })
    }

    // Verify the Firebase token
    const decodedToken = await verifyIdToken(idToken)
    const firebaseUid = decodedToken.uid

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          firebaseUid,
          email: decodedToken.email || '',
          displayName: decodedToken.name || null,
          photoURL: decodedToken.picture || null,
        },
      })

      // Create default workspace for new user
      await prisma.workspace.create({
        data: {
          name: 'My Workspace',
          userId: user.id,
        },
      })
    } else {
      // Update user info if changed
      const updates: Record<string, string | null> = {}
      if (decodedToken.email && decodedToken.email !== user.email) {
        updates.email = decodedToken.email
      }
      if (decodedToken.name && decodedToken.name !== user.displayName) {
        updates.displayName = decodedToken.name
      }
      if (decodedToken.picture && decodedToken.picture !== user.photoURL) {
        updates.photoURL = decodedToken.picture
      }

      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates,
        })
      }
    }

    // Return user profile
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// GET /api/auth/me
// Get current user profile
export async function me(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Extract and verify token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const decodedToken = await verifyIdToken(idToken)
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        workspaces: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
        workspaces: user.workspaces,
      },
    })
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// POST /api/auth/logout
// Optional endpoint for logout (mainly for clearing server-side sessions if implemented)
export async function logout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Since we're using stateless JWT tokens from Firebase,
  // logout is mainly handled client-side by removing the token
  // This endpoint exists for future session management if needed

  return res.status(200).json({ success: true, message: 'Logged out successfully' })
}

// Main handler that routes to appropriate function
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
