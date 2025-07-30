import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { EditorBlock, TextFormat, ConversionOptions, BlockType } from './types'

// Create a DOMPurify instance with jsdom window
const window = new JSDOM('').window as any
const purify = DOMPurify(window)

/**
 * Maps block types to HTML elements
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
  li: 'paragraph', // Will be determined by parent element
  blockquote: 'quote',
  pre: 'code',
}

/**
 * Convert editor blocks to HTML string
 */
export function toHTML(blocks: EditorBlock[], options: ConversionOptions = {}): string {
  const { preserveMetadata = true, classPrefix = 'kairos' } = options

  const doc = new JSDOM('<!DOCTYPE html><html><body></body></html>').window.document
  const container = doc.createElement('article')
  container.setAttribute('data-kairos-document', 'true')

  let currentList: HTMLElement | null = null
  let currentListType: 'bulletList' | 'numberedList' | null = null

  blocks.forEach((block) => {
    // Handle list grouping
    if (block.type === 'bulletList' || block.type === 'numberedList') {
      if (!currentList || currentListType !== block.type) {
        currentList = doc.createElement(block.type === 'bulletList' ? 'ul' : 'ol')
        currentListType = block.type
        container.appendChild(currentList)
      }
    } else {
      currentList = null
      currentListType = null
    }

    // Create element
    const tagName = BLOCK_TYPE_TO_TAG[block.type]
    const element = doc.createElement(tagName)

    // Add classes
    element.className = `${classPrefix}-${block.type}`

    // Add metadata if requested
    if (preserveMetadata) {
      element.setAttribute('data-kairos-id', block.id)
      element.setAttribute('data-kairos-type', block.type)

      if (block.createdAt) {
        element.setAttribute('data-kairos-created', block.createdAt)
      }
      if (block.updatedAt) {
        element.setAttribute('data-kairos-updated', block.updatedAt)
      }
      if (block.version !== undefined) {
        element.setAttribute('data-kairos-version', String(block.version))
      }
      if (block.metadata) {
        element.setAttribute('data-kairos-metadata', JSON.stringify(block.metadata))
      }
    }

    // Apply text content and formatting
    if (block.textFormats && block.textFormats.length > 0) {
      element.innerHTML = applyTextFormats(block.content, block.textFormats, doc)
    } else {
      element.textContent = block.content
    }

    // Add to appropriate parent
    if (currentList && (block.type === 'bulletList' || block.type === 'numberedList')) {
      currentList.appendChild(element)
    } else {
      container.appendChild(element)
    }
  })

  const html = container.outerHTML

  // Sanitize if requested
  if (options.sanitize) {
    return purify.sanitize(html, {
      ALLOWED_TAGS: ['article', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 'u', 'a'],
      ALLOWED_ATTR: ['href', 'data-kairos-*', 'class'],
      ADD_DATA_URI_TAGS: [],
    })
  }

  return html
}

/**
 * Apply text formatting to content
 */
function applyTextFormats(content: string, formats: TextFormat[], _doc: Document): string {
  // Sort formats by start position
  const sortedFormats = [...formats].sort((a, b) => a.start - b.start)

  let result = ''
  let lastEnd = 0

  sortedFormats.forEach((format) => {
    // Add text before this format
    if (format.start > lastEnd) {
      result += escapeHtml(content.substring(lastEnd, format.start))
    }

    // Add formatted text
    const text = escapeHtml(content.substring(format.start, format.end))
    let formattedText = text

    switch (format.type) {
      case 'bold':
        formattedText = `<strong>${text}</strong>`
        break
      case 'italic':
        formattedText = `<em>${text}</em>`
        break
      case 'underline':
        formattedText = `<u>${text}</u>`
        break
      case 'code':
        formattedText = `<code>${text}</code>`
        break
      case 'link': {
        const href = format.data?.href || '#'
        formattedText = `<a href="${escapeHtml(href)}">${text}</a>`
        break
      }
    }

    result += formattedText
    lastEnd = format.end
  })

  // Add remaining text
  if (lastEnd < content.length) {
    result += escapeHtml(content.substring(lastEnd))
  }

  return result
}

/**
 * Parse HTML string into editor blocks
 */
export function fromHTML(html: string, options: ConversionOptions = {}): EditorBlock[] {
  const { sanitize = true } = options

  // Sanitize HTML first if requested
  const cleanHtml = sanitize
    ? purify.sanitize(html, {
        ALLOWED_TAGS: ['article', 'div', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 'u', 'a', 'b', 'i'],
        ALLOWED_ATTR: ['href', 'data-kairos-*'],
      })
    : html

  const doc = new JSDOM(cleanHtml).window.document
  const blocks: EditorBlock[] = []

  // Find the container or use body
  const container = doc.querySelector('[data-kairos-document]') || doc.body

  // Process child nodes
  processNodes(container.childNodes, blocks)

  return blocks
}

/**
 * Process DOM nodes into blocks
 */
function processNodes(nodes: NodeListOf<ChildNode>, blocks: EditorBlock[], listType?: 'bulletList' | 'numberedList') {
  nodes.forEach((node) => {
    if (node.nodeType === 1) {
      // Element node
      const element = node as HTMLElement
      const tagName = element.tagName.toLowerCase()

      // Handle lists specially
      if (tagName === 'ul' || tagName === 'ol') {
        const childListType = tagName === 'ul' ? 'bulletList' : 'numberedList'
        processNodes(element.childNodes, blocks, childListType)
        return
      }

      // Determine block type
      let blockType: BlockType = TAG_TO_BLOCK_TYPE[tagName] || 'paragraph'

      // Override for list items
      if (tagName === 'li' && listType) {
        blockType = listType
      }

      // Create block
      const block: EditorBlock = {
        id: element.getAttribute('data-kairos-id') || generateId(),
        type: blockType,
        content: '',
        textFormats: [],
      }

      // Extract metadata
      if (element.hasAttribute('data-kairos-created')) {
        block.createdAt = element.getAttribute('data-kairos-created')!
      }
      if (element.hasAttribute('data-kairos-updated')) {
        block.updatedAt = element.getAttribute('data-kairos-updated')!
      }
      if (element.hasAttribute('data-kairos-version')) {
        block.version = parseInt(element.getAttribute('data-kairos-version')!, 10)
      }
      if (element.hasAttribute('data-kairos-metadata')) {
        try {
          block.metadata = JSON.parse(element.getAttribute('data-kairos-metadata')!)
        } catch {
          // Ignore invalid metadata
        }
      }

      // Extract text content and formats
      const extraction = extractTextAndFormats(element)
      block.content = extraction.text
      block.textFormats = extraction.formats

      blocks.push(block)
    } else if (node.nodeType === 3 && node.textContent?.trim()) {
      // Text node outside of element - create paragraph
      blocks.push({
        id: generateId(),
        type: 'paragraph',
        content: node.textContent.trim(),
      })
    }
  })
}

/**
 * Extract text content and formatting from an element
 */
function extractTextAndFormats(element: HTMLElement): { text: string; formats: TextFormat[] } {
  const formats: TextFormat[] = []
  let text = ''

  function processNode(node: Node, currentFormat?: Partial<TextFormat>) {
    if (node.nodeType === 3) {
      // Text node
      const start = text.length
      text += node.textContent || ''
      const end = text.length

      if (currentFormat && start < end) {
        formats.push({
          type: currentFormat.type as TextFormat['type'],
          start,
          end,
          data: currentFormat.data,
        })
      }
    } else if (node.nodeType === 1) {
      // Element node
      const el = node as HTMLElement
      const tagName = el.tagName.toLowerCase()

      let newFormat: Partial<TextFormat> | undefined

      switch (tagName) {
        case 'strong':
        case 'b':
          newFormat = { type: 'bold' }
          break
        case 'em':
        case 'i':
          newFormat = { type: 'italic' }
          break
        case 'u':
          newFormat = { type: 'underline' }
          break
        case 'code':
          if (el.parentElement?.tagName.toLowerCase() !== 'pre') {
            newFormat = { type: 'code' }
          }
          break
        case 'a':
          newFormat = {
            type: 'link',
            data: { href: el.getAttribute('href') || '#' },
          }
          break
      }

      // Process children
      el.childNodes.forEach((child) => {
        processNode(child, newFormat || currentFormat)
      })
    }
  }

  element.childNodes.forEach((child) => processNode(child))

  return { text, formats }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = new JSDOM('').window.document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
