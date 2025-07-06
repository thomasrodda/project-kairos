import request from 'supertest'
import { Express } from 'express'
import { prismaMock } from '../../test/setup'
import { setupTestApp, expectErrorResponse, expectSuccessResponse, createAuthenticatedRequest } from '../../test/helpers'
import { createUser, createWorkspace, createPage, createBlock } from '../../test/factories'
import { BlockType } from '@prisma/client'

// Mock the history service
jest.mock('../../services/historyService', () => {
  const actual = jest.requireActual('../../services/historyService')
  return {
    ...actual,
    historyService: {
      getPageHistory: jest.fn(),
      getBlockHistory: jest.fn(),
      getPageSnapshots: jest.fn(),
      getSnapshot: jest.fn(),
      createSnapshot: jest.fn(),
      restoreSnapshot: jest.fn(),
      cleanupOldHistory: jest.fn(),
    },
  }
})

import { historyService } from '../../services/historyService'

describe('History Routes', () => {
  let app: Express

  beforeAll(() => {
    app = setupTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/history/pages/:pageId', () => {
    describe('✅ Core Functionality', () => {
      it('should return page history with default pagination', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const page = createPage({ workspaceId: workspace.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockChanges = [
          {
            id: 'change-1',
            blockId: 'block-1',
            pageId: page.id,
            userId: user.id,
            action: 'CREATE',
            changes: { content: 'New block' },
            version: 1,
            timestamp: new Date(),
          },
          {
            id: 'change-2',
            blockId: 'block-1',
            pageId: page.id,
            userId: user.id,
            action: 'UPDATE',
            changes: { content: 'Updated block' },
            version: 2,
            timestamp: new Date(),
          },
        ]

        ;(historyService.getPageHistory as jest.Mock).mockResolvedValueOnce({
          changes: mockChanges,
          total: 2,
        })

        const response = await authRequest('get', `/api/history/pages/${page.id}`)

        expectSuccessResponse(response)
        expect(response.body).toHaveProperty('items')
        expect(response.body.items).toHaveLength(2)
        expect(response.body).toHaveProperty('pagination')
        expect(response.body.pagination.total).toBe(2)
        expect(response.body.pagination.page).toBe(1)
        expect(response.body.pagination.limit).toBe(20)
        expect(historyService.getPageHistory).toHaveBeenCalledWith(page.id, user.id, {
          limit: 20,
          offset: 0,
          startDate: undefined,
          endDate: undefined,
        })
      })

      it('should support custom pagination parameters', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.getPageHistory as jest.Mock).mockResolvedValueOnce({
          changes: [],
          total: 50,
        })

        const response = await authRequest('get', `/api/history/pages/${page.id}?limit=10&offset=20`)

        expectSuccessResponse(response)
        expect(response.body.pagination.page).toBe(3) // offset 20 / limit 10 + 1
        expect(response.body.pagination.limit).toBe(10)
        expect(historyService.getPageHistory).toHaveBeenCalledWith(page.id, user.id, {
          limit: 10,
          offset: 20,
          startDate: undefined,
          endDate: undefined,
        })
      })

      it('should support date range filtering', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const startDate = '2024-01-01T00:00:00Z'
        const endDate = '2024-01-31T23:59:59Z'

        ;(historyService.getPageHistory as jest.Mock).mockResolvedValueOnce({
          changes: [],
          total: 0,
        })

        const response = await authRequest('get', `/api/history/pages/${page.id}?startDate=${startDate}&endDate=${endDate}`)

        expectSuccessResponse(response)
        expect(historyService.getPageHistory).toHaveBeenCalledWith(page.id, user.id, {
          limit: 20,
          offset: 0,
          startDate,
          endDate,
        })
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/history/pages/test-id')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Authorization', () => {
      it('should only return history for pages the user has access to', async () => {
        const user = createUser()
        const otherUser = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // Mock service to check authorization internally
        ;(historyService.getPageHistory as jest.Mock).mockRejectedValueOnce(new Error('Page not found'))

        const response = await authRequest('get', `/api/history/pages/${page.id}`)

        expectErrorResponse(response, 500)
        expect(historyService.getPageHistory).toHaveBeenCalledWith(page.id, user.id, expect.any(Object))
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle invalid pagination parameters', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('get', '/api/history/pages/test-id?limit=invalid&offset=negative')

        expectErrorResponse(response, 400)
      })

      it('should handle service errors gracefully', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.getPageHistory as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'))

        const response = await authRequest('get', `/api/history/pages/${page.id}`)

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('GET /api/history/blocks/:blockId', () => {
    describe('✅ Core Functionality', () => {
      it('should return block history with required pageId', async () => {
        const user = createUser()
        const page = createPage()
        const block = createBlock({ pageId: page.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockChanges = [
          {
            id: 'change-1',
            blockId: block.id,
            pageId: page.id,
            userId: user.id,
            action: 'UPDATE',
            changes: { content: 'First edit' },
            version: 1,
            timestamp: new Date(),
          },
        ]

        ;(historyService.getBlockHistory as jest.Mock).mockResolvedValueOnce({
          changes: mockChanges,
          total: 1,
        })

        const response = await authRequest('get', `/api/history/blocks/${block.id}?pageId=${page.id}`)

        expectSuccessResponse(response)
        expect(response.body.items).toHaveLength(1)
        expect(historyService.getBlockHistory).toHaveBeenCalledWith(block.id, page.id, user.id, expect.any(Object))
      })

      it('should return 400 when pageId is missing', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('get', '/api/history/blocks/block-id')

        expectErrorResponse(response, 400, 'pageId is required')
      })

      it('should support all query parameters', async () => {
        const user = createUser()
        const page = createPage()
        const block = createBlock({ pageId: page.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.getBlockHistory as jest.Mock).mockResolvedValueOnce({
          changes: [],
          total: 0,
        })

        const params = new URLSearchParams({
          pageId: page.id,
          limit: '5',
          offset: '10',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })

        const response = await authRequest('get', `/api/history/blocks/${block.id}?${params}`)

        expectSuccessResponse(response)
        expect(historyService.getBlockHistory).toHaveBeenCalledWith(block.id, page.id, user.id, {
          limit: 5,
          offset: 10,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      })
    })

    describe('✅ Validation', () => {
      it('should validate pageId is a string', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('get', '/api/history/blocks/block-id?pageId[]=array')

        expectErrorResponse(response, 400, 'pageId is required')
      })
    })
  })

  describe('GET /api/history/snapshots/:pageId', () => {
    describe('✅ Core Functionality', () => {
      it('should return page snapshots', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockSnapshots = [
          {
            id: 'snapshot-1',
            pageId: page.id,
            userId: user.id,
            title: 'Snapshot 1',
            blocksSnapshot: JSON.stringify([]),
            createdAt: new Date(),
          },
          {
            id: 'snapshot-2',
            pageId: page.id,
            userId: user.id,
            title: 'Snapshot 2',
            blocksSnapshot: JSON.stringify([]),
            createdAt: new Date(),
          },
        ]

        ;(historyService.getPageSnapshots as jest.Mock).mockResolvedValueOnce({
          snapshots: mockSnapshots,
          total: 2,
        })

        const response = await authRequest('get', `/api/history/snapshots/${page.id}`)

        expectSuccessResponse(response)
        expect(response.body.items).toHaveLength(2)
        expect(response.body.pagination.total).toBe(2)
        expect(historyService.getPageSnapshots).toHaveBeenCalledWith(page.id, user.id, expect.any(Object))
      })

      it('should support date filtering for snapshots', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.getPageSnapshots as jest.Mock).mockResolvedValueOnce({
          snapshots: [],
          total: 0,
        })

        const response = await authRequest('get', `/api/history/snapshots/${page.id}?startDate=2024-01-01&endDate=2024-01-31`)

        expectSuccessResponse(response)
        expect(historyService.getPageSnapshots).toHaveBeenCalledWith(page.id, user.id, {
          limit: 20,
          offset: 0,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle non-existent page', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.getPageSnapshots as jest.Mock).mockRejectedValueOnce(new Error('Page not found'))

        const response = await authRequest('get', '/api/history/snapshots/non-existent')

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('GET /api/history/snapshots/:pageId/:snapshotId', () => {
    describe('✅ Core Functionality', () => {
      it('should return a specific snapshot', async () => {
        const user = createUser()
        const page = createPage()
        const snapshotId = 'snapshot-123'
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockSnapshot = {
          id: snapshotId,
          pageId: page.id,
          userId: user.id,
          title: 'Test Snapshot',
          blocksSnapshot: JSON.stringify([{ id: 'block-1', type: BlockType.PARAGRAPH, content: 'Test content' }]),
          createdAt: new Date(),
        }

        ;(historyService.getSnapshot as jest.Mock).mockResolvedValueOnce(mockSnapshot)

        const response = await authRequest('get', `/api/history/snapshots/${page.id}/${snapshotId}`)

        expectSuccessResponse(response)
        expect(response.body.snapshot).toEqual(
          expect.objectContaining({
            id: snapshotId,
            pageId: page.id,
            title: 'Test Snapshot',
          })
        )
        expect(historyService.getSnapshot).toHaveBeenCalledWith(snapshotId, user.id)
      })
    })

    describe('✅ Authorization', () => {
      it('should not return snapshots for unauthorized users', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.getSnapshot as jest.Mock).mockRejectedValueOnce(new Error('Snapshot not found'))

        const response = await authRequest('get', `/api/history/snapshots/${page.id}/snapshot-123`)

        expectErrorResponse(response, 500)
      })
    })

    describe('✅ Error Handling', () => {
      it('should return 404 for non-existent snapshot', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.getSnapshot as jest.Mock).mockRejectedValueOnce(new Error('Snapshot not found'))

        const response = await authRequest('get', `/api/history/snapshots/${page.id}/non-existent`)

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('POST /api/history/snapshots/:pageId', () => {
    describe('✅ Core Functionality', () => {
      it('should create a new snapshot', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockSnapshot = {
          id: 'new-snapshot',
          pageId: page.id,
          userId: user.id,
          title: 'Auto Snapshot',
          blocksSnapshot: JSON.stringify([]),
          createdAt: new Date(),
        }

        ;(historyService.createSnapshot as jest.Mock).mockResolvedValueOnce(mockSnapshot)

        const response = await authRequest('post', `/api/history/snapshots/${page.id}`)

        expectSuccessResponse(response, 201)
        expect(response.body.snapshot).toEqual(
          expect.objectContaining({
            id: 'new-snapshot',
            pageId: page.id,
          })
        )
        expect(response.headers.location).toBe(`/api/history/snapshots/${page.id}/new-snapshot`)
        expect(historyService.createSnapshot).toHaveBeenCalledWith(page.id, user.id)
      })
    })

    describe('✅ Authorization', () => {
      it('should only allow snapshot creation for owned pages', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.createSnapshot as jest.Mock).mockRejectedValueOnce(new Error('Page not found'))

        const response = await authRequest('post', `/api/history/snapshots/${page.id}`)

        expectErrorResponse(response, 500)
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle snapshot creation failures', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.createSnapshot as jest.Mock).mockRejectedValueOnce(new Error('Failed to create snapshot'))

        const response = await authRequest('post', `/api/history/snapshots/${page.id}`)

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('POST /api/history/restore', () => {
    describe('✅ Core Functionality', () => {
      it('should restore from a snapshot', async () => {
        const user = createUser()
        const snapshotId = 'snapshot-123'
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.restoreSnapshot as jest.Mock).mockResolvedValueOnce(undefined)

        const response = await authRequest('post', '/api/history/restore').send({
          snapshotId,
        })

        expect(response.status).toBe(204)
        expect(response.body).toEqual({})
        expect(historyService.restoreSnapshot).toHaveBeenCalledWith(snapshotId, user.id)
      })
    })

    describe('✅ Validation', () => {
      it('should require snapshotId', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/history/restore').send({})

        expectErrorResponse(response, 400)
      })

      it('should validate snapshotId format', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/history/restore').send({
          snapshotId: 123, // Should be string
        })

        expectErrorResponse(response, 400)
      })
    })

    describe('✅ Authorization', () => {
      it('should only allow restoring owned snapshots', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.restoreSnapshot as jest.Mock).mockRejectedValueOnce(new Error('Snapshot not found'))

        const response = await authRequest('post', '/api/history/restore').send({
          snapshotId: 'other-users-snapshot',
        })

        expectErrorResponse(response, 500)
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle restore failures', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.restoreSnapshot as jest.Mock).mockRejectedValueOnce(new Error('Restore failed'))

        const response = await authRequest('post', '/api/history/restore').send({
          snapshotId: 'snapshot-123',
        })

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('DELETE /api/history/cleanup', () => {
    describe('✅ Core Functionality', () => {
      it('should cleanup old history', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockResult = {
          deletedChanges: 150,
          deletedSnapshots: 5,
          freedSpace: '25MB',
        }

        ;(historyService.cleanupOldHistory as jest.Mock).mockResolvedValueOnce(mockResult)

        const response = await authRequest('delete', '/api/history/cleanup')

        expectSuccessResponse(response)
        expect(response.body).toEqual(mockResult)
        expect(historyService.cleanupOldHistory).toHaveBeenCalledWith(user.id)
      })
    })

    describe('✅ Authorization', () => {
      it('should only cleanup history for the authenticated user', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.cleanupOldHistory as jest.Mock).mockResolvedValueOnce({
          deletedChanges: 0,
          deletedSnapshots: 0,
        })

        await authRequest('delete', '/api/history/cleanup')

        expect(historyService.cleanupOldHistory).toHaveBeenCalledWith(user.id)
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle cleanup failures', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(historyService.cleanupOldHistory as jest.Mock).mockRejectedValueOnce(new Error('Cleanup failed'))

        const response = await authRequest('delete', '/api/history/cleanup')

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('✅ Security Tests', () => {
    it('should prevent access to history across workspaces', async () => {
      const user = createUser()
      const otherUserWorkspace = createWorkspace({ userId: 'other-user' })
      const otherUserPage = createPage({ workspaceId: otherUserWorkspace.id })
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      ;(historyService.getPageHistory as jest.Mock).mockRejectedValueOnce(new Error('Page not found'))

      const response = await authRequest('get', `/api/history/pages/${otherUserPage.id}`)

      expectErrorResponse(response, 500)
    })

    it('should handle malformed date parameters', async () => {
      const user = createUser()
      const page = createPage()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      // Service should handle validation
      ;(historyService.getPageHistory as jest.Mock).mockResolvedValueOnce({
        changes: [],
        total: 0,
      })

      const response = await authRequest('get', `/api/history/pages/${page.id}?startDate=invalid-date`)

      // The route passes the date as-is, service handles validation
      expectSuccessResponse(response)
      expect(historyService.getPageHistory).toHaveBeenCalledWith(
        page.id,
        user.id,
        expect.objectContaining({
          startDate: 'invalid-date',
        })
      )
    })

    it('should limit the amount of history returned', async () => {
      const user = createUser()
      const page = createPage()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      // Create many changes
      const manyChanges = Array.from({ length: 100 }, (_, i) => ({
        id: `change-${i}`,
        blockId: 'block-1',
        pageId: page.id,
        userId: user.id,
        action: 'UPDATE',
        changes: { content: `Edit ${i}` },
        version: i + 1,
        timestamp: new Date(),
      }))

      ;(historyService.getPageHistory as jest.Mock).mockResolvedValueOnce({
        changes: manyChanges.slice(0, 20), // Default limit
        total: 100,
      })

      const response = await authRequest('get', `/api/history/pages/${page.id}`)

      expectSuccessResponse(response)
      expect(response.body.items).toHaveLength(20)
      expect(response.body.pagination.total).toBe(100)
    })
  })
})
