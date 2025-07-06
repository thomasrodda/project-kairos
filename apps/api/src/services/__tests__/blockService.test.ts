import { BlockService } from '../blockService'
import { prismaMock } from '../../test/setup'
import { createUser, createWorkspace, createPage, createBlock } from '../../test/factories'
import { BlockType } from '@prisma/client'
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors'
import { Prisma } from '@kairos/database'

describe('BlockService', () => {
  let blockService: BlockService
  let mockUser: ReturnType<typeof createUser>
  let mockWorkspace: ReturnType<typeof createWorkspace>
  let mockPage: ReturnType<typeof createPage>

  beforeEach(() => {
    blockService = new BlockService()
    mockUser = createUser()
    mockWorkspace = createWorkspace({ userId: mockUser.id })
    mockPage = createPage({ workspaceId: mockWorkspace.id })
    jest.clearAllMocks()
  })

  describe('✅ Version Tracking', () => {
    it('should include version field in block responses', async () => {
      const mockBlock = createBlock({
        pageId: mockPage.id,
        version: 1,
      })

      prismaMock.page.findFirst.mockResolvedValue(mockPage)
      prismaMock.block.findMany.mockResolvedValue([mockBlock])

      const blocks = await blockService.getBlocksByPage(mockPage.id, mockUser.id)

      expect(blocks).toHaveLength(1)
      expect(blocks[0]).toHaveProperty('version', 1)
    })

    it('should initialize version to 1 when creating a new block', async () => {
      const newBlockData = {
        type: BlockType.PARAGRAPH,
        content: 'New block content',
      }

      const createdBlock = createBlock({
        ...newBlockData,
        pageId: mockPage.id,
        version: 1,
      })

      prismaMock.page.findFirst.mockResolvedValue(mockPage)
      prismaMock.block.findFirst.mockResolvedValue(null) // No existing blocks
      prismaMock.block.create.mockResolvedValue(createdBlock)
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      const result = await blockService.createBlock(mockPage.id, mockUser.id, newBlockData)

      expect(result).toHaveProperty('version', 1)
      expect(prismaMock.block.create).toHaveBeenCalledWith({
        data: {
          pageId: mockPage.id,
          type: newBlockData.type,
          content: newBlockData.content,
          order: 0,
          metadata: Prisma.JsonNull,
        },
      })
    })

    it('should increment version on update', async () => {
      const existingBlock = createBlock({
        id: 'block-1',
        pageId: mockPage.id,
        version: 3,
        content: 'Original content',
      })

      const updateData = {
        content: 'Updated content',
        version: 3, // Matching current version
      }

      prismaMock.block.findFirst.mockResolvedValue(existingBlock)
      prismaMock.block.findUnique.mockResolvedValueOnce(existingBlock)
      prismaMock.block.updateMany.mockResolvedValue({ count: 1 })
      prismaMock.block.findUnique.mockResolvedValueOnce({
        ...existingBlock,
        content: updateData.content,
        version: 4, // Incremented version
      })
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      const result = await blockService.updateBlock(existingBlock.id, mockPage.id, mockUser.id, updateData)

      expect(result.version).toBe(4)
      expect(prismaMock.block.updateMany).toHaveBeenCalledWith({
        where: {
          id: existingBlock.id,
          version: 3,
        },
        data: {
          version: { increment: 1 },
          content: updateData.content,
        },
      })
    })
  })

  describe('✅ Optimistic Locking', () => {
    it('should fail with 409 Conflict when version does not match', async () => {
      const existingBlock = createBlock({
        id: 'block-1',
        pageId: mockPage.id,
        version: 5,
        content: 'Current content',
      })

      const updateData = {
        content: 'Updated content',
        version: 3, // Outdated version
      }

      prismaMock.block.findFirst.mockResolvedValue(existingBlock)
      prismaMock.block.findUnique.mockResolvedValue(existingBlock)
      prismaMock.block.updateMany.mockResolvedValue({ count: 0 }) // No rows updated

      await expect(blockService.updateBlock(existingBlock.id, mockPage.id, mockUser.id, updateData)).rejects.toThrow(ConflictError)

      await expect(blockService.updateBlock(existingBlock.id, mockPage.id, mockUser.id, updateData)).rejects.toThrow(
        'Block was modified by another user'
      )
    })

    it('should handle concurrent updates correctly', async () => {
      const existingBlock = createBlock({
        id: 'block-1',
        pageId: mockPage.id,
        version: 2,
        content: 'Original content',
      })

      // First update with correct version
      prismaMock.block.findFirst.mockResolvedValue(existingBlock)
      prismaMock.block.findUnique.mockResolvedValueOnce(existingBlock)
      prismaMock.block.updateMany.mockResolvedValueOnce({ count: 1 })
      prismaMock.block.findUnique.mockResolvedValueOnce({
        ...existingBlock,
        content: 'First update',
        version: 3,
      })
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      const firstUpdate = await blockService.updateBlock(existingBlock.id, mockPage.id, mockUser.id, { content: 'First update', version: 2 })

      expect(firstUpdate.version).toBe(3)

      // Second update with outdated version should fail
      prismaMock.block.findFirst.mockResolvedValue({ ...existingBlock, version: 3 })
      prismaMock.block.findUnique.mockResolvedValue({ ...existingBlock, version: 3 })
      prismaMock.block.updateMany.mockResolvedValueOnce({ count: 0 })

      await expect(
        blockService.updateBlock(existingBlock.id, mockPage.id, mockUser.id, {
          content: 'Second update',
          version: 2, // Still using old version
        })
      ).rejects.toThrow(ConflictError)
    })

    it('should use version 1 when version is not provided (backward compatibility)', async () => {
      const existingBlock = createBlock({
        id: 'block-1',
        pageId: mockPage.id,
        version: 1,
        content: 'Original content',
      })

      const updateData = {
        content: 'Updated content',
        // No version provided
      }

      prismaMock.block.findFirst.mockResolvedValue(existingBlock)
      prismaMock.block.findUnique.mockResolvedValueOnce(existingBlock)
      prismaMock.block.updateMany.mockResolvedValue({ count: 1 })
      prismaMock.block.findUnique.mockResolvedValueOnce({
        ...existingBlock,
        content: updateData.content,
        version: 2,
      })
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      const result = await blockService.updateBlock(existingBlock.id, mockPage.id, mockUser.id, updateData)

      expect(result.version).toBe(2)
      expect(prismaMock.block.updateMany).toHaveBeenCalledWith({
        where: {
          id: existingBlock.id,
          version: 1, // Default version used
        },
        data: {
          version: { increment: 1 },
          content: updateData.content,
        },
      })
    })
  })

  describe('✅ Batch Updates with Version Conflicts', () => {
    it('should handle batch updates with all matching versions', async () => {
      const blocks = [
        createBlock({ id: 'block-1', pageId: mockPage.id, version: 1, content: 'Content 1' }),
        createBlock({ id: 'block-2', pageId: mockPage.id, version: 2, content: 'Content 2' }),
        createBlock({ id: 'block-3', pageId: mockPage.id, version: 1, content: 'Content 3' }),
      ]

      const updateData = {
        blocks: [
          { id: 'block-1', content: 'Updated 1', version: 1 },
          { id: 'block-2', content: 'Updated 2', version: 2 },
          { id: 'block-3', content: 'Updated 3', version: 1 },
        ],
      }

      prismaMock.page.findFirst.mockResolvedValue(mockPage)
      prismaMock.block.findMany.mockResolvedValueOnce(blocks) // For verification
      prismaMock.$transaction.mockImplementation(async (updates) => {
        return updates.map(() => ({ count: 1 }))
      })
      prismaMock.block.findMany.mockResolvedValueOnce(
        blocks.map((block, i) => ({
          ...block,
          content: updateData.blocks[i].content,
          version: block.version + 1,
        }))
      )
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      const result = await blockService.batchUpdateBlocks(mockPage.id, mockUser.id, updateData)

      expect(result).toHaveLength(3)
      expect(result[0].version).toBe(2)
      expect(result[1].version).toBe(3)
      expect(result[2].version).toBe(2)
    })

    it('should fail batch update when any version conflicts', async () => {
      const blocks = [
        createBlock({ id: 'block-1', pageId: mockPage.id, version: 1 }),
        createBlock({ id: 'block-2', pageId: mockPage.id, version: 5 }), // Current version is 5
        createBlock({ id: 'block-3', pageId: mockPage.id, version: 1 }),
      ]

      const updateData = {
        blocks: [
          { id: 'block-1', content: 'Updated 1', version: 1 },
          { id: 'block-2', content: 'Updated 2', version: 2 }, // Wrong version (should be 5)
          { id: 'block-3', content: 'Updated 3', version: 1 },
        ],
      }

      prismaMock.page.findFirst.mockResolvedValue(mockPage)
      prismaMock.block.findMany.mockResolvedValue(blocks)
      prismaMock.$transaction.mockImplementation(async (updates) => {
        return [
          { count: 1 }, // block-1 succeeds
          { count: 0 }, // block-2 fails due to version mismatch
          { count: 1 }, // block-3 succeeds
        ]
      })

      await expect(blockService.batchUpdateBlocks(mockPage.id, mockUser.id, updateData)).rejects.toThrow(ConflictError)

      try {
        await blockService.batchUpdateBlocks(mockPage.id, mockUser.id, updateData)
      } catch (error: any) {
        expect(error.details.conflicts).toEqual([
          {
            id: 'block-2',
            currentVersion: 5,
            expectedVersion: 2,
          },
        ])
      }
    })

    it('should handle batch updates with no version provided (backward compatibility)', async () => {
      const blocks = [
        createBlock({ id: 'block-1', pageId: mockPage.id, version: 1 }),
        createBlock({ id: 'block-2', pageId: mockPage.id, version: 1 }),
      ]

      const updateData = {
        blocks: [
          { id: 'block-1', content: 'Updated 1' }, // No version
          { id: 'block-2', content: 'Updated 2' }, // No version
        ],
      }

      prismaMock.page.findFirst.mockResolvedValue(mockPage)
      prismaMock.block.findMany.mockResolvedValueOnce(blocks)
      prismaMock.$transaction.mockImplementation(async (updates) => {
        return updates.map(() => ({ count: 1 }))
      })
      prismaMock.block.findMany.mockResolvedValueOnce(
        blocks.map((block, i) => ({
          ...block,
          content: updateData.blocks[i].content,
          version: 2,
        }))
      )
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      const result = await blockService.batchUpdateBlocks(mockPage.id, mockUser.id, updateData)

      expect(result).toHaveLength(2)
      expect(result[0].version).toBe(2)
      expect(result[1].version).toBe(2)
    })
  })

  describe('✅ Change Tracking', () => {
    it('should track block creation with BlockChange record', async () => {
      const newBlockData = {
        type: BlockType.HEADING1,
        content: 'New heading',
        metadata: { level: 1 },
      }

      const createdBlock = createBlock({
        id: 'new-block',
        ...newBlockData,
        pageId: mockPage.id,
      })

      prismaMock.page.findFirst.mockResolvedValue(mockPage)
      prismaMock.block.findFirst.mockResolvedValue(null)
      prismaMock.block.create.mockResolvedValue(createdBlock)
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      await blockService.createBlock(mockPage.id, mockUser.id, newBlockData)

      expect(prismaMock.blockChange.create).toHaveBeenCalledWith({
        data: {
          blockId: 'new-block',
          operation: 'create',
          oldContent: null,
          newContent: 'New heading',
          oldFormatting: Prisma.JsonNull,
          newFormatting: { level: 1 },
          changedBy: mockUser.id,
        },
      })
    })

    it('should track block updates with old and new values', async () => {
      const existingBlock = createBlock({
        id: 'block-1',
        pageId: mockPage.id,
        version: 1,
        content: 'Original content',
        metadata: { format: 'plain' },
      })

      const updateData = {
        content: 'Updated content',
        metadata: { format: 'markdown' },
        version: 1,
      }

      prismaMock.block.findFirst.mockResolvedValue(existingBlock)
      prismaMock.block.findUnique.mockResolvedValueOnce(existingBlock)
      prismaMock.block.updateMany.mockResolvedValue({ count: 1 })
      prismaMock.block.findUnique.mockResolvedValueOnce({
        ...existingBlock,
        ...updateData,
        version: 2,
      })
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      await blockService.updateBlock(existingBlock.id, mockPage.id, mockUser.id, updateData)

      expect(prismaMock.blockChange.create).toHaveBeenCalledWith({
        data: {
          blockId: 'block-1',
          operation: 'update',
          oldContent: 'Original content',
          newContent: 'Updated content',
          oldFormatting: { format: 'plain' },
          newFormatting: { format: 'markdown' },
          changedBy: mockUser.id,
        },
      })
    })

    it('should track block deletion with final content', async () => {
      const blockToDelete = createBlock({
        id: 'block-1',
        pageId: mockPage.id,
        content: 'Content to be deleted',
        metadata: { important: true },
        order: 2,
      })

      prismaMock.block.findFirst.mockResolvedValue(blockToDelete)
      prismaMock.block.findUnique.mockResolvedValue(blockToDelete)
      prismaMock.blockChange.create.mockResolvedValue({} as any)
      prismaMock.block.delete.mockResolvedValue(blockToDelete)
      prismaMock.block.updateMany.mockResolvedValue({ count: 3 })

      await blockService.deleteBlock(blockToDelete.id, mockPage.id, mockUser.id)

      expect(prismaMock.blockChange.create).toHaveBeenCalledWith({
        data: {
          blockId: 'block-1',
          operation: 'delete',
          oldContent: 'Content to be deleted',
          newContent: null,
          oldFormatting: { important: true },
          newFormatting: Prisma.JsonNull,
          changedBy: mockUser.id,
        },
      })

      // Ensure tracking happens before deletion
      const trackingCallOrder = prismaMock.blockChange.create.mock.invocationCallOrder[0]
      const deleteCallOrder = prismaMock.block.delete.mock.invocationCallOrder[0]
      expect(trackingCallOrder).toBeLessThan(deleteCallOrder)
    })

    it('should handle null metadata in change tracking', async () => {
      const existingBlock = createBlock({
        id: 'block-1',
        pageId: mockPage.id,
        version: 1,
        content: 'Content',
        metadata: null,
      })

      const updateData = {
        content: 'Updated content',
        version: 1,
      }

      prismaMock.block.findFirst.mockResolvedValue(existingBlock)
      prismaMock.block.findUnique.mockResolvedValueOnce(existingBlock)
      prismaMock.block.updateMany.mockResolvedValue({ count: 1 })
      prismaMock.block.findUnique.mockResolvedValueOnce({
        ...existingBlock,
        content: updateData.content,
        version: 2,
      })
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      await blockService.updateBlock(existingBlock.id, mockPage.id, mockUser.id, updateData)

      expect(prismaMock.blockChange.create).toHaveBeenCalledWith({
        data: {
          blockId: 'block-1',
          operation: 'update',
          oldContent: 'Content',
          newContent: 'Updated content',
          oldFormatting: Prisma.JsonNull,
          newFormatting: Prisma.JsonNull,
          changedBy: mockUser.id,
        },
      })
    })

    it('should track all changes in batch update', async () => {
      const blocks = [
        createBlock({ id: 'block-1', pageId: mockPage.id, version: 1, content: 'Content 1' }),
        createBlock({ id: 'block-2', pageId: mockPage.id, version: 1, content: 'Content 2' }),
      ]

      const updateData = {
        blocks: [
          { id: 'block-1', content: 'Updated 1', version: 1 },
          { id: 'block-2', content: 'Updated 2', version: 1 },
        ],
      }

      prismaMock.page.findFirst.mockResolvedValue(mockPage)
      prismaMock.block.findMany.mockResolvedValueOnce(blocks)
      prismaMock.$transaction.mockImplementation(async (updates) => {
        return updates.map(() => ({ count: 1 }))
      })
      prismaMock.block.findMany.mockResolvedValueOnce(
        blocks.map((block, i) => ({
          ...block,
          content: updateData.blocks[i].content,
          version: 2,
        }))
      )
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      await blockService.batchUpdateBlocks(mockPage.id, mockUser.id, updateData)

      expect(prismaMock.blockChange.create).toHaveBeenCalledTimes(2)
      expect(prismaMock.blockChange.create).toHaveBeenCalledWith({
        data: {
          blockId: 'block-1',
          operation: 'update',
          oldContent: 'Content 1',
          newContent: 'Updated 1',
          oldFormatting: Prisma.JsonNull,
          newFormatting: Prisma.JsonNull,
          changedBy: mockUser.id,
        },
      })
      expect(prismaMock.blockChange.create).toHaveBeenCalledWith({
        data: {
          blockId: 'block-2',
          operation: 'update',
          oldContent: 'Content 2',
          newContent: 'Updated 2',
          oldFormatting: Prisma.JsonNull,
          newFormatting: Prisma.JsonNull,
          changedBy: mockUser.id,
        },
      })
    })
  })

  describe('✅ Edge Cases', () => {
    it('should handle updating a non-existent block', async () => {
      prismaMock.block.findFirst.mockResolvedValue(null)

      await expect(
        blockService.updateBlock('non-existent', mockPage.id, mockUser.id, {
          content: 'New content',
        })
      ).rejects.toThrow(NotFoundError)
    })

    it('should handle version overflow gracefully', async () => {
      const existingBlock = createBlock({
        id: 'block-1',
        pageId: mockPage.id,
        version: Number.MAX_SAFE_INTEGER - 1,
        content: 'Content',
      })

      const updateData = {
        content: 'Updated content',
        version: Number.MAX_SAFE_INTEGER - 1,
      }

      prismaMock.block.findFirst.mockResolvedValue(existingBlock)
      prismaMock.block.findUnique.mockResolvedValueOnce(existingBlock)
      prismaMock.block.updateMany.mockResolvedValue({ count: 1 })
      prismaMock.block.findUnique.mockResolvedValueOnce({
        ...existingBlock,
        content: updateData.content,
        version: Number.MAX_SAFE_INTEGER,
      })
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      const result = await blockService.updateBlock(existingBlock.id, mockPage.id, mockUser.id, updateData)

      expect(result.version).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should handle empty batch updates', async () => {
      prismaMock.page.findFirst.mockResolvedValue(mockPage)
      prismaMock.block.findMany.mockResolvedValue([])
      prismaMock.$transaction.mockResolvedValue([])

      const result = await blockService.batchUpdateBlocks(mockPage.id, mockUser.id, {
        blocks: [],
      })

      expect(result).toEqual([])
      expect(prismaMock.$transaction).toHaveBeenCalledWith([])
    })

    it('should maintain order integrity when deleting blocks', async () => {
      const blockToDelete = createBlock({
        id: 'block-2',
        pageId: mockPage.id,
        order: 1,
      })

      prismaMock.block.findFirst.mockResolvedValue(blockToDelete)
      prismaMock.block.findUnique.mockResolvedValue(blockToDelete)
      prismaMock.blockChange.create.mockResolvedValue({} as any)
      prismaMock.block.delete.mockResolvedValue(blockToDelete)
      prismaMock.block.updateMany.mockResolvedValue({ count: 2 })

      await blockService.deleteBlock(blockToDelete.id, mockPage.id, mockUser.id)

      // Verify blocks after the deleted one are shifted up
      expect(prismaMock.block.updateMany).toHaveBeenCalledWith({
        where: {
          pageId: mockPage.id,
          order: { gt: 1 },
        },
        data: {
          order: { decrement: 1 },
        },
      })
    })

    it('should handle Prisma.JsonNull in metadata correctly', async () => {
      const newBlockData = {
        type: BlockType.PARAGRAPH,
        content: 'Content',
        metadata: undefined, // Will be converted to Prisma.JsonNull
      }

      const createdBlock = createBlock({
        ...newBlockData,
        pageId: mockPage.id,
        metadata: null,
      })

      prismaMock.page.findFirst.mockResolvedValue(mockPage)
      prismaMock.block.findFirst.mockResolvedValue(null)
      prismaMock.block.create.mockResolvedValue(createdBlock)
      prismaMock.blockChange.create.mockResolvedValue({} as any)

      await blockService.createBlock(mockPage.id, mockUser.id, newBlockData)

      expect(prismaMock.block.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: Prisma.JsonNull,
        }),
      })

      expect(prismaMock.blockChange.create).toHaveBeenCalledWith({
        data: {
          blockId: createdBlock.id,
          operation: 'create',
          oldContent: null,
          newContent: 'Content',
          oldFormatting: Prisma.JsonNull,
          newFormatting: Prisma.JsonNull,
          changedBy: mockUser.id,
        },
      })
    })
  })

  describe('✅ Access Control', () => {
    it('should verify page access before operations', async () => {
      prismaMock.page.findFirst.mockResolvedValue(null)

      await expect(blockService.getBlocksByPage('unauthorized-page', mockUser.id)).rejects.toThrow(NotFoundError)

      expect(prismaMock.page.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'unauthorized-page',
          workspace: {
            userId: mockUser.id,
          },
        },
      })
    })

    it('should verify block access through workspace ownership', async () => {
      prismaMock.block.findFirst.mockResolvedValue(null)

      await expect(
        blockService.updateBlock('block-1', mockPage.id, 'different-user', {
          content: 'Hacked content',
        })
      ).rejects.toThrow(NotFoundError)

      expect(prismaMock.block.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'block-1',
          pageId: mockPage.id,
          page: {
            workspace: {
              userId: 'different-user',
            },
          },
        },
      })
    })
  })
})
