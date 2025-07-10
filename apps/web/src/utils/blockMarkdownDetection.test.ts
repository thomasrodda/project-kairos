import { detectBlockMarkdown, removeMarkdownPrefix, shouldConvertBlockMarkdown } from './blockMarkdownDetection'

describe('blockMarkdownDetection', () => {
  describe('detectBlockMarkdown', () => {
    it('should detect H1 markdown pattern', () => {
      const result = detectBlockMarkdown('# Heading 1')
      expect(result).not.toBeNull()
      expect(result?.blockType).toBe('h1')
      expect(result?.prefix).toBe('# ')
    })

    it('should detect H2 markdown pattern', () => {
      const result = detectBlockMarkdown('## Heading 2')
      expect(result).not.toBeNull()
      expect(result?.blockType).toBe('h2')
      expect(result?.prefix).toBe('## ')
    })

    it('should detect H3 markdown pattern', () => {
      const result = detectBlockMarkdown('### Heading 3')
      expect(result).not.toBeNull()
      expect(result?.blockType).toBe('h3')
      expect(result?.prefix).toBe('### ')
    })

    it('should detect dash bullet pattern', () => {
      const result = detectBlockMarkdown('- Bullet item')
      expect(result).not.toBeNull()
      expect(result?.blockType).toBe('bullet')
      expect(result?.prefix).toBe('- ')
    })

    it('should detect asterisk bullet pattern', () => {
      const result = detectBlockMarkdown('* Bullet item')
      expect(result).not.toBeNull()
      expect(result?.blockType).toBe('bullet')
      expect(result?.prefix).toBe('* ')
    })

    it('should not detect patterns without space', () => {
      expect(detectBlockMarkdown('#Heading')).toBeNull()
      expect(detectBlockMarkdown('##Heading')).toBeNull()
      expect(detectBlockMarkdown('-Item')).toBeNull()
    })

    it('should not detect patterns in middle of text', () => {
      expect(detectBlockMarkdown('Some # text')).toBeNull()
      expect(detectBlockMarkdown('Some - text')).toBeNull()
    })
  })

  describe('removeMarkdownPrefix', () => {
    it('should remove H1 prefix', () => {
      const pattern = { pattern: /^# /, blockType: 'h1' as const, prefix: '# ' }
      expect(removeMarkdownPrefix('# Heading 1', pattern)).toBe('Heading 1')
    })

    it('should remove H2 prefix', () => {
      const pattern = { pattern: /^## /, blockType: 'h2' as const, prefix: '## ' }
      expect(removeMarkdownPrefix('## Heading 2', pattern)).toBe('Heading 2')
    })

    it('should remove bullet prefix', () => {
      const pattern = { pattern: /^- /, blockType: 'bullet' as const, prefix: '- ' }
      expect(removeMarkdownPrefix('- Bullet item', pattern)).toBe('Bullet item')
    })
  })

  describe('shouldConvertBlockMarkdown', () => {
    it('should trigger on space after H1 pattern', () => {
      const result = shouldConvertBlockMarkdown('# ', 2, ' ')
      expect(result).not.toBeNull()
      expect(result?.blockType).toBe('h1')
    })

    it('should trigger on space after H2 pattern', () => {
      const result = shouldConvertBlockMarkdown('## ', 3, ' ')
      expect(result).not.toBeNull()
      expect(result?.blockType).toBe('h2')
    })

    it('should trigger on space after H3 pattern', () => {
      const result = shouldConvertBlockMarkdown('### ', 4, ' ')
      expect(result).not.toBeNull()
      expect(result?.blockType).toBe('h3')
    })

    it('should trigger on space after dash bullet pattern', () => {
      const result = shouldConvertBlockMarkdown('- ', 2, ' ')
      expect(result).not.toBeNull()
      expect(result?.blockType).toBe('bullet')
    })

    it('should trigger on space after asterisk bullet pattern', () => {
      const result = shouldConvertBlockMarkdown('* ', 2, ' ')
      expect(result).not.toBeNull()
      expect(result?.blockType).toBe('bullet')
    })

    it('should not trigger on non-space character', () => {
      expect(shouldConvertBlockMarkdown('#a', 2, 'a')).toBeNull()
      expect(shouldConvertBlockMarkdown('-x', 2, 'x')).toBeNull()
    })

    it('should not trigger when cursor is not at expected position', () => {
      expect(shouldConvertBlockMarkdown('# ', 1, ' ')).toBeNull()
      expect(shouldConvertBlockMarkdown('## ', 2, ' ')).toBeNull()
    })

    it('should not trigger for patterns in middle of text', () => {
      expect(shouldConvertBlockMarkdown('text # ', 7, ' ')).toBeNull()
      expect(shouldConvertBlockMarkdown('text - ', 7, ' ')).toBeNull()
    })
  })
})
