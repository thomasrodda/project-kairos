import type { VercelRequest, VercelResponse } from '@vercel/node'

// Mock page data for development
const MOCK_PAGES = [
  {
    id: 'mock-page-123',
    title: 'Getting Started',
    workspaceId: 'mock-workspace-123',
    parentId: null,
    order: 0,
    icon: null,
    isFolder: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    blocks: [
      {
        id: 'mock-block-123',
        type: 'paragraph',
        content: '',
        pageId: 'mock-page-123',
        order: 0,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    ],
  },
]

// GET /api/pages?workspaceId=xxx or GET /api/pages?id=xxx
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id, workspaceId } = req.query

  // Only handle mock workspace requests
  if (workspaceId !== 'mock-workspace-123' && !id?.toString().startsWith('mock-')) {
    // Fall back to real endpoint
    return res.status(404).json({ error: 'Use real pages endpoint for non-mock data' })
  }

  switch (req.method) {
    case 'GET':
      // Single page with blocks
      if (id) {
        const page = MOCK_PAGES.find((p) => p.id === id)
        if (!page) {
          return res.status(404).json({
            error: {
              code: 'PAGE_NOT_FOUND',
              message: 'The requested page does not exist',
            },
          })
        }
        return res.status(200).json({ page, blocks: page.blocks })
      }

      // List pages for workspace
      if (workspaceId === 'mock-workspace-123') {
        const pages = MOCK_PAGES.filter((p) => p.workspaceId === workspaceId).map((p) => {
          // Remove blocks from list response
          const { blocks: _, ...pageWithoutBlocks } = p
          return pageWithoutBlocks
        })
        return res.status(200).json({ pages })
      }

      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMS',
          message: 'Either id or workspaceId is required',
        },
      })

    case 'POST': {
      // Create new page
      if (!workspaceId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_WORKSPACE_ID',
            message: 'Workspace ID is required',
          },
        })
      }

      const { title = 'Untitled', parentId = null } = req.body || {}
      const newPage = {
        id: `mock-page-${Date.now()}`,
        title,
        workspaceId: workspaceId as string,
        parentId,
        order: MOCK_PAGES.filter((p) => p.workspaceId === workspaceId).length,
        icon: null,
        isFolder: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        blocks: [],
      }

      MOCK_PAGES.push(newPage)
      return res.status(201).json({ page: newPage })
    }

    case 'PUT': {
      // Update page or reorder
      if (req.url?.includes('/reorder')) {
        // Mock reorder success
        return res.status(200).json({ data: { message: 'Pages reordered successfully' } })
      }

      if (!id) {
        return res.status(400).json({
          error: {
            code: 'MISSING_ID',
            message: 'Page ID is required',
          },
        })
      }

      const pageIndex = MOCK_PAGES.findIndex((p) => p.id === id)
      if (pageIndex === -1) {
        return res.status(404).json({
          error: {
            code: 'PAGE_NOT_FOUND',
            message: 'The requested page does not exist',
          },
        })
      }

      const updates = req.body || {}
      MOCK_PAGES[pageIndex] = {
        ...MOCK_PAGES[pageIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      return res.status(200).json({ data: MOCK_PAGES[pageIndex] })
    }

    case 'DELETE': {
      if (!id) {
        return res.status(400).json({
          error: {
            code: 'MISSING_ID',
            message: 'Page ID is required',
          },
        })
      }

      const deleteIndex = MOCK_PAGES.findIndex((p) => p.id === id)
      if (deleteIndex === -1) {
        return res.status(404).json({
          error: {
            code: 'PAGE_NOT_FOUND',
            message: 'The requested page does not exist',
          },
        })
      }

      MOCK_PAGES[deleteIndex].deletedAt = new Date().toISOString() as any
      return res.status(200).json({ data: { message: 'Page deleted successfully' } })
    }

    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} not allowed`,
        },
      })
  }
}
