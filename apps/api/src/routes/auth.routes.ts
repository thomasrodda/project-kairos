import { Router } from 'express'
import { AuthService } from '../services/auth.service'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

/**
 * POST /api/auth/verify
 * Verify a Firebase ID token
 */
router.post('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' })
      return
    }

    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await AuthService.verifyToken(idToken)

    res.json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
    })
  } catch (_error) {
    res.status(401).json({ valid: false, error: 'Invalid token' })
  }
})

/**
 * POST /api/auth/sync-user
 * Sync a Firebase user to the database
 */
router.post('/sync-user', requireAuth, async (req, res) => {
  try {
    // Use the authenticated user's UID
    const user = await AuthService.syncUser(req.user!.id)
    res.json({ user })
  } catch (error) {
    console.error('Sync user error:', error)
    res.status(500).json({ error: 'Failed to sync user' })
  }
})

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user })
})

export default router
