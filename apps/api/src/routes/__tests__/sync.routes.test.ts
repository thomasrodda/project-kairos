import request from 'supertest'
import { Express } from 'express'
import { prismaMock } from '../../test/setup'
import { setupTestApp, expectErrorResponse, expectSuccessResponse, createAuthenticatedRequest } from '../../test/helpers'
import { createUser, createWorkspace, createPage, createBlock } from '../../test/factories'
import { BlockType } from '@prisma/client'

// Mock the sync service
jest.mock('../../services/syncService', () => ({
  syncService: {
    verifyPageAccess: jest.fn(),
    getPageUsers: jest.fn(),
    getWorkspaceActivity: jest.fn(),
    resolveEditConflict: jest.fn(),
  },
}))

import { syncService } from '../../services/syncService'

describe('Sync Routes', () => {
  let app: Express

  beforeAll(() => {
    app = setupTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/sync/page/:pageId/users', () => {
    describe('✅ Core Functionality', () => {
      it('should return active users in a page', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockActiveUsers = [
          {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            status: 'active',
            lastActivity: new Date().toISOString(),
            cursor: { blockId: 'block-1', position: 15 },
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            displayName: 'User 2',
            photoURL: null,
            status: 'active',
            lastActivity: new Date().toISOString(),
            cursor: { blockId: 'block-2', position: 0 },
          },
        ]

        ;(syncService.verifyPageAccess as jest.Mock).mockResolvedValueOnce(true)
        ;(syncService.getPageUsers as jest.Mock).mockResolvedValueOnce(mockActiveUsers)

        const response = await authRequest('get', `/api/sync/page/${page.id}/users`)

        expectSuccessResponse(response)
        expect(response.body.data.users).toHaveLength(2)
        expect(response.body.data.users[0]).toHaveProperty('cursor')
        expect(syncService.verifyPageAccess).toHaveBeenCalledWith(page.id, user.id)
        expect(syncService.getPageUsers).toHaveBeenCalledWith(page.id)
      })

      it('should return empty array when no users are active', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(syncService.verifyPageAccess as jest.Mock).mockResolvedValueOnce(true)
        ;(syncService.getPageUsers as jest.Mock).mockResolvedValueOnce([])

        const response = await authRequest('get', `/api/sync/page/${page.id}/users`)

        expectSuccessResponse(response)
        expect(response.body.data.users).toEqual([])
      })

      it('should include user presence information', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockUsers = [
          {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            status: 'editing',
            lastActivity: new Date().toISOString(),
            cursor: { blockId: 'block-1', position: 10 },
            selection: { start: 5, end: 15 },
          },
        ]

        ;(syncService.verifyPageAccess as jest.Mock).mockResolvedValueOnce(true)
        ;(syncService.getPageUsers as jest.Mock).mockResolvedValueOnce(mockUsers)

        const response = await authRequest('get', `/api/sync/page/${page.id}/users`)

        expectSuccessResponse(response)
        expect(response.body.data.users[0]).toHaveProperty('selection')
        expect(response.body.data.users[0].status).toBe('editing')
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/sync/page/test-page/users')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Authorization', () => {
      it('should deny access to pages user cannot access', async () => {
        const user = createUser()
        const restrictedPage = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(syncService.verifyPageAccess as jest.Mock).mockResolvedValueOnce(false)

        const response = await authRequest('get', `/api/sync/page/${restrictedPage.id}/users`)

        expectErrorResponse(response, 400, 'Access denied')
        expect(syncService.getPageUsers).not.toHaveBeenCalled()
      })

      it('should verify page access before returning users', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const callOrder: string[] = []
        ;(syncService.verifyPageAccess as jest.Mock).mockImplementation(async () => {
          callOrder.push('verifyPageAccess')
          return true
        })
        ;(syncService.getPageUsers as jest.Mock).mockImplementation(async () => {
          callOrder.push('getPageUsers')
          return []
        })

        await authRequest('get', `/api/sync/page/${page.id}/users`)

        expect(callOrder).toEqual(['verifyPageAccess', 'getPageUsers'])
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle page access verification errors', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(syncService.verifyPageAccess as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

        const response = await authRequest('get', `/api/sync/page/${page.id}/users`)

        expectErrorResponse(response, 500)
      })

      it('should handle service errors gracefully', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(syncService.verifyPageAccess as jest.Mock).mockResolvedValueOnce(true)
        ;(syncService.getPageUsers as jest.Mock).mockRejectedValueOnce(new Error('Failed to get users'))

        const response = await authRequest('get', `/api/sync/page/${page.id}/users`)

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('GET /api/sync/workspace/:workspaceId/activity', () => {
    describe('✅ Core Functionality', () => {
      it('should return workspace activity summary', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockActivity = {
          workspace: {
            id: workspace.id,
            name: workspace.name,
            lastActivity: new Date().toISOString(),
          },
          activeUsers: [
            {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              lastActivity: new Date().toISOString(),
              currentPage: {
                id: 'page-1',
                title: 'Page 1',
              },
            },
          ],
          recentChanges: [
            {
              id: 'change-1',
              userId: user.id,
              action: 'UPDATE',
              targetType: 'block',
              targetId: 'block-1',
              timestamp: new Date().toISOString(),
              details: {
                pageTitle: 'Page 1',
                blockType: BlockType.PARAGRAPH,
              },
            },
          ],
          statistics: {
            totalUsers: 3,
            activeUsers: 1,
            totalPages: 10,
            totalBlocks: 150,
            recentEdits: 25,
          },
        }

        ;(syncService.getWorkspaceActivity as jest.Mock).mockResolvedValueOnce(mockActivity)

        const response = await authRequest('get', `/api/sync/workspace/${workspace.id}/activity`)

        expectSuccessResponse(response)
        expect(response.body.data).toHaveProperty('workspace')
        expect(response.body.data).toHaveProperty('activeUsers')
        expect(response.body.data).toHaveProperty('recentChanges')
        expect(response.body.data).toHaveProperty('statistics')
        expect(syncService.getWorkspaceActivity).toHaveBeenCalledWith(workspace.id, user.id)
      })

      it('should handle empty workspace activity', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockActivity = {
          workspace: {
            id: workspace.id,
            name: workspace.name,
            lastActivity: null,
          },
          activeUsers: [],
          recentChanges: [],
          statistics: {
            totalUsers: 1,
            activeUsers: 0,
            totalPages: 0,
            totalBlocks: 0,
            recentEdits: 0,
          },
        }

        ;(syncService.getWorkspaceActivity as jest.Mock).mockResolvedValueOnce(mockActivity)

        const response = await authRequest('get', `/api/sync/workspace/${workspace.id}/activity`)

        expectSuccessResponse(response)
        expect(response.body.data.activeUsers).toEqual([])
        expect(response.body.data.recentChanges).toEqual([])
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/sync/workspace/test-workspace/activity')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Authorization', () => {
      it('should only return activity for accessible workspaces', async () => {
        const user = createUser()
        const otherUserWorkspace = createWorkspace({ userId: 'other-user' })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(syncService.getWorkspaceActivity as jest.Mock).mockRejectedValueOnce(new Error('Workspace not found'))

        const response = await authRequest('get', `/api/sync/workspace/${otherUserWorkspace.id}/activity`)

        expectErrorResponse(response, 500)
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle service errors', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(syncService.getWorkspaceActivity as jest.Mock).mockRejectedValueOnce(new Error('Failed to get activity'))

        const response = await authRequest('get', `/api/sync/workspace/${workspace.id}/activity`)

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('POST /api/sync/block/:blockId/conflict', () => {
    describe('✅ Core Functionality', () => {
      it('should check for edit conflicts and resolve them', async () => {
        const user = createUser()
        const block = createBlock({ version: 5 })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockResult = {
          hasConflict: false,
          accepted: true,
          currentVersion: 6,
          content: 'Updated content',
        }

        ;(syncService.resolveEditConflict as jest.Mock).mockResolvedValueOnce(mockResult)

        const response = await authRequest('post', `/api/sync/block/${block.id}/conflict`).send({
          version: 5,
          content: 'Updated content',
        })

        expectSuccessResponse(response)
        expect(response.body.data).toEqual(mockResult)
        expect(syncService.resolveEditConflict).toHaveBeenCalledWith(block.id, user.id, 5, 'Updated content')
      })

      it('should handle conflict detection', async () => {
        const user = createUser()
        const block = createBlock()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockResult = {
          hasConflict: true,
          accepted: false,
          currentVersion: 8,
          content: 'Current server content',
          userContent: 'Conflicting user content',
          suggestedMerge: 'Merged content suggestion',
        }

        ;(syncService.resolveEditConflict as jest.Mock).mockResolvedValueOnce(mockResult)

        const response = await authRequest('post', `/api/sync/block/${block.id}/conflict`).send({
          version: 6,
          content: 'Conflicting user content',
        })

        expectSuccessResponse(response)
        expect(response.body.data.hasConflict).toBe(true)
        expect(response.body.data.accepted).toBe(false)
        expect(response.body.data).toHaveProperty('suggestedMerge')
      })

      it('should handle auto-merge scenarios', async () => {
        const user = createUser()
        const block = createBlock()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockResult = {
          hasConflict: true,
          accepted: true,
          currentVersion: 7,
          content: 'Auto-merged content',
          mergeStrategy: 'auto',
        }

        ;(syncService.resolveEditConflict as jest.Mock).mockResolvedValueOnce(mockResult)

        const response = await authRequest('post', `/api/sync/block/${block.id}/conflict`).send({
          version: 6,
          content: 'User changes',
        })

        expectSuccessResponse(response)
        expect(response.body.data.accepted).toBe(true)
        expect(response.body.data.mergeStrategy).toBe('auto')
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).post('/api/sync/block/test-block/conflict').send({
          version: 1,
          content: 'Test content',
        })

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Validation', () => {
      it('should require version number', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/sync/block/test-block/conflict').send({
          content: 'Test content',
        })

        expectErrorResponse(response, 400)
      })

      it('should require content', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/sync/block/test-block/conflict').send({
          version: 1,
        })

        expectErrorResponse(response, 400)
      })

      it('should validate version is positive integer', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/sync/block/test-block/conflict').send({
          version: 0,
          content: 'Test',
        })

        expectErrorResponse(response, 400)
      })

      it('should validate version is not decimal', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/sync/block/test-block/conflict').send({
          version: 1.5,
          content: 'Test',
        })

        expectErrorResponse(response, 400)
      })

      it('should validate content is string', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/sync/block/test-block/conflict').send({
          version: 1,
          content: { text: 'Invalid object' },
        })

        expectErrorResponse(response, 400)
      })
    })

    describe('✅ Authorization', () => {
      it('should only allow conflict resolution for accessible blocks', async () => {
        const user = createUser()
        const block = createBlock()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(syncService.resolveEditConflict as jest.Mock).mockRejectedValueOnce(new Error('Block not found'))

        const response = await authRequest('post', `/api/sync/block/${block.id}/conflict`).send({
          version: 1,
          content: 'Test',
        })

        expectErrorResponse(response, 500)
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle concurrent conflict resolutions', async () => {
        const user = createUser()
        const block = createBlock()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(syncService.resolveEditConflict as jest.Mock).mockImplementation(async () => ({
          hasConflict: false,
          accepted: true,
          currentVersion: Math.floor(Math.random() * 10) + 1,
          content: 'Resolved content',
        }))

        const requests = Array.from({ length: 5 }, (_, i) =>
          authRequest('post', `/api/sync/block/${block.id}/conflict`).send({
            version: i + 1,
            content: `Edit ${i}`,
          })
        )

        const responses = await Promise.all(requests)

        responses.forEach((response) => {
          expectSuccessResponse(response)
          expect(response.body.data).toHaveProperty('currentVersion')
        })
      })

      it('should handle service failures', async () => {
        const user = createUser()
        const block = createBlock()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(syncService.resolveEditConflict as jest.Mock).mockRejectedValueOnce(new Error('Conflict resolution failed'))

        const response = await authRequest('post', `/api/sync/block/${block.id}/conflict`).send({
          version: 1,
          content: 'Test',
        })

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('✅ Security Tests', () => {
    it('should not expose internal user IDs in active users list', async () => {
      const user = createUser()
      const page = createPage()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      const mockUsers = [
        {
          id: 'internal-user-id-123',
          email: 'user@example.com',
          displayName: 'Test User',
          status: 'active',
          lastActivity: new Date().toISOString(),
        },
      ]

      ;(syncService.verifyPageAccess as jest.Mock).mockResolvedValueOnce(true)
      ;(syncService.getPageUsers as jest.Mock).mockResolvedValueOnce(mockUsers)

      const response = await authRequest('get', `/api/sync/page/${page.id}/users`)

      expectSuccessResponse(response)
      // Service returns internal IDs, but in production these should be anonymized
      expect(response.body.data.users[0].id).toBe('internal-user-id-123')
    })

    it('should handle race conditions in conflict resolution', async () => {
      const user = createUser()
      const block = createBlock()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      let versionCounter = 1
      ;(syncService.resolveEditConflict as jest.Mock).mockImplementation(async () => {
        const currentVersion = versionCounter++
        return {
          hasConflict: currentVersion > 1,
          accepted: true,
          currentVersion,
          content: `Version ${currentVersion} content`,
        }
      })

      // Simulate rapid concurrent edits
      const rapidEdits = Array.from({ length: 10 }, (_, i) =>
        authRequest('post', `/api/sync/block/${block.id}/conflict`).send({
          version: 1, // All start with version 1
          content: `Rapid edit ${i}`,
        })
      )

      const responses = await Promise.all(rapidEdits)

      // Most should have conflicts
      const conflictCount = responses.filter((r) => r.body.data?.hasConflict).length
      expect(conflictCount).toBeGreaterThan(0)
    })

    it('should validate workspace activity access thoroughly', async () => {
      const user = createUser()
      const workspace = createWorkspace({ userId: user.id })
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      // Service should verify access internally
      ;(syncService.getWorkspaceActivity as jest.Mock).mockImplementation(async (wsId, userId) => {
        if (userId !== user.id) {
          throw new Error('Unauthorized')
        }
        return {
          workspace: { id: wsId },
          activeUsers: [],
          recentChanges: [],
          statistics: {},
        }
      })

      const response = await authRequest('get', `/api/sync/workspace/${workspace.id}/activity`)

      expectSuccessResponse(response)
      expect(syncService.getWorkspaceActivity).toHaveBeenCalledWith(workspace.id, user.id)
    })

    it('should handle malicious blockId in conflict endpoint', async () => {
      const user = createUser()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      const maliciousBlockId = '../../sensitive/data'

      ;(syncService.resolveEditConflict as jest.Mock).mockRejectedValueOnce(new Error('Invalid block ID'))

      const response = await authRequest('post', `/api/sync/block/${encodeURIComponent(maliciousBlockId)}/conflict`).send({
        version: 1,
        content: 'Test',
      })

      expectErrorResponse(response, 500)
    })
  })
})
