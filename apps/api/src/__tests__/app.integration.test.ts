import request from 'supertest'
import { Express } from 'express'
import { auth } from '../services/firebase-admin'
import { prismaMock } from '../test/setup'
import { setupTestApp, expectSuccessResponse, createAuthenticatedRequest } from '../test/helpers'
import { createUser, createWorkspace, createCompleteUserData } from '../test/factories'
import { createMockDecodedToken } from '../test/setup'

describe('App Integration Tests', () => {
  let app: Express

  beforeAll(() => {
    app = setupTestApp()
  })

  describe('✅ Full User Journey', () => {
    it('should handle complete user onboarding flow', async () => {
      // Step 1: Verify token (user signs in)
      const mockToken = createMockDecodedToken({
        uid: 'new-user-123',
        email: 'newuser@example.com',
      })
      ;(auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockToken)

      const verifyResponse = await request(app).post('/api/auth/verify').set('Authorization', 'Bearer new-user-token')

      expectSuccessResponse(verifyResponse)
      expect(verifyResponse.body.uid).toBe('new-user-123')

      // Step 2: Sync user to database
      const newUser = createUser({
        firebaseUid: 'new-user-123',
        email: 'newuser@example.com',
      })
      ;(auth.verifyIdToken as jest.Mock).mockResolvedValue(mockToken)
      ;(auth.getUser as jest.Mock).mockResolvedValueOnce({
        uid: 'new-user-123',
        email: 'newuser@example.com',
        displayName: 'New User',
      })
      prismaMock.user.findUnique.mockResolvedValueOnce(null) // User doesn't exist yet
      prismaMock.user.upsert.mockResolvedValueOnce(newUser)

      const syncResponse = await request(app).post('/api/auth/sync-user').set('Authorization', 'Bearer new-user-token')

      expectSuccessResponse(syncResponse)
      expect(syncResponse.body.user.email).toBe('newuser@example.com')

      // Step 3: Get user profile
      prismaMock.user.findUnique.mockResolvedValueOnce(newUser)

      const meResponse = await request(app).get('/api/auth/me').set('Authorization', 'Bearer new-user-token')

      expectSuccessResponse(meResponse)
      expect(meResponse.body.user.id).toBe(newUser.id)

      // Step 4: Create first workspace
      const workspace = createWorkspace({
        userId: newUser.id,
        name: 'My First Workspace',
      })
      prismaMock.workspace.create.mockResolvedValueOnce(workspace)

      const createWorkspaceResponse = await request(app)
        .post('/api/workspaces')
        .set('Authorization', 'Bearer new-user-token')
        .send({ name: 'My First Workspace' })

      expectSuccessResponse(createWorkspaceResponse, 201)
      expect(createWorkspaceResponse.body.workspace.name).toBe('My First Workspace')

      // Step 5: List workspaces
      prismaMock.workspace.findMany.mockResolvedValueOnce([{ ...workspace, _count: { pages: 0 } }])

      const listResponse = await request(app).get('/api/workspaces').set('Authorization', 'Bearer new-user-token')

      expectSuccessResponse(listResponse)
      expect(listResponse.body.workspaces).toHaveLength(1)
    })

    it('should handle complete workspace management flow', async () => {
      const { user, workspaces } = createCompleteUserData()
      const workspace = workspaces[0].workspace
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      // Step 1: List all workspaces
      prismaMock.workspace.findMany.mockResolvedValueOnce(
        workspaces.map((w) => ({
          ...w.workspace,
          _count: { pages: w.pages.length },
        }))
      )

      const listResponse = await authRequest('get', '/api/workspaces')
      expectSuccessResponse(listResponse)
      expect(listResponse.body.workspaces).toHaveLength(2)

      // Step 2: Get specific workspace with pages
      prismaMock.workspace.findFirst.mockResolvedValueOnce({
        ...workspace,
        pages: workspaces[0].pages.map((p) => ({
          ...p,
          _count: { children: 0 },
        })),
      })

      const getResponse = await authRequest('get', `/api/workspaces/${workspace.id}`)
      expectSuccessResponse(getResponse)
      expect(getResponse.body.workspace.pages).toHaveLength(3)

      // Step 3: Update workspace
      const updatedWorkspace = { ...workspace, name: 'Updated Workspace' }
      prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)
      prismaMock.workspace.update.mockResolvedValueOnce(updatedWorkspace)

      const updateResponse = await authRequest('put', `/api/workspaces/${workspace.id}`).send({ name: 'Updated Workspace' })
      expectSuccessResponse(updateResponse)
      expect(updateResponse.body.workspace.name).toBe('Updated Workspace')

      // Step 4: Delete workspace
      prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)
      prismaMock.workspace.delete.mockResolvedValueOnce(workspace)

      const deleteResponse = await authRequest('delete', `/api/workspaces/${workspace.id}`)
      expect(deleteResponse.status).toBe(204)
    })
  })

  describe('✅ Cross-Route Security', () => {
    it('should enforce authentication across all protected routes', async () => {
      const protectedEndpoints = [
        { method: 'post', path: '/api/auth/sync-user' },
        { method: 'get', path: '/api/auth/me' },
        { method: 'get', path: '/api/workspaces' },
        { method: 'post', path: '/api/workspaces' },
        { method: 'get', path: '/api/workspaces/test-id' },
        { method: 'put', path: '/api/workspaces/test-id' },
        { method: 'delete', path: '/api/workspaces/test-id' },
      ]

      for (const endpoint of protectedEndpoints) {
        const response = await request(app)[endpoint.method](endpoint.path)
        expect(response.status).toBe(401)
        expect(response.body.error).toMatch(/Missing or invalid authorization header|Unauthorized/)
      }
    })

    it('should prevent cross-user data access', async () => {
      const user1 = createUser()
      const user2 = createUser()
      const user1Workspace = createWorkspace({ userId: user1.id })

      // User 2 tries to access User 1's workspace
      const { request: user2Request } = createAuthenticatedRequest(app, user2)

      // Try to get workspace
      prismaMock.workspace.findFirst.mockResolvedValueOnce(null)
      const getResponse = await user2Request('get', `/api/workspaces/${user1Workspace.id}`)
      expect(getResponse.status).toBe(404)

      // Try to update workspace
      prismaMock.workspace.findFirst.mockResolvedValueOnce(null)
      const updateResponse = await user2Request('put', `/api/workspaces/${user1Workspace.id}`).send({ name: 'Hacked!' })
      expect(updateResponse.status).toBe(404)

      // Try to delete workspace
      prismaMock.workspace.findFirst.mockResolvedValueOnce(null)
      const deleteResponse = await user2Request('delete', `/api/workspaces/${user1Workspace.id}`)
      expect(deleteResponse.status).toBe(404)
    })
  })

  describe('✅ Error Handling Consistency', () => {
    it('should return consistent error format across all endpoints', async () => {
      const errorEndpoints = [
        {
          method: 'post',
          path: '/api/auth/verify',
          setup: () => {
            ;(auth.verifyIdToken as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'))
          },
          headers: { Authorization: 'Bearer bad-token' },
        },
        {
          method: 'post',
          path: '/api/workspaces',
          setup: () => {
            prismaMock.user.findUnique.mockResolvedValueOnce(createUser())
          },
          headers: { Authorization: 'Bearer valid-token' },
          body: { name: '' }, // Invalid
        },
      ]

      for (const endpoint of errorEndpoints) {
        if (endpoint.setup) endpoint.setup()

        const req = request(app)[endpoint.method](endpoint.path)

        if (endpoint.headers) {
          Object.entries(endpoint.headers).forEach(([key, value]) => {
            req.set(key, value)
          })
        }

        if (endpoint.body) {
          req.send(endpoint.body)
        }

        const response = await req

        expect(response.status).toBeGreaterThanOrEqual(400)
        expect(response.body).toHaveProperty('error')
        expect(typeof response.body.error).toBe('string')
      }
    })
  })

  describe('✅ CORS and Headers', () => {
    it('should set CORS headers on all routes', async () => {
      const endpoints = [
        { method: 'get', path: '/api/health' },
        { method: 'post', path: '/api/auth/verify' },
        { method: 'get', path: '/api/workspaces' },
      ]

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path)

        expect(response.headers['access-control-allow-origin']).toBeDefined()
        expect(response.headers['access-control-allow-credentials']).toBe('true')
      }
    })

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/workspaces')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'content-type,authorization')

      expect(response.status).toBe(204)
      expect(response.headers['access-control-allow-origin']).toBeDefined()
      expect(response.headers['access-control-allow-methods']).toBeDefined()
      expect(response.headers['access-control-allow-headers']).toBeDefined()
    })
  })

  describe('✅ Content Type Handling', () => {
    it('should parse JSON bodies correctly', async () => {
      const user = createUser()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      prismaMock.workspace.create.mockResolvedValueOnce(createWorkspace({ userId: user.id }))

      const response = await authRequest('post', '/api/workspaces').set('Content-Type', 'application/json').send({ name: 'Test Workspace' })

      expectSuccessResponse(response, 201)
    })

    it('should reject non-JSON content types for POST/PUT', async () => {
      const user = createUser()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      const response = await authRequest('post', '/api/workspaces').set('Content-Type', 'text/plain').send('name=Test Workspace')

      // Express will try to parse it as JSON and fail
      expect(response.status).toBe(400)
    })
  })

  describe('✅ Performance and Limits', () => {
    it('should handle large payloads appropriately', async () => {
      const user = createUser()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      const largeDescription = 'a'.repeat(10000) // 10KB of text
      const response = await authRequest('post', '/api/workspaces').send({
        name: 'Test',
        description: largeDescription,
      })

      // Should either succeed or fail with appropriate error
      if (response.status === 201) {
        expect(response.body.workspace).toBeDefined()
      } else {
        expect(response.status).toBe(400) // Payload too large or validation error
      }
    })

    it('should handle concurrent requests from same user', async () => {
      const user = createUser()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      prismaMock.workspace.findMany.mockResolvedValue([])

      const requests = Array.from({ length: 10 }, () => authRequest('get', '/api/workspaces'))

      const responses = await Promise.all(requests)

      responses.forEach((response) => {
        expectSuccessResponse(response)
      })
    })
  })
})
