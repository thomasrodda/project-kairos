import type { VercelRequest, VercelResponse } from '@vercel/node'
import handler from './versions'
import { prisma } from '../../lib/prisma'
import { requireAuth } from '../../lib/auth-helpers'
import { z } from 'zod'

// Mock dependencies
jest.mock('../../lib/auth-helpers')
jest.mock('../../lib/firebase-admin')
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
jest.mock('../../lib/prisma', () => ({
  prisma: {
    page: {
      findFirst: jest.fn(),
    },
    contentVersion: {
      findMany: jest.fn(),
    },
  },
}))

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/pages/[id]/versions', () => {
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
      query: { id: 'cuid123456789012345678901' },
      headers: {},
    }

    // Mock auth to succeed by default
    mockRequireAuth.mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
    })
  })

  describe('GET method', () => {
    it('should return page versions successfully', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        title: 'Test Page',
      }

      const mockVersions = [
        {
          id: 'version-1',
          versionNumber: 2,
          title: 'Updated Title',
          createdAt: new Date('2025-01-10T10:00:00Z'),
          user: {
            displayName: 'Test User',
            email: 'test@example.com',
          },
        },
        {
          id: 'version-2',
          versionNumber: 1,
          title: 'Original Title',
          createdAt: new Date('2025-01-10T09:00:00Z'),
          user: {
            displayName: 'Test User',
            email: 'test@example.com',
          },
        },
      ]

      mockPrisma.page.findFirst.mockResolvedValue(mockPage)
      mockPrisma.contentVersion.findMany.mockResolvedValue(mockVersions)

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(200)
      expect(jsonData.data).toEqual({
        page: {
          id: 'cuid123456789012345678901',
          title: 'Test Page',
        },
        versions: [
          {
            id: 'version-1',
            versionNumber: 2,
            title: 'Updated Title',
            createdAt: '2025-01-10T10:00:00.000Z',
            createdBy: {
              displayName: 'Test User',
              email: 'test@example.com',
            },
          },
          {
            id: 'version-2',
            versionNumber: 1,
            title: 'Original Title',
            createdAt: '2025-01-10T09:00:00.000Z',
            createdBy: {
              displayName: 'Test User',
              email: 'test@example.com',
            },
          },
        ],
      })

      // Verify Prisma calls
      expect(mockPrisma.page.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'cuid123456789012345678901',
          deletedAt: null,
          workspace: {
            userId: 'test-user-id',
            deletedAt: null,
          },
        },
        select: {
          id: true,
          title: true,
        },
      })

      expect(mockPrisma.contentVersion.findMany).toHaveBeenCalledWith({
        where: { pageId: 'cuid123456789012345678901' },
        orderBy: { versionNumber: 'desc' },
        select: {
          id: true,
          versionNumber: true,
          title: true,
          createdAt: true,
          user: {
            select: {
              displayName: true,
              email: true,
            },
          },
        },
      })
    })

    it('should return error if page not found', async () => {
      mockPrisma.page.findFirst.mockResolvedValue(null)

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(404)
      expect(jsonData.error).toEqual({
        code: 'PAGE_NOT_FOUND',
        message: 'The requested page does not exist',
      })
    })

    it('should return error if page ID is missing', async () => {
      req.query = {}

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(400)
      expect(jsonData.error).toEqual({
        code: 'MISSING_ID',
        message: 'Page ID is required',
      })
    })

    it('should return error if unauthorized', async () => {
      mockRequireAuth.mockResolvedValue(null)

      await handler(req as VercelRequest, res as VercelResponse)

      expect(mockRequireAuth).toHaveBeenCalled()
      expect(mockPrisma.page.findFirst).not.toHaveBeenCalled()
    })

    it('should return error for non-GET method', async () => {
      req.method = 'POST'

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(405)
      expect(jsonData.error).toEqual({
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed',
      })
    })

    it('should return empty array if no versions exist', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        title: 'Test Page',
      }

      mockPrisma.page.findFirst.mockResolvedValue(mockPage)
      mockPrisma.contentVersion.findMany.mockResolvedValue([])

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(200)
      expect(jsonData.data.versions).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.page.findFirst.mockRejectedValue(new Error('Database error'))

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(500)
      expect(jsonData.error).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve versions',
      })
    })

    it('should validate page ID format', async () => {
      req.query = { id: 'invalid-id-format' }

      await handler(req as VercelRequest, res as VercelResponse)

      expect(statusCode).toBe(400)
      expect(jsonData.error.code).toBe('VALIDATION_ERROR')
      expect(jsonData.error.details.errors).toBeDefined()
    })
  })
})
