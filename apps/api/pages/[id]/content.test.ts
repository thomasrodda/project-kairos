import type { VercelRequest, VercelResponse } from '@vercel/node'
import handler from './content'
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
    $transaction: jest.fn(),
    page: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    block: {
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      createMany: jest.fn(),
    },
    contentVersion: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/pages/[id]/content', () => {
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
      method: 'PUT',
    }

    // Default mock for authenticated user
    mockRequireAuth.mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        firebaseUid: 'test-firebase-uid',
      },
    })
  })

  describe('Method validation', () => {
    it('should only allow PUT method', async () => {
      const methods = ['GET', 'POST', 'DELETE', 'PATCH']
      for (const method of methods) {
        req.method = method
        req.query = { id: 'cuid123456789012345678901' }

        await handler(req as any, res as any)

        expect(statusCode).toBe(405)
        expect(jsonData).toEqual({
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Only PUT method is allowed',
          },
        })

        // Reset for next iteration
        statusCode = 200
        jsonData = null
      }
    })
  })

  describe('Authentication', () => {
    it('should require authentication', async () => {
      mockRequireAuth.mockResolvedValue(null)
      req.query = { id: 'cuid123456789012345678901' }

      await handler(req as any, res as any)

      expect(mockRequireAuth).toHaveBeenCalledWith(req, res)
    })
  })

  describe('PUT /api/pages/[id]/content', () => {
    beforeEach(() => {
      req.method = 'PUT'
      req.query = { id: 'cuid123456789012345678901' }
    })

    it('should require page ID', async () => {
      req.query = {}

      await handler(req as any, res as any)

      expect(statusCode).toBe(400)
      expect(jsonData).toEqual({
        error: {
          code: 'MISSING_ID',
          message: 'Page ID is required',
        },
      })
    })

    it('should validate page ID format', async () => {
      req.query = { id: 'invalid-id' }
      req.body = { title: 'Updated Title' }

      await handler(req as any, res as any)

      expect(statusCode).toBe(400)
      expect(jsonData.error.code).toBe('VALIDATION_ERROR')
    })

    it('should update only page title', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        title: 'Old Title',
        updatedAt: new Date('2024-01-01'),
      }

      const mockUpdatedPage = {
        id: 'cuid123456789012345678901',
        title: 'Updated Title',
        updatedAt: new Date(),
        blocks: [],
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(mockPage),
            update: jest.fn().mockResolvedValue(mockUpdatedPage),
            findUnique: jest.fn().mockResolvedValue(mockUpdatedPage),
          },
          block: {
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
          },
        }
        return await callback(tx)
      })

      req.body = { title: 'Updated Title' }

      await handler(req as any, res as any)

      expect(statusCode).toBe(200)
      expect(jsonData).toBeDefined()
      expect(jsonData.data).toBeDefined()
      expect(jsonData.data.page).toBeDefined()
      expect(jsonData.data.page.title).toBe('Updated Title')
      expect(jsonData.data.saveStatus).toBe('success')
      expect(jsonData.data.savedAt).toBeDefined()
    })

    it('should update blocks content and order', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        updatedAt: new Date('2024-01-01'),
      }

      const mockBlocks = [{ id: 'cuid12345678901234567890b1' }, { id: 'cuid12345678901234567890b2' }]

      const mockUpdatedPage = {
        id: 'cuid123456789012345678901',
        title: 'Test Page',
        updatedAt: new Date(),
        blocks: [
          {
            id: 'cuid12345678901234567890b1',
            type: 'h1',
            content: 'Updated Heading',
            order: 0,
            metadata: {},
            updatedAt: new Date(),
          },
          {
            id: 'cuid12345678901234567890b2',
            type: 'paragraph',
            content: 'Updated paragraph',
            order: 1,
            metadata: {},
            updatedAt: new Date(),
          },
        ],
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(mockPage),
            update: jest.fn(),
            findUnique: jest.fn().mockResolvedValue(mockUpdatedPage),
          },
          block: {
            findMany: jest.fn().mockResolvedValue(mockBlocks),
            update: jest.fn(),
            updateMany: jest.fn(),
          },
        }
        return await callback(tx)
      })

      req.body = {
        blocks: [
          {
            id: 'cuid12345678901234567890b1',
            type: 'h1',
            content: 'Updated Heading',
            order: 0,
          },
          {
            id: 'cuid12345678901234567890b2',
            type: 'paragraph',
            content: 'Updated paragraph',
            order: 1,
          },
        ],
      }

      await handler(req as any, res as any)

      expect(statusCode).toBe(200)
      expect(jsonData.data.page.blocks).toHaveLength(2)
      expect(jsonData.data.page.blocks[0].content).toBe('Updated Heading')
      expect(jsonData.data.page.blocks[1].content).toBe('Updated paragraph')
    })

    it('should handle block deletions', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        updatedAt: new Date('2024-01-01'),
      }

      const mockBlocksToDelete = [{ id: 'cuid12345678901234567890b1' }, { id: 'cuid12345678901234567890b2' }]

      const mockUpdatedPage = {
        id: 'cuid123456789012345678901',
        title: 'Test Page',
        updatedAt: new Date(),
        blocks: [], // All blocks deleted
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(mockPage),
            update: jest.fn(),
            findUnique: jest.fn().mockResolvedValue(mockUpdatedPage),
          },
          block: {
            findMany: jest.fn().mockResolvedValue(mockBlocksToDelete),
            update: jest.fn(),
            updateMany: jest.fn(),
          },
        }
        return await callback(tx)
      })

      req.body = {
        deletedBlockIds: ['cuid12345678901234567890b1', 'cuid12345678901234567890b2'],
      }

      await handler(req as any, res as any)

      expect(statusCode).toBe(200)
      expect(jsonData.data.page.blocks).toHaveLength(0)
    })

    it('should detect conflicts when page was updated by another user', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        updatedAt: new Date('2024-01-02'), // More recent than lastUpdatedAt
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(mockPage),
            update: jest.fn(),
            findUnique: jest.fn(),
          },
          block: {
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
          },
        }

        // Simulate conflict detection
        await tx.page.findFirst()
        throw new Error('CONFLICT_DETECTED')
      })

      req.body = {
        title: 'Updated Title',
        lastUpdatedAt: new Date('2024-01-01').toISOString(), // Older than page.updatedAt
      }

      await handler(req as any, res as any)

      expect(statusCode).toBe(409)
      expect(jsonData).toEqual({
        error: {
          code: 'CONFLICT_DETECTED',
          message: 'The page has been modified by another user or session',
          details: {
            message: 'Please refresh the page to get the latest content',
          },
        },
      })
    })

    it('should handle all updates in a single transaction', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        updatedAt: new Date('2024-01-01'),
      }

      const mockExistingBlocks = [{ id: 'cuid12345678901234567890b1' }, { id: 'cuid12345678901234567890b2' }]

      const mockBlocksToDelete = [{ id: 'cuid12345678901234567890b3' }]

      const mockUpdatedPage = {
        id: 'cuid123456789012345678901',
        title: 'Updated Title',
        updatedAt: new Date(),
        blocks: [
          {
            id: 'cuid12345678901234567890b1',
            type: 'h1',
            content: 'New Heading',
            order: 0,
            metadata: {},
            updatedAt: new Date(),
          },
          {
            id: 'cuid12345678901234567890b2',
            type: 'paragraph',
            content: 'New paragraph',
            order: 1,
            metadata: {},
            updatedAt: new Date(),
          },
        ],
      }

      let transactionCallbackExecuted = false

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        transactionCallbackExecuted = true
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(mockPage),
            update: jest.fn(),
            findUnique: jest.fn().mockResolvedValue(mockUpdatedPage),
          },
          block: {
            findMany: jest
              .fn()
              .mockResolvedValueOnce(mockExistingBlocks) // For block updates
              .mockResolvedValueOnce(mockBlocksToDelete), // For block deletions
            update: jest.fn(),
            updateMany: jest.fn(),
          },
        }
        return await callback(tx)
      })

      req.body = {
        title: 'Updated Title',
        blocks: [
          {
            id: 'cuid12345678901234567890b1',
            type: 'h1',
            content: 'New Heading',
            order: 0,
          },
          {
            id: 'cuid12345678901234567890b2',
            type: 'paragraph',
            content: 'New paragraph',
            order: 1,
          },
        ],
        deletedBlockIds: ['cuid12345678901234567890b3'],
      }

      await handler(req as any, res as any)

      expect(transactionCallbackExecuted).toBe(true)
      expect(statusCode).toBe(200)
      expect(jsonData.data.page.title).toBe('Updated Title')
      expect(jsonData.data.page.blocks).toHaveLength(2)
    })

    it('should return 404 when page not found', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
            findUnique: jest.fn(),
          },
          block: {
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
          },
        }

        await tx.page.findFirst()
        throw new Error('PAGE_NOT_FOUND')
      })

      req.body = { title: 'Updated Title' }

      await handler(req as any, res as any)

      expect(statusCode).toBe(404)
      expect(jsonData).toEqual({
        error: {
          code: 'PAGE_NOT_FOUND',
          message: 'The requested page does not exist',
        },
      })
    })

    it('should validate block IDs belong to the page', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        updatedAt: new Date(),
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(mockPage),
            update: jest.fn(),
            findUnique: jest.fn(),
          },
          block: {
            findMany: jest.fn().mockResolvedValue([{ id: 'cuid12345678901234567890b1' }]), // Only one block found
            update: jest.fn(),
            updateMany: jest.fn(),
          },
        }

        await tx.page.findFirst()
        await tx.block.findMany()
        throw new Error('INVALID_BLOCK_IDS')
      })

      req.body = {
        blocks: [
          { id: 'cuid12345678901234567890b1', type: 'paragraph', content: 'Text', order: 0 },
          { id: 'cuid12345678901234567890b2', type: 'paragraph', content: 'Text', order: 1 }, // This doesn't exist
        ],
      }

      await handler(req as any, res as any)

      expect(statusCode).toBe(400)
      expect(jsonData).toEqual({
        error: {
          code: 'INVALID_BLOCK_IDS',
          message: 'One or more block IDs are invalid',
        },
      })
    })

    it('should validate deleted block IDs belong to the page', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        updatedAt: new Date(),
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(mockPage),
            update: jest.fn(),
            findUnique: jest.fn(),
          },
          block: {
            findMany: jest.fn().mockResolvedValue([]), // No blocks found
            update: jest.fn(),
            updateMany: jest.fn(),
          },
        }

        await tx.page.findFirst()
        await tx.block.findMany()
        throw new Error('INVALID_DELETE_BLOCK_IDS')
      })

      req.body = {
        deletedBlockIds: ['cuid12345678901234567890b1', 'cuid12345678901234567890b2'], // These don't exist
      }

      await handler(req as any, res as any)

      expect(statusCode).toBe(400)
      expect(jsonData).toEqual({
        error: {
          code: 'INVALID_DELETE_BLOCK_IDS',
          message: 'One or more blocks to delete are invalid',
        },
      })
    })

    it('should handle validation errors', async () => {
      req.body = {
        blocks: [
          {
            id: 'invalid-id', // Invalid CUID
            type: 'invalid-type', // Invalid block type
            content: 'Text',
            order: -1, // Invalid order
          },
        ],
      }

      await handler(req as any, res as any)

      expect(statusCode).toBe(400)
      expect(jsonData.error.code).toBe('VALIDATION_ERROR')
      expect(jsonData.error.details.errors).toBeDefined()
    })

    it('should handle unexpected errors', async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error('Database connection failed'))

      req.body = { title: 'Updated Title' }

      await handler(req as any, res as any)

      expect(statusCode).toBe(500)
      expect(jsonData).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to save content',
        },
      })
    })

    it('should only update blocks belonging to the authenticated user', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        updatedAt: new Date(),
      }

      let findFirstQuery: any

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockImplementation((query) => {
              findFirstQuery = query
              return Promise.resolve(mockPage)
            }),
            update: jest.fn(),
            findUnique: jest.fn().mockResolvedValue({
              ...mockPage,
              title: 'Test Page',
              blocks: [],
            }),
          },
          block: {
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
          },
        }

        return callback(tx)
      })

      req.body = { title: 'Updated Title' }

      await handler(req as any, res as any)

      expect(findFirstQuery.where).toMatchObject({
        id: 'cuid123456789012345678901',
        deletedAt: null,
        workspace: {
          userId: 'test-user-id',
          deletedAt: null,
        },
      })
    })

    it('should handle block metadata updates', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        updatedAt: new Date(),
      }

      const mockBlocks = [{ id: 'cuid12345678901234567890b1' }]

      const mockUpdatedPage = {
        id: 'cuid123456789012345678901',
        title: 'Test Page',
        updatedAt: new Date(),
        blocks: [
          {
            id: 'cuid12345678901234567890b1',
            type: 'paragraph',
            content: 'Text with metadata',
            order: 0,
            metadata: { align: 'center', color: 'blue' },
            updatedAt: new Date(),
          },
        ],
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(mockPage),
            update: jest.fn(),
            findUnique: jest.fn().mockResolvedValue(mockUpdatedPage),
          },
          block: {
            findMany: jest.fn().mockResolvedValue(mockBlocks),
            update: jest.fn(),
            updateMany: jest.fn(),
          },
        }
        return await callback(tx)
      })

      req.body = {
        blocks: [
          {
            id: 'cuid12345678901234567890b1',
            type: 'paragraph',
            content: 'Text with metadata',
            order: 0,
            metadata: { align: 'center', color: 'blue' },
          },
        ],
      }

      await handler(req as any, res as any)

      expect(statusCode).toBe(200)
      expect(jsonData.data.page.blocks[0].metadata).toEqual({
        align: 'center',
        color: 'blue',
      })
    })

    it('should create content version after successful update', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        title: 'Current Title',
        updatedAt: new Date('2024-01-01'),
        blocks: [
          {
            id: 'cuid12345678901234567890b1',
            type: 'paragraph',
            content: 'Original content',
            order: 0,
            metadata: null,
          },
        ],
      }

      const mockUpdatedPage = {
        id: 'cuid123456789012345678901',
        title: 'Updated Title',
        updatedAt: new Date(),
        blocks: [
          {
            id: 'cuid12345678901234567890b1',
            type: 'paragraph',
            content: 'Updated content',
            order: 0,
            metadata: null,
            updatedAt: new Date(),
          },
        ],
      }

      let contentVersionCreated = false
      let createdVersionData: any = null

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(mockPage),
            update: jest.fn().mockResolvedValue(mockUpdatedPage),
            findUnique: jest.fn().mockResolvedValue(mockUpdatedPage),
          },
          block: {
            findMany: jest
              .fn()
              .mockResolvedValueOnce([{ id: 'cuid12345678901234567890b1' }]) // For validation
              .mockResolvedValueOnce([
                {
                  id: 'cuid12345678901234567890b1',
                  type: 'paragraph',
                  content: 'Updated content',
                  order: 0,
                  metadata: null,
                },
              ]), // For version snapshot
            update: jest.fn(),
            updateMany: jest.fn(),
          },
          contentVersion: {
            findFirst: jest.fn().mockResolvedValue({ versionNumber: 5 }), // Latest version
            create: jest.fn().mockImplementation((data) => {
              contentVersionCreated = true
              createdVersionData = data.data
              return Promise.resolve({})
            }),
            findMany: jest.fn().mockResolvedValue([]), // No old versions to delete
            deleteMany: jest.fn(),
          },
        }
        return await callback(tx)
      })

      req.body = {
        title: 'Updated Title',
        blocks: [
          {
            id: 'cuid12345678901234567890b1',
            type: 'paragraph',
            content: 'Updated content',
            order: 0,
          },
        ],
      }

      await handler(req as any, res as any)

      expect(statusCode).toBe(200)
      expect(contentVersionCreated).toBe(true)
      expect(createdVersionData).toMatchObject({
        pageId: 'cuid123456789012345678901',
        versionNumber: 6, // 5 + 1
        title: 'Updated Title',
        userId: 'test-user-id',
      })
      expect(createdVersionData.blocks).toHaveLength(1)
      expect(createdVersionData.blocks[0]).toMatchObject({
        content: 'Updated content',
        type: 'paragraph',
      })
    })

    it('should cleanup old versions keeping only last 10', async () => {
      const mockPage = {
        id: 'cuid123456789012345678901',
        title: 'Current Title',
        updatedAt: new Date('2024-01-01'),
        blocks: [],
      }

      const mockUpdatedPage = {
        id: 'cuid123456789012345678901',
        title: 'Updated Title',
        updatedAt: new Date(),
        blocks: [],
      }

      // Mock old versions to delete
      const oldVersions = Array.from({ length: 5 }, (_, i) => ({ id: `old-version-${i}` }))
      let deleteManyCall: any = null

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          page: {
            findFirst: jest.fn().mockResolvedValue(mockPage),
            update: jest.fn().mockResolvedValue(mockUpdatedPage),
            findUnique: jest.fn().mockResolvedValue(mockUpdatedPage),
          },
          block: {
            findMany: jest.fn().mockResolvedValue([]),
            update: jest.fn(),
            updateMany: jest.fn(),
          },
          contentVersion: {
            findFirst: jest.fn().mockResolvedValue({ versionNumber: 15 }),
            create: jest.fn(),
            findMany: jest.fn().mockResolvedValue(oldVersions), // Return old versions to delete
            deleteMany: jest.fn().mockImplementation((args) => {
              deleteManyCall = args
              return Promise.resolve({})
            }),
          },
        }
        return await callback(tx)
      })

      req.body = { title: 'Updated Title' }

      await handler(req as any, res as any)

      expect(statusCode).toBe(200)
      expect(deleteManyCall).toEqual({
        where: {
          id: { in: oldVersions.map((v) => v.id) },
        },
      })
    })
  })
})
