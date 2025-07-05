import { Router } from 'express'
import { prisma } from '@kairos/database'
import { requireAuth } from '../middleware/auth.middleware'
import { z } from 'zod'
import { asyncHandler } from '../middleware/errorHandler'
import {
  successResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse,
  parsePaginationParams,
  calculatePagination,
} from '../utils/apiResponse'
import { ValidationError, NotFoundError } from '../utils/errors'

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
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePaginationParams(req.query)

    const [workspaces, total] = await Promise.all([
      prisma.workspace.findMany({
        where: { userId: req.user!.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { pages: true },
          },
        },
        skip: offset,
        take: limit,
      }),
      prisma.workspace.count({
        where: { userId: req.user!.id },
      }),
    ])

    paginatedResponse(res, workspaces, calculatePagination(page, limit, total))
  })
)

/**
 * GET /api/workspaces/:id
 * Get a specific workspace
 */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
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
      throw new NotFoundError('Workspace', req.params.id)
    }

    successResponse(res, { workspace })
  })
)

/**
 * POST /api/workspaces
 * Create a new workspace
 */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    let validatedData
    try {
      validatedData = createWorkspaceSchema.parse(req.body)
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

    const workspace = await prisma.workspace.create({
      data: {
        ...validatedData,
        userId: req.user!.id,
      },
    })

    createdResponse(res, { workspace }, `/api/workspaces/${workspace.id}`)
  })
)

/**
 * PUT /api/workspaces/:id
 * Update a workspace
 */
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    let validatedData
    try {
      validatedData = updateWorkspaceSchema.parse(req.body)
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

    // Check ownership
    const existing = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    })

    if (!existing) {
      throw new NotFoundError('Workspace', req.params.id)
    }

    const workspace = await prisma.workspace.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    })

    successResponse(res, { workspace })
  })
)

/**
 * DELETE /api/workspaces/:id
 * Delete a workspace and all its contents
 */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    // Check ownership
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    })

    if (!workspace) {
      throw new NotFoundError('Workspace', req.params.id)
    }

    // Delete workspace (cascades to pages and blocks)
    await prisma.workspace.delete({
      where: { id: req.params.id },
    })

    noContentResponse(res)
  })
)

export default router
