import type { VercelRequest, VercelResponse } from '@vercel/node'
import handler from './[versionId]'
import { prisma } from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth-helpers'
import { z } from 'zod'

// Mock dependencies
jest.mock('../../../lib/auth-helpers')
jest.mock('../../../lib/firebase-admin')
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({})),
  BlockType: {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    paragraph: 'paragraph',
    bullet: 'bullet',
  },
}))
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    page: {
      findFirst: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    contentVersion: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    block: {
      updateMany: jest.fn(),
      createMany: jest.fn(),
    },
  },
}))

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/pages/[id]/versions/[versionId]', () => {
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
      method: 'GET',
      query: { id: 'cuid123456789012345678901', versionId: 'cuid223456789012345678901' },
      headers: {},
    }

    // Mock auth to succeed by default
    mockRequireAuth.mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
    })
  })

  describe('GET method', () => {
    it('should return version details successfully', async () => {
      const mockPage = { id: 'cuid123456789012345678901' }
      const mockVersion = {
        id: 'cuid223456789012345678901',
        versionNumber: 1,
        title: 'Test Version Title',
        blocks: [
          {
            id: 'block-1',
            type: 'paragraph',
            content: 'Test content',
            order: 0,
            metadata: null,
          },
        ],
        createdAt: new Date('2025-01-10T10:00:00Z'),
        user: {
          displayName: 'Test User',
          email: 'test@example.com',
        },
      }

      mockPrisma.page.findFirst.mockResolvedValue(mockPage)
      mockPrisma.contentVersion.findFirst.mockResolvedValue(mockVersion)

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(200)
      expect(jsonData.data).toEqual({
        version: {
          id: 'cuid223456789012345678901',
          versionNumber: 1,
          title: 'Test Version Title',
          blocks: [
            {
              id: 'block-1',
              type: 'paragraph',
              content: 'Test content',
              order: 0,
              metadata: null,
            },
          ],
          createdAt: '2025-01-10T10:00:00.000Z',
          createdBy: {
            displayName: 'Test User',
            email: 'test@example.com',
          },
        },
      })
    })

    it('should return error if version not found', async () => {
      const mockPage = { id: 'cuid123456789012345678901' }

      mockPrisma.page.findFirst.mockResolvedValue(mockPage)
      mockPrisma.contentVersion.findFirst.mockResolvedValue(null)

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(404)
      expect(jsonData.error).toEqual({
        code: 'VERSION_NOT_FOUND',
        message: 'The requested version does not exist',
      })
    })
  })

  describe('POST method (restore)', () => {
    it('should restore version successfully', async () => {
      req.method = 'POST'

      const mockPage = { id: 'cuid123456789012345678901' }
      const mockVersion = {
        title: 'Restored Title',
        blocks: [
          {
            id: 'block-1',
            type: 'paragraph',
            content: 'Restored content',
            order: 0,
            metadata: null,
          },
        ],
      }

      const mockRestoredPage = {
        id: 'test-page-id',
        title: 'Restored Title',
        updatedAt: new Date(),
        blocks: [
          {
            id: 'cuidb23456789012345678901',
            type: 'paragraph',
            content: 'Restored content',
            order: 0,
            metadata: null,
          },
        ],
      }

      mockPrisma.page.findFirst.mockResolvedValue(mockPage)
      mockPrisma.contentVersion.findFirst.mockResolvedValue(mockVersion)

      // Mock transaction to execute all operations and return the restored page
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            update: jest.fn(),
            findUnique: jest.fn().mockResolvedValue(mockRestoredPage),
          },
          block: {
            updateMany: jest.fn(),
            createMany: jest.fn(),
          },
          contentVersion: {
            findFirst: jest.fn().mockResolvedValue({ versionNumber: 2 }),
            create: jest.fn(),
            findMany: jest.fn().mockResolvedValue([]),
            deleteMany: jest.fn(),
          },
        }
        return callback(tx as any)
      })

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(200)
      expect(jsonData.data).toEqual({
        page: mockRestoredPage,
        message: 'Page restored successfully from version',
      })
    })

    it('should handle version cleanup during restore', async () => {
      req.method = 'POST'

      const mockPage = { id: 'cuid123456789012345678901' }
      const mockVersion = {
        title: 'Restored Title',
        blocks: [],
      }

      // Mock versions to delete (simulating more than 10 versions)
      const versionsToDelete = Array.from({ length: 5 }, (_, i) => ({ id: `old-version-${i}` }))

      mockPrisma.page.findFirst.mockResolvedValue(mockPage)
      mockPrisma.contentVersion.findFirst.mockResolvedValue(mockVersion)

      let deleteManyCalled = false

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            update: jest.fn(),
            findUnique: jest.fn().mockResolvedValue({
              id: 'test-page-id',
              title: 'Restored Title',
              updatedAt: new Date(),
              blocks: [],
            }),
          },
          block: {
            updateMany: jest.fn(),
            createMany: jest.fn(),
          },
          contentVersion: {
            findFirst: jest.fn().mockResolvedValue({ versionNumber: 15 }),
            create: jest.fn(),
            findMany: jest.fn().mockResolvedValue(versionsToDelete),
            deleteMany: jest.fn().mockImplementation(() => {
              deleteManyCalled = true
            }),
          },
        }
        return callback(tx as any)
      })

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(200)
      expect(deleteManyCalled).toBe(true)
    })

    it('should return error if IDs are missing', async () => {
      req.query = { id: 'test-page-id' } // Missing versionId

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(400)
      expect(jsonData.error).toEqual({
        code: 'MISSING_ID',
        message: 'Page ID and Version ID are required',
      })
    })

    it('should return error for unsupported methods', async () => {
      req.method = 'DELETE'

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(405)
      expect(jsonData.error).toEqual({
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET or POST methods are allowed',
      })
    })

    it('should handle database errors during restore', async () => {
      req.method = 'POST'

      mockPrisma.page.findFirst.mockResolvedValue({ id: 'test-page-id' })
      mockPrisma.contentVersion.findFirst.mockRejectedValue(new Error('Database error'))

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(500)
      expect(jsonData.error).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'Failed to process version request',
      })
    })
  })
})
