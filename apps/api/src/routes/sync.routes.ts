import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { asyncHandler } from '../middleware'
import { successResponse } from '../utils/apiResponse'
import { syncService } from '../services/syncService'
import { z } from 'zod'
import { ValidationError } from '../utils/errors'

const router = Router()

/**
 * @route   GET /api/sync/page/:pageId/users
 * @desc    Get active users in a page
 * @access  Private
 */
router.get(
  '/page/:pageId/users',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { pageId } = req.params
    const userId = req.user!.id

    // Verify user has access to the page
    const hasAccess = await syncService.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new ValidationError('Access denied', {
        field: 'pageId',
        reason: 'You do not have access to this page',
      })
    }

    const users = await syncService.getPageUsers(pageId)

    successResponse(res, { users })
  })
)

/**
 * @route   GET /api/sync/workspace/:workspaceId/activity
 * @desc    Get workspace activity summary
 * @access  Private
 */
router.get(
  '/workspace/:workspaceId/activity',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params
    const userId = req.user!.id

    const activity = await syncService.getWorkspaceActivity(workspaceId, userId)

    successResponse(res, activity)
  })
)

/**
 * @route   POST /api/sync/block/:blockId/conflict
 * @desc    Check for edit conflicts on a block
 * @access  Private
 */
router.post(
  '/block/:blockId/conflict',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { blockId } = req.params
    const userId = req.user!.id

    const schema = z.object({
      version: z.number().int().min(1),
      content: z.string(),
    })

    const { version, content } = schema.parse(req.body)

    const result = await syncService.resolveEditConflict(blockId, userId, version, content)

    successResponse(res, result)
  })
)

export default router
