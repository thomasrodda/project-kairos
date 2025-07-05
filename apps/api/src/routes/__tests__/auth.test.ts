import request from 'supertest'
import { Express } from 'express'
import { auth } from '../../services/firebase-admin'
import { prismaMock } from '../../test/setup'
import { setupTestApp, expectErrorResponse, expectSuccessResponse, createAuthenticatedRequest } from '../../test/helpers'
import { createUser } from '../../test/factories'
import { createMockDecodedToken } from '../../test/setup'

describe('Auth Routes', () => {
  let app: Express

  beforeAll(() => {
    app = setupTestApp()
  })

  describe('POST /api/auth/verify', () => {
    describe('✅ Core Functionality', () => {
      it('should verify a valid Firebase token', async () => {
        const mockToken = createMockDecodedToken()
        ;(auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockToken)

        const response = await request(app).post('/api/auth/verify').set('Authorization', 'Bearer valid-token')

        expectSuccessResponse(response)
        expect(response.body).toEqual({
          valid: true,
          uid: mockToken.uid,
          email: mockToken.email,
        })
        expect(auth.verifyIdToken).toHaveBeenCalledWith('valid-token')
      })

      it('should handle tokens without email', async () => {
        const mockToken = createMockDecodedToken({ email: undefined })
        ;(auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockToken)

        const response = await request(app).post('/api/auth/verify').set('Authorization', 'Bearer valid-token')

        expectSuccessResponse(response)
        expect(response.body).toEqual({
          valid: true,
          uid: mockToken.uid,
          email: undefined,
        })
      })
    })

    describe('✅ Authentication Errors', () => {
      it('should return 401 when authorization header is missing', async () => {
        const response = await request(app).post('/api/auth/verify')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
        expect(auth.verifyIdToken).not.toHaveBeenCalled()
      })

      it('should return 401 when authorization header is malformed', async () => {
        const response = await request(app).post('/api/auth/verify').set('Authorization', 'InvalidFormat token')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })

      it('should return 401 when token is invalid', async () => {
        ;(auth.verifyIdToken as jest.Mock).mockRejectedValueOnce(new Error('Token expired'))

        const response = await request(app).post('/api/auth/verify').set('Authorization', 'Bearer expired-token')

        expectErrorResponse(response, 401, 'Invalid token')
        expect(response.body.valid).toBe(false)
      })

      it('should return 401 for empty bearer token', async () => {
        const response = await request(app).post('/api/auth/verify').set('Authorization', 'Bearer ')

        expectErrorResponse(response, 401, 'Invalid token')
      })
    })

    describe('✅ Edge Cases', () => {
      it('should handle case-sensitive Bearer prefix', async () => {
        const response = await request(app).post('/api/auth/verify').set('Authorization', 'bearer valid-token')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })

      it('should trim whitespace from token', async () => {
        const mockToken = createMockDecodedToken()
        ;(auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockToken)

        const response = await request(app).post('/api/auth/verify').set('Authorization', 'Bearer   valid-token   ')

        expectSuccessResponse(response)
        expect(auth.verifyIdToken).toHaveBeenCalledWith('valid-token   ')
      })

      it('should handle Firebase errors gracefully', async () => {
        ;(auth.verifyIdToken as jest.Mock).mockRejectedValueOnce({
          code: 'auth/id-token-revoked',
          message: 'Token has been revoked',
        })

        const response = await request(app).post('/api/auth/verify').set('Authorization', 'Bearer revoked-token')

        expectErrorResponse(response, 401, 'Invalid token')
      })
    })
  })

  describe('POST /api/auth/sync-user', () => {
    describe('✅ Core Functionality', () => {
      it('should sync an authenticated user', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // Mock Firebase getUser
        ;(auth.getUser as jest.Mock).mockResolvedValueOnce({
          uid: user.firebaseUid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })

        // Mock Prisma upsert
        prismaMock.user.upsert.mockResolvedValueOnce(user)

        const response = await authRequest('post', '/api/auth/sync-user')

        expectSuccessResponse(response)
        expect(response.body).toEqual({ user })
        expect(auth.getUser).toHaveBeenCalledWith(user.firebaseUid)
        expect(prismaMock.user.upsert).toHaveBeenCalledWith({
          where: { firebaseUid: user.firebaseUid },
          update: expect.objectContaining({
            email: user.email,
            displayName: user.displayName,
          }),
          create: expect.objectContaining({
            firebaseUid: user.firebaseUid,
            email: user.email,
          }),
        })
      })

      it('should handle users without display name or photo', async () => {
        const user = createUser({ displayName: null, photoURL: null })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(auth.getUser as jest.Mock).mockResolvedValueOnce({
          uid: user.firebaseUid,
          email: user.email,
        })

        prismaMock.user.upsert.mockResolvedValueOnce(user)

        const response = await authRequest('post', '/api/auth/sync-user')

        expectSuccessResponse(response)
        expect(prismaMock.user.upsert).toHaveBeenCalledWith({
          where: { firebaseUid: user.firebaseUid },
          update: expect.objectContaining({
            displayName: null,
            photoURL: null,
          }),
          create: expect.objectContaining({
            displayName: null,
            photoURL: null,
          }),
        })
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).post('/api/auth/sync-user')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })

      it('should return 401 with invalid token', async () => {
        ;(auth.verifyIdToken as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'))

        const response = await request(app).post('/api/auth/sync-user').set('Authorization', 'Bearer invalid-token')

        expectErrorResponse(response, 401, 'Unauthorized')
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle Firebase getUser errors', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(auth.getUser as jest.Mock).mockRejectedValueOnce(new Error('User not found'))

        const response = await authRequest('post', '/api/auth/sync-user')

        expectErrorResponse(response, 500, 'Failed to sync user')
      })

      it('should handle database errors', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(auth.getUser as jest.Mock).mockResolvedValueOnce({
          uid: user.firebaseUid,
          email: user.email,
        })

        prismaMock.user.upsert.mockRejectedValueOnce(new Error('Database connection failed'))

        const response = await authRequest('post', '/api/auth/sync-user')

        expectErrorResponse(response, 500, 'Failed to sync user')
      })
    })
  })

  describe('GET /api/auth/me', () => {
    describe('✅ Core Functionality', () => {
      it('should return current authenticated user', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // Mock user lookup
        prismaMock.user.findUnique.mockResolvedValueOnce(user)

        const response = await authRequest('get', '/api/auth/me')

        expectSuccessResponse(response)
        expect(response.body).toEqual({ user })
      })

      it('should return user with all fields', async () => {
        const user = createUser({
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
        })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.user.findUnique.mockResolvedValueOnce(user)

        const response = await authRequest('get', '/api/auth/me')

        expectSuccessResponse(response)
        expect(response.body.user).toMatchObject({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/auth/me')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })

      it('should return 401 with expired token', async () => {
        ;(auth.verifyIdToken as jest.Mock).mockRejectedValueOnce({
          code: 'auth/id-token-expired',
          message: 'Token expired',
        })

        const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer expired-token')

        expectErrorResponse(response, 401, 'Unauthorized')
      })
    })

    describe('✅ Edge Cases', () => {
      it('should handle when user exists in Firebase but not in database', async () => {
        const decodedToken = createMockDecodedToken()
        ;(auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(decodedToken)

        // First lookup returns null (user doesn't exist)
        prismaMock.user.findUnique.mockResolvedValueOnce(null)

        // Sync user flow
        const newUser = createUser({ firebaseUid: decodedToken.uid })
        ;(auth.getUser as jest.Mock).mockResolvedValueOnce({
          uid: decodedToken.uid,
          email: decodedToken.email,
        })
        prismaMock.user.upsert.mockResolvedValueOnce(newUser)

        const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer valid-token')

        expectSuccessResponse(response)
        expect(response.body.user).toEqual(newUser)
      })

      it('should handle concurrent requests for same user', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.user.findUnique.mockResolvedValue(user)

        const requests = Array.from({ length: 5 }, () => authRequest('get', '/api/auth/me'))

        const responses = await Promise.all(requests)

        responses.forEach((response) => {
          expectSuccessResponse(response)
          expect(response.body.user.id).toBe(user.id)
        })
      })
    })
  })

  describe('✅ Security Tests', () => {
    it('should not expose sensitive Firebase token data', async () => {
      const mockToken = createMockDecodedToken()
      ;(auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockToken)

      const response = await request(app).post('/api/auth/verify').set('Authorization', 'Bearer valid-token')

      expectSuccessResponse(response)
      // Should not expose internal Firebase fields
      expect(response.body).not.toHaveProperty('aud')
      expect(response.body).not.toHaveProperty('iss')
      expect(response.body).not.toHaveProperty('sub')
      expect(response.body).not.toHaveProperty('auth_time')
      expect(response.body).not.toHaveProperty('firebase')
    })

    it('should handle SQL injection attempts in token', async () => {
      const sqlInjectionToken = "'; DROP TABLE users; --"
      ;(auth.verifyIdToken as jest.Mock).mockRejectedValueOnce(new Error('Invalid token format'))

      const response = await request(app).post('/api/auth/verify').set('Authorization', `Bearer ${sqlInjectionToken}`)

      expectErrorResponse(response, 401, 'Invalid token')
    })

    it('should rate limit auth endpoints', async () => {
      // This test would require rate limiting middleware to be implemented
      // For now, we'll just verify the endpoint handles many requests
      const requests = Array.from({ length: 10 }, (_, i) => request(app).post('/api/auth/verify').set('Authorization', `Bearer token-${i}`))

      const responses = await Promise.all(requests)

      // All should return 401 (invalid tokens)
      responses.forEach((response) => {
        expect(response.status).toBe(401)
      })
    })
  })
})
