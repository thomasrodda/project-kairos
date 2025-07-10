import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { sendError, sendSuccess, HttpStatus } from '../../lib/api-response'
import { requireAuth } from '../../lib/auth-helpers'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 'METHOD_NOT_ALLOWED', 'Only GET method is allowed', HttpStatus.METHOD_NOT_ALLOWED)
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
        title: true,
      },
    })

    if (!page) {
      return sendError(res, 'PAGE_NOT_FOUND', 'The requested page does not exist', HttpStatus.NOT_FOUND)
    }

    // Get page versions
    const versions = await prisma.contentVersion.findMany({
      where: { pageId },
      orderBy: { versionNumber: 'desc' },
      select: {
        id: true,
        versionNumber: true,
        title: true,
        createdAt: true,
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    })

    return sendSuccess(res, {
      page: {
        id: page.id,
        title: page.title,
      },
      versions: versions.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        title: v.title,
        createdAt: v.createdAt.toISOString(),
        createdBy: {
          displayName: v.user.displayName,
          email: v.user.email,
        },
      })),
    })
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid request data', HttpStatus.BAD_REQUEST, {
        errors: error.errors,
      })
    }

    // Generic error
    console.error('Get versions error:', error)
    return sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve versions', HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
