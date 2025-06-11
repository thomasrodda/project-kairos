// apps/web/src/utils/textFormatting.test.ts
import {
  applyFormat,
  removeFormat,
  hasFormat,
  getFormatsAtPosition,
  mergeFormats,
  adjustFormatsAfterEdit,
  splitIntoSegments,
  isRangeFormatted,
  toggleFormat,
} from './textFormatting'
import { TextFormat, FormatType } from '../contexts/EditorContext'

describe('textFormatting utilities', () => {
  // ✅ applyFormat
  describe('applyFormat', () => {
    it('should apply formatting to an empty format list', () => {
      const result = applyFormat([], 0, 5, 'bold')
      expect(result).toEqual([{ start: 0, end: 5, type: 'bold' }])
    })

    it('should merge overlapping formats of the same type', () => {
      const existing: TextFormat[] = [{ start: 0, end: 5, type: 'bold' }]
      const result = applyFormat(existing, 3, 8, 'bold')
      expect(result).toEqual([{ start: 0, end: 8, type: 'bold' }])
    })

    it('should merge adjacent formats of the same type', () => {
      const existing: TextFormat[] = [{ start: 0, end: 5, type: 'bold' }]
      const result = applyFormat(existing, 5, 10, 'bold')
      expect(result).toEqual([{ start: 0, end: 10, type: 'bold' }])
    })

    it('should not merge formats of different types', () => {
      const existing: TextFormat[] = [{ start: 0, end: 5, type: 'bold' }]
      const result = applyFormat(existing, 3, 8, 'italic')
      expect(result).toHaveLength(2)
      expect(result).toContainEqual({ start: 0, end: 5, type: 'bold' })
      expect(result).toContainEqual({ start: 3, end: 8, type: 'italic' })
    })

    it('should handle link formatting with URL', () => {
      const result = applyFormat([], 0, 5, 'link', 'https://example.com')
      expect(result).toEqual([
        {
          start: 0,
          end: 5,
          type: 'link',
          url: 'https://example.com',
        },
      ])
    })

    it('should not apply format to empty range', () => {
      const result = applyFormat([], 5, 5, 'bold')
      expect(result).toEqual([])
    })

    it('should replace existing format of same type when overlapping', () => {
      const existing: TextFormat[] = [{ start: 5, end: 10, type: 'bold' }]
      const result = applyFormat(existing, 0, 15, 'bold')
      expect(result).toEqual([{ start: 0, end: 15, type: 'bold' }])
    })
  })

  // ✅ removeFormat
  describe('removeFormat', () => {
    it('should remove format completely within range', () => {
      const formats: TextFormat[] = [{ start: 5, end: 10, type: 'bold' }]
      const result = removeFormat(formats, 0, 15)
      expect(result).toEqual([])
    })

    it('should split format when removing from middle', () => {
      const formats: TextFormat[] = [{ start: 0, end: 10, type: 'bold' }]
      const result = removeFormat(formats, 3, 7)
      expect(result).toEqual([
        { start: 0, end: 3, type: 'bold' },
        { start: 7, end: 10, type: 'bold' },
      ])
    })

    it('should trim format when removing from start', () => {
      const formats: TextFormat[] = [{ start: 0, end: 10, type: 'bold' }]
      const result = removeFormat(formats, 0, 5)
      expect(result).toEqual([{ start: 5, end: 10, type: 'bold' }])
    })

    it('should trim format when removing from end', () => {
      const formats: TextFormat[] = [{ start: 0, end: 10, type: 'bold' }]
      const result = removeFormat(formats, 5, 10)
      expect(result).toEqual([{ start: 0, end: 5, type: 'bold' }])
    })

    it('should only remove specified format type when provided', () => {
      const formats: TextFormat[] = [
        { start: 0, end: 10, type: 'bold' },
        { start: 0, end: 10, type: 'italic' },
      ]
      const result = removeFormat(formats, 0, 10, 'bold')
      expect(result).toEqual([{ start: 0, end: 10, type: 'italic' }])
    })

    it('should keep formats outside removal range', () => {
      const formats: TextFormat[] = [
        { start: 0, end: 5, type: 'bold' },
        { start: 10, end: 15, type: 'bold' },
      ]
      const result = removeFormat(formats, 6, 9)
      expect(result).toEqual(formats)
    })
  })

  // ✅ hasFormat
  describe('hasFormat', () => {
    const formats: TextFormat[] = [
      { start: 0, end: 5, type: 'bold' },
      { start: 10, end: 15, type: 'italic' },
    ]

    it('should return true when position has the format', () => {
      expect(hasFormat(formats, 2, 'bold')).toBe(true)
      expect(hasFormat(formats, 12, 'italic')).toBe(true)
    })

    it('should return false when position does not have the format', () => {
      expect(hasFormat(formats, 7, 'bold')).toBe(false)
      expect(hasFormat(formats, 2, 'italic')).toBe(false)
    })

    it('should handle position at format boundaries', () => {
      expect(hasFormat(formats, 0, 'bold')).toBe(true) // Start inclusive
      expect(hasFormat(formats, 5, 'bold')).toBe(false) // End exclusive
    })
  })

  // ✅ getFormatsAtPosition
  describe('getFormatsAtPosition', () => {
    it('should return all formats at a position', () => {
      const formats: TextFormat[] = [
        { start: 0, end: 10, type: 'bold' },
        { start: 5, end: 15, type: 'italic' },
        { start: 5, end: 15, type: 'underline' },
      ]
      const result = getFormatsAtPosition(formats, 7)
      expect(result).toEqual(['bold', 'italic', 'underline'])
    })

    it('should return empty array when no formats at position', () => {
      const formats: TextFormat[] = [{ start: 0, end: 5, type: 'bold' }]
      const result = getFormatsAtPosition(formats, 10)
      expect(result).toEqual([])
    })
  })

  // ✅ mergeFormats
  describe('mergeFormats', () => {
    it('should merge adjacent formats of same type', () => {
      const formats: TextFormat[] = [
        { start: 0, end: 5, type: 'bold' },
        { start: 5, end: 10, type: 'bold' },
      ]
      const result = mergeFormats(formats)
      expect(result).toEqual([{ start: 0, end: 10, type: 'bold' }])
    })

    it('should merge overlapping formats of same type', () => {
      const formats: TextFormat[] = [
        { start: 0, end: 7, type: 'bold' },
        { start: 5, end: 10, type: 'bold' },
      ]
      const result = mergeFormats(formats)
      expect(result).toEqual([{ start: 0, end: 10, type: 'bold' }])
    })

    it('should not merge formats of different types', () => {
      const formats: TextFormat[] = [
        { start: 0, end: 5, type: 'bold' },
        { start: 5, end: 10, type: 'italic' },
      ]
      const result = mergeFormats(formats)
      expect(result).toHaveLength(2)
    })

    it('should not merge links with different URLs', () => {
      const formats: TextFormat[] = [
        { start: 0, end: 5, type: 'link', url: 'https://a.com' },
        { start: 5, end: 10, type: 'link', url: 'https://b.com' },
      ]
      const result = mergeFormats(formats)
      expect(result).toHaveLength(2)
    })

    it('should handle empty array', () => {
      expect(mergeFormats([])).toEqual([])
    })
  })

  // ✅ adjustFormatsAfterEdit
  describe('adjustFormatsAfterEdit', () => {
    it('should not affect formats before edit', () => {
      const formats: TextFormat[] = [{ start: 0, end: 5, type: 'bold' }]
      const result = adjustFormatsAfterEdit(formats, 10, 2, 5)
      expect(result).toEqual([{ start: 0, end: 5, type: 'bold' }])
    })

    it('should shift formats after edit', () => {
      const formats: TextFormat[] = [{ start: 10, end: 15, type: 'bold' }]
      const result = adjustFormatsAfterEdit(formats, 5, 2, 5) // Insert 3 chars
      expect(result).toEqual([{ start: 13, end: 18, type: 'bold' }])
    })

    it('should expand format containing edit', () => {
      const formats: TextFormat[] = [{ start: 0, end: 10, type: 'bold' }]
      const result = adjustFormatsAfterEdit(formats, 5, 0, 3) // Insert 3 chars
      expect(result).toEqual([{ start: 0, end: 13, type: 'bold' }])
    })

    it('should remove format within deleted range', () => {
      const formats: TextFormat[] = [{ start: 5, end: 8, type: 'bold' }]
      const result = adjustFormatsAfterEdit(formats, 4, 6, 0) // Delete 6 chars
      expect(result).toEqual([])
    })

    it('should trim format ending in deleted range', () => {
      const formats: TextFormat[] = [{ start: 0, end: 8, type: 'bold' }]
      const result = adjustFormatsAfterEdit(formats, 5, 5, 0)
      expect(result).toEqual([{ start: 0, end: 5, type: 'bold' }])
    })

    it('should adjust format starting in deleted range', () => {
      const formats: TextFormat[] = [{ start: 7, end: 15, type: 'bold' }]
      const result = adjustFormatsAfterEdit(formats, 5, 5, 2) // Delete 5, insert 2
      expect(result).toEqual([{ start: 7, end: 12, type: 'bold' }])
    })
  })

  // ✅ splitIntoSegments
  describe('splitIntoSegments', () => {
    it('should return single segment for unformatted text', () => {
      const result = splitIntoSegments('hello world')
      expect(result).toEqual([
        {
          text: 'hello world',
          formats: [],
          start: 0,
          end: 11,
        },
      ])
    })

    it('should split text with single format', () => {
      const formatting: TextFormat[] = [{ start: 6, end: 11, type: 'bold' }]
      const result = splitIntoSegments('hello world', formatting)
      expect(result).toEqual([
        { text: 'hello ', formats: [], start: 0, end: 6 },
        { text: 'world', formats: ['bold'], start: 6, end: 11 },
      ])
    })

    it('should handle overlapping formats', () => {
      const formatting: TextFormat[] = [
        { start: 0, end: 10, type: 'bold' },
        { start: 5, end: 15, type: 'italic' },
      ]
      const result = splitIntoSegments('hello world test', formatting)
      expect(result).toEqual([
        { text: 'hello', formats: ['bold'], start: 0, end: 5 },
        { text: ' worl', formats: ['bold', 'italic'], start: 5, end: 10 },
        { text: 'd tes', formats: ['italic'], start: 10, end: 15 },
        { text: 't', formats: [], start: 15, end: 16 },
      ])
    })

    it('should remove duplicate format types', () => {
      const formatting: TextFormat[] = [
        { start: 0, end: 5, type: 'bold' },
        { start: 0, end: 5, type: 'bold' }, // Duplicate
      ]
      const result = splitIntoSegments('hello', formatting)
      expect(result).toEqual([{ text: 'hello', formats: ['bold'], start: 0, end: 5 }])
    })
  })

  // ✅ isRangeFormatted
  describe('isRangeFormatted', () => {
    it('should return true when range is fully formatted', () => {
      const formats: TextFormat[] = [{ start: 0, end: 10, type: 'bold' }]
      expect(isRangeFormatted(formats, 2, 8, 'bold')).toBe(true)
    })

    it('should return true when range is covered by multiple formats', () => {
      const formats: TextFormat[] = [
        { start: 0, end: 6, type: 'bold' },
        { start: 5, end: 10, type: 'bold' },
      ]
      expect(isRangeFormatted(formats, 2, 8, 'bold')).toBe(true)
    })

    it('should return false when range has gaps', () => {
      const formats: TextFormat[] = [
        { start: 0, end: 3, type: 'bold' },
        { start: 7, end: 10, type: 'bold' },
      ]
      expect(isRangeFormatted(formats, 0, 10, 'bold')).toBe(false)
    })

    it('should only consider specified format type', () => {
      const formats: TextFormat[] = [{ start: 0, end: 10, type: 'italic' }]
      expect(isRangeFormatted(formats, 2, 8, 'bold')).toBe(false)
    })
  })

  // ✅ toggleFormat
  describe('toggleFormat', () => {
    it('should apply format when range is not formatted', () => {
      const formats: TextFormat[] = []
      const result = toggleFormat(formats, 0, 5, 'bold')
      expect(result).toEqual([{ start: 0, end: 5, type: 'bold' }])
    })

    it('should remove format when range is fully formatted', () => {
      const formats: TextFormat[] = [{ start: 0, end: 10, type: 'bold' }]
      const result = toggleFormat(formats, 2, 8, 'bold')
      expect(result).toEqual([
        { start: 0, end: 2, type: 'bold' },
        { start: 8, end: 10, type: 'bold' },
      ])
    })

    it('should apply format when range is partially formatted', () => {
      const formats: TextFormat[] = [{ start: 0, end: 3, type: 'bold' }]
      const result = toggleFormat(formats, 0, 10, 'bold')
      expect(result).toEqual([{ start: 0, end: 10, type: 'bold' }])
    })

    it('should handle link toggling with URL', () => {
      const formats: TextFormat[] = []
      const result = toggleFormat(formats, 0, 5, 'link', 'https://example.com')
      expect(result).toEqual([
        {
          start: 0,
          end: 5,
          type: 'link',
          url: 'https://example.com',
        },
      ])
    })
  })
})
