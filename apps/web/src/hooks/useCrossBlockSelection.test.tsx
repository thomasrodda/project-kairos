import { renderHook, act, waitFor } from '@testing-library/react'
import { useCrossBlockSelection } from './useCrossBlockSelection'
import { EditorProvider, useEditorDispatch } from '../contexts/EditorContext'
import type { EditorBlock } from '../contexts/EditorContext'
import { generateId } from '@kairos/utils'
import React, { useEffect } from 'react'

// Helper to create a block for testing
const createBlock = (overrides?: Partial<EditorBlock>): EditorBlock => ({
  id: generateId(),
  type: 'paragraph',
  content: 'Test block content',
  ...overrides,
})

// Helper to create real text selection in the DOM
const createTextSelection = (startElement: Element, startOffset: number, endElement: Element, endOffset: number) => {
  const selection = window.getSelection()
  if (!selection) return

  // Clear existing selection
  selection.removeAllRanges()

  // Create and add new range
  const range = document.createRange()
  const startTextNode = startElement.firstChild || startElement
  const endTextNode = endElement.firstChild || endElement

  range.setStart(startTextNode, startOffset)
  range.setEnd(endTextNode, endOffset)
  selection.addRange(range)

  // Trigger selection change event
  document.dispatchEvent(new Event('selectionchange'))
}

// Helper to set up DOM elements with block structure matching the real editor
const setupBlockElements = (blocks: EditorBlock[]) => {
  const container = document.createElement('div')
  container.setAttribute('data-testid', 'editor-content')
  container.contentEditable = 'true'

  blocks.forEach((block) => {
    // Create block wrapper
    const blockWrapper = document.createElement('div')
    blockWrapper.className = 'block'
    blockWrapper.setAttribute('data-block-id', block.id)

    // Create block content element (this is what the hook looks for)
    const blockContent = document.createElement('div')
    blockContent.className = 'block__content'
    blockContent.setAttribute('data-block-id', block.id)
    blockContent.textContent = block.content

    blockWrapper.appendChild(blockContent)
    container.appendChild(blockWrapper)
  })

  document.body.appendChild(container)

  const getBlockElement = (blockId: string) => {
    const el = container.querySelector(`.block__content[data-block-id="${blockId}"]`)
    if (!el) throw new Error(`Block element not found: ${blockId}`)
    return el
  }

  return { container, getBlockElement }
}

// Helper to clean up DOM after tests
const cleanupDOM = () => {
  document.body.innerHTML = ''
}

// Helper wrapper component for tests that sets up EditorProvider with initial blocks
const createWrapper = (initialBlocks: EditorBlock[] = []) => {
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => {
      const dispatch = useEditorDispatch()

      useEffect(() => {
        if (initialBlocks.length > 0) {
          dispatch({
            type: 'SET_PAGE',
            pageId: 'test-page',
            title: 'Test Page',
            blocks: initialBlocks,
          })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      return <>{children}</>
    }

    return (
      <EditorProvider>
        <TestWrapper>{children}</TestWrapper>
      </EditorProvider>
    )
  }
}

describe('useCrossBlockSelection', () => {
  beforeEach(() => {
    cleanupDOM()
  })

  afterEach(() => {
    cleanupDOM()
  })

  describe('✅ Core Functionality', () => {
    it('detects when user selects text within a single block', async () => {
      const blocks = [createBlock({ id: 'block-1', content: 'First block content' }), createBlock({ id: 'block-2', content: 'Second block content' })]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      // User selects "block" in the first block (positions 6-11)
      act(() => {
        createTextSelection(firstBlock, 6, firstBlock, 11)
      })

      await waitFor(() => {
        expect(result.current.selection).not.toBeNull()
        expect(result.current.selection?.selectedText).toBe('block')
        expect(result.current.selection?.startBlockId).toBe('block-1')
        expect(result.current.selection?.endBlockId).toBe('block-1')
        expect(result.current.selection?.startOffset).toBe(6)
        expect(result.current.selection?.endOffset).toBe(11)
        expect(result.current.isMultiBlockSelection).toBe(false)
      })
    })

    it('returns null when no text is selected', () => {
      const blocks = [createBlock({ id: 'block-1', content: 'Test content' })]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      // No selection made
      expect(result.current.selection).toBeNull()
      expect(result.current.isMultiBlockSelection).toBe(false)
      expect(result.current.getSelectedText()).toBe('')
    })

    it('updates when user changes selection', async () => {
      const blocks = [createBlock({ id: 'block-1', content: 'First block content' })]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      // First selection
      act(() => {
        createTextSelection(firstBlock, 0, firstBlock, 5)
      })

      await waitFor(() => {
        expect(result.current.selection?.selectedText).toBe('First')
      })

      // Change selection
      act(() => {
        createTextSelection(firstBlock, 6, firstBlock, 11)
      })

      await waitFor(() => {
        expect(result.current.selection?.selectedText).toBe('block')
      })
    })

    it('clears selection when user clicks without selecting', async () => {
      const blocks = [createBlock({ id: 'block-1', content: 'Test content' })]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      // Make a selection
      act(() => {
        createTextSelection(firstBlock, 0, firstBlock, 4)
      })

      await waitFor(() => {
        expect(result.current.selection).not.toBeNull()
      })

      // Clear selection
      act(() => {
        window.getSelection()?.removeAllRanges()
        document.dispatchEvent(new Event('selectionchange'))
      })

      await waitFor(() => {
        expect(result.current.selection).toBeNull()
      })
    })
  })

  describe('✅ Cross-Block Selection', () => {
    it('detects when user selects across multiple blocks', async () => {
      const blocks = [
        createBlock({ id: 'block-1', content: 'First block' }),
        createBlock({ id: 'block-2', content: 'Second block' }),
        createBlock({ id: 'block-3', content: 'Third block' }),
      ]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)

      // User selects from middle of first block to middle of second block
      act(() => {
        createTextSelection(
          getBlockElement('block-1'),
          6, // After "First "
          getBlockElement('block-2'),
          6 // After "Second"
        )
      })

      await waitFor(() => {
        expect(result.current.selection).not.toBeNull()
        expect(result.current.selection?.startBlockId).toBe('block-1')
        expect(result.current.selection?.endBlockId).toBe('block-2')
        expect(result.current.isMultiBlockSelection).toBe(true)
        expect(result.current.selection?.selectedText).toContain('block')
        expect(result.current.selection?.selectedText).toContain('Second')
      })
    })

    it('identifies fully selected blocks in multi-block selection', async () => {
      const blocks = [
        createBlock({ id: 'block-1', content: 'First' }),
        createBlock({ id: 'block-2', content: 'Second' }),
        createBlock({ id: 'block-3', content: 'Third' }),
      ]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)

      // Select from start of first block to end of third block
      act(() => {
        createTextSelection(
          getBlockElement('block-1'),
          0,
          getBlockElement('block-3'),
          5 // Length of "Third"
        )
      })

      await waitFor(() => {
        expect(result.current.selection).not.toBeNull()
        // Middle block should be fully selected
        expect(result.current.selection?.selectedBlocks).toContain('block-2')
      })
    })

    it('handles selection across blocks with different types', async () => {
      const blocks = [
        createBlock({ id: 'block-1', content: 'Heading', type: 'h1' }),
        createBlock({ id: 'block-2', content: 'Paragraph text', type: 'paragraph' }),
        createBlock({ id: 'block-3', content: 'Bullet item', type: 'bullet' }),
      ]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)

      act(() => {
        createTextSelection(
          getBlockElement('block-1'),
          0,
          getBlockElement('block-3'),
          6 // After "Bullet"
        )
      })

      await waitFor(() => {
        expect(result.current.selection).not.toBeNull()
        const markdown = result.current.getSelectedMarkdown()
        expect(markdown).toContain('# Heading')
        expect(markdown).toContain('Paragraph text')
        expect(markdown).toContain('- Bullet')
      })
    })
  })

  describe('✅ User Interactions', () => {
    it('updates selection on mouseup after dragging to select', async () => {
      const blocks = [createBlock({ id: 'block-1', content: 'Click and drag to select this text' })]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      // Simulate selection
      act(() => {
        createTextSelection(firstBlock, 10, firstBlock, 20)
      })

      // Trigger mouseup as user would when finishing selection
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
      })

      await waitFor(() => {
        expect(result.current.selection).not.toBeNull()
        expect(result.current.selection?.selectedText).toBe('drag to se')
      })
    })

    it('updates selection when user uses Shift+Arrow keys', async () => {
      const blocks = [createBlock({ id: 'block-1', content: 'Use keyboard to select' })]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      // Create selection as if user held Shift and pressed arrow keys
      act(() => {
        createTextSelection(firstBlock, 4, firstBlock, 12)
      })

      // Simulate keyup event with Shift key
      act(() => {
        const event = new KeyboardEvent('keyup', {
          key: 'ArrowRight',
          shiftKey: true,
          bubbles: true,
        })
        document.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(result.current.selection).not.toBeNull()
        expect(result.current.selection?.selectedText).toBe('keyboard')
      })
    })

    it('calls onSelectionChange callback when selection changes', async () => {
      const onSelectionChange = jest.fn()
      const blocks = [createBlock({ id: 'block-1', content: 'Select me' })]

      renderHook(() => useCrossBlockSelection({ onSelectionChange }), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      act(() => {
        createTextSelection(firstBlock, 0, firstBlock, 6)
      })

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedText: 'Select',
            startBlockId: 'block-1',
            endBlockId: 'block-1',
          })
        )
      })
    })
  })

  describe('✅ Selection State Management', () => {
    it('provides clearSelection method that clears browser selection', () => {
      const blocks = [createBlock({ id: 'block-1', content: 'Clear this selection' })]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      // Create a selection
      act(() => {
        createTextSelection(firstBlock, 0, firstBlock, 5)
      })

      // Clear it
      act(() => {
        result.current.clearSelection()
      })

      expect(window.getSelection()?.rangeCount).toBe(0)
      expect(result.current.selection).toBeNull()
    })

    it('generates plain text from selection', async () => {
      const blocks = [createBlock({ id: 'block-1', content: 'First line' }), createBlock({ id: 'block-2', content: 'Second line' })]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)

      act(() => {
        createTextSelection(
          getBlockElement('block-1'),
          0,
          getBlockElement('block-2'),
          6 // After "Second"
        )
      })

      await waitFor(() => {
        const text = result.current.getSelectedText()
        expect(text).toContain('First line')
        expect(text).toContain('Second')
      })
    })

    it('generates markdown from single block selection', async () => {
      const blocks = [createBlock({ id: 'block-1', content: 'Heading text', type: 'h1' })]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      act(() => {
        createTextSelection(firstBlock, 0, firstBlock, 7) // "Heading"
      })

      await waitFor(() => {
        const markdown = result.current.getSelectedMarkdown()
        // Single block selection returns just the text, not formatted
        expect(markdown).toBe('Heading')
      })
    })

    it('handles partial selection in first and last blocks', async () => {
      const blocks = [
        createBlock({ id: 'block-1', content: 'Start block here' }),
        createBlock({ id: 'block-2', content: 'Middle block fully selected' }),
        createBlock({ id: 'block-3', content: 'End block partial' }),
      ]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)

      // Select from "block" in first to "partial" in last
      act(() => {
        createTextSelection(
          getBlockElement('block-1'),
          6, // After "Start "
          getBlockElement('block-3'),
          9 // After "End block"
        )
      })

      await waitFor(() => {
        const markdown = result.current.getSelectedMarkdown()
        expect(markdown).toContain('block here') // Rest of first block
        expect(markdown).toContain('Middle block fully selected') // Full middle block
        expect(markdown).toContain('End block') // Start of last block
        expect(markdown).not.toContain('partial') // Should not include this
      })
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles selection when blocks are empty', async () => {
      const blocks = [
        createBlock({ id: 'block-1', content: 'Has content' }),
        createBlock({ id: 'block-2', content: '' }), // Empty block
        createBlock({ id: 'block-3', content: 'Also has content' }),
      ]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)

      act(() => {
        createTextSelection(
          getBlockElement('block-1'),
          0,
          getBlockElement('block-3'),
          4 // "Also"
        )
      })

      await waitFor(() => {
        expect(result.current.selection).not.toBeNull()
        const markdown = result.current.getSelectedMarkdown()
        expect(markdown).toContain('Has content')
        expect(markdown).toContain('Also')
      })
    })

    it('returns null for collapsed (cursor) selection', async () => {
      const blocks = [createBlock({ id: 'block-1', content: 'Click to place cursor' })]

      const { result } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      // Create collapsed selection (cursor position)
      act(() => {
        createTextSelection(firstBlock, 5, firstBlock, 5)
      })

      await waitFor(() => {
        expect(result.current.selection).toBeNull()
      })
    })

    it('is disabled when enabled option is false', async () => {
      const blocks = [createBlock({ id: 'block-1', content: 'Should not track selection' })]

      const { result } = renderHook(() => useCrossBlockSelection({ enabled: false }), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      act(() => {
        createTextSelection(firstBlock, 0, firstBlock, 6)
      })

      // Wait a bit to ensure no selection is detected
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(result.current.selection).toBeNull()
    })

    it('clears selection when all blocks are removed', async () => {
      const blocks = [createBlock({ id: 'block-1', content: 'Will be removed' })]

      const { result, rerender } = renderHook(() => useCrossBlockSelection(), {
        wrapper: createWrapper(blocks),
      })

      const { getBlockElement } = setupBlockElements(blocks)
      const firstBlock = getBlockElement('block-1')

      // Create selection
      act(() => {
        createTextSelection(firstBlock, 0, firstBlock, 4)
      })

      await waitFor(() => {
        expect(result.current.selection).not.toBeNull()
      })

      // Simulate blocks being removed by re-rendering with empty blocks
      cleanupDOM()
      setupBlockElements([])

      // Re-render with updated context (simulating blocks removal)
      rerender()

      await waitFor(() => {
        expect(result.current.selection).toBeNull()
      })
    })
  })
})
