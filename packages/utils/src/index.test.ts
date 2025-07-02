// packages/utils/src/index.test.ts
import { generateId, formatDate, truncateText, createBlockId, createPageId, createWorkspaceId } from './index'

describe('Core Utilities', () => {
  describe('✅ generateId creates unique IDs', () => {
    it('should generate unique IDs on multiple calls', () => {
      const id1 = generateId()
      const id2 = generateId()
      const id3 = generateId()

      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(id1).not.toBe(id3)
    })

    it('should generate IDs with consistent format', () => {
      const id = generateId()

      // Should be alphanumeric (base36 characters)
      expect(id).toMatch(/^[a-z0-9]+$/)

      // Should have reasonable length
      expect(id.length).toBeGreaterThan(10)
    })

    it('should generate many unique IDs without collisions', () => {
      const ids = new Set()
      const count = 100

      for (let i = 0; i < count; i++) {
        ids.add(generateId())
      }

      // All IDs should be unique
      expect(ids.size).toBe(count)
    })
  })

  describe('✅ formatDate handles various dates correctly', () => {
    it('should format a standard date correctly', () => {
      const date = new Date('2024-03-15T10:30:00Z')
      const formatted = formatDate(date)

      expect(formatted).toBe('Mar 15, 2024')
    })

    it('should format different months correctly', () => {
      const january = new Date('2024-01-01T00:00:00Z')
      const december = new Date('2024-12-31T23:59:59Z')

      expect(formatDate(january)).toBe('Jan 1, 2024')
      expect(formatDate(december)).toBe('Dec 31, 2024')
    })

    it('should format dates from different years', () => {
      const date2020 = new Date('2020-06-15T12:00:00Z')
      const date2025 = new Date('2025-09-22T15:45:00Z')

      expect(formatDate(date2020)).toBe('Jun 15, 2020')
      expect(formatDate(date2025)).toBe('Sep 22, 2025')
    })

    it('should format dates consistently regardless of time', () => {
      const morning = new Date('2024-07-04T08:30:00Z')
      const evening = new Date('2024-07-04T20:30:00Z')

      expect(formatDate(morning)).toBe('Jul 4, 2024')
      expect(formatDate(evening)).toBe('Jul 4, 2024')
    })

    it('should handle invalid date gracefully', () => {
      const invalidDate = new Date('invalid-date-string')
      const result = formatDate(invalidDate)

      expect(result).toBe('Invalid Date')
    })
  })

  describe('✅ truncateText with various lengths', () => {
    const sampleText = 'This is a sample text for testing truncation functionality'

    it('should return original text when shorter than max length', () => {
      const result = truncateText(sampleText, 100)
      expect(result).toBe(sampleText)
    })

    it('should truncate text when longer than max length', () => {
      const result = truncateText(sampleText, 20)

      expect(result.length).toBeLessThanOrEqual(23) // 20 + '...'
      expect(result.endsWith('...')).toBe(true)
      expect(result).toContain('This is a sample')
    })

    it('should handle exact length match', () => {
      const exactText = 'Exactly twenty chars'
      const result = truncateText(exactText, 20)

      expect(result).toBe(exactText)
      expect(result.endsWith('...')).toBe(false)
    })

    it('should handle empty string', () => {
      const result = truncateText('', 10)
      expect(result).toBe('')
    })

    it('should handle very short max length', () => {
      const result = truncateText(sampleText, 5)

      expect(result.length).toBeLessThanOrEqual(8) // 5 + '...'
      expect(result.endsWith('...')).toBe(true)
      expect(result).toContain('This')
    })

    it('should trim whitespace before adding ellipsis', () => {
      const textWithSpaces = 'Hello world   with spaces   '
      const result = truncateText(textWithSpaces, 12)

      // Should trim trailing space before adding ellipsis
      expect(result).toBe('Hello world...')
      expect(result).not.toContain('   ...')
    })

    it('should handle zero max length', () => {
      const result = truncateText(sampleText, 0)
      expect(result).toBe('...')
    })

    it('should handle negative max length gracefully', () => {
      const result = truncateText(sampleText, -5)
      expect(result).toBe('...')
    })
  })

  describe('✅ Block utility functions work correctly', () => {
    it('should create different types of IDs that are all unique', () => {
      const blockId = createBlockId()
      const pageId = createPageId()
      const workspaceId = createWorkspaceId()

      expect(blockId).not.toBe(pageId)
      expect(pageId).not.toBe(workspaceId)
      expect(blockId).not.toBe(workspaceId)
    })
  })

  describe('✅ Error Handling', () => {
    it('should handle special characters in truncateText', () => {
      const specialText = 'Hello! @#$%^&*()_+ 你好 🌟'
      const result = truncateText(specialText, 10)

      expect(result.length).toBeLessThanOrEqual(13) // 10 + '...'
      expect(result.endsWith('...')).toBe(true)
    })

    it('should handle very long text efficiently', () => {
      const veryLongText = 'a'.repeat(1000)
      const result = truncateText(veryLongText, 50)

      expect(result.length).toBeLessThanOrEqual(53) // 50 + '...'
      expect(result.endsWith('...')).toBe(true)
    })
  })
})
