import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { sendError, sendSuccess, HttpStatus } from '../../../lib/api-response'
import { requireAuth } from '../../../lib/auth-helpers'

interface VersionBlock {
  id: string
  type: string
  content: string
  order: number
  metadata?: any
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authResult = await requireAuth(req, res)
  if (!authResult) return

  const { user } = authResult

  const { id, versionId } = req.query
  if (!id || typeof id !== 'string' || !versionId || typeof versionId !== 'string') {
    return sendError(res, 'MISSING_ID', 'Page ID and Version ID are required', HttpStatus.BAD_REQUEST)
  }

  try {
    const pageId = z.string().cuid().parse(id)
    const contentVersionId = z.string().cuid().parse(versionId)

    // Check if page exists and user has access
    const page = await prisma.page.findFirst({
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
      },
    })

    if (!page) {
      return sendError(res, 'PAGE_NOT_FOUND', 'The requested page does not exist', HttpStatus.NOT_FOUND)
    }

    if (req.method === 'GET') {
      // Get version details
      const version = await prisma.contentVersion.findFirst({
        where: {
          id: contentVersionId,
          pageId,
        },
        select: {
          id: true,
          versionNumber: true,
          title: true,
          blocks: true,
          createdAt: true,
          user: {
            select: {
              displayName: true,
              email: true,
            },
          },
        },
      })

      if (!version) {
        return sendError(res, 'VERSION_NOT_FOUND', 'The requested version does not exist', HttpStatus.NOT_FOUND)
      }

      return sendSuccess(res, {
        version: {
          id: version.id,
          versionNumber: version.versionNumber,
          title: version.title,
          blocks: version.blocks,
          createdAt: version.createdAt.toISOString(),
          createdBy: {
            displayName: version.user.displayName,
            email: version.user.email,
          },
        },
      })
    } else if (req.method === 'POST') {
      // Restore version
      const version = await prisma.contentVersion.findFirst({
        where: {
          id: contentVersionId,
          pageId,
        },
        select: {
          title: true,
          blocks: true,
        },
      })

      if (!version) {
        return sendError(res, 'VERSION_NOT_FOUND', 'The requested version does not exist', HttpStatus.NOT_FOUND)
      }

      // Start a transaction to restore the version
      const restoredPage = await prisma.$transaction(async (tx) => {
        // Update page title
        await tx.page.update({
          where: { id: pageId },
          data: { title: version.title },
        })

        // Soft delete all current blocks
        await tx.block.updateMany({
          where: {
            pageId,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        })

        // Create new blocks from version
        const versionBlocks = version.blocks as unknown as VersionBlock[]
        if (versionBlocks && versionBlocks.length > 0) {
          await tx.block.createMany({
            data: versionBlocks.map((block) => ({
              pageId,
              type: block.type as any,
              content: block.content,
              order: block.order,
              metadata: block.metadata,
            })),
          })
        }

        // Create a new version for this restore action
        const latestVersion = await tx.contentVersion.findFirst({
          where: { pageId },
          orderBy: { versionNumber: 'desc' },
          select: { versionNumber: true },
        })

        const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1

        await tx.contentVersion.create({
          data: {
            pageId,
            versionNumber: nextVersionNumber,
            title: version.title,
            blocks: (versionBlocks || []) as any,
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

        // Return restored page
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
              },
            },
          },
        })
      })

      return sendSuccess(res, {
        page: restoredPage,
        message: 'Page restored successfully from version',
      })
    } else {
      return sendError(res, 'METHOD_NOT_ALLOWED', 'Only GET or POST methods are allowed', HttpStatus.METHOD_NOT_ALLOWED)
    }
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid request data', HttpStatus.BAD_REQUEST, {
        errors: error.errors,
      })
    }

    // Generic error
    console.error('Version operation error:', error)
    return sendError(res, 'INTERNAL_ERROR', 'Failed to process version request', HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
