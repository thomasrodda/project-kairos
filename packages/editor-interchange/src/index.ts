/**
 * Editor Interchange Package
 *
 * Provides HTML/JSON conversion for the Kairos editor
 */

import { HTMLConverter } from './html-converter'
import { MarkdownConverter } from './markdown-converter'
import { FormatDetector } from './format-detector'
import { EditorBlock, ConversionOptions, EditorInterchange as IEditorInterchange } from './types'

export * from './types'

/**
 * Main implementation of the EditorInterchange interface
 */
export class EditorInterchange implements IEditorInterchange {
  private htmlConverter: HTMLConverter
  private markdownConverter: MarkdownConverter
  private formatDetector: FormatDetector

  constructor() {
    this.htmlConverter = new HTMLConverter()
    this.markdownConverter = new MarkdownConverter()
    this.formatDetector = new FormatDetector()
  }

  /**
   * Convert editor blocks to HTML
   */
  toHTML(blocks: EditorBlock[], options?: ConversionOptions): string {
    return this.htmlConverter.toHTML(blocks, options)
  }

  /**
   * Parse HTML into editor blocks
   */
  fromHTML(html: string, options?: ConversionOptions): EditorBlock[] {
    return this.htmlConverter.fromHTML(html, options)
  }

  /**
   * Convert editor blocks to Markdown
   */
  toMarkdown(blocks: EditorBlock[]): string {
    return this.markdownConverter.toMarkdown(blocks)
  }

  /**
   * Detect content format
   */
  detectFormat(content: string): 'html' | 'markdown' | 'plain' {
    return this.formatDetector.detectFormat(content)
  }
}

// Export a singleton instance for convenience
export const editorInterchange = new EditorInterchange()

// Also export the individual converters for advanced usage
export { HTMLConverter, MarkdownConverter, FormatDetector }
