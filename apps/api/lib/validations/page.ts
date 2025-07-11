import { z } from 'zod'

// Define BlockType enum locally to avoid import issues
enum BlockType {
  paragraph = 'paragraph',
  h1 = 'h1',
  h2 = 'h2',
  h3 = 'h3',
  bullet = 'bullet',
}

// Page creation schema
export const createPageSchema = z.object({
  title: z.string().min(1).max(255).trim().default('Untitled'),
  parentId: z.string().min(1).optional(), // Changed from .cuid() to support cuid2
  isFolder: z.boolean().default(false),
})

// Page update schema
export const updatePageSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  parentId: z.string().min(1).nullable().optional(), // Changed from .cuid() to support cuid2
  order: z.number().int().min(0).optional(),
})

// Page reorder schema
export const reorderPagesSchema = z.object({
  pageIds: z.array(z.string().min(1)).min(1), // Changed from .cuid() to support cuid2
})

// Page params schema
export const pageIdSchema = z.object({
  id: z.string().min(1), // Changed from .cuid() to support cuid2
})

// Content update schema for auto-save
export const updatePageContentSchema = z.object({
  // Page title update (optional)
  title: z.string().min(1).max(255).trim().optional(),

  // Partial block updates
  blocks: z
    .array(
      z.object({
        id: z.string().min(1), // Changed from .cuid() to support cuid2
        type: z.nativeEnum(BlockType),
        content: z.string(),
        order: z.number().int().min(0),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .optional(),

  // Blocks to delete (soft delete)
  deletedBlockIds: z.array(z.string().min(1)).optional(), // Changed from .cuid() to support cuid2

  // For conflict detection - last known update timestamp
  lastUpdatedAt: z.string().datetime().optional(),
})

export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
export type ReorderPagesInput = z.infer<typeof reorderPagesSchema>
export type UpdatePageContentInput = z.infer<typeof updatePageContentSchema>
