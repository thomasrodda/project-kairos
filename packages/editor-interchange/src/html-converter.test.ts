/**
 * Tests for HTML Converter
 */

import { HTMLConverter } from './html-converter'
import { EditorBlock } from './types'

describe('HTMLConverter', () => {
  let converter: HTMLConverter

  beforeEach(() => {
    converter = new HTMLConverter()
  })

  describe('toHTML', () => {
    test('converts paragraph block to <p> tag', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'This is a paragraph',
        },
      ]

      const html = converter.toHTML(blocks)
      expect(html).toContain('<p class="kairos-paragraph"')
      expect(html).toContain('This is a paragraph</p>')
    })

    test('converts heading blocks to appropriate tags', () => {
      const blocks: EditorBlock[] = [
        { id: 'h1', type: 'heading1', content: 'Heading 1' },
        { id: 'h2', type: 'heading2', content: 'Heading 2' },
        { id: 'h3', type: 'heading3', content: 'Heading 3' },
      ]

      const html = converter.toHTML(blocks)
      expect(html).toContain('<h1 class="kairos-heading1"')
      expect(html).toContain('Heading 1</h1>')
      expect(html).toContain('<h2 class="kairos-heading2"')
      expect(html).toContain('Heading 2</h2>')
      expect(html).toContain('<h3 class="kairos-heading3"')
      expect(html).toContain('Heading 3</h3>')
    })

    test('groups bullet list items in <ul>', () => {
      const blocks: EditorBlock[] = [
        { id: 'li1', type: 'bulletList', content: 'First item' },
        { id: 'li2', type: 'bulletList', content: 'Second item' },
        { id: 'li3', type: 'bulletList', content: 'Third item' },
      ]

      const html = converter.toHTML(blocks)
      expect(html).toContain('<ul class="kairos-list">')
      expect(html).toContain('<li class="kairos-bulletList"')
      expect(html.match(/<li/g)?.length).toBe(3)
      expect(html.match(/<ul/g)?.length).toBe(1)
    })

    test('converts quote blocks to <blockquote>', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'quote-1',
          type: 'quote',
          content: 'This is a quote',
        },
      ]

      const html = converter.toHTML(blocks)
      expect(html).toContain('<blockquote class="kairos-quote"')
      expect(html).toContain('This is a quote</blockquote>')
    })

    test('converts code blocks to <pre><code>', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'code-1',
          type: 'code',
          content: 'const hello = "world";',
        },
      ]

      const html = converter.toHTML(blocks)
      expect(html).toContain('<pre class="kairos-code"')
      expect(html).toContain('<code>')
      expect(html).toContain('const hello = "world";</code>')
    })

    test('preserves metadata when enabled', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'block-123',
          type: 'paragraph',
          content: 'Test',
          createdAt: '2025-07-30T10:00:00Z',
          version: 1,
        },
      ]

      const html = converter.toHTML(blocks, { preserveMetadata: true })
      expect(html).toContain('data-kairos-id="block-123"')
      expect(html).toContain('data-kairos-type="paragraph"')
      expect(html).toContain('data-kairos-created="2025-07-30T10:00:00Z"')
      expect(html).toContain('data-kairos-version="1"')
    })

    test('applies bold formatting', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'This is bold text',
          textFormats: [{ type: 'bold', start: 8, end: 12 }],
        },
      ]

      const html = converter.toHTML(blocks)
      expect(html).toContain('This is <strong>bold</strong> text')
    })

    test('applies italic formatting', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'This is italic text',
          textFormats: [{ type: 'italic', start: 8, end: 14 }],
        },
      ]

      const html = converter.toHTML(blocks)
      expect(html).toContain('This is <em>italic</em> text')
    })

    test('applies link formatting', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'This is a link to Google',
          textFormats: [
            {
              type: 'link',
              start: 10,
              end: 14,
              data: { href: 'https://google.com' },
            },
          ],
        },
      ]

      const html = converter.toHTML(blocks)
      expect(html).toContain('This is a <a href="https://google.com">link</a> to Google')
    })

    test('applies multiple formatting to same text', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'This is bold italic text',
          textFormats: [
            { type: 'bold', start: 8, end: 19 },
            { type: 'italic', start: 8, end: 19 },
          ],
        },
      ]

      const html = converter.toHTML(blocks)
      expect(html).toContain('<strong><em>bold italic</em></strong>')
    })

    test('handles overlapping formatting', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'This is bold and italic text',
          textFormats: [
            { type: 'bold', start: 8, end: 16 }, // "bold and"
            { type: 'italic', start: 13, end: 23 }, // "and italic"
          ],
        },
      ]

      const html = converter.toHTML(blocks)
      // Should handle overlapping formats correctly
      expect(html).toContain('bold')
      expect(html).toContain('italic')
    })

    test('escapes HTML characters in content', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'This has <script>alert("XSS")</script> tags',
        },
      ]

      const html = converter.toHTML(blocks)
      expect(html).not.toContain('<script>')
      expect(html).toContain('&lt;script&gt;')
    })

    test('handles empty blocks', () => {
      const blocks: EditorBlock[] = [
        {
          id: 'block-1',
          type: 'paragraph',
          content: '',
        },
      ]

      const html = converter.toHTML(blocks)
      expect(html).toContain('<p class="kairos-paragraph"')
      expect(html).toMatch(/<p[^>]*><\/p>/)
    })

    test('separates different list types', () => {
      const blocks: EditorBlock[] = [
        { id: 'ul1', type: 'bulletList', content: 'Bullet 1' },
        { id: 'ul2', type: 'bulletList', content: 'Bullet 2' },
        { id: 'ol1', type: 'numberedList', content: 'Number 1' },
        { id: 'ol2', type: 'numberedList', content: 'Number 2' },
        { id: 'ul3', type: 'bulletList', content: 'Bullet 3' },
      ]

      const html = converter.toHTML(blocks)
      expect(html.match(/<ul/g)?.length).toBe(2) // Two separate UL elements
      expect(html.match(/<ol/g)?.length).toBe(1) // One OL element
    })
  })

  describe('fromHTML', () => {
    test('parses paragraph from <p> tag', () => {
      const html = '<p>This is a paragraph</p>'
      const blocks = converter.fromHTML(html)

      expect(blocks).toHaveLength(1)
      expect(blocks[0].type).toBe('paragraph')
      expect(blocks[0].content).toBe('This is a paragraph')
    })

    test('parses headings from <h1-h3> tags', () => {
      const html = '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>'
      const blocks = converter.fromHTML(html)

      expect(blocks).toHaveLength(3)
      expect(blocks[0].type).toBe('heading1')
      expect(blocks[0].content).toBe('Heading 1')
      expect(blocks[1].type).toBe('heading2')
      expect(blocks[1].content).toBe('Heading 2')
      expect(blocks[2].type).toBe('heading3')
      expect(blocks[2].content).toBe('Heading 3')
    })

    test('parses bullet lists from <ul><li>', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
      const blocks = converter.fromHTML(html)

      expect(blocks).toHaveLength(2)
      expect(blocks[0].type).toBe('bulletList')
      expect(blocks[0].content).toBe('Item 1')
      expect(blocks[1].type).toBe('bulletList')
      expect(blocks[1].content).toBe('Item 2')
    })

    test('parses numbered lists from <ol><li>', () => {
      const html = '<ol><li>Item 1</li><li>Item 2</li></ol>'
      const blocks = converter.fromHTML(html)

      expect(blocks).toHaveLength(2)
      expect(blocks[0].type).toBe('numberedList')
      expect(blocks[1].type).toBe('numberedList')
    })

    test('parses bold formatting from <strong>', () => {
      const html = '<p>This is <strong>bold</strong> text</p>'
      const blocks = converter.fromHTML(html)

      expect(blocks[0].content).toBe('This is bold text')
      expect(blocks[0].textFormats).toHaveLength(1)
      expect(blocks[0].textFormats![0]).toMatchObject({
        type: 'bold',
        start: 8,
        end: 12,
      })
    })

    test('parses italic formatting from <em>', () => {
      const html = '<p>This is <em>italic</em> text</p>'
      const blocks = converter.fromHTML(html)

      expect(blocks[0].content).toBe('This is italic text')
      expect(blocks[0].textFormats).toHaveLength(1)
      expect(blocks[0].textFormats![0]).toMatchObject({
        type: 'italic',
        start: 8,
        end: 14,
      })
    })

    test('parses links from <a> tags', () => {
      const html = '<p>This is a <a href="https://example.com">link</a> text</p>'
      const blocks = converter.fromHTML(html)

      expect(blocks[0].content).toBe('This is a link text')
      expect(blocks[0].textFormats).toHaveLength(1)
      expect(blocks[0].textFormats![0]).toMatchObject({
        type: 'link',
        start: 10,
        end: 14,
        data: { href: 'https://example.com' },
      })
    })

    test('preserves metadata from data attributes', () => {
      const html = '<p data-kairos-id="block-123" data-kairos-created="2025-07-30T10:00:00Z">Test</p>'
      const blocks = converter.fromHTML(html)

      expect(blocks[0].id).toBe('block-123')
      expect(blocks[0].createdAt).toBe('2025-07-30T10:00:00Z')
    })

    test('handles nested formatting', () => {
      const html = '<p>This is <strong><em>bold and italic</em></strong> text</p>'
      const blocks = converter.fromHTML(html)

      expect(blocks[0].textFormats).toHaveLength(2)
      const formats = blocks[0].textFormats!.sort((a, b) => a.type.localeCompare(b.type))
      expect(formats[0].type).toBe('bold')
      expect(formats[1].type).toBe('italic')
    })

    test('sanitizes malicious HTML', () => {
      const html = '<p>Safe text</p><script>alert("XSS")</script><p>More text</p>'
      const blocks = converter.fromHTML(html)

      expect(blocks).toHaveLength(2)
      expect(blocks[0].content).toBe('Safe text')
      expect(blocks[1].content).toBe('More text')
      // Script tag should be removed
    })

    test('handles empty elements', () => {
      const html = '<p></p><p>Content</p><p></p>'
      const blocks = converter.fromHTML(html)

      expect(blocks).toHaveLength(3)
      expect(blocks[0].content).toBe('')
      expect(blocks[1].content).toBe('Content')
      expect(blocks[2].content).toBe('')
    })
  })

  describe('round-trip conversion', () => {
    test('maintains data integrity through HTML conversion', () => {
      const originalBlocks: EditorBlock[] = [
        {
          id: 'block-1',
          type: 'heading1',
          content: 'Main Title',
        },
        {
          id: 'block-2',
          type: 'paragraph',
          content: 'This has bold and italic text',
          textFormats: [
            { type: 'bold', start: 9, end: 13 },
            { type: 'italic', start: 18, end: 24 },
          ],
        },
        {
          id: 'block-3',
          type: 'bulletList',
          content: 'First item with a link',
          textFormats: [{ type: 'link', start: 17, end: 21, data: { href: 'https://example.com' } }],
        },
      ]

      const html = converter.toHTML(originalBlocks)
      const parsedBlocks = converter.fromHTML(html)

      expect(parsedBlocks).toHaveLength(3)

      // Check block types
      expect(parsedBlocks[0].type).toBe('heading1')
      expect(parsedBlocks[1].type).toBe('paragraph')
      expect(parsedBlocks[2].type).toBe('bulletList')

      // Check content
      expect(parsedBlocks[0].content).toBe('Main Title')
      expect(parsedBlocks[1].content).toBe('This has bold and italic text')
      expect(parsedBlocks[2].content).toBe('First item with a link')

      // Check formatting
      expect(parsedBlocks[1].textFormats).toHaveLength(2)
      expect(parsedBlocks[2].textFormats).toHaveLength(1)
      expect(parsedBlocks[2].textFormats![0].data?.href).toBe('https://example.com')
    })
  })
})
