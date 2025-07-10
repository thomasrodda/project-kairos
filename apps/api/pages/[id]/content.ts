import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { sendError, sendSuccess, HttpStatus } from '../../lib/api-response'
import { requireAuth } from '../../lib/auth-helpers'
import { updatePageContentSchema } from '../../lib/validations/page'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return sendError(res, 'METHOD_NOT_ALLOWED', 'Only PUT method is allowed', HttpStatus.METHOD_NOT_ALLOWED)
  }

  const authResult = await requireAuth(req, res)
  if (!authResult) return

  const { user } = authResult

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return sendError(res, 'MISSING_ID', 'Page ID is required', HttpStatus.BAD_REQUEST)
  }

  try {
    const pageId = z.string().cuid().parse(id)
    const data = updatePageContentSchema.parse(req.body)

    // Start a transaction for all updates
    const result = await prisma.$transaction(async (tx) => {
      // Check if page exists and user has access
      const page = await tx.page.findFirst({
        where: {
          id: pageId,
          deletedAt: null,
          workspace: {
            userId: user.id,
            deletedAt: null,
          },
        },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          blocks: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              type: true,
              content: true,
              order: true,
              metadata: true,
            },
          },
        },
      })

      if (!page) {
        throw new Error('PAGE_NOT_FOUND')
      }

      // Conflict detection: Check if page was updated since last known update
      if (data.lastUpdatedAt) {
        const lastUpdatedAt = new Date(data.lastUpdatedAt)
        if (page.updatedAt > lastUpdatedAt) {
          throw new Error('CONFLICT_DETECTED')
        }
      }

      // Update page title if provided
      if (data.title !== undefined) {
        await tx.page.update({
          where: { id: pageId },
          data: { title: data.title },
        })
      }

      // Handle block updates
      if (data.blocks && data.blocks.length > 0) {
        // Extract block IDs
        const blockIds = data.blocks.map((b) => b.id)

        // Verify all blocks exist and belong to this page
        const existingBlocks = await tx.block.findMany({
          where: {
            id: { in: blockIds },
            pageId,
            deletedAt: null,
          },
          select: { id: true },
        })

        if (existingBlocks.length !== blockIds.length) {
          throw new Error('INVALID_BLOCK_IDS')
        }

        // Update all blocks
        const blockUpdates = data.blocks.map((block) =>
          tx.block.update({
            where: { id: block.id },
            data: {
              type: block.type,
              content: block.content,
              order: block.order,
              metadata: block.metadata as any,
            },
          })
        )

        await Promise.all(blockUpdates)
      }

      // Handle block deletions
      if (data.deletedBlockIds && data.deletedBlockIds.length > 0) {
        // Verify blocks belong to this page
        const blocksToDelete = await tx.block.findMany({
          where: {
            id: { in: data.deletedBlockIds },
            pageId,
            deletedAt: null,
          },
          select: { id: true },
        })

        if (blocksToDelete.length !== data.deletedBlockIds.length) {
          throw new Error('INVALID_DELETE_BLOCK_IDS')
        }

        // Soft delete blocks
        await tx.block.updateMany({
          where: {
            id: { in: data.deletedBlockIds },
          },
          data: {
            deletedAt: new Date(),
          },
        })
      }

      // Create content version after successful update
      // Get the latest version number for this page
      const latestVersion = await tx.contentVersion.findFirst({
        where: { pageId },
        orderBy: { versionNumber: 'desc' },
        select: { versionNumber: true },
      })

      const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1

      // Get the current state of all blocks after updates
      const currentBlocks = await tx.block.findMany({
        where: {
          pageId,
          deletedAt: null,
        },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          type: true,
          content: true,
          order: true,
          metadata: true,
        },
      })

      // Create the content version
      await tx.contentVersion.create({
        data: {
          pageId,
          versionNumber: nextVersionNumber,
          title: data.title ?? page.title,
          blocks: currentBlocks,
          userId: user.id,
        },
      })

      // Clean up old versions (keep only last 10)
      const versionsToDelete = await tx.contentVersion.findMany({
        where: { pageId },
        orderBy: { versionNumber: 'desc' },
        skip: 10,
        select: { id: true },
      })

      if (versionsToDelete.length > 0) {
        await tx.contentVersion.deleteMany({
          where: {
            id: { in: versionsToDelete.map((v) => v.id) },
          },
        })
      }

      // Return updated page with current updatedAt timestamp
      return await tx.page.findUnique({
        where: { id: pageId },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          blocks: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              type: true,
              content: true,
              order: true,
              metadata: true,
              updatedAt: true,
            },
          },
        },
      })
    })

    return sendSuccess(res, {
      page: result,
      saveStatus: 'success',
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    // Handle specific errors
    if (error instanceof Error) {
      switch (error.message) {
        case 'PAGE_NOT_FOUND':
          return sendError(res, 'PAGE_NOT_FOUND', 'The requested page does not exist', HttpStatus.NOT_FOUND)
        case 'CONFLICT_DETECTED':
          return sendError(res, 'CONFLICT_DETECTED', 'The page has been modified by another user or session', HttpStatus.CONFLICT, {
            message: 'Please refresh the page to get the latest content',
          })
        case 'INVALID_BLOCK_IDS':
          return sendError(res, 'INVALID_BLOCK_IDS', 'One or more block IDs are invalid', HttpStatus.BAD_REQUEST)
        case 'INVALID_DELETE_BLOCK_IDS':
          return sendError(res, 'INVALID_DELETE_BLOCK_IDS', 'One or more blocks to delete are invalid', HttpStatus.BAD_REQUEST)
      }
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid request data', HttpStatus.BAD_REQUEST, {
        errors: error.errors,
      })
    }

    // Generic error
    console.error('Auto-save error:', error)
    return sendError(res, 'INTERNAL_ERROR', 'Failed to save content', HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
