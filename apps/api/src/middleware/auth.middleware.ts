import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'

/**
 * Middleware to verify Firebase authentication
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' })
      return
    }

    const idToken = authHeader.split('Bearer ')[1]

    // Verify token
    const decodedToken = await AuthService.verifyToken(idToken)

    // Get or create user in database
    const user = await AuthService.getOrCreateUser(decodedToken)

    // Attach to request
    req.user = user
    req.decodedToken = decodedToken

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1]
      const decodedToken = await AuthService.verifyToken(idToken)
      const user = await AuthService.getOrCreateUser(decodedToken)

      req.user = user
      req.decodedToken = decodedToken
    }

    next()
  } catch (_error) {
    // Continue without auth
    next()
  }
}
