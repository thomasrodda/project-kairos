import { z } from 'zod'

// Page creation schema
export const createPageSchema = z.object({
  title: z.string().min(1).max(255).trim().default('Untitled'),
  parentId: z.string().cuid().optional(),
  isFolder: z.boolean().default(false),
})

// Page update schema
export const updatePageSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  parentId: z.string().cuid().nullable().optional(),
  order: z.number().int().min(0).optional(),
})

// Page reorder schema
export const reorderPagesSchema = z.object({
  pageIds: z.array(z.string().cuid()).min(1),
})

// Page params schema
export const pageIdSchema = z.object({
  id: z.string().cuid(),
})

export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
export type ReorderPagesInput = z.infer<typeof reorderPagesSchema>
