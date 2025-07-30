/**
 * Markdown Converter
 *
 * Converts EditorBlock[] to Markdown format
 */

import { EditorBlock, TextFormat } from './types'

export class MarkdownConverter {
  /**
   * Convert editor blocks to Markdown
   */
  toMarkdown(blocks: EditorBlock[]): string {
    const lines: string[] = []
    let inList = false
    let listType: 'bullet' | 'numbered' | null = null

    blocks.forEach((block, index) => {
      // Add spacing between blocks (except lists)
      if (index > 0 && !inList && block.type !== 'bulletList' && block.type !== 'numberedList') {
        lines.push('')
      }

      // Handle list continuity
      if (block.type === 'bulletList' || block.type === 'numberedList') {
        const currentListType = block.type === 'bulletList' ? 'bullet' : 'numbered'
        if (!inList || listType !== currentListType) {
          if (inList) {
            lines.push('') // Add space between different list types
          }
          inList = true
          listType = currentListType
        }
      } else {
        if (inList) {
          lines.push('') // Add space after list
          inList = false
          listType = null
        }
      }

      // Convert block to markdown
      const markdown = this.blockToMarkdown(block)
      lines.push(markdown)
    })

    return lines.join('\n')
  }

  /**
   * Convert a single block to markdown
   */
  private blockToMarkdown(block: EditorBlock): string {
    const formattedContent = this.applyFormattingToMarkdown(block.content, block.textFormats || [])

    switch (block.type) {
      case 'heading1':
        return `# ${formattedContent}`
      case 'heading2':
        return `## ${formattedContent}`
      case 'heading3':
        return `### ${formattedContent}`
      case 'bulletList':
        return `- ${formattedContent}`
      case 'numberedList':
        return `1. ${formattedContent}` // Markdown will auto-number
      case 'quote':
        return `> ${formattedContent}`
      case 'code':
        // For code blocks, use triple backticks
        return '```\n' + block.content + '\n```'
      case 'paragraph':
      default:
        return formattedContent
    }
  }

  /**
   * Apply text formatting to content for markdown
   */
  private applyFormattingToMarkdown(content: string, formats: TextFormat[]): string {
    if (formats.length === 0) {
      return content
    }

    // Sort formats by start position
    const sortedFormats = [...formats].sort((a, b) => a.start - b.start)

    // Build a map of positions to formatting markers
    const markers: Map<number, string[]> = new Map()

    sortedFormats.forEach((format) => {
      const startMarkers = markers.get(format.start) || []
      const endMarkers = markers.get(format.end) || []

      switch (format.type) {
        case 'bold':
          startMarkers.push('**')
          endMarkers.unshift('**')
          break
        case 'italic':
          startMarkers.push('*')
          endMarkers.unshift('*')
          break
        case 'underline':
          // Markdown doesn't have native underline, use HTML
          startMarkers.push('<u>')
          endMarkers.unshift('</u>')
          break
        case 'code':
          startMarkers.push('`')
          endMarkers.unshift('`')
          break
        case 'link':
          startMarkers.push('[')
          endMarkers.unshift(`](${format.data?.href || '#'})`)
          break
      }

      markers.set(format.start, startMarkers)
      markers.set(format.end, endMarkers)
    })

    // Build the result string
    let result = ''
    let lastPos = 0

    // Get all positions in order
    const positions = Array.from(markers.keys()).sort((a, b) => a - b)

    positions.forEach((pos) => {
      // Add text up to this position
      if (pos > lastPos) {
        result += content.slice(lastPos, pos)
      }

      // Add markers at this position
      const posMarkers = markers.get(pos) || []
      result += posMarkers.join('')

      lastPos = pos
    })

    // Add any remaining text
    if (lastPos < content.length) {
      result += content.slice(lastPos)
    }

    return result
  }
}
