import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { asyncHandler } from '../middleware'
import { successResponse, paginatedResponse, calculatePagination } from '../utils/apiResponse'
import { searchService, searchQuerySchema } from '../services/searchService'

const router = Router()

/**
 * @route   GET /api/search
 * @desc    Search across pages and blocks
 * @access  Private
 */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id

    // Parse and validate query parameters
    const params = searchQuerySchema.parse({
      query: req.query.q || req.query.query,
      workspaceId: req.query.workspaceId,
      pageId: req.query.pageId,
      blockTypes: req.query.blockTypes ? (req.query.blockTypes as string).split(',') : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    })

    const { results, total } = await searchService.search(userId, params)

    const page = Math.floor(params.offset / params.limit) + 1
    paginatedResponse(res, results, calculatePagination(page, params.limit, total))
  })
)

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions based on partial query
 * @access  Private
 */
router.get(
  '/suggestions',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const query = (req.query.q || req.query.query || '') as string
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5

    const suggestions = await searchService.searchSuggestions(userId, query, limit)

    successResponse(res, { suggestions })
  })
)

/**
 * @route   POST /api/search/indices
 * @desc    Create or update search indices (admin only)
 * @access  Private (should be admin only in production)
 */
router.post(
  '/indices',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Add admin check here
    await searchService.createSearchIndices()

    successResponse(res, { message: 'Search indices created/updated successfully' })
  })
)

export default router
