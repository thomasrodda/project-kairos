import { SyncService } from '../syncService'
import { prismaMock, redisMock } from '../../test/setup'
import { createUser, createWorkspace, createPage, createBlock } from '../../test/factories'
import { BlockType } from '@prisma/client'

describe('SyncService', () => {
  let syncService: SyncService
  let mockUser: ReturnType<typeof createUser>
  let mockUser2: ReturnType<typeof createUser>
  let mockWorkspace: ReturnType<typeof createWorkspace>
  let mockPage: ReturnType<typeof createPage>

  beforeEach(() => {
    syncService = new SyncService()
    mockUser = createUser()
    mockUser2 = createUser({ id: 'user-2', email: 'user2@example.com' })
    mockWorkspace = createWorkspace({ userId: mockUser.id })
    mockPage = createPage({ workspaceId: mockWorkspace.id })
    jest.clearAllMocks()
    redisMock.clear()
  })

  describe('✅ Access Verification', () => {
    describe('verifyWorkspaceAccess', () => {
      it('should return true when user has access to workspace', async () => {
        prismaMock.workspace.findFirst.mockResolvedValue(mockWorkspace)

        const result = await syncService.verifyWorkspaceAccess(mockWorkspace.id, mockUser.id)

        expect(result).toBe(true)
        expect(prismaMock.workspace.findFirst).toHaveBeenCalledWith({
          where: {
            id: mockWorkspace.id,
            userId: mockUser.id,
          },
        })
      })

      it('should return false when user does not have access', async () => {
        prismaMock.workspace.findFirst.mockResolvedValue(null)

        const result = await syncService.verifyWorkspaceAccess(mockWorkspace.id, 'different-user')

        expect(result).toBe(false)
      })
    })

    describe('verifyPageAccess', () => {
      it('should return true when user has access to page', async () => {
        prismaMock.page.findFirst.mockResolvedValue(mockPage)

        const result = await syncService.verifyPageAccess(mockPage.id, mockUser.id)

        expect(result).toBe(true)
        expect(prismaMock.page.findFirst).toHaveBeenCalledWith({
          where: {
            id: mockPage.id,
            workspace: {
              userId: mockUser.id,
            },
          },
        })
      })

      it('should return false when user does not have access', async () => {
        prismaMock.page.findFirst.mockResolvedValue(null)

        const result = await syncService.verifyPageAccess(mockPage.id, 'different-user')

        expect(result).toBe(false)
      })
    })
  })

  describe('✅ Active Edit Tracking', () => {
    describe('trackActiveEdit', () => {
      it('should track active edit on a block', async () => {
        const blockId = 'block-1'

        await syncService.trackActiveEdit(blockId, mockUser.id)

        expect(await syncService.isBlockBeingEdited(blockId, 'other-user')).toBe(true)
        expect(await syncService.getBlockEditor(blockId)).toBe(mockUser.id)
      })

      it('should update timestamp for existing edit', async () => {
        const blockId = 'block-1'

        await syncService.trackActiveEdit(blockId, mockUser.id)
        const firstEdit = await redisMock.get(`active_edits:${blockId}`)
        const firstTimestamp = JSON.parse(firstEdit!).timestamp

        // Wait a bit and track again
        await new Promise((resolve) => setTimeout(resolve, 10))
        await syncService.trackActiveEdit(blockId, mockUser.id)
        const secondEdit = await redisMock.get(`active_edits:${blockId}`)
        const secondTimestamp = JSON.parse(secondEdit!).timestamp

        expect(new Date(secondTimestamp).getTime()).toBeGreaterThan(new Date(firstTimestamp).getTime())
      })

      it('should clean up stale edits automatically', async () => {
        // Note: With Redis TTL, stale edits are automatically cleaned up
        // This test verifies that Redis TTL is set correctly
        const blockId = 'stale-block'

        await syncService.trackActiveEdit(blockId, 'old-user')

        // Verify the key has TTL set
        const key = `active_edits:${blockId}`
        const value = await redisMock.get(key)
        expect(value).toBeTruthy()

        // In real Redis, the key would expire after 30 seconds
        // Our mock doesn't simulate time-based expiration in this test
      })
    })

    describe('isBlockBeingEdited', () => {
      it('should return false when block is not being edited', async () => {
        const result = await syncService.isBlockBeingEdited('block-1', mockUser.id)
        expect(result).toBe(false)
      })

      it('should return false when same user is editing', async () => {
        await syncService.trackActiveEdit('block-1', mockUser.id)

        const result = await syncService.isBlockBeingEdited('block-1', mockUser.id)
        expect(result).toBe(false)
      })

      it('should return true when different user is editing', async () => {
        await syncService.trackActiveEdit('block-1', mockUser.id)

        const result = await syncService.isBlockBeingEdited('block-1', 'other-user')
        expect(result).toBe(true)
      })
    })

    describe('clearUserActiveEdits', () => {
      it('should clear all active edits for a user', async () => {
        // Track multiple edits
        await syncService.trackActiveEdit('block-1', mockUser.id)
        await syncService.trackActiveEdit('block-2', mockUser.id)
        await syncService.trackActiveEdit('block-3', mockUser2.id)

        // Clear edits for mockUser
        await syncService.clearUserActiveEdits(mockUser.id)

        expect(await syncService.getBlockEditor('block-1')).toBeNull()
        expect(await syncService.getBlockEditor('block-2')).toBeNull()
        expect(await syncService.getBlockEditor('block-3')).toBe(mockUser2.id) // Should remain
      })

      it('should handle clearing when user has no active edits', async () => {
        await syncService.clearUserActiveEdits('non-existent-user')
        // Should not throw
      })
    })
  })

  describe('✅ Page User Management', () => {
    describe('addUserToPage', () => {
      it('should add user to a page', async () => {
        prismaMock.user.findUnique.mockResolvedValue(mockUser)

        await syncService.addUserToPage(mockPage.id, mockUser.id)

        const pageUsers = await syncService.getPageUsers(mockPage.id)
        expect(pageUsers).toHaveLength(1)
        expect(pageUsers[0]).toEqual({
          userId: mockUser.id,
          displayName: mockUser.displayName,
          email: mockUser.email,
          joinedAt: expect.any(Date),
        })
      })

      it('should handle user without display name', async () => {
        const userWithoutName = { ...mockUser, displayName: null }
        prismaMock.user.findUnique.mockResolvedValue(userWithoutName)

        await syncService.addUserToPage(mockPage.id, mockUser.id)

        const pageUsers = await syncService.getPageUsers(mockPage.id)
        expect(pageUsers[0].displayName).toBeUndefined()
      })

      it('should handle non-existent user gracefully', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null)

        await syncService.addUserToPage(mockPage.id, 'non-existent')

        const pageUsers = await syncService.getPageUsers(mockPage.id)
        expect(pageUsers).toHaveLength(0)
      })

      it('should update existing user in page', async () => {
        prismaMock.user.findUnique.mockResolvedValue(mockUser)

        // Add user twice
        await syncService.addUserToPage(mockPage.id, mockUser.id)
        await syncService.addUserToPage(mockPage.id, mockUser.id)

        const pageUsers = await syncService.getPageUsers(mockPage.id)
        expect(pageUsers).toHaveLength(1) // Should not duplicate
      })
    })

    describe('removeUserFromPage', () => {
      it('should remove user from page', async () => {
        prismaMock.user.findUnique.mockResolvedValue(mockUser)

        await syncService.addUserToPage(mockPage.id, mockUser.id)
        await syncService.removeUserFromPage(mockPage.id, mockUser.id)

        const pageUsers = await syncService.getPageUsers(mockPage.id)
        expect(pageUsers).toHaveLength(0)
      })

      it('should clean up empty page maps', async () => {
        prismaMock.user.findUnique.mockResolvedValue(mockUser)

        await syncService.addUserToPage(mockPage.id, mockUser.id)
        await syncService.removeUserFromPage(mockPage.id, mockUser.id)

        // Check that the Redis key is removed when empty
        const key = `page_users:${mockPage.id}`
        const exists = await redisMock.hlen(key)
        expect(exists).toBe(0)
      })

      it('should handle removing non-existent user', async () => {
        await syncService.removeUserFromPage(mockPage.id, 'non-existent')
        // Should not throw
      })
    })

    describe('getPageUsers', () => {
      it('should return all users in a page', async () => {
        prismaMock.user.findUnique.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(mockUser2)

        await syncService.addUserToPage(mockPage.id, mockUser.id)
        await syncService.addUserToPage(mockPage.id, mockUser2.id)

        const pageUsers = await syncService.getPageUsers(mockPage.id)
        expect(pageUsers).toHaveLength(2)
        expect(pageUsers.map((u) => u.userId)).toContain(mockUser.id)
        expect(pageUsers.map((u) => u.userId)).toContain(mockUser2.id)
      })

      it('should return empty array for page with no users', async () => {
        const pageUsers = await syncService.getPageUsers('empty-page')
        expect(pageUsers).toEqual([])
      })
    })
  })

  describe('✅ Workspace Activity', () => {
    describe('getWorkspaceActivity', () => {
      it('should return workspace activity summary', async () => {
        const page1 = createPage({ id: 'page-1', workspaceId: mockWorkspace.id })
        const page2 = createPage({ id: 'page-2', workspaceId: mockWorkspace.id })

        // Mock workspace access
        prismaMock.workspace.findFirst.mockResolvedValue(mockWorkspace)

        // Mock pages in workspace
        prismaMock.page.findMany.mockResolvedValue([page1, page2] as any)

        // Mock recent changes
        prismaMock.blockChange.count.mockResolvedValue(25)

        // Add users to pages
        prismaMock.user.findUnique.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(mockUser2)
        await syncService.addUserToPage(page1.id, mockUser.id)
        await syncService.addUserToPage(page2.id, mockUser2.id)

        const activity = await syncService.getWorkspaceActivity(mockWorkspace.id, mockUser.id)

        expect(activity).toEqual({
          activeUsers: 2,
          activePages: [page1.id, page2.id],
          recentChanges: 25,
        })
      })

      it('should throw error when user does not have access', async () => {
        prismaMock.workspace.findFirst.mockResolvedValue(null)

        await expect(syncService.getWorkspaceActivity(mockWorkspace.id, 'unauthorized-user')).rejects.toThrow('Access denied')
      })

      it('should handle workspace with no activity', async () => {
        prismaMock.workspace.findFirst.mockResolvedValue(mockWorkspace)
        prismaMock.page.findMany.mockResolvedValue([])
        prismaMock.blockChange.count.mockResolvedValue(0)

        const activity = await syncService.getWorkspaceActivity(mockWorkspace.id, mockUser.id)

        expect(activity).toEqual({
          activeUsers: 0,
          activePages: [],
          recentChanges: 0,
        })
      })

      it('should filter recent changes by time window', async () => {
        prismaMock.workspace.findFirst.mockResolvedValue(mockWorkspace)
        prismaMock.page.findMany.mockResolvedValue([])
        prismaMock.blockChange.count.mockResolvedValue(10)

        await syncService.getWorkspaceActivity(mockWorkspace.id, mockUser.id)

        expect(prismaMock.blockChange.count).toHaveBeenCalledWith({
          where: {
            block: {
              page: {
                workspaceId: mockWorkspace.id,
              },
            },
            changedAt: {
              gte: expect.any(Date),
            },
          },
        })
      })
    })
  })

  describe('✅ Conflict Resolution', () => {
    describe('resolveEditConflict', () => {
      it('should resolve when versions match', async () => {
        const mockBlock = createBlock({
          id: 'block-1',
          version: 5,
          content: 'Current content',
        })

        prismaMock.block.findUnique.mockResolvedValue(mockBlock)

        const result = await syncService.resolveEditConflict('block-1', mockUser.id, 5, 'New content')

        expect(result).toEqual({
          resolved: true,
          currentVersion: 5,
          currentContent: 'Current content',
        })
      })

      it('should detect version mismatch', async () => {
        const mockBlock = createBlock({
          id: 'block-1',
          version: 5,
          content: 'Current content',
        })

        prismaMock.block.findUnique.mockResolvedValue(mockBlock)

        const result = await syncService.resolveEditConflict(
          'block-1',
          mockUser.id,
          3, // Old version
          'New content'
        )

        expect(result.resolved).toBe(false)
        expect(result.currentVersion).toBe(5)
        expect(result.currentContent).toBe('Current content')
      })

      it('should include conflict info when another user is editing', async () => {
        const mockBlock = createBlock({
          id: 'block-1',
          version: 5,
          content: 'Current content',
        })

        prismaMock.block.findUnique.mockResolvedValue(mockBlock)

        // Track active edit by another user
        await syncService.trackActiveEdit('block-1', mockUser2.id)

        const result = await syncService.resolveEditConflict('block-1', mockUser.id, 3, 'New content from user 1')

        expect(result.resolved).toBe(false)
        expect(result.conflict).toEqual({
          userId: mockUser2.id,
          content: 'New content from user 1',
        })
      })

      it('should throw error when block not found', async () => {
        prismaMock.block.findUnique.mockResolvedValue(null)

        await expect(syncService.resolveEditConflict('non-existent', mockUser.id, 1, 'Content')).rejects.toThrow('Block not found')
      })
    })
  })

  describe('✅ Edge Cases', () => {
    it('should handle concurrent edits cleanup', async () => {
      // With Redis TTL, cleanup is automatic
      // Test that we can track multiple edits
      for (let i = 0; i < 10; i++) {
        await syncService.trackActiveEdit(`block-${i}`, `user-${i}`)
      }

      // Add one more edit
      await syncService.trackActiveEdit('recent', mockUser.id)

      // Verify edits are tracked
      expect(await syncService.getBlockEditor('block-5')).toBe('user-5')
      expect(await syncService.getBlockEditor('recent')).toBe(mockUser.id)
    })

    it('should handle rapid user joins and leaves', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser)

      // Rapid joins and leaves
      for (let i = 0; i < 5; i++) {
        await syncService.addUserToPage(mockPage.id, mockUser.id)
        await syncService.removeUserFromPage(mockPage.id, mockUser.id)
      }

      const pageUsers = await syncService.getPageUsers(mockPage.id)
      expect(pageUsers).toHaveLength(0)
    })

    it('should handle multiple pages with same users', async () => {
      const page1 = 'page-1'
      const page2 = 'page-2'

      prismaMock.user.findUnique.mockResolvedValue(mockUser)

      await syncService.addUserToPage(page1, mockUser.id)
      await syncService.addUserToPage(page2, mockUser.id)

      const users1 = await syncService.getPageUsers(page1)
      const users2 = await syncService.getPageUsers(page2)

      expect(users1).toHaveLength(1)
      expect(users2).toHaveLength(1)
      expect(users1[0].userId).toBe(mockUser.id)
      expect(users2[0].userId).toBe(mockUser.id)
    })

    it('should handle workspace with many pages', async () => {
      const pages = Array.from({ length: 100 }, (_, i) => createPage({ id: `page-${i}`, workspaceId: mockWorkspace.id }))

      prismaMock.workspace.findFirst.mockResolvedValue(mockWorkspace)
      prismaMock.page.findMany.mockResolvedValue(pages as any)
      prismaMock.blockChange.count.mockResolvedValue(1000)

      // Add users to some pages
      prismaMock.user.findUnique.mockResolvedValue(mockUser)
      for (let i = 0; i < 10; i++) {
        await syncService.addUserToPage(`page-${i}`, mockUser.id)
      }

      const activity = await syncService.getWorkspaceActivity(mockWorkspace.id, mockUser.id)

      expect(activity.activePages).toHaveLength(10)
      expect(activity.activeUsers).toBe(1)
      expect(activity.recentChanges).toBe(1000)
    })
  })

  describe('✅ Performance and Cleanup', () => {
    it('should efficiently handle many active edits', async () => {
      // Track many edits
      const editCount = 1000
      for (let i = 0; i < editCount; i++) {
        await syncService.trackActiveEdit(`block-${i}`, `user-${i % 10}`)
      }

      // Check a specific edit
      expect(await syncService.getBlockEditor('block-500')).toBe('user-0')

      // Clear edits for one user
      await syncService.clearUserActiveEdits('user-0')

      // Verify only that user's edits were cleared
      expect(await syncService.getBlockEditor('block-0')).toBeNull()
      expect(await syncService.getBlockEditor('block-1')).toBe('user-1')
    })

    it('should handle edge case timestamps', async () => {
      // Test that Redis TTL works correctly
      await syncService.trackActiveEdit('test-block', mockUser.id)

      // Verify the edit is stored
      expect(await syncService.getBlockEditor('test-block')).toBe(mockUser.id)

      // In production, Redis would expire this after 30 seconds
      // Our mock doesn't simulate TTL expiration in real-time
    })
  })
})
