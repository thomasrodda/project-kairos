import { prisma, Page, Prisma } from '@kairos/database'
import { z } from 'zod'
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors'

// Validation schemas
export const createPageSchema = z.object({
  title: z.string().min(1).max(200).default('Untitled'),
  parentId: z.string().optional().nullable(),
  isFolder: z.boolean().default(false),
  order: z.number().int().min(0).optional(),
})

export const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isFolder: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

export const movePageSchema = z.object({
  parentId: z.string().nullable(),
  order: z.number().int().min(0),
})

// Types
export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
export type MovePageInput = z.infer<typeof movePageSchema>

export interface PageWithCounts extends Page {
  _count: {
    blocks: number
    children: number
  }
}

export interface PageWithHierarchy extends Page {
  children: PageWithHierarchy[]
  _count: {
    blocks: number
  }
}

class PageService {
  /**
   * Check if a user has access to a workspace
   */
  private async checkWorkspaceAccess(workspaceId: string, userId: string): Promise<boolean> {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId,
      },
    })
    return !!workspace
  }

  /**
   * Check if a user has access to a page
   */
  async verifyPageAccess(pageId: string, userId: string): Promise<boolean> {
    return this.checkPageAccess(pageId, userId)
  }

  /**
   * Check if a user has access to a page (private method)
   */
  private async checkPageAccess(pageId: string, userId: string): Promise<boolean> {
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
   * Build a hierarchical structure of pages
   */
  private buildHierarchy(pages: PageWithCounts[], parentId: string | null = null): PageWithHierarchy[] {
    return pages
      .filter((page) => page.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map((page) => ({
        ...page,
        children: this.buildHierarchy(pages, page.id),
      }))
  }

  /**
   * Get the next order value for a new page
   */
  private async getNextOrder(workspaceId: string, parentId: string | null): Promise<number> {
    const lastPage = await prisma.page.findFirst({
      where: {
        workspaceId,
        parentId,
      },
      orderBy: {
        order: 'desc',
      },
    })
    return lastPage ? lastPage.order + 1 : 0
  }

  /**
   * List all pages in a workspace with hierarchy
   */
  async listPages(workspaceId: string, userId: string): Promise<PageWithHierarchy[]> {
    // Check access
    const hasAccess = await this.checkWorkspaceAccess(workspaceId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Workspace', workspaceId)
    }

    // Get all pages with counts
    const pages = await prisma.page.findMany({
      where: {
        workspaceId,
      },
      include: {
        _count: {
          select: {
            blocks: true,
            children: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    // Build hierarchy
    return this.buildHierarchy(pages)
  }

  /**
   * Get a single page with blocks
   */
  async getPage(pageId: string, userId: string): Promise<Page & { blocks: any[] }> {
    // Check access
    const hasAccess = await this.checkPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    const page = await prisma.page.findUnique({
      where: {
        id: pageId,
      },
      include: {
        blocks: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!page) {
      throw new NotFoundError('Page', pageId)
    }

    return page
  }

  /**
   * Create a new page
   */
  async createPage(workspaceId: string, userId: string, data: CreatePageInput): Promise<Page> {
    // Check access
    const hasAccess = await this.checkWorkspaceAccess(workspaceId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Workspace', workspaceId)
    }

    // Validate parent if provided
    if (data.parentId) {
      const parentExists = await this.checkPageAccess(data.parentId, userId)
      if (!parentExists) {
        throw new NotFoundError('Parent page', data.parentId)
      }
    }

    // Get order if not provided
    const order = data.order ?? (await this.getNextOrder(workspaceId, data.parentId || null))

    // Create page
    const page = await prisma.page.create({
      data: {
        title: data.title,
        workspaceId,
        parentId: data.parentId || null,
        isFolder: data.isFolder,
        order,
      },
    })

    return page
  }

  /**
   * Update a page
   */
  async updatePage(pageId: string, userId: string, data: UpdatePageInput): Promise<Page> {
    // Check access
    const hasAccess = await this.checkPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // Update page
    const page = await prisma.page.update({
      where: {
        id: pageId,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    return page
  }

  /**
   * Delete a page and all its children
   */
  async deletePage(pageId: string, userId: string): Promise<void> {
    // Check access
    const hasAccess = await this.checkPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // Delete page (cascades to children and blocks)
    await prisma.page.delete({
      where: {
        id: pageId,
      },
    })
  }

  /**
   * Move a page in the hierarchy
   */
  async movePage(pageId: string, userId: string, data: MovePageInput): Promise<Page> {
    // Check access to the page
    const hasAccess = await this.checkPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new Error('Page not found or access denied')
    }

    // Get the page to check workspace
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { workspaceId: true },
    })

    if (!page) {
      throw new NotFoundError('Page', pageId)
    }

    // Validate new parent if provided
    if (data.parentId) {
      const parentPage = await prisma.page.findFirst({
        where: {
          id: data.parentId,
          workspaceId: page.workspaceId,
        },
      })

      if (!parentPage) {
        throw new NotFoundError('Parent page', data.parentId)
      }

      // Check for circular reference
      if (await this.isDescendant(pageId, data.parentId)) {
        throw new ValidationError('Cannot move a page to its own descendant', {
          field: 'parentId',
          value: data.parentId,
          reason: 'Circular reference detected',
        })
      }
    }

    // Update the page
    const updatedPage = await prisma.page.update({
      where: {
        id: pageId,
      },
      data: {
        parentId: data.parentId,
        order: data.order,
        updatedAt: new Date(),
      },
    })

    return updatedPage
  }

  /**
   * Check if targetId is a descendant of pageId
   */
  private async isDescendant(pageId: string, targetId: string): Promise<boolean> {
    const children = await prisma.page.findMany({
      where: {
        parentId: pageId,
      },
      select: {
        id: true,
      },
    })

    for (const child of children) {
      if (child.id === targetId) {
        return true
      }
      if (await this.isDescendant(child.id, targetId)) {
        return true
      }
    }

    return false
  }
}

export const pageService = new PageService()
