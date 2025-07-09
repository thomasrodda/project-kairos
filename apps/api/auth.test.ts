import { verify, me, logout } from './auth'
import { verifyIdToken } from './lib/firebase-admin'
import { prisma } from '@kairos/database'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Mock dependencies
jest.mock('./lib/firebase-admin')
jest.mock('@kairos/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    workspace: {
      create: jest.fn(),
    },
  },
}))

describe('Auth Endpoints', () => {
  let req: Partial<VercelRequest>
  let res: Partial<VercelResponse>

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    }
  })

  describe('POST /api/auth/verify', () => {
    beforeEach(() => {
      req = {
        method: 'POST',
        body: { idToken: 'mock-token' },
      }
    })

    it('should verify token and return existing user', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
      }

      const mockUser = {
        id: 'user-123',
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(verifyIdToken as jest.Mock).mockResolvedValue(mockDecodedToken)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      await verify(req as VercelRequest, res as VercelResponse)

      expect(verifyIdToken).toHaveBeenCalledWith('mock-token')
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: 'firebase-uid-123' },
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
          createdAt: mockUser.createdAt,
        },
      })
    })

    it('should create new user if not exists', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid-123',
        email: 'newuser@example.com',
        name: 'New User',
        picture: null,
      }

      const mockNewUser = {
        id: 'user-456',
        firebaseUid: 'firebase-uid-123',
        email: 'newuser@example.com',
        displayName: 'New User',
        photoURL: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(verifyIdToken as jest.Mock).mockResolvedValue(mockDecodedToken)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue(mockNewUser)

      await verify(req as VercelRequest, res as VercelResponse)

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firebaseUid: 'firebase-uid-123',
          email: 'newuser@example.com',
          displayName: 'New User',
          photoURL: null,
        },
      })
      expect(prisma.workspace.create).toHaveBeenCalledWith({
        data: {
          name: 'My Workspace',
          userId: 'user-456',
        },
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return 400 if no token provided', async () => {
      req.body = {}

      await verify(req as VercelRequest, res as VercelResponse)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'ID token is required' })
    })

    it('should return 401 if token verification fails', async () => {
      ;(verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'))

      await verify(req as VercelRequest, res as VercelResponse)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' })
    })

    it('should return 405 for non-POST requests', async () => {
      req.method = 'GET'

      await verify(req as VercelRequest, res as VercelResponse)

      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })
  })

  describe('GET /api/auth/me', () => {
    beforeEach(() => {
      req = {
        method: 'GET',
        headers: {
          authorization: 'Bearer mock-token',
        },
      }
    })

    it('should return current user with workspaces', async () => {
      const mockDecodedToken = { uid: 'firebase-uid-123' }
      const mockUser = {
        id: 'user-123',
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        workspaces: [{ id: 'workspace-1', name: 'My Workspace', createdAt: new Date() }],
      }

      ;(verifyIdToken as jest.Mock).mockResolvedValue(mockDecodedToken)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      await me(req as VercelRequest, res as VercelResponse)

      expect(verifyIdToken).toHaveBeenCalledWith('mock-token')
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { firebaseUid: 'firebase-uid-123' },
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
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
          createdAt: mockUser.createdAt,
          workspaces: mockUser.workspaces,
        },
      })
    })

    it('should return 401 if no token provided', async () => {
      req.headers = {}

      await me(req as VercelRequest, res as VercelResponse)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' })
    })

    it('should return 404 if user not found', async () => {
      const mockDecodedToken = { uid: 'firebase-uid-123' }

      ;(verifyIdToken as jest.Mock).mockResolvedValue(mockDecodedToken)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      await me(req as VercelRequest, res as VercelResponse)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' })
    })

    it('should return 405 for non-GET requests', async () => {
      req.method = 'POST'

      await me(req as VercelRequest, res as VercelResponse)

      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })
  })

  describe('POST /api/auth/logout', () => {
    beforeEach(() => {
      req = {
        method: 'POST',
      }
    })

    it('should return success message', async () => {
      await logout(req as VercelRequest, res as VercelResponse)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      })
    })

    it('should return 405 for non-POST requests', async () => {
      req.method = 'GET'

      await logout(req as VercelRequest, res as VercelResponse)

      expect(res.status).toHaveBeenCalledWith(405)
      expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })
  })
})
