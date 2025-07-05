import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { z } from 'zod'
import { blockService, createBlockSchema, updateBlockSchema, reorderBlocksSchema, batchUpdateBlocksSchema } from '../services/blockService'
import { asyncHandler } from '../middleware/errorHandler'
import { successResponse, createdResponse, noContentResponse } from '../utils/apiResponse'
import { ValidationError } from '../utils/errors'

const router = Router()

/**
 * GET /api/blocks/:pageId
 * Get all blocks in a page (ordered)
 */
router.get(
  '/:pageId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const blocks = await blockService.getBlocksByPage(req.params.pageId, req.user!.id)
    successResponse(res, { blocks })
  })
)

/**
 * POST /api/blocks/:pageId
 * Create a new block
 */
router.post(
  '/:pageId',
  requireAuth,
  asyncHandler(async (req, res) => {
    let validatedData
    try {
      validatedData = createBlockSchema.parse(req.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid input',
          error.errors.map((e) => ({
            field: e.path.join('.'),
            reason: e.message,
          }))
        )
      }
      throw error
    }

    const block = await blockService.createBlock(req.params.pageId, req.user!.id, validatedData)
    createdResponse(res, { block }, `/api/blocks/${req.params.pageId}/${block.id}`)
  })
)

/**
 * PUT /api/blocks/:pageId/:blockId
 * Update block content/type
 */
router.put(
  '/:pageId/:blockId',
  requireAuth,
  asyncHandler(async (req, res) => {
    let validatedData
    try {
      validatedData = updateBlockSchema.parse(req.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid input',
          error.errors.map((e) => ({
            field: e.path.join('.'),
            reason: e.message,
          }))
        )
      }
      throw error
    }

    const block = await blockService.updateBlock(req.params.blockId, req.params.pageId, req.user!.id, validatedData)
    successResponse(res, { block })
  })
)

/**
 * DELETE /api/blocks/:pageId/:blockId
 * Delete a block
 */
router.delete(
  '/:pageId/:blockId',
  requireAuth,
  asyncHandler(async (req, res) => {
    await blockService.deleteBlock(req.params.blockId, req.params.pageId, req.user!.id)
    noContentResponse(res)
  })
)

/**
 * PUT /api/blocks/:pageId/reorder
 * Batch reorder blocks
 */
router.put(
  '/:pageId/reorder',
  requireAuth,
  asyncHandler(async (req, res) => {
    let validatedData
    try {
      validatedData = reorderBlocksSchema.parse(req.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid input',
          error.errors.map((e) => ({
            field: e.path.join('.'),
            reason: e.message,
          }))
        )
      }
      throw error
    }

    const blocks = await blockService.reorderBlocks(req.params.pageId, req.user!.id, validatedData)
    successResponse(res, { blocks })
  })
)

/**
 * PUT /api/blocks/:pageId/batch
 * Batch update multiple blocks (for auto-save)
 */
router.put(
  '/:pageId/batch',
  requireAuth,
  asyncHandler(async (req, res) => {
    let validatedData
    try {
      validatedData = batchUpdateBlocksSchema.parse(req.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid input',
          error.errors.map((e) => ({
            field: e.path.join('.'),
            reason: e.message,
          }))
        )
      }
      throw error
    }

    const blocks = await blockService.batchUpdateBlocks(req.params.pageId, req.user!.id, validatedData)
    successResponse(res, { blocks })
  })
)

export default router
