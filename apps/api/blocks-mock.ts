import type { VercelRequest, VercelResponse } from '@vercel/node'

// Mock block data storage
const MOCK_BLOCKS: Record<string, any[]> = {
  'mock-page-123': [
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
}

// GET /api/blocks?pageId=xxx or GET /api/blocks?id=xxx
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id, pageId } = req.query

  // Only handle mock requests
  if (!pageId?.toString().startsWith('mock-') && !id?.toString().startsWith('mock-')) {
    return res.status(404).json({ error: 'Use real blocks endpoint for non-mock data' })
  }

  switch (req.method) {
    case 'GET':
      // Single block
      if (id) {
        for (const blocks of Object.values(MOCK_BLOCKS)) {
          const block = blocks.find((b) => b.id === id)
          if (block) {
            return res.status(200).json({ block })
          }
        }
        return res.status(404).json({
          error: {
            code: 'BLOCK_NOT_FOUND',
            message: 'The requested block does not exist',
          },
        })
      }

      // List blocks for page
      if (pageId) {
        const blocks = MOCK_BLOCKS[pageId as string] || []
        return res.status(200).json({ blocks })
      }

      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMS',
          message: 'Either id or pageId is required',
        },
      })

    case 'POST': {
      // Create new block
      if (!pageId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PAGE_ID',
            message: 'Page ID is required',
          },
        })
      }

      const { type = 'paragraph', content = '', order } = req.body || {}
      const pageBlocksArray = MOCK_BLOCKS[pageId as string] || []
      const newOrder = order ?? pageBlocksArray.length

      const newBlock = {
        id: `mock-block-${Date.now()}`,
        type,
        content,
        pageId,
        order: newOrder,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      }

      if (!MOCK_BLOCKS[pageId as string]) {
        MOCK_BLOCKS[pageId as string] = []
      }
      MOCK_BLOCKS[pageId as string].push(newBlock)

      return res.status(201).json({ block: newBlock })
    }

    case 'PUT':
      // Bulk update
      if (req.url?.includes('/bulk')) {
        const { blocks = [] } = req.body || {}
        // Mock success
        return res.status(200).json({ data: { updated: blocks.length } })
      }

      // Reorder blocks
      if (req.url?.includes('/reorder')) {
        // Mock success
        return res.status(200).json({ data: { message: 'Blocks reordered successfully' } })
      }

      // Update single block
      if (!id) {
        return res.status(400).json({
          error: {
            code: 'MISSING_ID',
            message: 'Block ID is required',
          },
        })
      }

      for (const [pageKey, blocks] of Object.entries(MOCK_BLOCKS)) {
        const blockIndex = blocks.findIndex((b) => b.id === id)
        if (blockIndex !== -1) {
          const updates = req.body || {}
          MOCK_BLOCKS[pageKey][blockIndex] = {
            ...MOCK_BLOCKS[pageKey][blockIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          }
          return res.status(200).json({ data: MOCK_BLOCKS[pageKey][blockIndex] })
        }
      }

      return res.status(404).json({
        error: {
          code: 'BLOCK_NOT_FOUND',
          message: 'The requested block does not exist',
        },
      })

    case 'DELETE':
      if (!id) {
        return res.status(400).json({
          error: {
            code: 'MISSING_ID',
            message: 'Block ID is required',
          },
        })
      }

      for (const [pageKey, blocks] of Object.entries(MOCK_BLOCKS)) {
        const blockIndex = blocks.findIndex((b) => b.id === id)
        if (blockIndex !== -1) {
          MOCK_BLOCKS[pageKey][blockIndex].deletedAt = new Date().toISOString()
          return res.status(200).json({ data: { message: 'Block deleted successfully' } })
        }
      }

      return res.status(404).json({
        error: {
          code: 'BLOCK_NOT_FOUND',
          message: 'The requested block does not exist',
        },
      })

    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} not allowed`,
        },
      })
  }
}
