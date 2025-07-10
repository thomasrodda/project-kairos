import { BlockType } from '@prisma/client'
import { z } from 'zod'
import { createBlockSchema } from './lib/validations/block'

describe('Block Type Validation', () => {
  it('should accept frontend block types', () => {
    const frontendBlockTypes = ['h1', 'h2', 'h3', 'paragraph', 'bullet']

    frontendBlockTypes.forEach((type) => {
      const result = createBlockSchema.safeParse({
        type,
        content: 'Test content',
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe(type)
      }
    })
  })

  it('should reject invalid block types', () => {
    const invalidTypes = ['HEADING1', 'HEADING2', 'PARAGRAPH', 'BULLET', 'invalid', 'h4']

    invalidTypes.forEach((type) => {
      const result = createBlockSchema.safeParse({
        type,
        content: 'Test content',
      })

      expect(result.success).toBe(false)
    })
  })

  it('should have all frontend block types in Prisma enum', () => {
    const prismaBlockTypes = Object.values(BlockType)
    const expectedTypes = ['h1', 'h2', 'h3', 'paragraph', 'bullet']

    expectedTypes.forEach((type) => {
      expect(prismaBlockTypes).toContain(type)
    })
  })

  it('should not have old uppercase block types', () => {
    const prismaBlockTypes = Object.values(BlockType)
    const oldTypes = ['HEADING1', 'HEADING2', 'HEADING3', 'PARAGRAPH', 'BULLET']

    oldTypes.forEach((type) => {
      expect(prismaBlockTypes).not.toContain(type)
    })
  })
})
