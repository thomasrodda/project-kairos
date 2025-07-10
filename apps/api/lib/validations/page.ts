import { z } from 'zod'
import { BlockType } from '@prisma/client'

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

// Content update schema for auto-save
export const updatePageContentSchema = z.object({
  // Page title update (optional)
  title: z.string().min(1).max(255).trim().optional(),

  // Partial block updates
  blocks: z
    .array(
      z.object({
        id: z.string().cuid(),
        type: z.nativeEnum(BlockType),
        content: z.string(),
        order: z.number().int().min(0),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .optional(),

  // Blocks to delete (soft delete)
  deletedBlockIds: z.array(z.string().cuid()).optional(),

  // For conflict detection - last known update timestamp
  lastUpdatedAt: z.string().datetime().optional(),
})

export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
export type ReorderPagesInput = z.infer<typeof reorderPagesSchema>
export type UpdatePageContentInput = z.infer<typeof updatePageContentSchema>
