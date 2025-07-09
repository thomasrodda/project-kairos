import { Request, Response, NextFunction } from 'express'
import { verifyIdToken, getUser } from '../lib/firebase-admin'
import { prisma } from '@kairos/database'
import '../types/express'

/**
 * Authentication middleware that verifies Firebase tokens and attaches user to request
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const idToken = authHeader.split('Bearer ')[1]
    if (!idToken) {
      return res.status(401).json({ error: 'Invalid token format' })
    }

    // Verify Firebase token
    const decodedToken = await verifyIdToken(idToken)
    const firebaseUid = decodedToken.uid

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
    })

    if (!user) {
      // Get additional user info from Firebase
      const firebaseUser = await getUser(firebaseUid)

      // Create new user
      user = await prisma.user.create({
        data: {
          firebaseUid,
          email: firebaseUser.email || decodedToken.email || '',
          displayName: firebaseUser.displayName || decodedToken.name || null,
          photoURL: firebaseUser.photoURL || decodedToken.picture || null,
        },
      })
    }

    // Attach user to request
    req.user = user
    req.firebaseUid = firebaseUid

    next()
  } catch (error) {
    console.error('Authentication error:', error)

    if (error instanceof Error) {
      if (error.message.includes('token')) {
        return res.status(401).json({ error: 'Invalid or expired token' })
      }
    }

    return res.status(500).json({ error: 'Authentication failed' })
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  // If no auth header, continue without user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  // If auth header exists, use regular authenticate
  return authenticate(req, res, next)
}

/**
 * Require authentication for routes - simpler version that just checks if user exists
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}
