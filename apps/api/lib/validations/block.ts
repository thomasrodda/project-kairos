import { z } from 'zod'
import { BlockType } from '@prisma/client'

// Block type enum matching Prisma schema
const blockTypeSchema = z.nativeEnum(BlockType)

// Block creation schema
export const createBlockSchema = z.object({
  type: blockTypeSchema,
  content: z.string().default(''),
  order: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// Block update schema
export const updateBlockSchema = z.object({
  type: blockTypeSchema.optional(),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// Bulk update blocks schema
export const bulkUpdateBlocksSchema = z.object({
  blocks: z.array(
    z.object({
      id: z.string().cuid(),
      type: blockTypeSchema,
      content: z.string(),
      order: z.number().int().min(0),
      metadata: z.record(z.unknown()).optional(),
    })
  ),
})

// Block reorder schema
export const reorderBlocksSchema = z.object({
  blockIds: z.array(z.string().cuid()).min(1),
})

// Block params schema
export const blockIdSchema = z.object({
  id: z.string().cuid(),
})

export type CreateBlockInput = z.infer<typeof createBlockSchema>
export type UpdateBlockInput = z.infer<typeof updateBlockSchema>
export type BulkUpdateBlocksInput = z.infer<typeof bulkUpdateBlocksSchema>
export type ReorderBlocksInput = z.infer<typeof reorderBlocksSchema>
