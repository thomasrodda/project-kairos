import { prisma, Block, Prisma } from '@kairos/database'
import { BlockType } from '@prisma/client'
import { z } from 'zod'
import { NotFoundError, ValidationError } from '../utils/errors'

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
    })
  ),
})

export class BlockService {
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

    return prisma.block.create({
      data: {
        pageId,
        type: data.type,
        content: data.content,
        order,
        metadata: data.metadata ?? Prisma.JsonNull,
      },
    })
  }

  /**
   * Update a block
   */
  async updateBlock(blockId: string, pageId: string, userId: string, data: z.infer<typeof updateBlockSchema>): Promise<Block> {
    const hasAccess = await this.verifyBlockAccess(blockId, pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Block', blockId)
    }

    // Handle order changes separately to maintain integrity
    if (data.order !== undefined) {
      const currentBlock = await prisma.block.findUnique({
        where: { id: blockId },
      })

      if (currentBlock && currentBlock.order !== data.order) {
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
    }

    const updateData: Prisma.BlockUpdateInput = {}
    if (data.type !== undefined) updateData.type = data.type
    if (data.content !== undefined) updateData.content = data.content
    if (data.order !== undefined) updateData.order = data.order
    if (data.metadata !== undefined) updateData.metadata = data.metadata ?? Prisma.JsonNull

    return prisma.block.update({
      where: { id: blockId },
      data: updateData,
    })
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

    // Update blocks in a transaction
    const updatedBlocks = await prisma.$transaction(
      data.blocks.map(({ id, ...updateData }) => {
        const data: Prisma.BlockUpdateInput = {}
        if (updateData.type !== undefined) data.type = updateData.type
        if (updateData.content !== undefined) data.content = updateData.content
        if (updateData.metadata !== undefined) data.metadata = updateData.metadata ?? Prisma.JsonNull

        return prisma.block.update({
          where: { id },
          data,
        })
      })
    )

    return updatedBlocks
  }
}

export const blockService = new BlockService()
