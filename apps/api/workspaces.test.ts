import type { VercelRequest, VercelResponse } from '@vercel/node'
import handler from './workspaces'
import { prisma } from '@kairos/database'
import { verifyIdToken } from './lib/firebase-admin'

// Mock dependencies
jest.mock('./lib/firebase-admin')
jest.mock('@kairos/database', () => ({
  prisma: {
    workspace: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    page: {
      create: jest.fn(),
    },
    block: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

const mockVerifyIdToken = verifyIdToken as jest.MockedFunction<typeof verifyIdToken>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/workspaces', () => {
  let req: Partial<VercelRequest>
  let res: Partial<VercelResponse>
  let jsonData: any
  let statusCode: number

  beforeEach(() => {
    jest.clearAllMocks()
    jsonData = null
    statusCode = 200

    // Mock response object
    res = {
      status: jest.fn().mockImplementation((code: number) => {
        statusCode = code
        return res
      }),
      json: jest.fn().mockImplementation((data: any) => {
        jsonData = data
        return res
      }),
      setHeader: jest.fn().mockReturnThis(),
    }

    // Mock request object
    req = {
      headers: {},
      query: {},
      body: {},
      method: 'GET',
    }

    // Default mock for authenticated user
    mockVerifyIdToken.mockResolvedValue({
      uid: 'test-firebase-uid',
      email: 'test@example.com',
    } as any)

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'test-user-id',
      firebaseUid: 'test-firebase-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })
  })

  describe('Authentication', () => {
    it('should require authentication for all methods', async () => {
      req.headers.authorization = ''

      const methods = ['GET', 'POST', 'PUT', 'DELETE']
      for (const method of methods) {
        req.method = method
        await handler(req as any, res as any)
        expect(statusCode).toBe(401)
        expect(jsonData).toEqual({
          error: {
            code: 'UNAUTHORIZED',
            message: 'No authentication token provided',
          },
        })
        // Reset for next iteration
        statusCode = 200
        jsonData = null
      }
    })

    it('should reject invalid tokens', async () => {
      req.headers.authorization = 'Bearer invalid-token'
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'))
      mockPrisma.user.findUnique.mockResolvedValue(null)

      req.method = 'GET'
      await handler(req as any, res as any)

      expect(statusCode).toBe(401)
      expect(jsonData).toEqual({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired authentication token',
        },
      })
    })
  })

  describe('GET /api/workspaces', () => {
    beforeEach(() => {
      req.method = 'GET'
      req.headers.authorization = 'Bearer valid-token'
    })

    it('should list all workspaces for authenticated user', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Workspace 1',
          userId: 'test-user-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'workspace-2',
          name: 'Workspace 2',
          userId: 'test-user-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ]

      mockPrisma.workspace.findMany.mockResolvedValue(mockWorkspaces)

      await handler(req as any, res as any)

      expect(statusCode).toBe(200)
      expect(jsonData).toEqual({ data: mockWorkspaces })
      expect(mockPrisma.workspace.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'test-user-id',
          deletedAt: null,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
    })

    it('should return single workspace when id is provided', async () => {
      req.query = { id: 'cuid123456789012345678901' }

      const mockWorkspace = {
        id: 'cuid123456789012345678901',
        name: 'Test Workspace',
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }

      mockPrisma.workspace.findFirst.mockResolvedValue(mockWorkspace)

      await handler(req as any, res as any)

      expect(statusCode).toBe(200)
      expect(jsonData).toEqual({ data: mockWorkspace })
      expect(mockPrisma.workspace.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'cuid123456789012345678901',
          userId: 'test-user-id',
          deletedAt: null,
        },
      })
    })

    it('should return 404 when workspace not found', async () => {
      req.query = { id: 'cuid123456789012345678901' }
      mockPrisma.workspace.findFirst.mockResolvedValue(null)

      await handler(req as any, res as any)

      expect(statusCode).toBe(404)
      expect(jsonData).toEqual({
        error: {
          code: 'WORKSPACE_NOT_FOUND',
          message: 'The requested workspace does not exist',
        },
      })
    })

    it('should return 400 for invalid workspace id format', async () => {
      req.query = { id: 'invalid-id' }

      await handler(req as any, res as any)

      expect(statusCode).toBe(400)
      expect(jsonData.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /api/workspaces', () => {
    beforeEach(() => {
      req.method = 'POST'
      req.headers.authorization = 'Bearer valid-token'
    })

    it('should create new workspace with default page and block', async () => {
      req.body = { name: 'New Workspace' }

      const mockWorkspace = {
        id: 'new-workspace-id',
        name: 'New Workspace',
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }

      const mockPage = {
        id: 'new-page-id',
        title: 'Getting Started',
        workspaceId: 'new-workspace-id',
        order: 0,
      }

      const mockBlock = {
        id: 'new-block-id',
        type: 'paragraph',
        content: '',
        pageId: 'new-page-id',
        position: 0,
        metadata: {},
      }

      // Mock the transaction to execute the callback and return the result
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          workspace: {
            create: jest.fn().mockResolvedValue(mockWorkspace),
          },
          page: {
            create: jest.fn().mockResolvedValue(mockPage),
          },
          block: {
            create: jest.fn().mockResolvedValue(mockBlock),
          },
        }
        return callback(tx)
      })

      await handler(req as any, res as any)

      expect(statusCode).toBe(201)
      expect(jsonData).toEqual({
        data: {
          ...mockWorkspace,
          defaultPageId: 'new-page-id',
        },
      })
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should validate workspace name', async () => {
      req.body = { name: '' }

      await handler(req as any, res as any)

      expect(statusCode).toBe(400)
      expect(jsonData.error.code).toBe('VALIDATION_ERROR')
    })

    it('should rollback workspace creation if page creation fails', async () => {
      req.body = { name: 'New Workspace' }

      // Mock the transaction to throw an error during page creation
      mockPrisma.$transaction.mockRejectedValue(new Error('Failed to create page'))

      await handler(req as any, res as any)

      expect(statusCode).toBe(500)
      expect(jsonData).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create page',
        },
      })
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })
  })

  describe('PUT /api/workspaces', () => {
    beforeEach(() => {
      req.method = 'PUT'
      req.headers.authorization = 'Bearer valid-token'
    })

    it('should update workspace name', async () => {
      req.query = { id: 'cuid123456789012345678901' }
      req.body = { name: 'Updated Workspace' }

      const existingWorkspace = {
        id: 'cuid123456789012345678901',
        name: 'Old Workspace',
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }

      const updatedWorkspace = {
        ...existingWorkspace,
        name: 'Updated Workspace',
      }

      mockPrisma.workspace.findFirst.mockResolvedValue(existingWorkspace)
      mockPrisma.workspace.update.mockResolvedValue(updatedWorkspace)

      await handler(req as any, res as any)

      expect(statusCode).toBe(200)
      expect(jsonData).toEqual({ data: updatedWorkspace })
      expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
        where: { id: 'cuid123456789012345678901' },
        data: { name: 'Updated Workspace' },
      })
    })

    it('should return 400 when id is missing', async () => {
      req.body = { name: 'Updated Workspace' }

      await handler(req as any, res as any)

      expect(statusCode).toBe(400)
      expect(jsonData).toEqual({
        error: {
          code: 'MISSING_ID',
          message: 'Workspace ID is required',
        },
      })
    })

    it('should return 404 when workspace not found', async () => {
      req.query = { id: 'cuid123456789012345678901' }
      req.body = { name: 'Updated Workspace' }
      mockPrisma.workspace.findFirst.mockResolvedValue(null)

      await handler(req as any, res as any)

      expect(statusCode).toBe(404)
    })
  })

  describe('DELETE /api/workspaces', () => {
    beforeEach(() => {
      req.method = 'DELETE'
      req.headers.authorization = 'Bearer valid-token'
    })

    it('should soft delete workspace', async () => {
      req.query = { id: 'cuid123456789012345678901' }

      const existingWorkspace = {
        id: 'cuid123456789012345678901',
        name: 'Workspace to Delete',
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }

      mockPrisma.workspace.findFirst.mockResolvedValue(existingWorkspace)
      mockPrisma.workspace.update.mockResolvedValue({
        ...existingWorkspace,
        deletedAt: new Date(),
      })

      await handler(req as any, res as any)

      expect(statusCode).toBe(200)
      expect(jsonData).toEqual({
        data: { message: 'Workspace deleted successfully' },
      })
      expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
        where: { id: 'cuid123456789012345678901' },
        data: {
          deletedAt: expect.any(Date),
        },
      })
    })

    it('should return 400 when id is missing', async () => {
      await handler(req as any, res as any)

      expect(statusCode).toBe(400)
      expect(jsonData).toEqual({
        error: {
          code: 'MISSING_ID',
          message: 'Workspace ID is required',
        },
      })
    })
  })

  describe('Method Not Allowed', () => {
    it('should return 405 for unsupported methods', async () => {
      req.method = 'PATCH'
      req.headers.authorization = 'Bearer valid-token'

      await handler(req as any, res as any)

      expect(statusCode).toBe(405)
      expect(jsonData).toEqual({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method not allowed. Allowed methods: GET, POST, PUT, DELETE',
        },
      })
      expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET, POST, PUT, DELETE')
    })
  })
})
