import { BlockType } from '../contexts/EditorContext'

export interface BlockMarkdownPattern {
  pattern: RegExp
  blockType: BlockType
  prefix: string
}

// Define block-level markdown patterns
const blockMarkdownPatterns: BlockMarkdownPattern[] = [
  {
    pattern: /^# /,
    blockType: 'h1',
    prefix: '# ',
  },
  {
    pattern: /^## /,
    blockType: 'h2',
    prefix: '## ',
  },
  {
    pattern: /^### /,
    blockType: 'h3',
    prefix: '### ',
  },
  {
    pattern: /^- /,
    blockType: 'bullet',
    prefix: '- ',
  },
  {
    pattern: /^\* /,
    blockType: 'bullet',
    prefix: '* ',
  },
]

/**
 * Checks if the block content should be converted to a different block type
 * based on markdown syntax at the beginning of the block
 */
export function detectBlockMarkdown(content: string): BlockMarkdownPattern | null {
  for (const pattern of blockMarkdownPatterns) {
    if (pattern.pattern.test(content)) {
      return pattern
    }
  }
  return null
}

/**
 * Removes the markdown prefix from the content
 */
export function removeMarkdownPrefix(content: string, pattern: BlockMarkdownPattern): string {
  return content.replace(pattern.pattern, '')
}

/**
 * Checks if we should trigger block markdown conversion
 * This happens when user types a space after markdown syntax at the start of a block
 */
export function shouldConvertBlockMarkdown(content: string, cursorPosition: number, typedChar: string): BlockMarkdownPattern | null {
  // Only trigger on space character
  if (typedChar !== ' ') return null

  // Check if cursor is at a position where markdown pattern would be complete
  // For example, after typing "# " cursor would be at position 2
  const contentBeforeCursor = content.slice(0, cursorPosition)

  for (const pattern of blockMarkdownPatterns) {
    if (contentBeforeCursor === pattern.prefix) {
      return pattern
    }
  }

  return null
}
