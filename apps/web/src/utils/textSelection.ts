// apps/web/src/utils/textSelection.ts
// Utility functions for handling cross-block text selection in the editor.
// Provides helpers for finding blocks from DOM nodes, calculating selection boundaries,
// and determining which blocks are fully or partially selected.

import type { EditorBlock } from '../contexts/EditorContext'

/**
 * Find the block element and ID from any DOM node within a block
 */
export function findBlockFromNode(node: Node): { element: HTMLElement; id: string } | null {
  let currentNode: Node | null = node

  // Walk up the DOM tree to find the block element
  while (currentNode) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const element = currentNode as HTMLElement
      const blockId = element.getAttribute('data-block-id')

      if (blockId && element.classList.contains('block')) {
        return { element, id: blockId }
      }
    }

    currentNode = currentNode.parentNode
  }

  return null
}

/**
 * Get all block IDs between two blocks (inclusive)
 */
export function getBlockIdsBetween(startBlockId: string, endBlockId: string, blocks: EditorBlock[]): string[] {
  const startIndex = blocks.findIndex((b) => b.id === startBlockId)
  const endIndex = blocks.findIndex((b) => b.id === endBlockId)

  if (startIndex === -1 || endIndex === -1) {
    return []
  }

  const [minIndex, maxIndex] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex]

  return blocks.slice(minIndex, maxIndex + 1).map((block) => block.id)
}

/**
 * Determine which blocks are fully selected vs partially selected
 */
export function categorizeSelectedBlocks(
  range: Range,
  startBlockId: string,
  endBlockId: string,
  blocks: EditorBlock[]
): {
  fullySelected: string[]
  partiallySelected: string[]
} {
  const blockIds = getBlockIdsBetween(startBlockId, endBlockId, blocks)

  if (blockIds.length === 0) {
    return { fullySelected: [], partiallySelected: [] }
  }

  // Single block selection
  if (blockIds.length === 1) {
    return { fullySelected: [], partiallySelected: [blockIds[0]] }
  }

  // Multiple blocks
  const fullySelected: string[] = []
  const partiallySelected: string[] = []

  blockIds.forEach((blockId, index) => {
    if (index === 0) {
      // First block is partially selected (starts from offset)
      partiallySelected.push(blockId)
    } else if (index === blockIds.length - 1) {
      // Last block is partially selected (ends at offset)
      partiallySelected.push(blockId)
    } else {
      // Middle blocks are fully selected
      fullySelected.push(blockId)
    }
  })

  return { fullySelected, partiallySelected }
}

/**
 * Get the text content from a range, handling cross-block selections
 */
export function getRangeText(range: Range): string {
  return range.toString()
}

/**
 * Calculate the offset within a specific block's content
 */
export function getOffsetInBlock(container: Node, offset: number): number {
  // If the container is a text node, the offset is already correct
  if (container.nodeType === Node.TEXT_NODE) {
    return offset
  }

  // If the container is an element, we need to calculate the text offset
  let textOffset = 0
  const element = container as HTMLElement

  // Walk through child nodes up to the offset index
  for (let i = 0; i < offset && i < element.childNodes.length; i++) {
    const child = element.childNodes[i]
    textOffset += child.textContent?.length || 0
  }

  return textOffset
}

/**
 * Check if a selection spans multiple blocks
 */
export function isMultiBlockSelection(range: Range): boolean {
  const startBlock = findBlockFromNode(range.startContainer)
  const endBlock = findBlockFromNode(range.endContainer)

  return startBlock !== null && endBlock !== null && startBlock.id !== endBlock.id
}

/**
 * Get clean text offsets for a block, accounting for contentEditable quirks
 */
export function getCleanOffsets(blockElement: HTMLElement, container: Node, offset: number): number {
  // Handle the common case where the container is inside the block's content area
  const blockContent = blockElement.querySelector('.block__content')
  if (!blockContent) return offset

  // If we're directly in the content element
  if (container === blockContent) {
    return getOffsetInBlock(container, offset)
  }

  // If we're in a text node within the content
  if (container.nodeType === Node.TEXT_NODE && blockContent.contains(container)) {
    // Find the text offset from the beginning of the block
    let textOffset = 0
    const walker = document.createTreeWalker(blockContent, NodeFilter.SHOW_TEXT, null)

    let node: Node | null
    while ((node = walker.nextNode())) {
      if (node === container) {
        return textOffset + offset
      }
      textOffset += node.textContent?.length || 0
    }
  }

  return offset
}

/**
 * Create a visual highlight element for selected text
 */
export function createSelectionHighlight(range: Range, _className: string = 'text-selection-highlight'): HTMLElement[] {
  const highlights: HTMLElement[] = []

  // This is a placeholder for visual highlighting
  // In practice, you might use CSS to style the native selection
  // or create overlay elements for custom highlighting

  return highlights
}

/**
 * Clear any custom selection highlights
 */
export function clearSelectionHighlights(container: HTMLElement): void {
  const highlights = container.querySelectorAll('.text-selection-highlight')
  highlights.forEach((el) => el.remove())
}

/**
 * Determine if the selection should be treated as a text selection vs block selection
 */
export function shouldTreatAsTextSelection(range: Range): boolean {
  // If the selection is collapsed (no text selected), it's not a text selection
  if (range.collapsed) return false

  // Check if the selection started from a drag handle or block selection UI
  const startElement =
    range.startContainer.nodeType === Node.ELEMENT_NODE ? (range.startContainer as HTMLElement) : range.startContainer.parentElement

  if (startElement?.closest('.block-drag-handle')) {
    return false
  }

  // Otherwise, treat it as a text selection
  return true
}
