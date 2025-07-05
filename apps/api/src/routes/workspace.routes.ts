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
router.get('/', requireAuth, async (req, res): Promise<void> => {
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
    return
  } catch (error) {
    console.error('Get workspaces error:', error)
    res.status(500).json({ error: 'Failed to fetch workspaces' })
    return
  }
})

/**
 * GET /api/workspaces/:id
 * Get a specific workspace
 */
router.get('/:id', requireAuth, async (req, res): Promise<void> => {
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
      res.status(404).json({ error: 'Workspace not found' })
      return
    }

    res.json({ workspace })
    return
  } catch (error) {
    console.error('Get workspace error:', error)
    res.status(500).json({ error: 'Failed to fetch workspace' })
    return
  }
})

/**
 * POST /api/workspaces
 * Create a new workspace
 */
router.post('/', requireAuth, async (req, res): Promise<void> => {
  try {
    const validatedData = createWorkspaceSchema.parse(req.body)

    const workspace = await prisma.workspace.create({
      data: {
        ...validatedData,
        userId: req.user!.id,
      },
    })

    res.status(201).json({ workspace })
    return
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors })
      return
    }
    console.error('Create workspace error:', error)
    res.status(500).json({ error: 'Failed to create workspace' })
    return
  }
})

/**
 * PUT /api/workspaces/:id
 * Update a workspace
 */
router.put('/:id', requireAuth, async (req, res): Promise<void> => {
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
      res.status(404).json({ error: 'Workspace not found' })
      return
    }

    const workspace = await prisma.workspace.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    })

    res.json({ workspace })
    return
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors })
      return
    }
    console.error('Update workspace error:', error)
    res.status(500).json({ error: 'Failed to update workspace' })
    return
  }
})

/**
 * DELETE /api/workspaces/:id
 * Delete a workspace and all its contents
 */
router.delete('/:id', requireAuth, async (req, res): Promise<void> => {
  try {
    // Check ownership
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    })

    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found' })
      return
    }

    // Delete workspace (cascades to pages and blocks)
    await prisma.workspace.delete({
      where: { id: req.params.id },
    })

    res.status(204).send()
    return
  } catch (error) {
    console.error('Delete workspace error:', error)
    res.status(500).json({ error: 'Failed to delete workspace' })
    return
  }
})

export default router
