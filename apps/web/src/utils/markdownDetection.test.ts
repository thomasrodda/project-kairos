import {
  detectMarkdownPatterns,
  findMarkdownAtCursor,
  shouldConvertMarkdown,
  convertMarkdownToFormatting,
  extractLinkUrl,
  adjustCursorForMarkdownRemoval,
  DetectedMarkdown,
} from './markdownDetection'

describe('markdownDetection', () => {
  describe('detectMarkdownPatterns', () => {
    it('should detect bold markdown', () => {
      const text = 'This is **bold** text'
      const patterns = detectMarkdownPatterns(text)

      expect(patterns).toHaveLength(1)
      expect(patterns[0]).toEqual({
        format: 'bold',
        startOffset: 10,
        endOffset: 14,
        originalStart: 8,
        originalEnd: 16,
        startMarkdownLength: 2,
        endMarkdownLength: 2,
      })
    })

    it('should detect italic markdown', () => {
      const text = 'This is *italic* text'
      const patterns = detectMarkdownPatterns(text)

      expect(patterns).toHaveLength(1)
      expect(patterns[0]).toEqual({
        format: 'italic',
        startOffset: 9,
        endOffset: 15,
        originalStart: 8,
        originalEnd: 16,
        startMarkdownLength: 1,
        endMarkdownLength: 1,
      })
    })

    it('should detect strikethrough markdown', () => {
      const text = 'This is ~~strikethrough~~ text'
      const patterns = detectMarkdownPatterns(text)

      expect(patterns).toHaveLength(1)
      expect(patterns[0]).toEqual({
        format: 'strikethrough',
        startOffset: 10,
        endOffset: 23,
        originalStart: 8,
        originalEnd: 25,
        startMarkdownLength: 2,
        endMarkdownLength: 2,
      })
    })

    it('should detect code markdown', () => {
      const text = 'This is `code` text'
      const patterns = detectMarkdownPatterns(text)

      expect(patterns).toHaveLength(1)
      expect(patterns[0]).toEqual({
        format: 'code',
        startOffset: 9,
        endOffset: 13,
        originalStart: 8,
        originalEnd: 14,
        startMarkdownLength: 1,
        endMarkdownLength: 1,
      })
    })

    it('should detect link markdown', () => {
      const text = 'This is [a link](https://example.com) text'
      const patterns = detectMarkdownPatterns(text)

      expect(patterns).toHaveLength(1)
      expect(patterns[0]).toEqual({
        format: 'link',
        startOffset: 9,
        endOffset: 15,
        originalStart: 8,
        originalEnd: 37,
        startMarkdownLength: 1,
        endMarkdownLength: 22,
      })
    })

    it('should detect multiple patterns', () => {
      const text = '**Bold** and *italic* and `code`'
      const patterns = detectMarkdownPatterns(text)

      expect(patterns).toHaveLength(3)
      expect(patterns[0].format).toBe('bold')
      expect(patterns[1].format).toBe('italic')
      expect(patterns[2].format).toBe('code')
    })

    it('should not detect incomplete patterns', () => {
      const text = '**Bold* and *italic and `code'
      const patterns = detectMarkdownPatterns(text)

      // The * in **Bold* will be detected as italic
      expect(patterns).toHaveLength(0)
    })

    it('should not detect asterisks in the middle of words', () => {
      const text = 'test*not*italic but *this is* italic'
      const patterns = detectMarkdownPatterns(text)

      expect(patterns).toHaveLength(1)
      expect(patterns[0].format).toBe('italic')
      expect(patterns[0].originalStart).toBe(20)
    })
  })

  describe('findMarkdownAtCursor', () => {
    it('should find pattern at cursor position', () => {
      const text = 'This is **bold** text'
      const pattern = findMarkdownAtCursor(text, 12)

      expect(pattern).not.toBeNull()
      expect(pattern?.format).toBe('bold')
    })

    it('should return null if no pattern at cursor', () => {
      const text = 'This is **bold** text'
      const pattern = findMarkdownAtCursor(text, 0)

      expect(pattern).toBeNull()
    })

    it('should find pattern at end of markdown', () => {
      const text = 'This is **bold** text'
      const pattern = findMarkdownAtCursor(text, 16)

      expect(pattern).not.toBeNull()
      expect(pattern?.format).toBe('bold')
    })
  })

  describe('shouldConvertMarkdown', () => {
    it('should detect completed bold pattern', () => {
      const text = 'This is **bold**'
      const pattern = shouldConvertMarkdown(text, 16, '*')

      expect(pattern).not.toBeNull()
      expect(pattern?.format).toBe('bold')
    })

    it('should detect completed italic pattern', () => {
      const text = 'This is *italic*'
      const pattern = shouldConvertMarkdown(text, 16, '*')

      expect(pattern).not.toBeNull()
      expect(pattern?.format).toBe('italic')
    })

    it('should detect completed strikethrough pattern', () => {
      const text = 'This is ~~strikethrough~~'
      const pattern = shouldConvertMarkdown(text, 25, '~')

      expect(pattern).not.toBeNull()
      expect(pattern?.format).toBe('strikethrough')
    })

    it('should detect completed code pattern', () => {
      const text = 'This is `code`'
      const pattern = shouldConvertMarkdown(text, 14, '`')

      expect(pattern).not.toBeNull()
      expect(pattern?.format).toBe('code')
    })

    it('should detect completed link pattern', () => {
      const text = 'This is [link](url)'
      const pattern = shouldConvertMarkdown(text, 19, ')')

      expect(pattern).not.toBeNull()
      expect(pattern?.format).toBe('link')
    })

    it('should not convert incomplete patterns', () => {
      const text = 'This is **bold*'
      const pattern = shouldConvertMarkdown(text, 15, '*')

      expect(pattern).toBeNull()
    })

    it('should not convert when cursor is not at end', () => {
      const text = 'This is **bold**'
      const pattern = shouldConvertMarkdown(text, 10, '*')

      expect(pattern).toBeNull()
    })
  })

  describe('convertMarkdownToFormatting', () => {
    it('should convert bold markdown', () => {
      const text = 'This is **bold** text'
      const pattern: DetectedMarkdown = {
        format: 'bold',
        startOffset: 10,
        endOffset: 14,
        originalStart: 8,
        originalEnd: 16,
        startMarkdownLength: 2,
        endMarkdownLength: 2,
      }

      const result = convertMarkdownToFormatting(text, pattern)

      expect(result.newText).toBe('This is bold text')
      expect(result.newCursorPosition).toBe(12)
      expect(result.format).toBe('bold')
      expect(result.range).toEqual({ start: 8, end: 12 })
    })

    it('should convert italic markdown', () => {
      const text = 'This is *italic* text'
      const pattern: DetectedMarkdown = {
        format: 'italic',
        startOffset: 9,
        endOffset: 15,
        originalStart: 8,
        originalEnd: 16,
        startMarkdownLength: 1,
        endMarkdownLength: 1,
      }

      const result = convertMarkdownToFormatting(text, pattern)

      expect(result.newText).toBe('This is italic text')
      expect(result.newCursorPosition).toBe(14)
      expect(result.format).toBe('italic')
      expect(result.range).toEqual({ start: 8, end: 14 })
    })

    it('should convert link markdown', () => {
      const text = 'This is [a link](https://example.com) text'
      const pattern: DetectedMarkdown = {
        format: 'link',
        startOffset: 9,
        endOffset: 15,
        originalStart: 8,
        originalEnd: 37,
        startMarkdownLength: 1,
        endMarkdownLength: 22,
      }

      const result = convertMarkdownToFormatting(text, pattern)

      expect(result.newText).toBe('This is a link text')
      expect(result.newCursorPosition).toBe(14)
      expect(result.format).toBe('link')
      expect(result.range).toEqual({ start: 8, end: 14 })
    })
  })

  describe('extractLinkUrl', () => {
    it('should extract URL from link markdown', () => {
      const text = 'This is [a link](https://example.com) text'
      const url = extractLinkUrl(text, 9)

      expect(url).toBe('https://example.com')
    })

    it('should return undefined if no link at position', () => {
      const text = 'This is [a link](https://example.com) text'
      const url = extractLinkUrl(text, 0)

      expect(url).toBeUndefined()
    })

    it('should handle multiple links', () => {
      const text = '[first](url1) and [second](url2)'
      const url1 = extractLinkUrl(text, 1)
      const url2 = extractLinkUrl(text, 19)

      expect(url1).toBe('url1')
      expect(url2).toBe('url2')
    })
  })

  describe('adjustCursorForMarkdownRemoval', () => {
    const pattern: DetectedMarkdown = {
      format: 'bold',
      startOffset: 10,
      endOffset: 14,
      originalStart: 8,
      originalEnd: 16,
      startMarkdownLength: 2,
      endMarkdownLength: 2,
    }

    it('should not adjust cursor before pattern', () => {
      const adjusted = adjustCursorForMarkdownRemoval(5, pattern)
      expect(adjusted).toBe(5)
    })

    it('should adjust cursor after pattern', () => {
      const adjusted = adjustCursorForMarkdownRemoval(20, pattern)
      expect(adjusted).toBe(16)
    })

    it('should adjust cursor at start markdown', () => {
      const adjusted = adjustCursorForMarkdownRemoval(9, pattern)
      expect(adjusted).toBe(8)
    })

    it('should adjust cursor in content', () => {
      const adjusted = adjustCursorForMarkdownRemoval(12, pattern)
      expect(adjusted).toBe(10)
    })

    it('should adjust cursor at end markdown', () => {
      const adjusted = adjustCursorForMarkdownRemoval(15, pattern)
      expect(adjusted).toBe(12)
    })
  })
})
