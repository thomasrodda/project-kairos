import { Router } from 'express'
import { AuthService } from '../services/auth.service'
import { requireAuth } from '../middleware/auth.middleware'
import { asyncHandler } from '../middleware/errorHandler'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { AuthenticationError, ValidationError } from '../utils/errors'

const router = Router()

/**
 * POST /api/auth/verify
 * Verify a Firebase ID token
 */
router.post(
  '/verify',
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header')
    }

    const idToken = authHeader.split('Bearer ')[1]

    try {
      const decodedToken = await AuthService.verifyToken(idToken)

      successResponse(res, {
        valid: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
      })
    } catch (error) {
      throw new AuthenticationError('Invalid token')
    }
  })
)

/**
 * POST /api/auth/sync-user
 * Sync a Firebase user to the database
 */
router.post(
  '/sync-user',
  requireAuth,
  asyncHandler(async (req, res) => {
    // Use the authenticated user's UID
    const user = await AuthService.syncUser(req.user!.id)
    successResponse(res, { user })
  })
)

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    successResponse(res, { user: req.user })
  })
)

export default router
