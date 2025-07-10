import { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyIdToken } from './firebase-admin'
import { prisma } from '@kairos/database'

export interface AuthenticatedUser {
  id: string
  email: string
  firebaseUid: string
}

// Extract token from Authorization header
export function extractToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.split('Bearer ')[1]
}

// Verify token and get user
export async function verifyTokenAndGetUser(token: string): Promise<AuthenticatedUser | null> {
  try {
    const decodedToken = await verifyIdToken(token)
    const user = await prisma.user.findUnique({
      where: {
        firebaseUid: decodedToken.uid,
        deletedAt: null, // Exclude soft-deleted users
      },
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firebaseUid: user.firebaseUid,
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Auth middleware for Vercel serverless functions
export async function requireAuth(req: VercelRequest, res: VercelResponse): Promise<{ user: AuthenticatedUser } | null> {
  const token = extractToken(req)

  if (!token) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authentication token provided',
      },
    })
    return null
  }

  const user = await verifyTokenAndGetUser(token)

  if (!user) {
    res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token',
      },
    })
    return null
  }

  return { user }
}

// Optional auth middleware - doesn't fail if no token
export async function optionalAuth(req: VercelRequest): Promise<{ user: AuthenticatedUser | null }> {
  const token = extractToken(req)

  if (!token) {
    return { user: null }
  }

  const user = await verifyTokenAndGetUser(token)
  return { user }
}
