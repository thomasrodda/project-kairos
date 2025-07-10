import { z } from 'zod'

// Workspace creation schema
export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).trim(),
})

// Workspace update schema
export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
})

// Workspace params schema
export const workspaceIdSchema = z.object({
  id: z.string().cuid(),
})

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>
