import { prisma } from '@kairos/database'
import { redis } from '../config/redis'
import { phase3Config } from '../config/phase3.config'

interface ActiveEdit {
  userId: string
  blockId: string
  timestamp: Date
}

interface PageUser {
  userId: string
  displayName?: string
  email: string
  joinedAt: Date
}

export class SyncService {
  // Redis key prefixes
  private readonly ACTIVE_EDITS_PREFIX = 'active_edits:'
  private readonly PAGE_USERS_PREFIX = 'page_users:'
  private readonly EDIT_TTL = phase3Config.sync.activeEditTTL // TTL for active edits from config

  /**
   * Handle Redis errors gracefully
   */
  private async handleRedisError<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      console.error('Redis operation failed:', error)
      return fallback
    }
  }

  /**
   * Verify user has access to a workspace
   */
  async verifyWorkspaceAccess(workspaceId: string, userId: string): Promise<boolean> {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId,
      },
    })
    return !!workspace
  }

  /**
   * Verify user has access to a page
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
   * Track active edit on a block
   */
  async trackActiveEdit(blockId: string, userId: string): Promise<void> {
    await this.handleRedisError(async () => {
      const key = `${this.ACTIVE_EDITS_PREFIX}${blockId}`
      const edit: ActiveEdit = {
        userId,
        blockId,
        timestamp: new Date(),
      }

      // Set with TTL to auto-expire stale edits
      await redis.setex(key, this.EDIT_TTL, JSON.stringify(edit))
    }, undefined)
  }

  /**
   * Check if a block is being edited by another user
   */
  async isBlockBeingEdited(blockId: string, userId: string): Promise<boolean> {
    return await this.handleRedisError(async () => {
      const key = `${this.ACTIVE_EDITS_PREFIX}${blockId}`
      const editData = await redis.get(key)

      if (!editData) return false

      const edit: ActiveEdit = JSON.parse(editData)
      return edit.userId !== userId
    }, false)
  }

  /**
   * Get user editing a block
   */
  async getBlockEditor(blockId: string): Promise<string | null> {
    return await this.handleRedisError(async () => {
      const key = `${this.ACTIVE_EDITS_PREFIX}${blockId}`
      const editData = await redis.get(key)

      if (!editData) return null

      const edit: ActiveEdit = JSON.parse(editData)
      return edit.userId
    }, null)
  }

  /**
   * Clear active edits for a user
   */
  async clearUserActiveEdits(userId: string): Promise<void> {
    await this.handleRedisError(async () => {
      // Get all active edit keys
      const pattern = `${this.ACTIVE_EDITS_PREFIX}*`
      const keys = await redis.keys(pattern)

      if (keys.length === 0) return

      // Check each key and delete if it belongs to the user
      const pipeline = redis.pipeline()

      for (const key of keys) {
        const editData = await redis.get(key)
        if (editData) {
          const edit: ActiveEdit = JSON.parse(editData)
          if (edit.userId === userId) {
            pipeline.del(key)
          }
        }
      }

      await pipeline.exec()
    }, undefined)
  }

  /**
   * Add user to a page
   */
  async addUserToPage(pageId: string, userId: string): Promise<void> {
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        email: true,
      },
    })

    if (!user) return

    await this.handleRedisError(async () => {
      // Add user to page in Redis
      const key = `${this.PAGE_USERS_PREFIX}${pageId}`
      const pageUser: PageUser = {
        userId: user.id,
        displayName: user.displayName || undefined,
        email: user.email,
        joinedAt: new Date(),
      }

      await redis.hset(key, userId, JSON.stringify(pageUser))
    }, undefined)
  }

  /**
   * Remove user from a page
   */
  async removeUserFromPage(pageId: string, userId: string): Promise<void> {
    await this.handleRedisError(async () => {
      const key = `${this.PAGE_USERS_PREFIX}${pageId}`
      await redis.hdel(key, userId)

      // Clean up empty hashes
      const remaining = await redis.hlen(key)
      if (remaining === 0) {
        await redis.del(key)
      }
    }, undefined)
  }

  /**
   * Get all users in a page
   */
  async getPageUsers(pageId: string): Promise<PageUser[]> {
    return await this.handleRedisError(async () => {
      const key = `${this.PAGE_USERS_PREFIX}${pageId}`
      const usersData = await redis.hgetall(key)

      if (!usersData || Object.keys(usersData).length === 0) {
        return []
      }

      return Object.values(usersData).map((userData) => {
        const user = JSON.parse(userData)
        // Convert joinedAt string back to Date
        return {
          ...user,
          joinedAt: new Date(user.joinedAt),
        }
      })
    }, [])
  }

  /**
   * Clean up stale edits
   * Note: With Redis TTL, this is no longer needed as Redis automatically expires keys
   */
  private async cleanupStaleEdits(): Promise<void> {
    // This method is kept for compatibility but is now a no-op
    // Redis handles expiration automatically with TTL
  }

  /**
   * Get workspace activity summary
   */
  async getWorkspaceActivity(
    workspaceId: string,
    userId: string
  ): Promise<{
    activeUsers: number
    activePages: string[]
    recentChanges: number
  }> {
    // Verify access
    const hasAccess = await this.verifyWorkspaceAccess(workspaceId, userId)
    if (!hasAccess) {
      throw new Error('Access denied')
    }

    // Get pages in workspace
    const pages = await prisma.page.findMany({
      where: { workspaceId },
      select: { id: true },
    })

    const pageIds = pages.map((p) => p.id)
    const activePages: string[] = []
    const activeUsersSet = new Set<string>()

    // Check active users in each page
    for (const pageId of pageIds) {
      const usersData = await this.handleRedisError(async () => {
        const key = `${this.PAGE_USERS_PREFIX}${pageId}`
        return await redis.hgetall(key)
      }, {})

      if (usersData && Object.keys(usersData).length > 0) {
        activePages.push(pageId)
        for (const userId of Object.keys(usersData)) {
          activeUsersSet.add(userId)
        }
      }
    }

    // Get recent changes count (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentChanges = await prisma.blockChange.count({
      where: {
        block: {
          page: {
            workspaceId,
          },
        },
        changedAt: {
          gte: oneHourAgo,
        },
      },
    })

    return {
      activeUsers: activeUsersSet.size,
      activePages,
      recentChanges,
    }
  }

  /**
   * Handle conflict resolution for concurrent edits
   */
  async resolveEditConflict(
    blockId: string,
    userId: string,
    clientVersion: number,
    newContent: string
  ): Promise<{
    resolved: boolean
    currentVersion: number
    currentContent: string
    conflict?: {
      userId: string
      content: string
    }
  }> {
    // Get current block state
    const block = await prisma.block.findUnique({
      where: { id: blockId },
    })

    if (!block) {
      throw new Error('Block not found')
    }

    // Check if versions match
    if (block.version === clientVersion) {
      // No conflict, client has latest version
      return {
        resolved: true,
        currentVersion: block.version,
        currentContent: block.content,
      }
    }

    // Version mismatch - potential conflict
    const activeEdit = await this.handleRedisError(async () => {
      const key = `${this.ACTIVE_EDITS_PREFIX}${blockId}`
      const editData = await redis.get(key)
      return editData ? JSON.parse(editData) : null
    }, null)

    return {
      resolved: false,
      currentVersion: block.version,
      currentContent: block.content,
      conflict: activeEdit
        ? {
            userId: activeEdit.userId,
            content: newContent,
          }
        : undefined,
    }
  }
}

export const syncService = new SyncService()
