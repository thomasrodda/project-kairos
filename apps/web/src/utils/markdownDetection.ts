import { FormatType } from '../contexts/EditorContext'

export interface SelectionRange {
  start: number
  end: number
}

export interface MarkdownPattern {
  pattern: RegExp
  format: FormatType
  startLength: number
  endLength: number
}

export interface DetectedMarkdown {
  format: FormatType
  startOffset: number
  endOffset: number
  originalStart: number
  originalEnd: number
  startMarkdownLength: number
  endMarkdownLength: number
}

export const markdownPatterns: MarkdownPattern[] = [
  {
    pattern: /\*\*([^*]+)\*\*/g,
    format: 'bold',
    startLength: 2,
    endLength: 2,
  },
  {
    pattern: /(?<!\*)(?<!\w)\*([^*]+)\*(?!\*)(?!\w)/g,
    format: 'italic',
    startLength: 1,
    endLength: 1,
  },
  {
    pattern: /~~([^~]+)~~/g,
    format: 'strikethrough',
    startLength: 2,
    endLength: 2,
  },
  {
    pattern: /`([^`]+)`/g,
    format: 'code',
    startLength: 1,
    endLength: 1,
  },
  {
    pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
    format: 'link',
    startLength: 1,
    endLength: 1,
  },
]

export function detectMarkdownPatterns(text: string): DetectedMarkdown[] {
  const detectedPatterns: DetectedMarkdown[] = []

  for (const { pattern, format, startLength, endLength } of markdownPatterns) {
    let match
    pattern.lastIndex = 0

    while ((match = pattern.exec(text)) !== null) {
      if (format === 'link') {
        const linkText = match[1]
        const linkUrl = match[2]
        detectedPatterns.push({
          format,
          startOffset: match.index + 1,
          endOffset: match.index + 1 + linkText.length,
          originalStart: match.index,
          originalEnd: match.index + match[0].length,
          startMarkdownLength: 1,
          endMarkdownLength: linkUrl.length + 3,
        })
      } else {
        const content = match[1]
        detectedPatterns.push({
          format,
          startOffset: match.index + startLength,
          endOffset: match.index + startLength + content.length,
          originalStart: match.index,
          originalEnd: match.index + match[0].length,
          startMarkdownLength: startLength,
          endMarkdownLength: endLength,
        })
      }
    }
  }

  return detectedPatterns.sort((a, b) => a.originalStart - b.originalStart)
}

export function findMarkdownAtCursor(text: string, cursorPosition: number): DetectedMarkdown | null {
  const patterns = detectMarkdownPatterns(text)

  for (const pattern of patterns) {
    if (cursorPosition >= pattern.originalStart && cursorPosition <= pattern.originalEnd) {
      return pattern
    }
  }

  return null
}

export function shouldConvertMarkdown(text: string, cursorPosition: number, lastChar: string): DetectedMarkdown | null {
  if (lastChar === '*' || lastChar === '~' || lastChar === '`' || lastChar === ')') {
    const pattern = findMarkdownAtCursor(text, cursorPosition - 1)
    if (pattern && cursorPosition === pattern.originalEnd) {
      return pattern
    }
  }

  return null
}

export function convertMarkdownToFormatting(
  text: string,
  pattern: DetectedMarkdown
): { newText: string; newCursorPosition: number; format: FormatType; range: SelectionRange } {
  const before = text.slice(0, pattern.originalStart)
  const content = text.slice(pattern.startOffset, pattern.endOffset)
  const after = text.slice(pattern.originalEnd)

  const newText = before + content + after
  const newCursorPosition = pattern.originalStart + content.length

  return {
    newText,
    newCursorPosition,
    format: pattern.format,
    range: {
      start: pattern.originalStart,
      end: pattern.originalStart + content.length,
    },
  }
}

export function extractLinkUrl(text: string, startOffset: number): string | undefined {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
  let match

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index === startOffset - 1) {
      return match[2]
    }
  }

  return undefined
}

export function adjustCursorForMarkdownRemoval(originalCursor: number, pattern: DetectedMarkdown): number {
  if (originalCursor <= pattern.originalStart) {
    return originalCursor
  }

  if (originalCursor >= pattern.originalEnd) {
    const totalMarkdownLength = pattern.startMarkdownLength + pattern.endMarkdownLength
    return originalCursor - totalMarkdownLength
  }

  if (originalCursor <= pattern.startOffset) {
    return pattern.originalStart
  }

  if (originalCursor >= pattern.endOffset) {
    return pattern.originalStart + (pattern.endOffset - pattern.startOffset)
  }

  return pattern.originalStart + (originalCursor - pattern.startOffset)
}
