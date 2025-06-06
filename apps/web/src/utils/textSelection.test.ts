// apps/web/src/utils/textSelection.test.ts
// Tests for text selection utility functions

import {
  findBlockFromNode,
  getBlockIdsBetween,
  categorizeSelectedBlocks,
  getCleanOffsets,
  isMultiBlockSelection,
  shouldTreatAsTextSelection,
  getRangeText,
} from './textSelection'
import type { EditorBlock } from '../contexts/EditorContext'

// Mock data
const mockBlocks: EditorBlock[] = [
  { id: 'block-1', type: 'paragraph', content: 'First block content' },
  { id: 'block-2', type: 'h1', content: 'Second block heading' },
  { id: 'block-3', type: 'paragraph', content: 'Third block content' },
  { id: 'block-4', type: 'bullet', content: 'Fourth block bullet' },
  { id: 'block-5', type: 'paragraph', content: '' },
]

describe('textSelection utilities', () => {
  // ✅ findBlockFromNode Tests
  describe('findBlockFromNode', () => {
    it('finds block from text node', () => {
      const blockContent = document.createElement('div')
      blockContent.className = 'block__content'
      blockContent.setAttribute('data-block-id', 'test-block')
      const textNode = document.createTextNode('Test content')
      blockContent.appendChild(textNode)

      const result = findBlockFromNode(textNode)
      expect(result).toEqual({
        element: blockContent,
        id: 'test-block',
      })
    })

    it('finds block from element node', () => {
      const blockContent = document.createElement('div')
      blockContent.className = 'block__content'
      blockContent.setAttribute('data-block-id', 'test-block')

      const result = findBlockFromNode(blockContent)
      expect(result).toEqual({
        element: blockContent,
        id: 'test-block',
      })
    })

    it('returns null for non-block nodes', () => {
      const randomDiv = document.createElement('div')
      randomDiv.className = 'not-a-block'

      const result = findBlockFromNode(randomDiv)
      expect(result).toBeNull()
    })

    it('handles deeply nested nodes', () => {
      const blockContent = document.createElement('div')
      blockContent.className = 'block__content'
      blockContent.setAttribute('data-block-id', 'nested-block')

      const span = document.createElement('span')
      const strong = document.createElement('strong')
      const textNode = document.createTextNode('Deeply nested')

      strong.appendChild(textNode)
      span.appendChild(strong)
      blockContent.appendChild(span)

      const result = findBlockFromNode(textNode)
      expect(result).toEqual({
        element: blockContent,
        id: 'nested-block',
      })
    })

    it('finds block from parent block element', () => {
      const block = document.createElement('div')
      block.className = 'block'
      block.setAttribute('data-block-id', 'parent-block')

      const blockContent = document.createElement('div')
      blockContent.className = 'block__content'
      block.appendChild(blockContent)

      const result = findBlockFromNode(block)
      expect(result).toEqual({
        element: blockContent,
        id: 'parent-block',
      })
    })

    it('returns null when block content is missing from parent block', () => {
      const block = document.createElement('div')
      block.className = 'block'
      block.setAttribute('data-block-id', 'incomplete-block')
      // No block__content child

      const result = findBlockFromNode(block)
      expect(result).toBeNull()
    })
  })

  // ✅ getBlockIdsBetween Tests
  describe('getBlockIdsBetween', () => {
    it('returns single block for same start/end', () => {
      const result = getBlockIdsBetween('block-2', 'block-2', mockBlocks)
      expect(result).toEqual(['block-2'])
    })

    it('returns range for different blocks', () => {
      const result = getBlockIdsBetween('block-1', 'block-3', mockBlocks)
      expect(result).toEqual(['block-1', 'block-2', 'block-3'])
    })

    it('handles reversed selection', () => {
      const result = getBlockIdsBetween('block-4', 'block-2', mockBlocks)
      expect(result).toEqual(['block-2', 'block-3', 'block-4'])
    })

    it('returns empty for invalid IDs', () => {
      const result = getBlockIdsBetween('invalid-1', 'invalid-2', mockBlocks)
      expect(result).toEqual([])
    })

    it('returns empty when start ID is invalid', () => {
      const result = getBlockIdsBetween('invalid', 'block-2', mockBlocks)
      expect(result).toEqual([])
    })

    it('returns empty when end ID is invalid', () => {
      const result = getBlockIdsBetween('block-1', 'invalid', mockBlocks)
      expect(result).toEqual([])
    })

    it('handles selection across all blocks', () => {
      const result = getBlockIdsBetween('block-1', 'block-5', mockBlocks)
      expect(result).toEqual(['block-1', 'block-2', 'block-3', 'block-4', 'block-5'])
    })
  })

  // ✅ categorizeSelectedBlocks Tests
  describe('categorizeSelectedBlocks', () => {
    let range: Range

    beforeEach(() => {
      range = document.createRange()
    })

    it('identifies fully selected middle blocks', () => {
      const result = categorizeSelectedBlocks(range, 'block-1', 'block-5', mockBlocks)
      expect(result.fullySelected).toEqual(['block-2', 'block-3', 'block-4'])
      expect(result.partiallySelected).toEqual(['block-1', 'block-5'])
    })

    it('identifies partially selected first/last', () => {
      const result = categorizeSelectedBlocks(range, 'block-2', 'block-4', mockBlocks)
      expect(result.fullySelected).toEqual(['block-3'])
      expect(result.partiallySelected).toEqual(['block-2', 'block-4'])
    })

    it('handles single block selection', () => {
      const result = categorizeSelectedBlocks(range, 'block-3', 'block-3', mockBlocks)
      expect(result.fullySelected).toEqual([])
      expect(result.partiallySelected).toEqual(['block-3'])
    })

    it('works with empty blocks', () => {
      const result = categorizeSelectedBlocks(range, 'block-4', 'block-5', mockBlocks)
      expect(result.fullySelected).toEqual([])
      expect(result.partiallySelected).toEqual(['block-4', 'block-5'])
    })

    it('handles two block selection', () => {
      const result = categorizeSelectedBlocks(range, 'block-1', 'block-2', mockBlocks)
      expect(result.fullySelected).toEqual([])
      expect(result.partiallySelected).toEqual(['block-1', 'block-2'])
    })

    it('returns empty arrays for invalid block IDs', () => {
      const result = categorizeSelectedBlocks(range, 'invalid-1', 'invalid-2', mockBlocks)
      expect(result.fullySelected).toEqual([])
      expect(result.partiallySelected).toEqual([])
    })

    it('handles reversed selection correctly', () => {
      const result = categorizeSelectedBlocks(range, 'block-4', 'block-2', mockBlocks)
      expect(result.fullySelected).toEqual(['block-3'])
      expect(result.partiallySelected).toEqual(['block-2', 'block-4'])
    })
  })

  // ✅ getCleanOffsets Tests
  describe('getCleanOffsets', () => {
    it('calculates text offset correctly', () => {
      const blockElement = document.createElement('div')
      blockElement.textContent = 'Hello world'
      const textNode = blockElement.firstChild as Text

      const offset = getCleanOffsets(blockElement, textNode, 6)
      expect(offset).toBe(6)
    })

    it('handles element containers', () => {
      const blockElement = document.createElement('div')
      blockElement.innerHTML = '<span>Hello</span> <span>world</span>'

      const offset = getCleanOffsets(blockElement, blockElement, 1)
      expect(offset).toBe(1)
    })

    it('handles text node containers', () => {
      const blockElement = document.createElement('div')
      const span = document.createElement('span')
      span.textContent = 'Hello'
      blockElement.appendChild(span)
      const textNode = document.createTextNode(' world')
      blockElement.appendChild(textNode)

      const offset = getCleanOffsets(blockElement, textNode, 1)
      expect(offset).toBe(6) // "Hello" (5) + " " (1)
    })

    it('works with nested structures', () => {
      const blockElement = document.createElement('div')
      blockElement.innerHTML = '<p><strong>Bold</strong> <em>italic</em></p>'
      const emNode = blockElement.querySelector('em')
      const italicText = emNode?.firstChild as Text

      const offset = getCleanOffsets(blockElement, italicText, 3)
      expect(offset).toBe(8) // "Bold" (4) + " " (1) + "ita" (3)
    })

    it('returns offset for container equal to blockElement', () => {
      const blockElement = document.createElement('div')
      blockElement.textContent = 'Test content'

      const offset = getCleanOffsets(blockElement, blockElement, 5)
      expect(offset).toBe(5)
    })

    it('handles empty text nodes', () => {
      const blockElement = document.createElement('div')
      const emptyText = document.createTextNode('')
      blockElement.appendChild(emptyText)
      const contentText = document.createTextNode('Content')
      blockElement.appendChild(contentText)

      const offset = getCleanOffsets(blockElement, contentText, 3)
      expect(offset).toBe(3)
    })

    it('returns offset as-is for text node not found in block', () => {
      const blockElement = document.createElement('div')
      blockElement.textContent = 'Block content'

      const otherDiv = document.createElement('div')
      const otherText = document.createTextNode('Other content')
      otherDiv.appendChild(otherText)

      const offset = getCleanOffsets(blockElement, otherText, 5)
      expect(offset).toBe(5) // Returns offset as-is when node not found
    })
  })

  // ✅ Additional utility function tests
  describe('isMultiBlockSelection', () => {
    it('returns true for multi-block selection', () => {
      const container = document.createElement('div')

      const block1 = document.createElement('div')
      block1.className = 'block__content'
      block1.setAttribute('data-block-id', 'block-1')
      block1.textContent = 'First block'

      const block2 = document.createElement('div')
      block2.className = 'block__content'
      block2.setAttribute('data-block-id', 'block-2')
      block2.textContent = 'Second block'

      container.appendChild(block1)
      container.appendChild(block2)

      const range = document.createRange()
      range.setStart(block1.firstChild!, 0)
      range.setEnd(block2.firstChild!, 5)

      expect(isMultiBlockSelection(range)).toBe(true)
    })

    it('returns false for single block selection', () => {
      const block = document.createElement('div')
      block.className = 'block__content'
      block.setAttribute('data-block-id', 'block-1')
      block.textContent = 'Single block'

      const range = document.createRange()
      range.setStart(block.firstChild!, 0)
      range.setEnd(block.firstChild!, 5)

      expect(isMultiBlockSelection(range)).toBe(false)
    })

    it('returns false when blocks not found', () => {
      const div = document.createElement('div')
      div.textContent = 'Not a block'

      const range = document.createRange()
      range.setStart(div.firstChild!, 0)
      range.setEnd(div.firstChild!, 5)

      expect(isMultiBlockSelection(range)).toBe(false)
    })
  })

  describe('shouldTreatAsTextSelection', () => {
    it('returns false for collapsed selection', () => {
      const range = document.createRange()
      const div = document.createElement('div')
      div.textContent = 'Test'
      range.setStart(div.firstChild!, 0)
      range.setEnd(div.firstChild!, 0)

      expect(shouldTreatAsTextSelection(range)).toBe(false)
    })

    it('returns false when selection started from drag handle', () => {
      const dragHandle = document.createElement('div')
      dragHandle.className = 'block-drag-handle'
      const textNode = document.createTextNode('Handle')
      dragHandle.appendChild(textNode)

      const range = document.createRange()
      range.setStart(textNode, 0)
      range.setEnd(textNode, 5)

      expect(shouldTreatAsTextSelection(range)).toBe(false)
    })

    it('returns true for regular text selection', () => {
      const div = document.createElement('div')
      div.textContent = 'Regular text'

      const range = document.createRange()
      range.setStart(div.firstChild!, 0)
      range.setEnd(div.firstChild!, 7)

      expect(shouldTreatAsTextSelection(range)).toBe(true)
    })

    it('handles element start container', () => {
      const div = document.createElement('div')
      div.innerHTML = '<span>Text</span>'

      const range = document.createRange()
      range.setStart(div, 0)
      range.setEnd(div.firstChild!.firstChild!, 4)

      expect(shouldTreatAsTextSelection(range)).toBe(true)
    })
  })

  describe('getRangeText', () => {
    it('returns text from range', () => {
      const div = document.createElement('div')
      div.textContent = 'Hello world'

      const range = document.createRange()
      range.setStart(div.firstChild!, 0)
      range.setEnd(div.firstChild!, 5)

      expect(getRangeText(range)).toBe('Hello')
    })

    it('handles multi-node selection', () => {
      const div = document.createElement('div')
      div.innerHTML = '<span>Hello</span> <span>world</span>'

      const range = document.createRange()
      range.selectNodeContents(div)

      expect(getRangeText(range)).toBe('Hello world')
    })
  })
})
