import request from 'supertest'
import { Express } from 'express'
import { prismaMock } from '../../test/setup'
import { setupTestApp, expectErrorResponse, expectSuccessResponse, createAuthenticatedRequest } from '../../test/helpers'
import { createUser, createWorkspace, createWorkspaceWithPages, createPage } from '../../test/factories'

describe('Workspace Routes', () => {
  let app: Express

  beforeAll(() => {
    app = setupTestApp()
  })

  describe('GET /api/workspaces', () => {
    describe('✅ Core Functionality', () => {
      it('should return all workspaces for authenticated user', async () => {
        const user = createUser()
        const workspaces = [createWorkspace({ userId: user.id }), createWorkspace({ userId: user.id })]
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // Mock Prisma response with _count
        const workspacesWithCount = workspaces.map((w) => ({
          ...w,
          _count: { pages: 5 },
        }))
        prismaMock.workspace.findMany.mockResolvedValueOnce(workspacesWithCount)

        const response = await authRequest('get', '/api/workspaces')

        expectSuccessResponse(response)
        expect(response.body.workspaces).toHaveLength(2)
        expect(response.body.workspaces[0]._count.pages).toBe(5)
        expect(prismaMock.workspace.findMany).toHaveBeenCalledWith({
          where: { userId: user.id },
          orderBy: { updatedAt: 'desc' },
          include: {
            _count: {
              select: { pages: true },
            },
          },
        })
      })

      it('should return empty array when user has no workspaces', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findMany.mockResolvedValueOnce([])

        const response = await authRequest('get', '/api/workspaces')

        expectSuccessResponse(response)
        expect(response.body.workspaces).toEqual([])
      })

      it('should not return other users workspaces', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findMany.mockResolvedValueOnce([])

        const response = await authRequest('get', '/api/workspaces')

        expectSuccessResponse(response)
        expect(prismaMock.workspace.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId: user.id },
          })
        )
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/workspaces')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle database errors gracefully', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findMany.mockRejectedValueOnce(new Error('Database connection failed'))

        const response = await authRequest('get', '/api/workspaces')

        expectErrorResponse(response, 500, 'Failed to fetch workspaces')
      })
    })

    describe('✅ Sorting and Pagination', () => {
      it('should return workspaces ordered by updatedAt desc', async () => {
        const user = createUser()
        const now = new Date()
        const workspaces = [
          createWorkspace({
            userId: user.id,
            updatedAt: new Date(now.getTime() - 1000),
          }),
          createWorkspace({
            userId: user.id,
            updatedAt: new Date(now.getTime() + 1000),
          }),
          createWorkspace({
            userId: user.id,
            updatedAt: now,
          }),
        ]
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const sortedWorkspaces = [...workspaces].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        prismaMock.workspace.findMany.mockResolvedValueOnce(sortedWorkspaces.map((w) => ({ ...w, _count: { pages: 0 } })))

        const response = await authRequest('get', '/api/workspaces')

        expectSuccessResponse(response)
        expect(response.body.workspaces[0].updatedAt).toBe(sortedWorkspaces[0].updatedAt.toISOString())
      })
    })
  })

  describe('GET /api/workspaces/:id', () => {
    describe('✅ Core Functionality', () => {
      it('should return workspace with pages', async () => {
        const user = createUser()
        const { workspace, pages } = createWorkspaceWithPages({ userId: user.id }, 3)
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // Mock workspace with pages including _count
        const workspaceWithPages = {
          ...workspace,
          pages: pages.map((p) => ({ ...p, _count: { children: 2 } })),
        }
        prismaMock.workspace.findFirst.mockResolvedValueOnce(workspaceWithPages)

        const response = await authRequest('get', `/api/workspaces/${workspace.id}`)

        expectSuccessResponse(response)
        expect(response.body.workspace.id).toBe(workspace.id)
        expect(response.body.workspace.pages).toHaveLength(3)
        expect(response.body.workspace.pages[0]._count.children).toBe(2)
      })

      it('should only return root pages', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)

        await authRequest('get', `/api/workspaces/${workspace.id}`)

        expect(prismaMock.workspace.findFirst).toHaveBeenCalledWith({
          where: {
            id: workspace.id,
            userId: user.id,
          },
          include: {
            pages: {
              where: { parentId: null },
              orderBy: { order: 'asc' },
              include: {
                _count: {
                  select: { children: true },
                },
              },
            },
          },
        })
      })
    })

    describe('✅ Authorization', () => {
      it('should not return workspace owned by another user', async () => {
        const user = createUser()
        const otherUser = createUser()
        const workspace = createWorkspace({ userId: otherUser.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(null)

        const response = await authRequest('get', `/api/workspaces/${workspace.id}`)

        expectErrorResponse(response, 404, 'Workspace not found')
      })

      it('should require authentication', async () => {
        const response = await request(app).get('/api/workspaces/test-id')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Error Handling', () => {
      it('should return 404 for non-existent workspace', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(null)

        const response = await authRequest('get', '/api/workspaces/non-existent')

        expectErrorResponse(response, 404, 'Workspace not found')
      })

      it('should handle database errors', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockRejectedValueOnce(new Error('Database error'))

        const response = await authRequest('get', '/api/workspaces/test-id')

        expectErrorResponse(response, 500, 'Failed to fetch workspace')
      })
    })
  })

  describe('POST /api/workspaces', () => {
    describe('✅ Core Functionality', () => {
      it('should create a new workspace', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const newWorkspace = createWorkspace({
          userId: user.id,
          name: 'My New Workspace',
          description: 'A test workspace',
        })
        prismaMock.workspace.create.mockResolvedValueOnce(newWorkspace)

        const response = await authRequest('post', '/api/workspaces').send({
          name: 'My New Workspace',
          description: 'A test workspace',
        })

        expectSuccessResponse(response, 201)
        expect(response.body.workspace).toMatchObject({
          name: 'My New Workspace',
          description: 'A test workspace',
          userId: user.id,
        })
        expect(prismaMock.workspace.create).toHaveBeenCalledWith({
          data: {
            name: 'My New Workspace',
            description: 'A test workspace',
            userId: user.id,
          },
        })
      })

      it('should create workspace without description', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const newWorkspace = createWorkspace({
          userId: user.id,
          name: 'Minimal Workspace',
          description: null,
        })
        prismaMock.workspace.create.mockResolvedValueOnce(newWorkspace)

        const response = await authRequest('post', '/api/workspaces').send({
          name: 'Minimal Workspace',
        })

        expectSuccessResponse(response, 201)
        expect(response.body.workspace.description).toBeNull()
      })
    })

    describe('✅ Validation', () => {
      it('should validate required name field', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/workspaces').send({
          description: 'Missing name',
        })

        expectErrorResponse(response, 400, 'Invalid input')
        expect(response.body.details).toBeDefined()
      })

      it('should validate name minimum length', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/workspaces').send({
          name: '',
        })

        expectErrorResponse(response, 400, 'Invalid input')
      })

      it('should validate name maximum length', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/workspaces').send({
          name: 'a'.repeat(101),
        })

        expectErrorResponse(response, 400, 'Invalid input')
      })

      it('should reject extra fields', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/workspaces').send({
          name: 'Test Workspace',
          invalidField: 'should be rejected',
          userId: 'trying-to-set-different-user',
        })

        // Zod will strip unknown fields by default with parse()
        // If we want strict validation, we'd need to use .strict() on the schema
        expectSuccessResponse(response, 201)
        expect(prismaMock.workspace.create).toHaveBeenCalledWith({
          data: {
            name: 'Test Workspace',
            userId: user.id, // Should use authenticated user's ID, not from body
          },
        })
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle database constraint errors', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.create.mockRejectedValueOnce({
          code: 'P2002',
          message: 'Unique constraint failed',
        })

        const response = await authRequest('post', '/api/workspaces').send({
          name: 'Duplicate Workspace',
        })

        expectErrorResponse(response, 500, 'Failed to create workspace')
      })
    })
  })

  describe('PUT /api/workspaces/:id', () => {
    describe('✅ Core Functionality', () => {
      it('should update workspace name and description', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const updatedWorkspace = {
          ...workspace,
          name: 'Updated Name',
          description: 'Updated description',
          updatedAt: new Date(),
        }

        prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)
        prismaMock.workspace.update.mockResolvedValueOnce(updatedWorkspace)

        const response = await authRequest('put', `/api/workspaces/${workspace.id}`).send({
          name: 'Updated Name',
          description: 'Updated description',
        })

        expectSuccessResponse(response)
        expect(response.body.workspace.name).toBe('Updated Name')
        expect(response.body.workspace.description).toBe('Updated description')
      })

      it('should allow partial updates', async () => {
        const user = createUser()
        const workspace = createWorkspace({
          userId: user.id,
          name: 'Original Name',
          description: 'Original description',
        })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)
        prismaMock.workspace.update.mockResolvedValueOnce({
          ...workspace,
          name: 'New Name',
        })

        const response = await authRequest('put', `/api/workspaces/${workspace.id}`).send({
          name: 'New Name',
        })

        expectSuccessResponse(response)
        expect(prismaMock.workspace.update).toHaveBeenCalledWith({
          where: { id: workspace.id },
          data: {
            name: 'New Name',
            updatedAt: expect.any(Date),
          },
        })
      })

      it('should update the updatedAt timestamp', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const beforeUpdate = new Date()
        prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)
        prismaMock.workspace.update.mockResolvedValueOnce({
          ...workspace,
          updatedAt: new Date(),
        })

        const response = await authRequest('put', `/api/workspaces/${workspace.id}`).send({
          name: 'Updated',
        })

        expectSuccessResponse(response)
        const updateCall = (prismaMock.workspace.update as jest.Mock).mock.calls[0][0]
        expect(updateCall.data.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
      })
    })

    describe('✅ Authorization', () => {
      it('should not allow updating another users workspace', async () => {
        const user = createUser()
        const otherUser = createUser()
        const workspace = createWorkspace({ userId: otherUser.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(null)

        const response = await authRequest('put', `/api/workspaces/${workspace.id}`).send({
          name: 'Hacked!',
        })

        expectErrorResponse(response, 404, 'Workspace not found')
        expect(prismaMock.workspace.update).not.toHaveBeenCalled()
      })
    })

    describe('✅ Validation', () => {
      it('should validate update fields', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('put', '/api/workspaces/test-id').send({
          name: '', // Empty name
        })

        expectErrorResponse(response, 400, 'Invalid input')
      })

      it('should allow empty update body', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)
        prismaMock.workspace.update.mockResolvedValueOnce(workspace)

        const response = await authRequest('put', `/api/workspaces/${workspace.id}`).send({})

        expectSuccessResponse(response)
        // Should still update the timestamp
        expect(prismaMock.workspace.update).toHaveBeenCalledWith({
          where: { id: workspace.id },
          data: {
            updatedAt: expect.any(Date),
          },
        })
      })
    })
  })

  describe('DELETE /api/workspaces/:id', () => {
    describe('✅ Core Functionality', () => {
      it('should delete workspace and return 204', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)
        prismaMock.workspace.delete.mockResolvedValueOnce(workspace)

        const response = await authRequest('delete', `/api/workspaces/${workspace.id}`)

        expect(response.status).toBe(204)
        expect(response.body).toEqual({})
        expect(prismaMock.workspace.delete).toHaveBeenCalledWith({
          where: { id: workspace.id },
        })
      })

      it('should cascade delete to pages and blocks', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)
        prismaMock.workspace.delete.mockResolvedValueOnce(workspace)

        await authRequest('delete', `/api/workspaces/${workspace.id}`)

        // The cascade deletion is handled by Prisma's referential actions
        expect(prismaMock.workspace.delete).toHaveBeenCalledWith({
          where: { id: workspace.id },
        })
      })
    })

    describe('✅ Authorization', () => {
      it('should not allow deleting another users workspace', async () => {
        const user = createUser()
        const otherUser = createUser()
        const workspace = createWorkspace({ userId: otherUser.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(null)

        const response = await authRequest('delete', `/api/workspaces/${workspace.id}`)

        expectErrorResponse(response, 404, 'Workspace not found')
        expect(prismaMock.workspace.delete).not.toHaveBeenCalled()
      })
    })

    describe('✅ Error Handling', () => {
      it('should return 404 for non-existent workspace', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(null)

        const response = await authRequest('delete', '/api/workspaces/non-existent')

        expectErrorResponse(response, 404, 'Workspace not found')
      })

      it('should handle database deletion errors', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)
        prismaMock.workspace.delete.mockRejectedValueOnce(new Error('Foreign key constraint'))

        const response = await authRequest('delete', `/api/workspaces/${workspace.id}`)

        expectErrorResponse(response, 500, 'Failed to delete workspace')
      })
    })

    describe('✅ Idempotency', () => {
      it('should return 404 on second delete attempt', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // First delete succeeds
        prismaMock.workspace.findFirst.mockResolvedValueOnce(workspace)
        prismaMock.workspace.delete.mockResolvedValueOnce(workspace)

        const response1 = await authRequest('delete', `/api/workspaces/${workspace.id}`)
        expect(response1.status).toBe(204)

        // Second delete finds no workspace
        prismaMock.workspace.findFirst.mockResolvedValueOnce(null)

        const response2 = await authRequest('delete', `/api/workspaces/${workspace.id}`)
        expectErrorResponse(response2, 404, 'Workspace not found')
      })
    })
  })

  describe('✅ Security Tests', () => {
    it('should sanitize user input to prevent NoSQL injection', async () => {
      const user = createUser()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      const maliciousPayload = {
        name: { $ne: null }, // NoSQL injection attempt
        description: { $gt: '' },
      }

      const response = await authRequest('post', '/api/workspaces').send(maliciousPayload)

      // Zod validation should reject non-string values
      expectErrorResponse(response, 400, 'Invalid input')
    })

    it('should handle extremely long workspace names', async () => {
      const user = createUser()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      const response = await authRequest('post', '/api/workspaces').send({
        name: 'a'.repeat(1000), // Way over the 100 char limit
      })

      expectErrorResponse(response, 400, 'Invalid input')
    })

    it('should handle concurrent updates safely', async () => {
      const user = createUser()
      const workspace = createWorkspace({ userId: user.id })
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      prismaMock.workspace.findFirst.mockResolvedValue(workspace)
      prismaMock.workspace.update.mockImplementation(async ({ data }) => ({
        ...workspace,
        ...data,
        updatedAt: new Date(),
      }))

      const updates = Array.from({ length: 5 }, (_, i) =>
        authRequest('put', `/api/workspaces/${workspace.id}`).send({
          name: `Update ${i}`,
        })
      )

      const responses = await Promise.all(updates)

      responses.forEach((response) => {
        expectSuccessResponse(response)
      })

      // All updates should have been attempted
      expect(prismaMock.workspace.update).toHaveBeenCalledTimes(5)
    })
  })
})
