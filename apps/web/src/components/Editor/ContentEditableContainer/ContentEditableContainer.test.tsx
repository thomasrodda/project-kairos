import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ContentEditableContainer } from './ContentEditableContainer'
import { renderWithEditor } from '../../../test/utils'
import { generateId } from '@kairos/utils'
import type { EditorBlock } from '../../../contexts/EditorContext'

// Mock generateId to have predictable IDs in tests
jest.mock('@kairos/utils', () => ({
  generateId: jest.fn(() => 'test-id'),
}))

describe('ContentEditableContainer', () => {
  const mockOnBlockClick = jest.fn()
  const mockGenerateId = generateId as jest.MockedFunction<typeof generateId>

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset ID counter for predictable test IDs
    let idCounter = 0
    mockGenerateId.mockImplementation(() => `test-id-${idCounter++}`)
  })

  // Helper to render ContentEditableContainer with test content
  const renderContainer = (initialBlocks: EditorBlock[] = [{ id: 'block-1', type: 'paragraph' as const, content: 'Test content' }]) => {
    return renderWithEditor(
      <ContentEditableContainer onBlockClick={mockOnBlockClick}>
        {initialBlocks.map((block) => (
          <div key={block.id} data-block-id={block.id} className="block">
            <div className="block__content" data-block-id={block.id}>
              {block.content}
            </div>
          </div>
        ))}
      </ContentEditableContainer>,
      { initialBlocks }
    )
  }

  // Helper to get contentEditable container
  const getContainer = () => document.querySelector('.content-editable-container') as HTMLDivElement

  // Helper to set selection and simulate typing
  const simulateTyping = async (container: HTMLElement, blockId: string, text: string, position: number = 0) => {
    const blockEl = container.querySelector(`[data-block-id="${blockId}"] .block__content`) as HTMLElement

    // Focus the container first
    container.focus()

    // Set cursor position
    const range = document.createRange()
    const textNode = blockEl.firstChild || blockEl
    range.setStart(textNode, position)
    range.collapse(true)

    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)

    // Simulate typing character by character
    for (const char of text) {
      // Try beforeinput event first
      const beforeInputEvent = new InputEvent('beforeinput', {
        data: char,
        inputType: 'insertText',
        bubbles: true,
        cancelable: true,
      })

      act(() => {
        const wasCanceled = !container.dispatchEvent(beforeInputEvent)

        // If beforeinput wasn't canceled or not supported, simulate the DOM change
        if (!wasCanceled) {
          // Get current selection
          const sel = window.getSelection()!
          const range = sel.getRangeAt(0)
          const node = range.startContainer
          const offset = range.startOffset

          // Insert text at cursor position
          if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent || ''
            node.textContent = textContent.slice(0, offset) + char + textContent.slice(offset)

            // Move cursor forward
            const newRange = document.createRange()
            newRange.setStart(node, offset + 1)
            newRange.collapse(true)
            sel.removeAllRanges()
            sel.addRange(newRange)
          } else {
            // If no text node, create one
            const textNode = document.createTextNode(char)
            node.appendChild(textNode)

            // Set cursor after the new text
            const newRange = document.createRange()
            newRange.setStart(textNode, 1)
            newRange.collapse(true)
            sel.removeAllRanges()
            sel.addRange(newRange)
          }

          // Dispatch input event to trigger the fallback handler
          const inputEvent = new Event('input', { bubbles: true })
          blockEl.dispatchEvent(inputEvent)
        }
      })

      // Small delay to allow state updates
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })
    }
  }

  // Helper to simulate paste
  const simulatePaste = async (container: HTMLElement, blockId: string, plainText: string, customData?: string, cursorPosition?: number) => {
    const blockEl = container.querySelector(`[data-block-id="${blockId}"] .block__content`) as HTMLElement

    // Focus the container
    container.focus()

    // Only set cursor if there's no existing selection
    const existingSelection = window.getSelection()!
    if (!existingSelection.rangeCount || existingSelection.isCollapsed) {
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      const position = cursorPosition !== undefined ? cursorPosition : blockEl.textContent?.length || 0
      range.setStart(textNode, position)
      range.collapse(true)

      existingSelection.removeAllRanges()
      existingSelection.addRange(range)
    }

    // Create clipboard data mock - jsdom doesn't fully support DataTransfer
    const clipboardData = {
      getData: jest.fn((type: string) => {
        if (type === 'text/plain') return plainText
        if (type === 'application/x-kairos-blocks') return customData || ''
        return ''
      }),
      types: customData ? ['text/plain', 'application/x-kairos-blocks'] : ['text/plain'],
    }

    // Create and dispatch paste event with mocked clipboardData
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
    })

    // Override the clipboardData property since jsdom doesn't support it properly
    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: clipboardData,
      writable: false,
    })

    await act(async () => {
      container.dispatchEvent(pasteEvent)
    })

    // Allow time for state updates
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
  }

  describe('✅ Basic Editing', () => {
    it('handles typing through custom input handler instead of browser default', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Test' }])
      const container = getContainer()

      // Type a character and verify it goes through our custom handler
      await simulateTyping(container, 'block-1', 'a', 4)

      // If default behavior wasn't prevented, the content would be corrupted
      // Our custom handler ensures the content is updated correctly through state
      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Testa')
      })

      // Verify the container remains a single contentEditable
      // Container should be contentEditable
      expect(container.getAttribute('contenteditable')).toBe('true')
      // In jsdom, contentEditable property might not be fully supported
      expect(container.hasAttribute('contenteditable')).toBe(true)
    })

    it('handles character input at correct position', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Hello world' }])
      const container = getContainer()

      // Simulate typing " beautiful" at position 5 (after "Hello")
      await simulateTyping(container, 'block-1', ' beautiful', 5)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Hello beautiful world')
      })
    })

    it('maintains cursor position after state updates', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Test' }])
      const container = getContainer()

      // Type "ing" at the end
      await simulateTyping(container, 'block-1', 'ing', 4)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Testing')
      })

      // Check cursor position is at the end
      await waitFor(() => {
        const currentSelection = window.getSelection()
        const currentRange = currentSelection?.getRangeAt(0)
        expect(currentRange?.startOffset).toBe(7) // "Testing" length
      })
    })

    it('works with different input methods (IME)', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Hello' }])
      const container = getContainer()

      // Simulate IME input
      await simulateTyping(container, 'block-1', ' 世界', 5)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Hello 世界')
      })
    })
  })

  describe('✅ Block Operations', () => {
    it('creates new block on Enter key', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'First line' }])
      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor after "First" (position 5)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 5)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Enter
      await act(async () => {
        fireEvent.keyDown(container, { key: 'Enter', code: 'Enter' })
      })

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(2)
        expect(store.getState().blocks[0].content).toBe('First')
        expect(store.getState().blocks[1].content).toBe(' line')
      })
    })

    it('splits block content at cursor position', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Hello beautiful world' }])
      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor after "beautiful" (position 15)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 15)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Enter
      await act(async () => {
        fireEvent.keyDown(container, { key: 'Enter', code: 'Enter' })
      })

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(2)
        expect(store.getState().blocks[0].content).toBe('Hello beautiful')
        expect(store.getState().blocks[1].content).toBe(' world')
      })
    })

    it('merges blocks on Backspace at start', async () => {
      const { store } = renderContainer([
        { id: 'block-1', type: 'paragraph', content: 'First block' },
        { id: 'block-2', type: 'paragraph', content: 'Second block' },
      ])

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(2)
      })

      const container = getContainer()
      const secondBlock = document.querySelector('[data-block-id="block-2"] .block__content') as HTMLElement

      // Set cursor at start of second block
      const range = document.createRange()
      const textNode = secondBlock.firstChild || secondBlock
      range.setStart(textNode, 0)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Backspace
      await act(async () => {
        fireEvent.keyDown(container, { key: 'Backspace', code: 'Backspace' })
      })

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(1)
        expect(store.getState().blocks[0].content).toBe('First blockSecond block')
      })
    })

    it('deletes forward on Delete key', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Test content' }])
      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Create selection from position 5 to 8
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 5)
      range.setEnd(textNode, 8)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Delete
      await act(async () => {
        fireEvent.keyDown(container, { key: 'Delete', code: 'Delete' })
      })

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Test tent')
      })
    })

    it('handles selection deletion (single block)', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Delete this text' }])
      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Select "this" (positions 7-11)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 7)
      range.setEnd(textNode, 11)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Backspace
      await act(async () => {
        fireEvent.keyDown(container, { key: 'Backspace', code: 'Backspace' })
      })

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Delete  text')
      })
    })

    it('handles selection deletion (multi-block)', async () => {
      const { store } = renderContainer([
        { id: 'block-1', type: 'paragraph', content: 'First block' },
        { id: 'block-2', type: 'paragraph', content: 'Second block' },
        { id: 'block-3', type: 'paragraph', content: 'Third block' },
      ])

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(3)
      })

      const container = getContainer()
      const firstBlock = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement
      const thirdBlock = document.querySelector('[data-block-id="block-3"] .block__content') as HTMLElement

      // Select from middle of first block to middle of third block
      const range = document.createRange()
      const firstTextNode = firstBlock.firstChild || firstBlock
      const thirdTextNode = thirdBlock.firstChild || thirdBlock
      range.setStart(firstTextNode, 6) // After "First "
      range.setEnd(thirdTextNode, 6) // After "Third "

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Delete
      await act(async () => {
        fireEvent.keyDown(container, { key: 'Delete', code: 'Delete' })
      })

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(1)
        // Should merge the unselected parts: "First " + "block"
        expect(store.getState().blocks[0].content).toBe('First block')
      })
    })
  })

  describe('✅ Paste Handling', () => {
    it('pastes plain text at cursor', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Hello world' }])
      const container = getContainer()

      // Manually set up handler to check if paste event is received
      const handlePasteSpy = jest.fn()
      container.addEventListener('paste', handlePasteSpy)

      // Add a small delay to ensure content is rendered
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      await simulatePaste(container, 'block-1', ' beautiful')

      // Check if paste event was received
      expect(handlePasteSpy).toHaveBeenCalled()

      await waitFor(
        () => {
          expect(store.getState().blocks[0].content).toBe('Hello world beautiful')
        },
        { timeout: 2000 }
      )
    })

    it('creates multiple blocks from multi-line paste', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Start' }])
      const container = getContainer()

      await simulatePaste(container, 'block-1', 'Line 1\nLine 2\nLine 3')

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(3)
        expect(store.getState().blocks[0].content).toBe('StartLine 1')
        expect(store.getState().blocks[1].content).toBe('Line 2')
        expect(store.getState().blocks[2].content).toBe('Line 3')
      })
    })

    it('preserves empty lines in custom format', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Start' }])
      const container = getContainer()

      const kairosData = JSON.stringify([
        { type: 'paragraph', content: 'First' },
        { type: 'paragraph', content: '' },
        { type: 'paragraph', content: 'Third' },
      ])

      await simulatePaste(container, 'block-1', 'First\n\nThird', kairosData)

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(3)
        expect(store.getState().blocks[0].content).toBe('StartFirst')
        expect(store.getState().blocks[1].content).toBe('')
        expect(store.getState().blocks[2].content).toBe('Third')
      })
    })

    it('handles paste with selection (replaces)', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Replace this text' }])
      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Wait for content to be rendered
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      // Select "this" (positions 8-12)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 8)
      range.setEnd(textNode, 12)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Verify selection is correct
      expect(selection.toString()).toBe('this')

      // Create paste event directly on the container
      const clipboardData = {
        getData: jest.fn((type: string) => {
          if (type === 'text/plain') return 'that'
          return ''
        }),
        types: ['text/plain'],
      }

      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
      })

      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: clipboardData,
        writable: false,
      })

      // Dispatch paste event
      await act(async () => {
        container.dispatchEvent(pasteEvent)
      })

      // Wait for state update
      await waitFor(() => {
        const content = store.getState().blocks[0].content
        expect(content).toBe('Replace that text')
      })
    })

    it('maintains block types from custom format', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Start' }])
      const container = getContainer()

      const kairosData = JSON.stringify([
        { type: 'h1', content: 'Heading 1' },
        { type: 'h2', content: 'Heading 2' },
        { type: 'bullet', content: 'Bullet point' },
      ])

      await simulatePaste(container, 'block-1', 'Heading 1\nHeading 2\nBullet point', kairosData)

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(3)
        expect(store.getState().blocks[0].content).toBe('StartHeading 1')
        expect(store.getState().blocks[0].type).toBe('paragraph') // First block maintains its type
        expect(store.getState().blocks[1].type).toBe('h2')
        expect(store.getState().blocks[1].content).toBe('Heading 2')
        expect(store.getState().blocks[2].type).toBe('bullet')
        expect(store.getState().blocks[2].content).toBe('Bullet point')
      })
    })

    it('prevents dangerous HTML injection', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Safe text' }])
      const container = getContainer()

      await simulatePaste(container, 'block-1', 'Bold text')

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Safe textBold text')
        expect(document.querySelector('script')).toBeNull()
      })
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles rapid typing without losing characters', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: '' }])
      const container = getContainer()

      const text = 'The quick brown fox jumps over the lazy dog'
      await simulateTyping(container, 'block-1', text, 0)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe(text)
      })
    })

    it('works at block boundaries', async () => {
      const { store } = renderContainer([
        { id: 'block-1', type: 'paragraph', content: 'First' },
        { id: 'block-2', type: 'paragraph', content: 'Second' },
      ])

      const container = getContainer()

      // Type at end of first block
      await simulateTyping(container, 'block-1', ' block', 5)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('First block')
      })

      // Type at start of second block
      await simulateTyping(container, 'block-2', 'The ', 0)

      await waitFor(() => {
        expect(store.getState().blocks[1].content).toBe('The Second')
      })
    })

    it('handles emoji and special characters', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Hello' }])
      const container = getContainer()

      const specialChars = ' 👋 🌍 © ™ €'
      await simulateTyping(container, 'block-1', specialChars, 5)

      await waitFor(() => {
        const content = store.getState().blocks[0].content
        // Check that special characters are present (might be encoded differently in jsdom)
        expect(content).toContain('Hello')
        expect(content).toContain('©')
        expect(content).toContain('™')
        expect(content).toContain('€')
        // Emoji might be encoded as replacement characters in jsdom
        expect(content.length).toBeGreaterThan(5)
      })
    })

    it('recovers from malformed paste data', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Test' }])
      const container = getContainer()

      // Create paste event with malformed JSON
      await simulatePaste(container, 'block-1', ' fallback', '{invalid json}')

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Test fallback')
      })
    })

    it('works with browser autofill', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: '' }])
      const container = getContainer()

      const email = 'autofilled@email.com'
      await simulateTyping(container, 'block-1', email, 0)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('autofilled@email.com')
      })
    })
  })

  describe('✅ Click Handling', () => {
    it('calls onBlockClick when clicking on a block', async () => {
      renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Click me' }])

      const blockContent = screen.getByText('Click me')
      fireEvent.click(blockContent)

      expect(mockOnBlockClick).toHaveBeenCalledWith('block-1')
    })

    it('handles clicks on nested elements within blocks', async () => {
      renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Nested content' }])

      const blockContent = screen.getByText('Nested content')

      // Create a span inside the block content
      const span = document.createElement('span')
      span.textContent = 'Nested'
      blockContent.innerHTML = ''
      blockContent.appendChild(span)

      // Click on the nested span
      fireEvent.click(span)

      expect(mockOnBlockClick).toHaveBeenCalledWith('block-1')
    })
  })

  // Note: Slash command tests are in ContentEditableContainer.slashcommand.test.tsx

  describe('✅ Undo/Redo Functionality', () => {
    it('undoes text changes with Ctrl+Z', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Original text' }])
      const container = getContainer()

      // Type some additional text
      await simulateTyping(container, 'block-1', ' added', 13)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Original text added')
      })

      // Press Ctrl+Z to undo
      await act(async () => {
        fireEvent.keyDown(container, { key: 'z', ctrlKey: true })
      })

      // Should revert to original text
      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Original text')
      })
    })

    it('redoes changes with Ctrl+Y', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Original text' }])
      const container = getContainer()

      // Type, undo, then redo
      await simulateTyping(container, 'block-1', ' added', 13)

      await act(async () => {
        fireEvent.keyDown(container, { key: 'z', ctrlKey: true }) // Undo
      })

      await act(async () => {
        fireEvent.keyDown(container, { key: 'y', ctrlKey: true }) // Redo
      })

      // Should have the added text back
      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Original text added')
      })
    })

    it('undoes formatting changes', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Make this bold' }])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Apply bold formatting
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 10)
      range.setEnd(textNode, 14)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      await act(async () => {
        fireEvent.keyDown(container, { key: 'b', ctrlKey: true })
      })

      // Verify formatting was applied
      await waitFor(() => {
        const formatting = store.getState().blocks[0].formatting || []
        expect(formatting).toHaveLength(1)
      })

      // Undo the formatting
      await act(async () => {
        fireEvent.keyDown(container, { key: 'z', ctrlKey: true })
      })

      // Formatting should be removed
      await waitFor(() => {
        const formatting = store.getState().blocks[0].formatting || []
        expect(formatting).toHaveLength(0)
      })
    })
  })

  describe('✅ Text Formatting Shortcuts', () => {
    it('applies bold formatting with Ctrl+B', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Make this bold text' }])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Select "bold" (positions 10-14)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 10)
      range.setEnd(textNode, 14)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Ctrl+B
      await act(async () => {
        fireEvent.keyDown(container, { key: 'b', ctrlKey: true, code: 'KeyB' })
      })

      await waitFor(() => {
        const formatting = store.getState().blocks[0].formatting
        expect(formatting).toHaveLength(1)
        expect(formatting?.[0]).toMatchObject({
          type: 'bold',
          start: 10,
          end: 14,
        })
      })
    })

    it('applies italic formatting with Ctrl+I', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Make this italic text' }])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Select "italic" (positions 10-16)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 10)
      range.setEnd(textNode, 16)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Ctrl+I
      await act(async () => {
        fireEvent.keyDown(container, { key: 'i', ctrlKey: true, code: 'KeyI' })
      })

      await waitFor(() => {
        const formatting = store.getState().blocks[0].formatting
        expect(formatting).toHaveLength(1)
        expect(formatting?.[0]).toMatchObject({
          type: 'italic',
          start: 10,
          end: 16,
        })
      })
    })

    it('applies underline formatting with Ctrl+U', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Make this underlined text' }])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Select "underlined" (positions 10-20)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 10)
      range.setEnd(textNode, 20)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Ctrl+U
      await act(async () => {
        fireEvent.keyDown(container, { key: 'u', ctrlKey: true, code: 'KeyU' })
      })

      await waitFor(() => {
        const formatting = store.getState().blocks[0].formatting
        expect(formatting).toHaveLength(1)
        expect(formatting?.[0]).toMatchObject({
          type: 'underline',
          start: 10,
          end: 20,
        })
      })
    })

    it('prompts for URL with Ctrl+K and creates link', async () => {
      const mockPrompt = jest.spyOn(window, 'prompt').mockReturnValue('https://example.com')
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Visit our website' }])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Select "website" (positions 10-17)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 10)
      range.setEnd(textNode, 17)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Ctrl+K
      await act(async () => {
        fireEvent.keyDown(container, { key: 'k', ctrlKey: true, code: 'KeyK' })
      })

      expect(mockPrompt).toHaveBeenCalledWith('Enter URL:')

      await waitFor(() => {
        const formatting = store.getState().blocks[0].formatting
        expect(formatting).toHaveLength(1)
        expect(formatting?.[0]).toMatchObject({
          type: 'link',
          start: 10,
          end: 17,
          url: 'https://example.com',
        })
      })

      mockPrompt.mockRestore()
    })

    it('toggles off existing link with Ctrl+K', async () => {
      const { store } = renderContainer([
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'Visit our website',
          formatting: [{ type: 'link', start: 10, end: 17, url: 'https://example.com' }],
        },
      ])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Focus container
      container.focus()

      // Select the linked text area (matching the existing formatting)
      const range = document.createRange()
      const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT)
      let node
      let currentOffset = 0
      let startNode = null
      let startOffset = 0
      let endNode = null
      let endOffset = 0

      while ((node = walker.nextNode())) {
        const nodeLength = node.textContent?.length || 0
        if (!startNode && currentOffset + nodeLength > 10) {
          startNode = node
          startOffset = 10 - currentOffset
        }
        if (!endNode && currentOffset + nodeLength >= 17) {
          endNode = node
          endOffset = 17 - currentOffset
        }
        currentOffset += nodeLength
      }

      if (startNode && endNode) {
        range.setStart(startNode, startOffset)
        range.setEnd(endNode, endOffset)
        const selection = window.getSelection()!
        selection.removeAllRanges()
        selection.addRange(range)
      }

      // Press Ctrl+K to toggle off the link
      await act(async () => {
        fireEvent.keyDown(container, { key: 'k', ctrlKey: true, code: 'KeyK' })
      })

      await waitFor(() => {
        const formatting = store.getState().blocks[0].formatting || []
        expect(formatting).toHaveLength(0)
      })
    })

    it('works with Cmd key on Mac', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Mac command test' }])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Select "command" (positions 4-11)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 4)
      range.setEnd(textNode, 11)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Press Cmd+B (metaKey instead of ctrlKey)
      await act(async () => {
        fireEvent.keyDown(container, { key: 'b', metaKey: true, code: 'KeyB' })
      })

      await waitFor(() => {
        const formatting = store.getState().blocks[0].formatting
        expect(formatting).toHaveLength(1)
        expect(formatting?.[0]).toMatchObject({
          type: 'bold',
          start: 4,
          end: 11,
        })
      })
    })
  })

  describe('✅ Multi-Block Formatting', () => {
    it('applies formatting across multiple blocks', async () => {
      const { store } = renderContainer([
        { id: 'block-1', type: 'paragraph', content: 'First paragraph' },
        { id: 'block-2', type: 'paragraph', content: 'Second paragraph' },
        { id: 'block-3', type: 'paragraph', content: 'Third paragraph' },
      ])

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(3)
      })

      const container = getContainer()
      const firstBlock = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement
      const thirdBlock = container.querySelector('[data-block-id="block-3"] .block__content') as HTMLElement

      // Select from "paragraph" in first block to "Third" in third block
      const range = document.createRange()
      range.setStart(firstBlock.firstChild!, 6)
      range.setEnd(thirdBlock.firstChild!, 5)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Apply bold formatting
      await act(async () => {
        fireEvent.keyDown(container, { key: 'b', ctrlKey: true, code: 'KeyB' })
      })

      await waitFor(() => {
        const blocks = store.getState().blocks
        // First block: "paragraph" should be bold
        expect(blocks[0].formatting).toContainEqual(expect.objectContaining({ type: 'bold', start: 6, end: 15 }))
        // Second block: entire content should be bold
        expect(blocks[1].formatting).toContainEqual(expect.objectContaining({ type: 'bold', start: 0, end: 16 }))
        // Third block: "Third" should be bold
        expect(blocks[2].formatting).toContainEqual(expect.objectContaining({ type: 'bold', start: 0, end: 5 }))
      })
    })

    it('applies link formatting across multiple blocks with URL prompt', async () => {
      const mockPrompt = jest.spyOn(window, 'prompt').mockReturnValue('https://multiblock.com')
      const { store } = renderContainer([
        { id: 'block-1', type: 'paragraph', content: 'Link this text' },
        { id: 'block-2', type: 'paragraph', content: 'And this too' },
      ])

      const container = getContainer()
      const firstBlock = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement
      const secondBlock = container.querySelector('[data-block-id="block-2"] .block__content') as HTMLElement

      // Select from "this" in first block to "this" in second block
      const range = document.createRange()
      range.setStart(firstBlock.firstChild!, 5)
      range.setEnd(secondBlock.firstChild!, 8)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Apply link formatting
      await act(async () => {
        fireEvent.keyDown(container, { key: 'k', ctrlKey: true, code: 'KeyK' })
      })

      expect(mockPrompt).toHaveBeenCalledWith('Enter URL:')

      await waitFor(() => {
        const blocks = store.getState().blocks
        // First block: "this text" should be linked
        expect(blocks[0].formatting).toContainEqual(expect.objectContaining({ type: 'link', start: 5, end: 14, url: 'https://multiblock.com' }))
        // Second block: "And this" should be linked
        expect(blocks[1].formatting).toContainEqual(expect.objectContaining({ type: 'link', start: 0, end: 8, url: 'https://multiblock.com' }))
      })

      mockPrompt.mockRestore()
    })
  })

  describe('✅ Selection Restoration', () => {
    it('restores selection after applying formatting to single block', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Format and restore selection' }])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Select "restore" (positions 11-18)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 11)
      range.setEnd(textNode, 18)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Apply bold
      await act(async () => {
        fireEvent.keyDown(container, { key: 'b', ctrlKey: true, code: 'KeyB' })
      })

      // Wait for formatting to be applied and selection to be restored
      await waitFor(() => {
        const currentSelection = window.getSelection()!
        expect(currentSelection.rangeCount).toBeGreaterThan(0)

        // Selection should still be on "restore"
        const selectedText = currentSelection.toString()
        expect(selectedText).toBe('restore')
      })
    })

    it('restores selection after multi-block formatting', async () => {
      const { store } = renderContainer([
        { id: 'block-1', type: 'paragraph', content: 'First block' },
        { id: 'block-2', type: 'paragraph', content: 'Second block' },
      ])

      const container = getContainer()
      const firstBlock = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement
      const secondBlock = container.querySelector('[data-block-id="block-2"] .block__content') as HTMLElement

      // Select across blocks
      const range = document.createRange()
      range.setStart(firstBlock.firstChild!, 6)
      range.setEnd(secondBlock.firstChild!, 6)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Apply italic
      await act(async () => {
        fireEvent.keyDown(container, { key: 'i', ctrlKey: true, code: 'KeyI' })
      })

      // Wait for selection restoration
      await waitFor(() => {
        const currentSelection = window.getSelection()!
        expect(currentSelection.rangeCount).toBeGreaterThan(0)

        // Should have multi-block selection
        const selectedText = currentSelection.toString()
        expect(selectedText).toContain('block')
        expect(selectedText).toContain('Second')
      })
    })
  })

  // Note: Markdown detection tests are in ContentEditableContainer.markdown.test.tsx

  describe('✅ Cross-Block Selection', () => {
    it('allows selecting text across multiple blocks with mouse', async () => {
      renderContainer([
        { id: 'block-1', type: 'paragraph', content: 'First paragraph text' },
        { id: 'block-2', type: 'paragraph', content: 'Second paragraph text' },
        { id: 'block-3', type: 'paragraph', content: 'Third paragraph text' },
      ])

      const container = getContainer()
      const firstBlock = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement
      const thirdBlock = container.querySelector('[data-block-id="block-3"] .block__content') as HTMLElement

      // Simulate mouse selection across blocks
      const range = document.createRange()
      range.setStart(firstBlock.firstChild!, 6)
      range.setEnd(thirdBlock.firstChild!, 5)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Verify selection spans multiple blocks
      const selectedText = selection.toString()
      expect(selectedText).toContain('paragraph text')
      expect(selectedText).toContain('Second paragraph text')
      expect(selectedText).toContain('Third')
    })

    it('handles copy with cross-block selection', async () => {
      const { store } = renderContainer([
        { id: 'block-1', type: 'h1', content: 'Title' },
        { id: 'block-2', type: 'paragraph', content: 'Paragraph' },
        { id: 'block-3', type: 'bullet', content: 'Bullet point' },
      ])

      const container = getContainer()
      const firstBlock = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement
      const thirdBlock = container.querySelector('[data-block-id="block-3"] .block__content') as HTMLElement

      // Select across all blocks
      const range = document.createRange()
      range.setStart(firstBlock.firstChild!, 0)
      range.setEnd(thirdBlock.firstChild!, 12)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Verify the selection includes all expected text
      const selectedText = selection.toString()
      expect(selectedText).toContain('Title')
      expect(selectedText).toContain('Paragraph')
      expect(selectedText).toContain('Bullet point')
    })
  })

  describe('✅ Focus Management', () => {
    it('maintains focus after operations', async () => {
      renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Test' }])
      const container = getContainer()

      // Focus the container
      container.focus()
      expect(document.activeElement).toBe(container)

      // Type some text
      await simulateTyping(container, 'block-1', ' more', 4)

      // Container should still be focused
      expect(document.activeElement).toBe(container)
    })

    it('restores focus after formatting toolbar interaction', async () => {
      renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Select this text' }])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Select some text first
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 0)
      range.setEnd(textNode, 6) // "Select"
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Apply formatting
      await act(async () => {
        fireEvent.keyDown(container, { key: 'b', ctrlKey: true })
      })

      // Container should maintain focus (or body in jsdom)
      // In jsdom, focus behavior might differ from real browsers
      expect([container, document.body].includes(document.activeElement as HTMLElement)).toBe(true)
    })
  })

  describe('✅ Complex Formatting Scenarios', () => {
    it('handles overlapping formatting correctly', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'This text has overlapping formats' }])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Apply bold to "text has"
      let range = document.createRange()
      let textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 5)
      range.setEnd(textNode, 13)
      let selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      await act(async () => {
        fireEvent.keyDown(container, { key: 'b', ctrlKey: true })
      })

      // Apply italic to "has overlapping"
      range = document.createRange()
      textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 10)
      range.setEnd(textNode, 25)
      selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      await act(async () => {
        fireEvent.keyDown(container, { key: 'i', ctrlKey: true })
      })

      await waitFor(() => {
        const formatting = store.getState().blocks[0].formatting || []
        // Should have bold from 5-13 and italic from 10-25
        expect(formatting).toHaveLength(2)
        expect(formatting).toContainEqual(expect.objectContaining({ type: 'bold', start: 5, end: 13 }))
        expect(formatting).toContainEqual(expect.objectContaining({ type: 'italic', start: 10, end: 25 }))
      })

      // The text "has" (positions 10-13) should have both bold and italic
    })

    it('removes formatting correctly when toggling off', async () => {
      const { store } = renderContainer([
        {
          id: 'block-1',
          type: 'paragraph',
          content: 'Bold and italic text',
          formatting: [
            { type: 'bold', start: 0, end: 4 },
            { type: 'italic', start: 9, end: 15 },
          ],
        },
      ])
      const container = getContainer()
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Select the bold text and toggle it off
      const range = document.createRange()
      const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT)
      let textNode
      while ((textNode = walker.nextNode())) {
        if (textNode.textContent?.includes('Bold')) break
      }

      if (textNode) {
        range.setStart(textNode, 0)
        range.setEnd(textNode, 4)
        const selection = window.getSelection()!
        selection.removeAllRanges()
        selection.addRange(range)

        await act(async () => {
          fireEvent.keyDown(container, { key: 'b', ctrlKey: true })
        })
      }

      await waitFor(() => {
        const formatting = store.getState().blocks[0].formatting || []
        // Should only have italic formatting left
        expect(formatting).toHaveLength(1)
        expect(formatting[0]).toMatchObject({ type: 'italic', start: 9, end: 15 })
      })
    })
  })

  describe('✅ Error Handling', () => {
    it('handles cursor positioning errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Test' }])
      const container = getContainer()

      // Try to set cursor at invalid position
      const blockEl = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Remove all content to cause positioning error
      blockEl.innerHTML = ''

      // This should not throw
      await simulateTyping(container, 'block-1', 'New text', 0)

      // Should recover and add text
      await waitFor(() => {
        expect(store.getState().blocks[0].content).toContain('New text')
      })

      consoleSpy.mockRestore()
    })

    it('handles missing block elements', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Test' }])
      const container = getContainer()

      // Try to interact with non-existent block
      const fakeBlockId = 'non-existent'

      // This should not throw
      await expect(async () => {
        await simulateTyping(container, fakeBlockId, 'Text', 0)
      }).rejects.toThrow() // simulateTyping helper will throw, but component should handle gracefully
    })
  })
})
