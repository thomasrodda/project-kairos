import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './lib/prisma'
import { requireAuth } from './lib/auth-helpers'
import { asyncHandler, sendSuccess, sendError, methodNotAllowed, HttpStatus } from './lib/api-response'
import { createPageSchema, updatePageSchema, reorderPagesSchema, pageIdSchema } from './lib/validations/page'

async function handler(req: VercelRequest, res: VercelResponse) {
  const authResult = await requireAuth(req, res)
  if (!authResult) return

  const { user } = authResult

  // Extract workspace ID from query or URL path
  const { workspaceId } = req.query

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, user.id)
    case 'POST':
      return handlePost(req, res, user.id)
    case 'PUT':
      return handlePut(req, res, user.id)
    case 'DELETE':
      return handleDelete(req, res, user.id)
    default:
      return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE'])
  }
}

// GET /api/pages?workspaceId=xxx or GET /api/pages?id=xxx
async function handleGet(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id, workspaceId } = req.query

  // Single page with blocks
  if (id) {
    const { id: pageId } = pageIdSchema.parse({ id })

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        deletedAt: null,
        workspace: {
          userId,
          deletedAt: null,
        },
      },
      include: {
        blocks: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        workspace: true,
      },
    })

    if (!page) {
      return sendError(res, 'PAGE_NOT_FOUND', 'The requested page does not exist', HttpStatus.NOT_FOUND)
    }

    // Return page and blocks separately to match frontend expectations
    const { blocks, ...pageData } = page
    return sendSuccess(res, {
      page: pageData,
      blocks: blocks || [],
    })
  }

  // List pages in workspace
  if (workspaceId) {
    // Verify workspace exists and belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId as string,
        userId,
        deletedAt: null,
      },
    })

    if (!workspace) {
      return sendError(res, 'WORKSPACE_NOT_FOUND', 'The requested workspace does not exist', HttpStatus.NOT_FOUND)
    }

    // Get all pages in workspace with hierarchy
    const pages = await prisma.page.findMany({
      where: {
        workspaceId: workspace.id,
        deletedAt: null,
      },
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
    })

    return sendSuccess(res, { pages })
  }

  return sendError(res, 'MISSING_PARAMETER', 'Either id or workspaceId is required', HttpStatus.BAD_REQUEST)
}

// POST /api/pages?workspaceId=xxx
async function handlePost(req: VercelRequest, res: VercelResponse, userId: string) {
  const { workspaceId } = req.query

  if (!workspaceId) {
    return sendError(res, 'MISSING_WORKSPACE_ID', 'Workspace ID is required', HttpStatus.BAD_REQUEST)
  }

  // Verify workspace exists and belongs to user
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId as string,
      userId,
      deletedAt: null,
    },
  })

  if (!workspace) {
    return sendError(res, 'WORKSPACE_NOT_FOUND', 'The requested workspace does not exist', HttpStatus.NOT_FOUND)
  }

  let data
  try {
    data = createPageSchema.parse(req.body)
  } catch (error: any) {
    console.error('Page creation validation error:', error)
    return sendError(res, 'VALIDATION_ERROR', error.message || 'Invalid request data', HttpStatus.BAD_REQUEST)
  }

  // If parentId is provided, verify it exists in the same workspace
  if (data.parentId) {
    const parentPage = await prisma.page.findFirst({
      where: {
        id: data.parentId,
        workspaceId: workspace.id,
        deletedAt: null,
      },
    })

    if (!parentPage) {
      return sendError(res, 'PARENT_PAGE_NOT_FOUND', 'The specified parent page does not exist', HttpStatus.NOT_FOUND)
    }
  }

  // Get the highest order value for new page
  const highestOrder = await prisma.page.findFirst({
    where: {
      workspaceId: workspace.id,
      parentId: data.parentId || null,
      deletedAt: null,
    },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const page = await prisma.page.create({
    data: {
      title: data.title,
      workspaceId: workspace.id,
      parentId: data.parentId,
      isFolder: data.isFolder,
      order: (highestOrder?.order ?? -1) + 1,
    },
    include: {
      blocks: true,
    },
  })

  return sendSuccess(res, page, HttpStatus.CREATED)
}

// PUT /api/pages?id=xxx or PUT /api/pages/reorder
async function handlePut(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query

  // Handle reorder endpoint
  if (req.url?.endsWith('/reorder')) {
    return handleReorder(req, res, userId)
  }

  if (!id) {
    return sendError(res, 'MISSING_ID', 'Page ID is required', HttpStatus.BAD_REQUEST)
  }

  const { id: pageId } = pageIdSchema.parse({ id })
  const data = updatePageSchema.parse(req.body)

  // Check if page exists and user has access
  const existing = await prisma.page.findFirst({
    where: {
      id: pageId,
      deletedAt: null,
      workspace: {
        userId,
        deletedAt: null,
      },
    },
  })

  if (!existing) {
    return sendError(res, 'PAGE_NOT_FOUND', 'The requested page does not exist', HttpStatus.NOT_FOUND)
  }

  // If updating parentId, verify new parent exists in same workspace
  if (data.parentId !== undefined) {
    if (data.parentId) {
      const parentPage = await prisma.page.findFirst({
        where: {
          id: data.parentId,
          workspaceId: existing.workspaceId,
          deletedAt: null,
        },
      })

      if (!parentPage) {
        return sendError(res, 'PARENT_PAGE_NOT_FOUND', 'The specified parent page does not exist', HttpStatus.NOT_FOUND)
      }

      // Prevent circular references
      if (data.parentId === pageId) {
        return sendError(res, 'CIRCULAR_REFERENCE', 'A page cannot be its own parent', HttpStatus.BAD_REQUEST)
      }
    }
  }

  const page = await prisma.page.update({
    where: { id: pageId },
    data,
    include: {
      blocks: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
      },
    },
  })

  return sendSuccess(res, page)
}

// DELETE /api/pages?id=xxx
async function handleDelete(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query
  if (!id) {
    return sendError(res, 'MISSING_ID', 'Page ID is required', HttpStatus.BAD_REQUEST)
  }

  const { id: pageId } = pageIdSchema.parse({ id })

  // Check if page exists and user has access
  const existing = await prisma.page.findFirst({
    where: {
      id: pageId,
      deletedAt: null,
      workspace: {
        userId,
        deletedAt: null,
      },
    },
    include: {
      children: {
        where: { deletedAt: null },
      },
    },
  })

  if (!existing) {
    return sendError(res, 'PAGE_NOT_FOUND', 'The requested page does not exist', HttpStatus.NOT_FOUND)
  }

  // Check if page has children
  if (existing.children.length > 0) {
    return sendError(res, 'PAGE_HAS_CHILDREN', 'Cannot delete a page that has child pages', HttpStatus.CONFLICT)
  }

  // Soft delete the page and its blocks
  await prisma.$transaction([
    prisma.page.update({
      where: { id: pageId },
      data: { deletedAt: new Date() },
    }),
    prisma.block.updateMany({
      where: { pageId, deletedAt: null },
      data: { deletedAt: new Date() },
    }),
  ])

  return sendSuccess(res, { message: 'Page deleted successfully' })
}

// PUT /api/pages/reorder
async function handleReorder(req: VercelRequest, res: VercelResponse, userId: string) {
  const data = reorderPagesSchema.parse(req.body)

  // Verify all pages exist and belong to user
  const pages = await prisma.page.findMany({
    where: {
      id: { in: data.pageIds },
      deletedAt: null,
      workspace: {
        userId,
        deletedAt: null,
      },
    },
  })

  if (pages.length !== data.pageIds.length) {
    return sendError(res, 'INVALID_PAGE_IDS', 'One or more page IDs are invalid', HttpStatus.BAD_REQUEST)
  }

  // Update order for each page
  const updates = data.pageIds.map((pageId, index) =>
    prisma.page.update({
      where: { id: pageId },
      data: { order: index },
    })
  )

  await prisma.$transaction(updates)

  return sendSuccess(res, { message: 'Pages reordered successfully' })
}

export default asyncHandler(handler)
