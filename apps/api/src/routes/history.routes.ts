import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.middleware'
import { asyncHandler } from '../middleware'
import { successResponse, paginatedResponse, createdResponse, noContentResponse, calculatePagination } from '../utils/apiResponse'
import { historyService, historyQuerySchema, restoreSnapshotSchema } from '../services/historyService'
import { ValidationError } from '../utils/errors'

const router = Router()

/**
 * @route   GET /api/history/pages/:pageId
 * @desc    Get block change history for a page
 * @access  Private
 */
router.get(
  '/pages/:pageId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { pageId } = req.params
    const userId = req.user!.id

    // Parse and validate query parameters
    const query = historyQuerySchema.parse({
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    })

    const { changes, total } = await historyService.getPageHistory(pageId, userId, query)

    const page = Math.floor(query.offset / query.limit) + 1
    paginatedResponse(res, changes, calculatePagination(page, query.limit, total))
  })
)

/**
 * @route   GET /api/history/blocks/:blockId
 * @desc    Get change history for a specific block
 * @access  Private
 */
router.get(
  '/blocks/:blockId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { blockId } = req.params
    const { pageId } = req.query
    const userId = req.user!.id

    if (!pageId || typeof pageId !== 'string') {
      throw new ValidationError('pageId is required', {
        field: 'pageId',
        reason: 'Must provide pageId as query parameter',
      })
    }

    // Parse and validate query parameters
    const query = historyQuerySchema.parse({
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    })

    const { changes, total } = await historyService.getBlockHistory(blockId, pageId, userId, query)

    const page = Math.floor(query.offset / query.limit) + 1
    paginatedResponse(res, changes, calculatePagination(page, query.limit, total))
  })
)

/**
 * @route   GET /api/history/snapshots/:pageId
 * @desc    Get snapshots for a page
 * @access  Private
 */
router.get(
  '/snapshots/:pageId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { pageId } = req.params
    const userId = req.user!.id

    // Parse and validate query parameters
    const query = historyQuerySchema.parse({
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    })

    const { snapshots, total } = await historyService.getPageSnapshots(pageId, userId, query)

    const page2 = Math.floor(query.offset / query.limit) + 1
    paginatedResponse(res, snapshots, calculatePagination(page2, query.limit, total))
  })
)

/**
 * @route   GET /api/history/snapshots/:pageId/:snapshotId
 * @desc    Get a specific snapshot
 * @access  Private
 */
router.get(
  '/snapshots/:pageId/:snapshotId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { snapshotId } = req.params
    const userId = req.user!.id

    const snapshot = await historyService.getSnapshot(snapshotId, userId)

    successResponse(res, { snapshot })
  })
)

/**
 * @route   POST /api/history/snapshots/:pageId
 * @desc    Create a new snapshot for a page
 * @access  Private
 */
router.post(
  '/snapshots/:pageId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { pageId } = req.params
    const userId = req.user!.id

    const snapshot = await historyService.createSnapshot(pageId, userId)

    createdResponse(res, { snapshot }, `/api/history/snapshots/${pageId}/${snapshot.id}`)
  })
)

/**
 * @route   POST /api/history/restore
 * @desc    Restore a page from a snapshot
 * @access  Private
 */
router.post(
  '/restore',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const { snapshotId } = restoreSnapshotSchema.parse(req.body)

    await historyService.restoreSnapshot(snapshotId, userId)

    noContentResponse(res)
  })
)

/**
 * @route   DELETE /api/history/cleanup
 * @desc    Clean up old history based on retention policy
 * @access  Private
 */
router.delete(
  '/cleanup',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id

    const result = await historyService.cleanupOldHistory(userId)

    successResponse(res, result)
  })
)

export default router
