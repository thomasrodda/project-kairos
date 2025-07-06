import { prisma } from '@kairos/database'

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
  // In-memory storage for active edits and page users
  // In production, consider using Redis for scalability
  private activeEdits: Map<string, ActiveEdit> = new Map()
  private pageUsers: Map<string, Map<string, PageUser>> = new Map()

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
    this.activeEdits.set(blockId, {
      userId,
      blockId,
      timestamp: new Date(),
    })

    // Clean up stale edits (older than 30 seconds)
    this.cleanupStaleEdits()
  }

  /**
   * Check if a block is being edited by another user
   */
  isBlockBeingEdited(blockId: string, userId: string): boolean {
    const edit = this.activeEdits.get(blockId)
    return !!edit && edit.userId !== userId
  }

  /**
   * Get user editing a block
   */
  getBlockEditor(blockId: string): string | null {
    const edit = this.activeEdits.get(blockId)
    return edit?.userId || null
  }

  /**
   * Clear active edits for a user
   */
  async clearUserActiveEdits(userId: string): Promise<void> {
    for (const [blockId, edit] of this.activeEdits.entries()) {
      if (edit.userId === userId) {
        this.activeEdits.delete(blockId)
      }
    }
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

    // Initialize page users map if needed
    if (!this.pageUsers.has(pageId)) {
      this.pageUsers.set(pageId, new Map())
    }

    // Add user to page
    const pageUsersMap = this.pageUsers.get(pageId)!
    pageUsersMap.set(userId, {
      userId: user.id,
      displayName: user.displayName || undefined,
      email: user.email,
      joinedAt: new Date(),
    })
  }

  /**
   * Remove user from a page
   */
  removeUserFromPage(pageId: string, userId: string): void {
    const pageUsersMap = this.pageUsers.get(pageId)
    if (pageUsersMap) {
      pageUsersMap.delete(userId)

      // Clean up empty maps
      if (pageUsersMap.size === 0) {
        this.pageUsers.delete(pageId)
      }
    }
  }

  /**
   * Get all users in a page
   */
  async getPageUsers(pageId: string): Promise<PageUser[]> {
    const pageUsersMap = this.pageUsers.get(pageId)
    if (!pageUsersMap) {
      return []
    }
    return Array.from(pageUsersMap.values())
  }

  /**
   * Clean up stale edits
   */
  private cleanupStaleEdits(): void {
    const now = new Date()
    const staleThreshold = 30 * 1000 // 30 seconds

    for (const [blockId, edit] of this.activeEdits.entries()) {
      if (now.getTime() - edit.timestamp.getTime() > staleThreshold) {
        this.activeEdits.delete(blockId)
      }
    }
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
      const pageUsersMap = this.pageUsers.get(pageId)
      if (pageUsersMap && pageUsersMap.size > 0) {
        activePages.push(pageId)
        for (const userId of pageUsersMap.keys()) {
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
    const activeEdit = this.activeEdits.get(blockId)

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
