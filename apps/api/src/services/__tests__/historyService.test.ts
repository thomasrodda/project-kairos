import { HistoryService } from '../historyService'
import { prismaMock } from '../../test/setup'
import { createUser, createWorkspace, createPage, createBlock } from '../../test/factories'
import { NotFoundError } from '../../utils/errors'
import { BlockChange, PageSnapshot, Prisma } from '@kairos/database'
import { pageService } from '../pageService'
import { blockService } from '../blockService'
import { BlockType } from '@prisma/client'
import { phase3Config } from '../../config/phase3.config'

// Mock the other services
jest.mock('../pageService')
jest.mock('../blockService')

describe('HistoryService', () => {
  let historyService: HistoryService
  let mockUser: ReturnType<typeof createUser>
  let mockWorkspace: ReturnType<typeof createWorkspace>
  let mockPage: ReturnType<typeof createPage>

  beforeEach(() => {
    historyService = new HistoryService()
    mockUser = createUser()
    mockWorkspace = createWorkspace({ userId: mockUser.id })
    mockPage = createPage({ workspaceId: mockWorkspace.id })
    jest.clearAllMocks()
  })

  describe('✅ Core Functionality', () => {
    describe('getPageHistory', () => {
      it('should retrieve page history with pagination', async () => {
        const mockChanges: BlockChange[] = [
          {
            id: 'change-1',
            blockId: 'block-1',
            operation: 'update',
            oldContent: 'Old content',
            newContent: 'New content',
            oldFormatting: null,
            newFormatting: null,
            changedBy: mockUser.id,
            changedAt: new Date('2024-01-01T10:00:00Z'),
            block: {
              id: 'block-1',
              type: BlockType.PARAGRAPH,
              order: 0,
            },
            user: {
              id: mockUser.id,
              displayName: mockUser.displayName,
              email: mockUser.email,
            },
          } as any,
          {
            id: 'change-2',
            blockId: 'block-2',
            operation: 'create',
            oldContent: null,
            newContent: 'Created content',
            oldFormatting: null,
            newFormatting: null,
            changedBy: mockUser.id,
            changedAt: new Date('2024-01-01T11:00:00Z'),
            block: {
              id: 'block-2',
              type: BlockType.HEADING1,
              order: 1,
            },
            user: {
              id: mockUser.id,
              displayName: mockUser.displayName,
              email: mockUser.email,
            },
          } as any,
        ]

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.blockChange.count.mockResolvedValue(2)
        prismaMock.blockChange.findMany.mockResolvedValue(mockChanges)

        const result = await historyService.getPageHistory(mockPage.id, mockUser.id, {
          limit: 10,
          offset: 0,
        })

        expect(result.changes).toHaveLength(2)
        expect(result.total).toBe(2)
        expect(result.changes[0].operation).toBe('update')
        expect(result.changes[1].operation).toBe('create')
        expect(prismaMock.blockChange.findMany).toHaveBeenCalledWith({
          where: { block: { pageId: mockPage.id } },
          orderBy: { changedAt: 'desc' },
          skip: 0,
          take: 10,
          include: {
            block: {
              select: {
                id: true,
                type: true,
                order: true,
              },
            },
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        })
      })

      it('should filter by date range', async () => {
        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.blockChange.count.mockResolvedValue(0)
        prismaMock.blockChange.findMany.mockResolvedValue([])

        const startDate = '2024-01-01T00:00:00Z'
        const endDate = '2024-01-31T23:59:59Z'

        await historyService.getPageHistory(mockPage.id, mockUser.id, {
          limit: 10,
          offset: 0,
          startDate,
          endDate,
        })

        expect(prismaMock.blockChange.findMany).toHaveBeenCalledWith({
          where: {
            block: { pageId: mockPage.id },
            changedAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          orderBy: { changedAt: 'desc' },
          skip: 0,
          take: 10,
          include: expect.any(Object),
        })
      })

      it('should throw NotFoundError when page access is denied', async () => {
        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(false)

        await expect(
          historyService.getPageHistory(mockPage.id, mockUser.id, {
            limit: 10,
            offset: 0,
          })
        ).rejects.toThrow(NotFoundError)
      })
    })

    describe('getBlockHistory', () => {
      it('should retrieve block-specific history', async () => {
        const blockId = 'block-1'
        const mockChanges: BlockChange[] = [
          {
            id: 'change-1',
            blockId,
            operation: 'update',
            oldContent: 'Version 1',
            newContent: 'Version 2',
            oldFormatting: null,
            newFormatting: null,
            changedBy: mockUser.id,
            changedAt: new Date(),
            user: {
              id: mockUser.id,
              displayName: mockUser.displayName,
              email: mockUser.email,
            },
          } as any,
        ]

        ;(blockService.verifyBlockAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.blockChange.count.mockResolvedValue(1)
        prismaMock.blockChange.findMany.mockResolvedValue(mockChanges)

        const result = await historyService.getBlockHistory(blockId, mockPage.id, mockUser.id, {
          limit: 10,
          offset: 0,
        })

        expect(result.changes).toHaveLength(1)
        expect(result.total).toBe(1)
        expect(prismaMock.blockChange.findMany).toHaveBeenCalledWith({
          where: { blockId },
          orderBy: { changedAt: 'desc' },
          skip: 0,
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        })
      })

      it('should throw NotFoundError when block access is denied', async () => {
        ;(blockService.verifyBlockAccess as jest.Mock).mockResolvedValue(false)

        await expect(
          historyService.getBlockHistory('block-1', mockPage.id, mockUser.id, {
            limit: 10,
            offset: 0,
          })
        ).rejects.toThrow(NotFoundError)
      })
    })
  })

  describe('✅ Snapshot Management', () => {
    describe('createSnapshot', () => {
      it('should create a page snapshot with all blocks', async () => {
        const mockBlocks = [
          createBlock({ id: 'block-1', pageId: mockPage.id, order: 0, content: 'Block 1' }),
          createBlock({ id: 'block-2', pageId: mockPage.id, order: 1, content: 'Block 2' }),
        ]

        const pageWithBlocks = {
          ...mockPage,
          blocks: mockBlocks,
        }

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValue(pageWithBlocks as any)
        prismaMock.pageSnapshot.create.mockResolvedValue({
          id: 'snapshot-1',
          pageId: mockPage.id,
          snapshotData: {
            pageId: mockPage.id,
            title: mockPage.title,
            blocks: mockBlocks.map((b) => ({
              id: b.id,
              type: b.type,
              content: b.content,
              order: b.order,
              metadata: b.metadata,
              version: b.version,
            })),
            timestamp: new Date().toISOString(),
          },
          createdAt: new Date(),
        } as PageSnapshot)

        const result = await historyService.createSnapshot(mockPage.id, mockUser.id)

        expect(result.id).toBe('snapshot-1')
        expect(prismaMock.pageSnapshot.create).toHaveBeenCalledWith({
          data: {
            pageId: mockPage.id,
            snapshotData: expect.objectContaining({
              pageId: mockPage.id,
              title: mockPage.title,
              blocks: expect.arrayContaining([
                expect.objectContaining({ id: 'block-1', content: 'Block 1' }),
                expect.objectContaining({ id: 'block-2', content: 'Block 2' }),
              ]),
            }),
          },
        })
      })

      it('should throw NotFoundError when page access is denied', async () => {
        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(false)

        await expect(historyService.createSnapshot(mockPage.id, mockUser.id)).rejects.toThrow(NotFoundError)
      })

      it('should handle pages with no blocks', async () => {
        const pageWithNoBlocks = {
          ...mockPage,
          blocks: [],
        }

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValue(pageWithNoBlocks as any)
        prismaMock.pageSnapshot.create.mockResolvedValue({
          id: 'snapshot-1',
          pageId: mockPage.id,
          snapshotData: {
            pageId: mockPage.id,
            title: mockPage.title,
            blocks: [],
            timestamp: new Date().toISOString(),
          },
          createdAt: new Date(),
        } as PageSnapshot)

        const result = await historyService.createSnapshot(mockPage.id, mockUser.id)

        expect(result.id).toBe('snapshot-1')
        expect(prismaMock.pageSnapshot.create).toHaveBeenCalledWith({
          data: {
            pageId: mockPage.id,
            snapshotData: expect.objectContaining({
              blocks: [],
            }),
          },
        })
      })
    })

    describe('getPageSnapshots', () => {
      it('should retrieve page snapshots with pagination', async () => {
        const mockSnapshots: PageSnapshot[] = [
          {
            id: 'snapshot-1',
            pageId: mockPage.id,
            snapshotData: { title: 'Snapshot 1' } as any,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'snapshot-2',
            pageId: mockPage.id,
            snapshotData: { title: 'Snapshot 2' } as any,
            createdAt: new Date('2024-01-02'),
          },
        ]

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.pageSnapshot.count.mockResolvedValue(2)
        prismaMock.pageSnapshot.findMany.mockResolvedValue(mockSnapshots)

        const result = await historyService.getPageSnapshots(mockPage.id, mockUser.id, {
          limit: 10,
          offset: 0,
        })

        expect(result.snapshots).toHaveLength(2)
        expect(result.total).toBe(2)
        expect(prismaMock.pageSnapshot.findMany).toHaveBeenCalledWith({
          where: { pageId: mockPage.id },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        })
      })

      it('should filter snapshots by date range', async () => {
        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.pageSnapshot.count.mockResolvedValue(0)
        prismaMock.pageSnapshot.findMany.mockResolvedValue([])

        const startDate = '2024-01-01T00:00:00Z'
        const endDate = '2024-01-31T23:59:59Z'

        await historyService.getPageSnapshots(mockPage.id, mockUser.id, {
          limit: 10,
          offset: 0,
          startDate,
          endDate,
        })

        expect(prismaMock.pageSnapshot.findMany).toHaveBeenCalledWith({
          where: {
            pageId: mockPage.id,
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        })
      })
    })

    describe('getSnapshot', () => {
      it('should retrieve a specific snapshot', async () => {
        const mockSnapshot = {
          id: 'snapshot-1',
          pageId: mockPage.id,
          snapshotData: { title: 'Test Snapshot' },
          createdAt: new Date(),
          page: {
            id: mockPage.id,
            workspaceId: mockWorkspace.id,
            workspace: {
              userId: mockUser.id,
            },
          },
        }

        prismaMock.pageSnapshot.findUnique.mockResolvedValue(mockSnapshot as any)

        const result = await historyService.getSnapshot('snapshot-1', mockUser.id)

        expect(result.id).toBe('snapshot-1')
        expect(prismaMock.pageSnapshot.findUnique).toHaveBeenCalledWith({
          where: { id: 'snapshot-1' },
          include: {
            page: {
              select: {
                id: true,
                workspaceId: true,
                workspace: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        })
      })

      it('should throw NotFoundError when snapshot does not exist', async () => {
        prismaMock.pageSnapshot.findUnique.mockResolvedValue(null)

        await expect(historyService.getSnapshot('non-existent', mockUser.id)).rejects.toThrow(NotFoundError)
      })

      it('should throw NotFoundError when user does not have access', async () => {
        const mockSnapshot = {
          id: 'snapshot-1',
          pageId: mockPage.id,
          snapshotData: { title: 'Test Snapshot' },
          createdAt: new Date(),
          page: {
            id: mockPage.id,
            workspaceId: mockWorkspace.id,
            workspace: {
              userId: 'different-user',
            },
          },
        }

        prismaMock.pageSnapshot.findUnique.mockResolvedValue(mockSnapshot as any)

        await expect(historyService.getSnapshot('snapshot-1', mockUser.id)).rejects.toThrow(NotFoundError)
      })
    })

    describe('restoreSnapshot', () => {
      it('should restore a page from snapshot', async () => {
        const snapshotData = {
          pageId: mockPage.id,
          title: 'Restored Title',
          blocks: [
            {
              id: 'block-1',
              type: BlockType.HEADING1,
              content: 'Restored Heading',
              order: 0,
              metadata: { level: 1 },
            },
            {
              id: 'block-2',
              type: BlockType.PARAGRAPH,
              content: 'Restored Content',
              order: 1,
              metadata: null,
            },
          ],
        }

        const mockSnapshot = {
          id: 'snapshot-1',
          pageId: mockPage.id,
          snapshotData,
          createdAt: new Date(),
          page: {
            id: mockPage.id,
            workspaceId: mockWorkspace.id,
            workspace: {
              userId: mockUser.id,
            },
          },
        }

        // Mock getSnapshot
        const getSnapshotSpy = jest.spyOn(historyService, 'getSnapshot')
        getSnapshotSpy.mockResolvedValue(mockSnapshot as any)

        // Mock transaction
        prismaMock.$transaction.mockImplementation(async (callback) => {
          const tx = {
            page: { update: jest.fn() },
            block: { deleteMany: jest.fn(), createMany: jest.fn() },
            blockChange: { create: jest.fn() },
          }
          await callback(tx as any)
        })

        await historyService.restoreSnapshot('snapshot-1', mockUser.id)

        expect(getSnapshotSpy).toHaveBeenCalledWith('snapshot-1', mockUser.id)
        expect(prismaMock.$transaction).toHaveBeenCalled()
      })

      it('should handle snapshots with no blocks', async () => {
        const snapshotData = {
          pageId: mockPage.id,
          title: 'Empty Page',
          blocks: [],
        }

        const mockSnapshot = {
          id: 'snapshot-1',
          pageId: mockPage.id,
          snapshotData,
          createdAt: new Date(),
          page: {
            id: mockPage.id,
            workspaceId: mockWorkspace.id,
            workspace: {
              userId: mockUser.id,
            },
          },
        }

        const getSnapshotSpy = jest.spyOn(historyService, 'getSnapshot')
        getSnapshotSpy.mockResolvedValue(mockSnapshot as any)

        prismaMock.$transaction.mockImplementation(async (callback) => {
          const tx = {
            page: { update: jest.fn() },
            block: { deleteMany: jest.fn(), createMany: jest.fn() },
            blockChange: { create: jest.fn() },
          }
          await callback(tx as any)
        })

        await historyService.restoreSnapshot('snapshot-1', mockUser.id)

        expect(prismaMock.$transaction).toHaveBeenCalled()
      })
    })
  })

  describe('✅ Automatic Snapshot Creation', () => {
    describe('shouldCreateSnapshot', () => {
      it('should return true when no snapshot exists', async () => {
        prismaMock.pageSnapshot.findFirst.mockResolvedValue(null)

        const result = await historyService.shouldCreateSnapshot(mockPage.id)

        expect(result).toBe(true)
      })

      it('should return true when configured interval hours have passed since last snapshot', async () => {
        const oldSnapshot = {
          id: 'snapshot-1',
          pageId: mockPage.id,
          createdAt: new Date(Date.now() - (phase3Config.history.snapshotIntervalHours + 1) * 60 * 60 * 1000), // 1 hour past the configured interval
        }

        prismaMock.pageSnapshot.findFirst.mockResolvedValue(oldSnapshot as any)

        const result = await historyService.shouldCreateSnapshot(mockPage.id)

        expect(result).toBe(true)
      })

      it('should return true when configured threshold changes have been made since last snapshot', async () => {
        const recentSnapshot = {
          id: 'snapshot-1',
          pageId: mockPage.id,
          createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        }

        prismaMock.pageSnapshot.findFirst.mockResolvedValue(recentSnapshot as any)
        prismaMock.blockChange.count.mockResolvedValue(phase3Config.history.snapshotThreshold)

        const result = await historyService.shouldCreateSnapshot(mockPage.id)

        expect(result).toBe(true)
        expect(prismaMock.blockChange.count).toHaveBeenCalledWith({
          where: {
            block: { pageId: mockPage.id },
            changedAt: { gt: recentSnapshot.createdAt },
          },
        })
      })

      it('should return false when conditions are not met', async () => {
        const recentSnapshot = {
          id: 'snapshot-1',
          pageId: mockPage.id,
          createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        }

        prismaMock.pageSnapshot.findFirst.mockResolvedValue(recentSnapshot as any)
        prismaMock.blockChange.count.mockResolvedValue(phase3Config.history.snapshotThreshold - 1) // Less than threshold

        const result = await historyService.shouldCreateSnapshot(mockPage.id)

        expect(result).toBe(false)
      })
    })
  })

  describe('✅ History Cleanup', () => {
    describe('cleanupOldHistory', () => {
      it('should delete old snapshots and changes', async () => {
        prismaMock.pageSnapshot.deleteMany.mockResolvedValue({ count: 5 })
        prismaMock.blockChange.deleteMany.mockResolvedValue({ count: 150 })

        const result = await historyService.cleanupOldHistory(mockUser.id)

        expect(result.deletedSnapshots).toBe(5)
        expect(result.deletedChanges).toBe(150)

        const retentionDate = new Date()
        retentionDate.setDate(retentionDate.getDate() - phase3Config.history.retentionDays)

        expect(prismaMock.pageSnapshot.deleteMany).toHaveBeenCalledWith({
          where: {
            createdAt: { lt: expect.any(Date) },
            page: {
              workspace: { userId: mockUser.id },
            },
          },
        })

        expect(prismaMock.blockChange.deleteMany).toHaveBeenCalledWith({
          where: {
            changedAt: { lt: expect.any(Date) },
            block: {
              page: {
                workspace: { userId: mockUser.id },
              },
            },
          },
        })
      })

      it('should handle no deletions gracefully', async () => {
        prismaMock.pageSnapshot.deleteMany.mockResolvedValue({ count: 0 })
        prismaMock.blockChange.deleteMany.mockResolvedValue({ count: 0 })

        const result = await historyService.cleanupOldHistory(mockUser.id)

        expect(result.deletedSnapshots).toBe(0)
        expect(result.deletedChanges).toBe(0)
      })
    })
  })

  describe('✅ Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.blockChange.count.mockRejectedValue(new Error('Database error'))

      await expect(
        historyService.getPageHistory(mockPage.id, mockUser.id, {
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow('Database error')
    })

    it('should handle transaction failures during restore', async () => {
      const mockSnapshot = {
        id: 'snapshot-1',
        pageId: mockPage.id,
        snapshotData: { pageId: mockPage.id, title: 'Test', blocks: [] },
        createdAt: new Date(),
        page: {
          id: mockPage.id,
          workspaceId: mockWorkspace.id,
          workspace: {
            userId: mockUser.id,
          },
        },
      }

      const getSnapshotSpy = jest.spyOn(historyService, 'getSnapshot')
      getSnapshotSpy.mockResolvedValue(mockSnapshot as any)

      prismaMock.$transaction.mockRejectedValue(new Error('Transaction failed'))

      await expect(historyService.restoreSnapshot('snapshot-1', mockUser.id)).rejects.toThrow('Transaction failed')
    })
  })

  describe('✅ Edge Cases', () => {
    it('should handle extremely large history results', async () => {
      const largeChanges = Array.from({ length: 100 }, (_, i) => ({
        id: `change-${i}`,
        blockId: `block-${i}`,
        operation: 'update',
        oldContent: `Old ${i}`,
        newContent: `New ${i}`,
        oldFormatting: null,
        newFormatting: null,
        changedBy: mockUser.id,
        changedAt: new Date(),
        block: {
          id: `block-${i}`,
          type: BlockType.PARAGRAPH,
          order: i,
        },
        user: {
          id: mockUser.id,
          displayName: mockUser.displayName,
          email: mockUser.email,
        },
      })) as any[]

      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.blockChange.count.mockResolvedValue(10000)
      prismaMock.blockChange.findMany.mockResolvedValue(largeChanges)

      const result = await historyService.getPageHistory(mockPage.id, mockUser.id, {
        limit: phase3Config.history.queryLimit.max,
        offset: 0,
      })

      expect(result.changes).toHaveLength(phase3Config.history.queryLimit.max)
      expect(result.total).toBe(10000)
    })

    it('should handle null metadata in block changes', async () => {
      const changesWithNullMetadata: BlockChange[] = [
        {
          id: 'change-1',
          blockId: 'block-1',
          operation: 'update',
          oldContent: 'Content',
          newContent: 'Updated',
          oldFormatting: Prisma.JsonNull,
          newFormatting: Prisma.JsonNull,
          changedBy: mockUser.id,
          changedAt: new Date(),
          block: {
            id: 'block-1',
            type: BlockType.PARAGRAPH,
            order: 0,
          },
          user: {
            id: mockUser.id,
            displayName: mockUser.displayName,
            email: mockUser.email,
          },
        } as any,
      ]

      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.blockChange.count.mockResolvedValue(1)
      prismaMock.blockChange.findMany.mockResolvedValue(changesWithNullMetadata)

      const result = await historyService.getPageHistory(mockPage.id, mockUser.id, {
        limit: 10,
        offset: 0,
      })

      expect(result.changes[0].oldFormatting).toBe(Prisma.JsonNull)
      expect(result.changes[0].newFormatting).toBe(Prisma.JsonNull)
    })

    it('should handle invalid date formats gracefully', async () => {
      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.blockChange.count.mockResolvedValue(0)
      prismaMock.blockChange.findMany.mockResolvedValue([])

      // Invalid date should be converted to valid Date object
      await historyService.getPageHistory(mockPage.id, mockUser.id, {
        limit: 10,
        offset: 0,
        startDate: 'invalid-date',
        endDate: 'also-invalid',
      })

      // The service should still execute, even with invalid dates
      expect(prismaMock.blockChange.findMany).toHaveBeenCalled()
    })
  })
})
