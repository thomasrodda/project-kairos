import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { asyncHandler } from '../middleware'
import { successResponse } from '../utils/apiResponse'
import { exportService, exportOptionsSchema, importMarkdownSchema } from '../services/exportService'

const router = Router()

/**
 * @route   GET /api/export/pages/:pageId
 * @desc    Export a page to markdown or JSON
 * @access  Private
 */
router.get(
  '/pages/:pageId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { pageId } = req.params
    const userId = req.user!.id

    // Parse options
    const options = exportOptionsSchema.parse({
      includeMetadata: req.query.includeMetadata === 'true',
      includeSubpages: req.query.includeSubpages !== 'false', // Default true
      format: req.query.format || 'markdown',
    })

    if (options.format === 'json') {
      const exportedData = await exportService.exportPageToJson(pageId, userId, options)
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="page-${pageId}.json"`)
      res.json(exportedData)
    } else {
      const markdown = await exportService.exportPageToMarkdown(pageId, userId, options)
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="page-${pageId}.md"`)
      res.send(markdown)
    }
  })
)

/**
 * @route   GET /api/export/workspaces/:workspaceId
 * @desc    Export entire workspace
 * @access  Private
 */
router.get(
  '/workspaces/:workspaceId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params
    const userId = req.user!.id
    const format = (req.query.format || 'markdown') as 'markdown' | 'json'

    const exportedData = await exportService.exportWorkspace(workspaceId, userId, format)

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="workspace-${workspaceId}.json"`)
      res.json(exportedData)
    } else {
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="workspace-${workspaceId}.md"`)
      res.send(exportedData)
    }
  })
)

/**
 * @route   POST /api/export/import
 * @desc    Import markdown content into a page
 * @access  Private
 */
router.post(
  '/import',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id
    const data = importMarkdownSchema.parse(req.body)

    const result = await exportService.importMarkdown(userId, data)

    successResponse(res, result)
  })
)

export default router
