import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '@kairos/database'
import { requireAuth } from './lib/auth-helpers'
import { asyncHandler, sendSuccess, sendError, methodNotAllowed, HttpStatus } from './lib/api-response'
import { createWorkspaceSchema, updateWorkspaceSchema, workspaceIdSchema } from './lib/validations/workspace'

async function handler(req: VercelRequest, res: VercelResponse) {
  // All workspace operations require authentication
  const authResult = await requireAuth(req, res)
  if (!authResult) return

  const { user } = authResult

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, user.id)
    case 'POST':
      return handlePost(req, res, user.id)
    case 'PUT':
      return handlePut(req, res, user.id)
    case 'DELETE':
      return handleDelete(req, res, user.id)
    default:
      return methodNotAllowed(res, ['GET', 'POST', 'PUT', 'DELETE'])
  }
}

// GET /api/workspaces or GET /api/workspaces?id=xxx
async function handleGet(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query

  // Single workspace
  if (id) {
    const { id: workspaceId } = workspaceIdSchema.parse({ id })

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId,
        deletedAt: null,
      },
    })

    if (!workspace) {
      return sendError(res, 'WORKSPACE_NOT_FOUND', 'The requested workspace does not exist', HttpStatus.NOT_FOUND)
    }

    return sendSuccess(res, workspace)
  }

  // List all workspaces for user
  const workspaces = await prisma.workspace.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return sendSuccess(res, workspaces)
}

// POST /api/workspaces
async function handlePost(req: VercelRequest, res: VercelResponse, userId: string) {
  const data = createWorkspaceSchema.parse(req.body)

  const workspace = await prisma.workspace.create({
    data: {
      name: data.name,
      userId,
    },
  })

  return sendSuccess(res, workspace, HttpStatus.CREATED)
}

// PUT /api/workspaces?id=xxx
async function handlePut(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query
  if (!id) {
    return sendError(res, 'MISSING_ID', 'Workspace ID is required', HttpStatus.BAD_REQUEST)
  }

  const { id: workspaceId } = workspaceIdSchema.parse({ id })
  const data = updateWorkspaceSchema.parse(req.body)

  // Check if workspace exists and belongs to user
  const existing = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      userId,
      deletedAt: null,
    },
  })

  if (!existing) {
    return sendError(res, 'WORKSPACE_NOT_FOUND', 'The requested workspace does not exist', HttpStatus.NOT_FOUND)
  }

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data,
  })

  return sendSuccess(res, workspace)
}

// DELETE /api/workspaces?id=xxx
async function handleDelete(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query
  if (!id) {
    return sendError(res, 'MISSING_ID', 'Workspace ID is required', HttpStatus.BAD_REQUEST)
  }

  const { id: workspaceId } = workspaceIdSchema.parse({ id })

  // Check if workspace exists and belongs to user
  const existing = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      userId,
      deletedAt: null,
    },
  })

  if (!existing) {
    return sendError(res, 'WORKSPACE_NOT_FOUND', 'The requested workspace does not exist', HttpStatus.NOT_FOUND)
  }

  // Soft delete the workspace
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      deletedAt: new Date(),
    },
  })

  return sendSuccess(res, { message: 'Workspace deleted successfully' })
}

export default asyncHandler(handler)
