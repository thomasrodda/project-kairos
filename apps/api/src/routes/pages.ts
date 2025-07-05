import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { pageService, createPageSchema, updatePageSchema, movePageSchema } from '../services/pageService'
import { z } from 'zod'
import { asyncHandler } from '../middleware/errorHandler'
import { successResponse, createdResponse, noContentResponse } from '../utils/apiResponse'
import { ValidationError } from '../utils/errors'

const router = Router()

/**
 * GET /api/pages/:workspaceId
 * List all pages in a workspace with hierarchy
 */
router.get(
  '/:workspaceId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { workspaceId } = req.params
    const pages = await pageService.listPages(workspaceId, req.user!.id)

    successResponse(res, { pages })
  })
)

/**
 * GET /api/pages/:workspaceId/:pageId
 * Get a single page with blocks
 */
router.get(
  '/:workspaceId/:pageId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { pageId } = req.params
    const page = await pageService.getPage(pageId, req.user!.id)

    successResponse(res, { page })
  })
)

/**
 * POST /api/pages/:workspaceId
 * Create a new page
 */
router.post(
  '/:workspaceId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { workspaceId } = req.params

    let validatedData
    try {
      validatedData = createPageSchema.parse(req.body)
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

    const page = await pageService.createPage(workspaceId, req.user!.id, validatedData)

    createdResponse(res, { page }, `/api/pages/${workspaceId}/${page.id}`)
  })
)

/**
 * PUT /api/pages/:workspaceId/:pageId
 * Update a page
 */
router.put(
  '/:workspaceId/:pageId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { pageId } = req.params

    let validatedData
    try {
      validatedData = updatePageSchema.parse(req.body)
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

    const page = await pageService.updatePage(pageId, req.user!.id, validatedData)

    successResponse(res, { page })
  })
)

/**
 * DELETE /api/pages/:workspaceId/:pageId
 * Delete a page and all its children
 */
router.delete(
  '/:workspaceId/:pageId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { pageId } = req.params

    await pageService.deletePage(pageId, req.user!.id)

    noContentResponse(res)
  })
)

/**
 * PUT /api/pages/:workspaceId/:pageId/move
 * Move a page in the hierarchy
 */
router.put(
  '/:workspaceId/:pageId/move',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { pageId } = req.params

    let validatedData
    try {
      validatedData = movePageSchema.parse(req.body)
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

    const page = await pageService.movePage(pageId, req.user!.id, validatedData)

    successResponse(res, { page })
  })
)

export default router
