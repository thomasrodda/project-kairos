/**
 * HTML Converter
 *
 * Converts between EditorBlock[] and HTML formats
 */

import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { EditorBlock, TextFormat, ConversionOptions, BlockType } from './types'

// Create a DOMPurify instance with jsdom for Node.js environment
const window = new JSDOM('').window
const purify = DOMPurify(window as any)

/**
 * Maps block types to HTML tags
 */
const BLOCK_TYPE_TO_TAG: Record<BlockType, string> = {
  paragraph: 'p',
  heading1: 'h1',
  heading2: 'h2',
  heading3: 'h3',
  bulletList: 'li',
  numberedList: 'li',
  quote: 'blockquote',
  code: 'pre',
}

/**
 * Maps HTML tags to block types
 */
const TAG_TO_BLOCK_TYPE: Record<string, BlockType> = {
  p: 'paragraph',
  h1: 'heading1',
  h2: 'heading2',
  h3: 'heading3',
  li: 'bulletList', // Will be refined based on parent
  blockquote: 'quote',
  pre: 'code',
}

export class HTMLConverter {
  /**
   * Convert editor blocks to HTML
   */
  toHTML(blocks: EditorBlock[], options: ConversionOptions = {}): string {
    const { preserveMetadata = true, sanitize = true, classPrefix = 'kairos' } = options

    const container = window.document.createElement('article')
    if (preserveMetadata) {
      container.setAttribute('data-kairos-document', 'true')
    }

    let currentList: HTMLElement | null = null
    let currentListType: 'ul' | 'ol' | null = null

    blocks.forEach((block) => {
      // Handle list grouping
      if (block.type === 'bulletList' || block.type === 'numberedList') {
        const listType = block.type === 'bulletList' ? 'ul' : 'ol'

        if (!currentList || currentListType !== listType) {
          currentList = window.document.createElement(listType)
          currentList.className = `${classPrefix}-list`
          container.appendChild(currentList)
          currentListType = listType
        }

        const listItem = this.createBlockElement(block, window, classPrefix, preserveMetadata)
        currentList.appendChild(listItem)
      } else {
        // End any current list
        currentList = null
        currentListType = null

        const element = this.createBlockElement(block, window, classPrefix, preserveMetadata)
        container.appendChild(element)
      }
    })

    const html = container.innerHTML

    return sanitize ? purify.sanitize(html) : html
  }

  /**
   * Parse HTML into editor blocks
   */
  fromHTML(html: string, options: ConversionOptions = {}): EditorBlock[] {
    const { sanitize = true } = options

    const cleanHTML = sanitize ? purify.sanitize(html) : html
    const container = window.document.createElement('div')
    container.innerHTML = cleanHTML

    const blocks: EditorBlock[] = []
    this.parseElement(container, blocks)

    return blocks
  }

  /**
   * Create an HTML element from a block
   */
  private createBlockElement(block: EditorBlock, window: any, classPrefix: string, preserveMetadata: boolean): HTMLElement {
    const tagName = BLOCK_TYPE_TO_TAG[block.type]
    const element = window.document.createElement(tagName)

    // Add classes
    element.className = `${classPrefix}-${block.type}`

    // Add metadata
    if (preserveMetadata) {
      element.setAttribute('data-kairos-id', block.id)
      element.setAttribute('data-kairos-type', block.type)

      if (block.createdAt) {
        element.setAttribute('data-kairos-created', block.createdAt)
      }
      if (block.version) {
        element.setAttribute('data-kairos-version', block.version.toString())
      }
    }

    // Handle code blocks specially
    if (block.type === 'code') {
      const code = window.document.createElement('code')
      code.textContent = block.content
      element.appendChild(code)
    } else {
      // Apply text formatting
      if (block.textFormats && block.textFormats.length > 0) {
        element.innerHTML = this.applyTextFormats(block.content, block.textFormats)
      } else {
        element.textContent = block.content
      }
    }

    return element
  }

  /**
   * Apply text formatting to content
   */
  private applyTextFormats(content: string, formats: TextFormat[]): string {
    // Sort formats by start position
    const sortedFormats = [...formats].sort((a, b) => a.start - b.start)

    let result = ''
    let lastEnd = 0

    sortedFormats.forEach((format) => {
      // Add text before this format
      if (format.start > lastEnd) {
        result += this.escapeHTML(content.slice(lastEnd, format.start))
      }

      // Get the formatted text
      const text = content.slice(format.start, format.end)

      // Apply the format
      switch (format.type) {
        case 'bold':
          result += `<strong>${this.escapeHTML(text)}</strong>`
          break
        case 'italic':
          result += `<em>${this.escapeHTML(text)}</em>`
          break
        case 'underline':
          result += `<u>${this.escapeHTML(text)}</u>`
          break
        case 'code':
          result += `<code>${this.escapeHTML(text)}</code>`
          break
        case 'link': {
          const href = format.data?.href || '#'
          result += `<a href="${this.escapeHTML(href)}">${this.escapeHTML(text)}</a>`
          break
        }
        default:
          result += this.escapeHTML(text)
      }

      lastEnd = format.end
    })

    // Add any remaining text
    if (lastEnd < content.length) {
      result += this.escapeHTML(content.slice(lastEnd))
    }

    return result
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    const div = window.document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Parse an HTML element into blocks
   */
  private parseElement(element: Element, blocks: EditorBlock[], parentListType?: 'ul' | 'ol'): void {
    Array.from(element.children).forEach((child) => {
      const tagName = child.tagName.toLowerCase()

      // Handle lists specially
      if (tagName === 'ul' || tagName === 'ol') {
        this.parseElement(child, blocks, tagName as 'ul' | 'ol')
        return
      }

      // Get block type
      let blockType = TAG_TO_BLOCK_TYPE[tagName]

      // Refine list type based on parent
      if (tagName === 'li' && parentListType) {
        blockType = parentListType === 'ul' ? 'bulletList' : 'numberedList'
      }

      if (blockType) {
        const block = this.parseBlockElement(child, blockType)
        blocks.push(block)
      } else {
        // For unknown elements, recurse into children
        this.parseElement(child, blocks, parentListType)
      }
    })
  }

  /**
   * Parse a single block element
   */
  private parseBlockElement(element: Element, blockType: BlockType): EditorBlock {
    const block: EditorBlock = {
      id: element.getAttribute('data-kairos-id') || this.generateId(),
      type: blockType,
      content: '',
      textFormats: [],
    }

    // Extract metadata
    const createdAt = element.getAttribute('data-kairos-created')
    if (createdAt) {
      block.createdAt = createdAt
    }

    const version = element.getAttribute('data-kairos-version')
    if (version) {
      block.version = parseInt(version, 10)
    }

    // Extract content and formatting
    if (blockType === 'code') {
      // For code blocks, just get text content
      block.content = element.textContent || ''
    } else {
      // Parse formatted content
      const { content, formats } = this.parseFormattedContent(element)
      block.content = content
      block.textFormats = formats
    }

    return block
  }

  /**
   * Parse formatted content from an element
   */
  private parseFormattedContent(element: Element): { content: string; formats: TextFormat[] } {
    let content = ''
    const formats: TextFormat[] = []

    const processNode = (node: Node) => {
      if (node.nodeType === node.TEXT_NODE) {
        content += node.textContent || ''
      } else if (node.nodeType === node.ELEMENT_NODE) {
        const el = node as Element
        const tagName = el.tagName.toLowerCase()
        const start = content.length

        // Process children
        Array.from(node.childNodes).forEach(processNode)

        const end = content.length

        // Record format if applicable
        if (start !== end) {
          switch (tagName) {
            case 'strong':
            case 'b':
              formats.push({ type: 'bold', start, end })
              break
            case 'em':
            case 'i':
              formats.push({ type: 'italic', start, end })
              break
            case 'u':
              formats.push({ type: 'underline', start, end })
              break
            case 'code':
              formats.push({ type: 'code', start, end })
              break
            case 'a':
              formats.push({
                type: 'link',
                start,
                end,
                data: { href: el.getAttribute('href') || '' },
              })
              break
          }
        }
      }
    }

    Array.from(element.childNodes).forEach(processNode)

    return { content, formats }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
