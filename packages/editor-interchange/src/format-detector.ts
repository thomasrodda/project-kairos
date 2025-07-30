/**
 * Format Detector
 *
 * Detects whether content is HTML, Markdown, or plain text
 */

export class FormatDetector {
  /**
   * Detect the format of the given content
   */
  detectFormat(content: string): 'html' | 'markdown' | 'plain' {
    const trimmed = content.trim()

    // Check for HTML
    if (this.isHTML(trimmed)) {
      return 'html'
    }

    // Check for Markdown
    if (this.isMarkdown(trimmed)) {
      return 'markdown'
    }

    // Default to plain text
    return 'plain'
  }

  /**
   * Check if content appears to be HTML
   */
  private isHTML(content: string): boolean {
    // Check for common HTML patterns
    const htmlPatterns = [
      /<\/?[a-z][\s\S]*>/i, // HTML tags
      /&[a-z]+;/i, // HTML entities
      /<!\[CDATA\[[\s\S]*?\]\]>/, // CDATA sections
      /<!DOCTYPE\s+html/i, // DOCTYPE
    ]

    return htmlPatterns.some((pattern) => pattern.test(content))
  }

  /**
   * Check if content appears to be Markdown
   */
  private isMarkdown(content: string): boolean {
    const lines = content.split('\n')
    let markdownIndicators = 0

    // Check for markdown patterns
    const markdownPatterns = [
      /^#{1,6}\s+.+/, // Headers
      /^\s*[-*+]\s+.+/, // Unordered lists
      /^\s*\d+\.\s+.+/, // Ordered lists
      /^\s*>\s+.+/, // Blockquotes
      /```[\s\S]*?```/, // Code blocks
      /\[.+\]\(.+\)/, // Links
      /!\[.+\]\(.+\)/, // Images
      /\*\*.+\*\*/, // Bold
      /\*.+\*/, // Italic
      /~~.+~~/, // Strikethrough
      /`[^`]+`/, // Inline code
    ]

    // Count markdown indicators
    lines.forEach((line) => {
      markdownPatterns.forEach((pattern) => {
        if (pattern.test(line)) {
          markdownIndicators++
        }
      })
    })

    // If we found at least 2 markdown indicators, consider it markdown
    return markdownIndicators >= 2
  }
}
