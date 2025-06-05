// apps/web/src/utils/textSelection.ts
// Utility functions for handling cross-block text selection in the editor.
// Updated to work with the single contentEditable container approach.

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

      // Check for block content element
      if (element.classList.contains('block__content')) {
        const blockId = element.getAttribute('data-block-id')
        if (blockId) {
          return { element, id: blockId }
        }
      }

      // Also check parent block element
      const blockId = element.getAttribute('data-block-id')
      if (blockId && element.classList.contains('block')) {
        // Find the content element within
        const contentEl = element.querySelector('.block__content') as HTMLElement
        if (contentEl) {
          return { element: contentEl, id: blockId }
        }
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
 * Get clean text offsets for a block
 */
export function getCleanOffsets(blockElement: HTMLElement, container: Node, offset: number): number {
  // If container is a text node
  if (container.nodeType === Node.TEXT_NODE) {
    // Find offset within the block
    let textOffset = 0
    const walker = document.createTreeWalker(blockElement, NodeFilter.SHOW_TEXT, null)

    let node: Node | null
    while ((node = walker.nextNode())) {
      if (node === container) {
        return textOffset + offset
      }
      textOffset += node.textContent?.length || 0
    }
  }

  // If container is an element, calculate based on child nodes
  if (container === blockElement) {
    return offset
  }

  return offset
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
 * Determine if the selection should be treated as a text selection
 */
export function shouldTreatAsTextSelection(range: Range): boolean {
  // If the selection is collapsed (no text selected), it's not a text selection
  if (range.collapsed) {
    return false
  }

  // Check if the selection started from a drag handle
  const startElement =
    range.startContainer.nodeType === Node.ELEMENT_NODE ? (range.startContainer as HTMLElement) : range.startContainer.parentElement

  const isFromDragHandle = startElement?.closest('.block-drag-handle') !== null

  if (isFromDragHandle) {
    return false
  }

  // Otherwise, treat it as a text selection
  return true
}
