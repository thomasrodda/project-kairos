import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '@kairos/database'
import { requireAuth } from './lib/auth-helpers'
import { asyncHandler, sendSuccess, sendError, methodNotAllowed, HttpStatus } from './lib/api-response'
import { createBlockSchema, updateBlockSchema, bulkUpdateBlocksSchema, reorderBlocksSchema, blockIdSchema } from './lib/validations/block'

async function handler(req: VercelRequest, res: VercelResponse) {
  const authResult = await requireAuth(req, res)
  if (!authResult) return

  const { user } = authResult

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

// GET /api/blocks?pageId=xxx or GET /api/blocks?id=xxx
async function handleGet(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id, pageId } = req.query

  // Single block
  if (id) {
    const { id: blockId } = blockIdSchema.parse({ id })

    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        deletedAt: null,
        page: {
          deletedAt: null,
          workspace: {
            userId,
            deletedAt: null,
          },
        },
      },
    })

    if (!block) {
      return sendError(res, 'BLOCK_NOT_FOUND', 'The requested block does not exist', HttpStatus.NOT_FOUND)
    }

    return sendSuccess(res, block)
  }

  // All blocks for a page
  if (pageId) {
    // Verify page exists and user has access
    const page = await prisma.page.findFirst({
      where: {
        id: pageId as string,
        deletedAt: null,
        workspace: {
          userId,
          deletedAt: null,
        },
      },
    })

    if (!page) {
      return sendError(res, 'PAGE_NOT_FOUND', 'The requested page does not exist', HttpStatus.NOT_FOUND)
    }

    const blocks = await prisma.block.findMany({
      where: {
        pageId: page.id,
        deletedAt: null,
      },
      orderBy: { order: 'asc' },
    })

    return sendSuccess(res, blocks)
  }

  return sendError(res, 'MISSING_PARAMETER', 'Either id or pageId is required', HttpStatus.BAD_REQUEST)
}

// POST /api/blocks?pageId=xxx
async function handlePost(req: VercelRequest, res: VercelResponse, userId: string) {
  const { pageId } = req.query

  if (!pageId) {
    return sendError(res, 'MISSING_PAGE_ID', 'Page ID is required', HttpStatus.BAD_REQUEST)
  }

  // Verify page exists and user has access
  const page = await prisma.page.findFirst({
    where: {
      id: pageId as string,
      deletedAt: null,
      workspace: {
        userId,
        deletedAt: null,
      },
    },
  })

  if (!page) {
    return sendError(res, 'PAGE_NOT_FOUND', 'The requested page does not exist', HttpStatus.NOT_FOUND)
  }

  const data = createBlockSchema.parse(req.body)

  // Get the highest order value if not provided
  let order = data.order
  if (order === undefined) {
    const highestOrder = await prisma.block.findFirst({
      where: {
        pageId: page.id,
        deletedAt: null,
      },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    order = (highestOrder?.order ?? -1) + 1
  }

  const block = await prisma.block.create({
    data: {
      pageId: page.id,
      type: data.type,
      content: data.content,
      order,
      metadata: data.metadata as any,
    },
  })

  return sendSuccess(res, block, HttpStatus.CREATED)
}

// PUT /api/blocks?id=xxx or PUT /api/blocks/bulk or PUT /api/blocks/reorder
async function handlePut(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query

  // Handle bulk update endpoint
  if (req.url?.endsWith('/bulk')) {
    return handleBulkUpdate(req, res, userId)
  }

  // Handle reorder endpoint
  if (req.url?.endsWith('/reorder')) {
    return handleReorder(req, res, userId)
  }

  // Single block update
  if (!id) {
    return sendError(res, 'MISSING_ID', 'Block ID is required', HttpStatus.BAD_REQUEST)
  }

  const { id: blockId } = blockIdSchema.parse({ id })
  const data = updateBlockSchema.parse(req.body)

  // Check if block exists and user has access
  const existing = await prisma.block.findFirst({
    where: {
      id: blockId,
      deletedAt: null,
      page: {
        deletedAt: null,
        workspace: {
          userId,
          deletedAt: null,
        },
      },
    },
  })

  if (!existing) {
    return sendError(res, 'BLOCK_NOT_FOUND', 'The requested block does not exist', HttpStatus.NOT_FOUND)
  }

  const block = await prisma.block.update({
    where: { id: blockId },
    data: {
      ...data,
      metadata: data.metadata as any,
    },
  })

  return sendSuccess(res, block)
}

// DELETE /api/blocks?id=xxx
async function handleDelete(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query
  if (!id) {
    return sendError(res, 'MISSING_ID', 'Block ID is required', HttpStatus.BAD_REQUEST)
  }

  const { id: blockId } = blockIdSchema.parse({ id })

  // Check if block exists and user has access
  const existing = await prisma.block.findFirst({
    where: {
      id: blockId,
      deletedAt: null,
      page: {
        deletedAt: null,
        workspace: {
          userId,
          deletedAt: null,
        },
      },
    },
  })

  if (!existing) {
    return sendError(res, 'BLOCK_NOT_FOUND', 'The requested block does not exist', HttpStatus.NOT_FOUND)
  }

  // Soft delete the block
  await prisma.block.update({
    where: { id: blockId },
    data: { deletedAt: new Date() },
  })

  return sendSuccess(res, { message: 'Block deleted successfully' })
}

// PUT /api/blocks/bulk
async function handleBulkUpdate(req: VercelRequest, res: VercelResponse, userId: string) {
  const data = bulkUpdateBlocksSchema.parse(req.body)

  // Extract all block IDs
  const blockIds = data.blocks.map((b) => b.id)

  // Verify all blocks exist and belong to user
  const existingBlocks = await prisma.block.findMany({
    where: {
      id: { in: blockIds },
      deletedAt: null,
      page: {
        deletedAt: null,
        workspace: {
          userId,
          deletedAt: null,
        },
      },
    },
    select: { id: true, pageId: true },
  })

  if (existingBlocks.length !== blockIds.length) {
    return sendError(res, 'INVALID_BLOCK_IDS', 'One or more block IDs are invalid', HttpStatus.BAD_REQUEST)
  }

  // Ensure all blocks belong to the same page
  const pageIds = new Set(existingBlocks.map((b) => b.pageId))
  if (pageIds.size > 1) {
    return sendError(res, 'BLOCKS_FROM_DIFFERENT_PAGES', 'All blocks must belong to the same page', HttpStatus.BAD_REQUEST)
  }

  // Update all blocks in a transaction
  const updates = data.blocks.map((block) =>
    prisma.block.update({
      where: { id: block.id },
      data: {
        type: block.type,
        content: block.content,
        order: block.order,
        metadata: block.metadata as any,
      },
    })
  )

  const updatedBlocks = await prisma.$transaction(updates)

  return sendSuccess(res, updatedBlocks)
}

// PUT /api/blocks/reorder
async function handleReorder(req: VercelRequest, res: VercelResponse, userId: string) {
  const data = reorderBlocksSchema.parse(req.body)

  // Verify all blocks exist and belong to user
  const blocks = await prisma.block.findMany({
    where: {
      id: { in: data.blockIds },
      deletedAt: null,
      page: {
        deletedAt: null,
        workspace: {
          userId,
          deletedAt: null,
        },
      },
    },
    select: { id: true, pageId: true },
  })

  if (blocks.length !== data.blockIds.length) {
    return sendError(res, 'INVALID_BLOCK_IDS', 'One or more block IDs are invalid', HttpStatus.BAD_REQUEST)
  }

  // Ensure all blocks belong to the same page
  const pageIds = new Set(blocks.map((b) => b.pageId))
  if (pageIds.size > 1) {
    return sendError(res, 'BLOCKS_FROM_DIFFERENT_PAGES', 'All blocks must belong to the same page', HttpStatus.BAD_REQUEST)
  }

  // Update order for each block
  const updates = data.blockIds.map((blockId, index) =>
    prisma.block.update({
      where: { id: blockId },
      data: { order: index },
    })
  )

  await prisma.$transaction(updates)

  return sendSuccess(res, { message: 'Blocks reordered successfully' })
}

export default asyncHandler(handler)
