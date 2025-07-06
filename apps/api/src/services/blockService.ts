import { prisma, Block, Prisma, BlockChange } from '@kairos/database'
import { BlockType } from '@prisma/client'
import { z } from 'zod'
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors'

// Validation schemas
export const createBlockSchema = z.object({
  type: z.nativeEnum(BlockType),
  content: z.string().default(''),
  order: z.number().int().min(0).optional(),
  metadata: z.record(z.any()).optional(),
})

export const updateBlockSchema = z.object({
  type: z.nativeEnum(BlockType).optional(),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
  metadata: z.record(z.any()).optional(),
  version: z.number().int().min(1).optional(), // For optimistic locking
})

export const reorderBlocksSchema = z.object({
  blocks: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ),
})

export const batchUpdateBlocksSchema = z.object({
  blocks: z.array(
    z.object({
      id: z.string(),
      type: z.nativeEnum(BlockType).optional(),
      content: z.string().optional(),
      metadata: z.record(z.any()).optional(),
      version: z.number().int().min(1).optional(), // For optimistic locking
    })
  ),
})

export class BlockService {
  /**
   * Track block changes for audit trail
   */
  private async trackBlockChange(
    blockId: string,
    operation: 'create' | 'update' | 'delete',
    userId: string,
    oldContent?: string | null,
    newContent?: string | null,
    oldFormatting?: any,
    newFormatting?: any
  ): Promise<BlockChange> {
    return prisma.blockChange.create({
      data: {
        blockId,
        operation,
        oldContent,
        newContent,
        oldFormatting: oldFormatting ?? Prisma.JsonNull,
        newFormatting: newFormatting ?? Prisma.JsonNull,
        changedBy: userId,
      },
    })
  }

  /**
   * Check if a user has access to a page through workspace ownership
   */
  async verifyPageAccess(pageId: string, userId: string): Promise<boolean> {
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        workspace: {
          userId,
        },
      },
    })
    return !!page
  }

  /**
   * Check if a user has access to a block through workspace ownership
   */
  async verifyBlockAccess(blockId: string, pageId: string, userId: string): Promise<boolean> {
    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        pageId,
        page: {
          workspace: {
            userId,
          },
        },
      },
    })
    return !!block
  }

  /**
   * Get all blocks in a page
   */
  async getBlocksByPage(pageId: string, userId: string): Promise<Block[]> {
    const hasAccess = await this.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    return prisma.block.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
    })
  }

  /**
   * Create a new block
   */
  async createBlock(pageId: string, userId: string, data: z.infer<typeof createBlockSchema>): Promise<Block> {
    const hasAccess = await this.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // If no order is provided, place it at the end
    let order = data.order
    if (order === undefined) {
      const lastBlock = await prisma.block.findFirst({
        where: { pageId },
        orderBy: { order: 'desc' },
      })
      order = lastBlock ? lastBlock.order + 1 : 0
    } else {
      // Shift existing blocks if inserting at a specific position
      await prisma.block.updateMany({
        where: {
          pageId,
          order: { gte: order },
        },
        data: {
          order: { increment: 1 },
        },
      })
    }

    const newBlock = await prisma.block.create({
      data: {
        pageId,
        type: data.type,
        content: data.content,
        order,
        metadata: data.metadata ?? Prisma.JsonNull,
      },
    })

    // Track the creation
    await this.trackBlockChange(newBlock.id, 'create', userId, null, newBlock.content, null, newBlock.metadata)

    return newBlock
  }

  /**
   * Update a block
   */
  async updateBlock(blockId: string, pageId: string, userId: string, data: z.infer<typeof updateBlockSchema>): Promise<Block> {
    const hasAccess = await this.verifyBlockAccess(blockId, pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Block', blockId)
    }

    // Get current block to check version
    const currentBlock = await prisma.block.findUnique({
      where: { id: blockId },
    })

    if (!currentBlock) {
      throw new NotFoundError('Block', blockId)
    }

    // Use provided version or assume version 1 for backward compatibility
    const expectedVersion = data.version ?? 1

    // Handle order changes separately to maintain integrity
    if (data.order !== undefined && currentBlock.order !== data.order) {
      const oldOrder = currentBlock.order
      const newOrder = data.order

      if (newOrder > oldOrder) {
        // Moving down: shift blocks between old and new position up
        await prisma.block.updateMany({
          where: {
            pageId,
            order: {
              gt: oldOrder,
              lte: newOrder,
            },
          },
          data: {
            order: { decrement: 1 },
          },
        })
      } else {
        // Moving up: shift blocks between new and old position down
        await prisma.block.updateMany({
          where: {
            pageId,
            order: {
              gte: newOrder,
              lt: oldOrder,
            },
          },
          data: {
            order: { increment: 1 },
          },
        })
      }
    }

    const updateData: Prisma.BlockUpdateInput = {
      version: { increment: 1 }, // Always increment version
    }
    if (data.type !== undefined) updateData.type = data.type
    if (data.content !== undefined) updateData.content = data.content
    if (data.order !== undefined) updateData.order = data.order
    if (data.metadata !== undefined) updateData.metadata = data.metadata ?? Prisma.JsonNull

    // Use updateMany for optimistic locking
    const result = await prisma.block.updateMany({
      where: {
        id: blockId,
        version: expectedVersion,
      },
      data: updateData,
    })

    // Check if update succeeded (version matched)
    if (result.count === 0) {
      throw new ConflictError('Block was modified by another user', {
        field: 'version',
        reason: 'Version mismatch - the block has been updated since you last fetched it',
        currentVersion: currentBlock.version,
        expectedVersion,
      })
    }

    // Fetch and return the updated block
    const updatedBlock = await prisma.block.findUnique({
      where: { id: blockId },
    })

    if (!updatedBlock) {
      throw new NotFoundError('Block', blockId)
    }

    // Track the update with old and new values
    await this.trackBlockChange(blockId, 'update', userId, currentBlock.content, updatedBlock.content, currentBlock.metadata, updatedBlock.metadata)

    return updatedBlock
  }

  /**
   * Delete a block
   */
  async deleteBlock(blockId: string, pageId: string, userId: string): Promise<void> {
    const hasAccess = await this.verifyBlockAccess(blockId, pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Block', blockId)
    }

    // Get the block to be deleted
    const blockToDelete = await prisma.block.findUnique({
      where: { id: blockId },
    })

    if (!blockToDelete) {
      throw new NotFoundError('Block', blockId)
    }

    // Track the deletion before actually deleting
    await this.trackBlockChange(blockId, 'delete', userId, blockToDelete.content, null, blockToDelete.metadata, null)

    // Delete the block
    await prisma.block.delete({
      where: { id: blockId },
    })

    // Shift remaining blocks up
    await prisma.block.updateMany({
      where: {
        pageId,
        order: { gt: blockToDelete.order },
      },
      data: {
        order: { decrement: 1 },
      },
    })
  }

  /**
   * Reorder multiple blocks
   */
  async reorderBlocks(pageId: string, userId: string, data: z.infer<typeof reorderBlocksSchema>): Promise<Block[]> {
    const hasAccess = await this.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // Verify all blocks belong to this page
    const blockIds = data.blocks.map((b) => b.id)
    const existingBlocks = await prisma.block.findMany({
      where: {
        id: { in: blockIds },
        pageId,
      },
    })

    if (existingBlocks.length !== blockIds.length) {
      throw new ValidationError('Some blocks not found or do not belong to this page', {
        field: 'blocks',
        reason: 'Invalid block IDs provided',
      })
    }

    // Update orders in a transaction
    await prisma.$transaction(
      data.blocks.map(({ id, order }) =>
        prisma.block.update({
          where: { id },
          data: { order },
        })
      )
    )

    // Return updated blocks
    return prisma.block.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
    })
  }

  /**
   * Batch update multiple blocks (for auto-save)
   */
  async batchUpdateBlocks(pageId: string, userId: string, data: z.infer<typeof batchUpdateBlocksSchema>): Promise<Block[]> {
    const hasAccess = await this.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // Verify all blocks belong to this page and get their current versions
    const blockIds = data.blocks.map((b) => b.id)
    const existingBlocks = await prisma.block.findMany({
      where: {
        id: { in: blockIds },
        pageId,
      },
    })

    if (existingBlocks.length !== blockIds.length) {
      throw new ValidationError('Some blocks not found or do not belong to this page', {
        field: 'blocks',
        reason: 'Invalid block IDs provided',
      })
    }

    // Create a map of block versions for quick lookup
    const blockVersionMap = new Map(existingBlocks.map((b) => [b.id, b.version]))

    // Track which blocks had version conflicts
    const versionConflicts: Array<{ id: string; currentVersion: number; expectedVersion: number }> = []

    // Update blocks in a transaction
    const results = await prisma.$transaction(
      data.blocks.map(({ id, version, ...updateData }) => {
        const expectedVersion = version ?? 1 // Use provided version or assume version 1 for backward compatibility
        const currentVersion = blockVersionMap.get(id) ?? 1

        const data: Prisma.BlockUpdateInput = {
          version: { increment: 1 }, // Always increment version
        }
        if (updateData.type !== undefined) data.type = updateData.type
        if (updateData.content !== undefined) data.content = updateData.content
        if (updateData.metadata !== undefined) data.metadata = updateData.metadata ?? Prisma.JsonNull

        // Use updateMany for optimistic locking
        return prisma.block.updateMany({
          where: {
            id,
            version: expectedVersion,
          },
          data,
        })
      })
    )

    // Check for version conflicts
    results.forEach((result, index) => {
      if (result.count === 0) {
        const block = data.blocks[index]
        const currentVersion = blockVersionMap.get(block.id) ?? 1
        versionConflicts.push({
          id: block.id,
          currentVersion,
          expectedVersion: block.version ?? 1,
        })
      }
    })

    // If any blocks had version conflicts, throw an error
    if (versionConflicts.length > 0) {
      throw new ConflictError('Some blocks were modified by another user', {
        field: 'blocks',
        reason: 'Version mismatch - some blocks have been updated since you last fetched them',
        conflicts: versionConflicts,
      })
    }

    // Fetch and return all updated blocks
    const updatedBlocks = await prisma.block.findMany({
      where: {
        id: { in: blockIds },
      },
      orderBy: { order: 'asc' },
    })

    // Track all successful updates
    const updatedBlocksMap = new Map(updatedBlocks.map((b) => [b.id, b]))
    const oldBlocksMap = new Map(existingBlocks.map((b) => [b.id, b]))

    await Promise.all(
      data.blocks.map(async ({ id }) => {
        const oldBlock = oldBlocksMap.get(id)
        const newBlock = updatedBlocksMap.get(id)

        if (oldBlock && newBlock) {
          await this.trackBlockChange(id, 'update', userId, oldBlock.content, newBlock.content, oldBlock.metadata, newBlock.metadata)
        }
      })
    )

    return updatedBlocks
  }
}

export const blockService = new BlockService()
