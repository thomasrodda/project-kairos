/**
 * Type definitions for the editor-interchange package
 *
 * These types are independent of the main editor to ensure
 * the package has zero dependencies on existing code.
 */

export interface TextFormat {
  type: 'bold' | 'italic' | 'underline' | 'code' | 'link'
  start: number
  end: number
  data?: { href?: string }
}

export interface EditorBlock {
  id: string
  type: BlockType
  content: string
  metadata?: Record<string, any>
  textFormats?: TextFormat[]
  createdAt?: string
  updatedAt?: string
  version?: number
}

export type BlockType = 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'quote' | 'code'

export interface ConversionOptions {
  /**
   * Whether to preserve Kairos-specific metadata in data attributes
   */
  preserveMetadata?: boolean

  /**
   * Whether to sanitize HTML to prevent XSS
   */
  sanitize?: boolean

  /**
   * Custom class prefix for generated HTML
   */
  classPrefix?: string
}

export interface ConversionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Main interface for HTML/JSON conversion
 */
export interface EditorInterchange {
  /**
   * Convert editor blocks to HTML
   */
  toHTML(blocks: EditorBlock[], options?: ConversionOptions): string

  /**
   * Parse HTML into editor blocks
   */
  fromHTML(html: string, options?: ConversionOptions): EditorBlock[]

  /**
   * Convert editor blocks to Markdown
   */
  toMarkdown(blocks: EditorBlock[]): string

  /**
   * Detect content format
   */
  detectFormat(content: string): 'html' | 'markdown' | 'plain'
}
