import { prisma, BlockChange, PageSnapshot, Prisma } from '@kairos/database'
import { NotFoundError } from '../utils/errors'
import { z } from 'zod'
import { pageService } from './pageService'
import { blockService } from './blockService'

// Validation schemas
export const historyQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export const restoreSnapshotSchema = z.object({
  snapshotId: z.string(),
})

// Constants
const SNAPSHOT_THRESHOLD = 100 // Create snapshot every 100 changes
const SNAPSHOT_INTERVAL_HOURS = 24 // Create snapshot every 24 hours
const RETENTION_DAYS = 30 // Keep history for 30 days (free tier)

export class HistoryService {
  /**
   * Get block change history for a page
   */
  async getPageHistory(
    pageId: string,
    userId: string,
    params: z.infer<typeof historyQuerySchema>
  ): Promise<{ changes: BlockChange[]; total: number }> {
    // Verify user has access to the page
    const hasAccess = await pageService.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // Build query filters
    const where: any = {
      block: { pageId },
    }

    if (params.startDate) {
      where.changedAt = where.changedAt || {}
      where.changedAt.gte = new Date(params.startDate)
    }

    if (params.endDate) {
      where.changedAt = where.changedAt || {}
      where.changedAt.lte = new Date(params.endDate)
    }

    // Get total count
    const total = await prisma.blockChange.count({ where })

    // Get changes with pagination
    const changes = await prisma.blockChange.findMany({
      where,
      orderBy: { changedAt: 'desc' },
      skip: params.offset,
      take: params.limit,
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

    return { changes, total }
  }

  /**
   * Get block-specific change history
   */
  async getBlockHistory(
    blockId: string,
    pageId: string,
    userId: string,
    params: z.infer<typeof historyQuerySchema>
  ): Promise<{ changes: BlockChange[]; total: number }> {
    // Verify user has access to the block
    const hasAccess = await blockService.verifyBlockAccess(blockId, pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Block', blockId)
    }

    // Build query filters
    const where: any = { blockId }

    if (params.startDate) {
      where.changedAt = where.changedAt || {}
      where.changedAt.gte = new Date(params.startDate)
    }

    if (params.endDate) {
      where.changedAt = where.changedAt || {}
      where.changedAt.lte = new Date(params.endDate)
    }

    // Get total count
    const total = await prisma.blockChange.count({ where })

    // Get changes with pagination
    const changes = await prisma.blockChange.findMany({
      where,
      orderBy: { changedAt: 'desc' },
      skip: params.offset,
      take: params.limit,
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

    return { changes, total }
  }

  /**
   * Get page snapshots
   */
  async getPageSnapshots(
    pageId: string,
    userId: string,
    params: z.infer<typeof historyQuerySchema>
  ): Promise<{ snapshots: PageSnapshot[]; total: number }> {
    // Verify user has access to the page
    const hasAccess = await pageService.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // Build query filters
    const where: any = { pageId }

    if (params.startDate) {
      where.createdAt = where.createdAt || {}
      where.createdAt.gte = new Date(params.startDate)
    }

    if (params.endDate) {
      where.createdAt = where.createdAt || {}
      where.createdAt.lte = new Date(params.endDate)
    }

    // Get total count
    const total = await prisma.pageSnapshot.count({ where })

    // Get snapshots with pagination
    const snapshots = await prisma.pageSnapshot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params.offset,
      take: params.limit,
    })

    return { snapshots, total }
  }

  /**
   * Get a specific snapshot
   */
  async getSnapshot(snapshotId: string, userId: string): Promise<PageSnapshot> {
    const snapshot = await prisma.pageSnapshot.findUnique({
      where: { id: snapshotId },
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

    if (!snapshot) {
      throw new NotFoundError('Snapshot', snapshotId)
    }

    // Verify user has access
    if (snapshot.page.workspace.userId !== userId) {
      throw new NotFoundError('Snapshot', snapshotId)
    }

    return snapshot
  }

  /**
   * Create a page snapshot
   */
  async createSnapshot(pageId: string, userId: string): Promise<PageSnapshot> {
    // Verify user has access to the page
    const hasAccess = await pageService.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // Get current page state with all blocks
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        blocks: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!page) {
      throw new NotFoundError('Page', pageId)
    }

    // Create snapshot data
    const snapshotData = {
      pageId: page.id,
      title: page.title,
      blocks: page.blocks.map((block) => ({
        id: block.id,
        type: block.type,
        content: block.content,
        order: block.order,
        metadata: block.metadata,
        version: block.version,
      })),
      timestamp: new Date().toISOString(),
    }

    // Create the snapshot
    const snapshot = await prisma.pageSnapshot.create({
      data: {
        pageId,
        snapshotData,
      },
    })

    return snapshot
  }

  /**
   * Restore a page from a snapshot
   */
  async restoreSnapshot(snapshotId: string, userId: string): Promise<void> {
    // Get and verify access to the snapshot
    const snapshot = await this.getSnapshot(snapshotId, userId)

    const snapshotData = snapshot.snapshotData as any
    const pageId = snapshotData.pageId

    // Start a transaction to restore the page
    await prisma.$transaction(async (tx) => {
      // Update page title
      await tx.page.update({
        where: { id: pageId },
        data: { title: snapshotData.title },
      })

      // Delete all current blocks
      await tx.block.deleteMany({
        where: { pageId },
      })

      // Recreate blocks from snapshot
      if (snapshotData.blocks && snapshotData.blocks.length > 0) {
        await tx.block.createMany({
          data: snapshotData.blocks.map((block: any) => ({
            id: block.id,
            pageId,
            type: block.type,
            content: block.content,
            order: block.order,
            metadata: block.metadata || null,
            version: 1, // Reset version after restore
          })),
        })
      }

      // Track the restore operation as block changes
      for (const block of snapshotData.blocks || []) {
        await tx.blockChange.create({
          data: {
            blockId: block.id,
            operation: 'update',
            oldContent: null,
            newContent: block.content,
            oldFormatting: Prisma.JsonNull,
            newFormatting: block.metadata || Prisma.JsonNull,
            changedBy: userId,
          },
        })
      }
    })
  }

  /**
   * Check if a snapshot should be created based on change count or time
   */
  async shouldCreateSnapshot(pageId: string): Promise<boolean> {
    // Get the latest snapshot
    const latestSnapshot = await prisma.pageSnapshot.findFirst({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
    })

    // If no snapshot exists, create one
    if (!latestSnapshot) {
      return true
    }

    // Check time since last snapshot
    const hoursSinceLastSnapshot = (Date.now() - latestSnapshot.createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastSnapshot >= SNAPSHOT_INTERVAL_HOURS) {
      return true
    }

    // Check number of changes since last snapshot
    const changeCount = await prisma.blockChange.count({
      where: {
        block: { pageId },
        changedAt: { gt: latestSnapshot.createdAt },
      },
    })

    return changeCount >= SNAPSHOT_THRESHOLD
  }

  /**
   * Clean up old history based on retention policy
   */
  async cleanupOldHistory(userId: string): Promise<{ deletedSnapshots: number; deletedChanges: number }> {
    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() - RETENTION_DAYS)

    // Delete old snapshots
    const deletedSnapshots = await prisma.pageSnapshot.deleteMany({
      where: {
        createdAt: { lt: retentionDate },
        page: {
          workspace: { userId },
        },
      },
    })

    // Delete old block changes
    const deletedChanges = await prisma.blockChange.deleteMany({
      where: {
        changedAt: { lt: retentionDate },
        block: {
          page: {
            workspace: { userId },
          },
        },
      },
    })

    return {
      deletedSnapshots: deletedSnapshots.count,
      deletedChanges: deletedChanges.count,
    }
  }
}

export const historyService = new HistoryService()
