import { Router } from 'express'
import { prisma } from '@kairos/database'
import { requireAuth } from '../middleware/auth.middleware'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
})

/**
 * GET /api/workspaces
 * Get all workspaces for the authenticated user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { pages: true },
        },
      },
    })

    res.json({ workspaces })
  } catch (error) {
    console.error('Get workspaces error:', error)
    res.status(500).json({ error: 'Failed to fetch workspaces' })
  }
})

/**
 * GET /api/workspaces/:id
 * Get a specific workspace
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        pages: {
          where: { parentId: null },
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { children: true },
            },
          },
        },
      },
    })

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' })
    }

    res.json({ workspace })
  } catch (error) {
    console.error('Get workspace error:', error)
    res.status(500).json({ error: 'Failed to fetch workspace' })
  }
})

/**
 * POST /api/workspaces
 * Create a new workspace
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const validatedData = createWorkspaceSchema.parse(req.body)

    const workspace = await prisma.workspace.create({
      data: {
        ...validatedData,
        userId: req.user!.id,
      },
    })

    res.status(201).json({ workspace })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Create workspace error:', error)
    res.status(500).json({ error: 'Failed to create workspace' })
  }
})

/**
 * PUT /api/workspaces/:id
 * Update a workspace
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const validatedData = updateWorkspaceSchema.parse(req.body)

    // Check ownership
    const existing = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Workspace not found' })
    }

    const workspace = await prisma.workspace.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    })

    res.json({ workspace })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Update workspace error:', error)
    res.status(500).json({ error: 'Failed to update workspace' })
  }
})

/**
 * DELETE /api/workspaces/:id
 * Delete a workspace and all its contents
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // Check ownership
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    })

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' })
    }

    // Delete workspace (cascades to pages and blocks)
    await prisma.workspace.delete({
      where: { id: req.params.id },
    })

    res.status(204).send()
  } catch (error) {
    console.error('Delete workspace error:', error)
    res.status(500).json({ error: 'Failed to delete workspace' })
  }
})

export default router
