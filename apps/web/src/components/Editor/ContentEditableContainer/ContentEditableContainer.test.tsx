import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  describe('✅ Basic Editing', () => {
    it('prevents default contentEditable behavior', async () => {
      renderContainer()
      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set up a selection
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 0)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Create a beforeinput event
      const event = new InputEvent('beforeinput', {
        data: 'a',
        inputType: 'insertText',
        bubbles: true,
        cancelable: true,
      })

      // Spy on preventDefault
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault')

      // Dispatch the event
      container.dispatchEvent(event)

      // Should prevent default behavior
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('handles character input at correct position', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Hello world' }])

      // Wait for initial render
      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Hello world')
      })

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor position after "Hello" (position 5)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 5)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Type " beautiful"
      const text = ' beautiful'
      for (const char of text) {
        const event = new InputEvent('beforeinput', {
          data: char,
          inputType: 'insertText',
          bubbles: true,
          cancelable: true,
        })
        container.dispatchEvent(event)
      }

      // Check that content was updated correctly
      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Hello beautiful world')
      })
    })

    it('maintains cursor position after state updates', async () => {
      renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Test' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at end
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 4)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Type "ing"
      for (const char of 'ing') {
        const event = new InputEvent('beforeinput', {
          data: char,
          inputType: 'insertText',
          bubbles: true,
          cancelable: true,
        })
        container.dispatchEvent(event)

        // Give React time to update
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
        })
      }

      // Check cursor is at the end
      await waitFor(() => {
        const currentSelection = window.getSelection()
        const currentRange = currentSelection?.getRangeAt(0)
        expect(currentRange?.startOffset).toBe(7) // "Testing" length
      })
    })

    it('works with different input methods (IME)', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Hello' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at end
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 5)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Simulate IME input
      const text = ' 世界'
      for (const char of text) {
        const event = new InputEvent('beforeinput', {
          data: char,
          inputType: 'insertText',
          bubbles: true,
          cancelable: true,
        })
        container.dispatchEvent(event)
      }

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
      fireEvent.keyDown(container, { key: 'Enter', code: 'Enter' })

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
      fireEvent.keyDown(container, { key: 'Enter', code: 'Enter' })

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

      // Wait for blocks to be initialized
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
      fireEvent.keyDown(container, { key: 'Backspace', code: 'Backspace' })

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
      fireEvent.keyDown(container, { key: 'Delete', code: 'Delete' })

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
      fireEvent.keyDown(container, { key: 'Backspace', code: 'Backspace' })

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

      // Wait for all blocks to be rendered
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
      fireEvent.keyDown(container, { key: 'Delete', code: 'Delete' })

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(1)
        expect(store.getState().blocks[0].content).toBe('First block')
      })
    })
  })

  describe('✅ Paste Handling', () => {
    it('pastes plain text at cursor', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Hello world' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at position 5
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 5)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Create paste event
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      })
      pasteEvent.clipboardData?.setData('text/plain', ' beautiful')

      fireEvent.paste(container, pasteEvent)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Hello beautiful world')
      })
    })

    it('creates multiple blocks from multi-line paste', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Start' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at end
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 5)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Create paste event with multiple lines
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      })
      pasteEvent.clipboardData?.setData('text/plain', '\nLine 1\nLine 2\nLine 3')

      fireEvent.paste(container, pasteEvent)

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(4)
        expect(store.getState().blocks[0].content).toBe('Start')
        expect(store.getState().blocks[1].content).toBe('Line 1')
        expect(store.getState().blocks[2].content).toBe('Line 2')
        expect(store.getState().blocks[3].content).toBe('Line 3')
      })
    })

    it('preserves empty lines in custom format', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Start' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at end
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 5)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Create paste event with custom Kairos format
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      })

      const kairosData = JSON.stringify([
        { type: 'paragraph', content: 'First' },
        { type: 'paragraph', content: '' },
        { type: 'paragraph', content: 'Third' },
      ])

      pasteEvent.clipboardData?.setData('application/x-kairos-blocks', kairosData)
      pasteEvent.clipboardData?.setData('text/plain', 'First\n\nThird')

      fireEvent.paste(container, pasteEvent)

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(4)
        expect(store.getState().blocks[0].content).toBe('StartFirst')
        expect(store.getState().blocks[1].content).toBe('')
        expect(store.getState().blocks[2].content).toBe('Third')
        expect(store.getState().blocks[3].content).toBe('')
      })
    })

    it('handles paste with selection (replaces)', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Replace this text' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Select "this" (positions 8-12)
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 8)
      range.setEnd(textNode, 12)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Create paste event
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      })
      pasteEvent.clipboardData?.setData('text/plain', 'that')

      fireEvent.paste(container, pasteEvent)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Replace that text')
      })
    })

    it('maintains block types from custom format', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Start' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at end
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 5)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Create paste event with custom Kairos format including different block types
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      })

      const kairosData = JSON.stringify([
        { type: 'h1', content: 'Heading 1' },
        { type: 'h2', content: 'Heading 2' },
        { type: 'bullet', content: 'Bullet point' },
      ])

      pasteEvent.clipboardData?.setData('application/x-kairos-blocks', kairosData)

      fireEvent.paste(container, pasteEvent)

      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(4)
        expect(store.getState().blocks[0].content).toBe('StartHeading 1')
        expect(store.getState().blocks[1].type).toBe('h2')
        expect(store.getState().blocks[1].content).toBe('Heading 2')
        expect(store.getState().blocks[2].type).toBe('bullet')
        expect(store.getState().blocks[2].content).toBe('Bullet point')
      })
    })

    it('prevents dangerous HTML injection', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Safe text' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at end
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 9)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Create paste event with dangerous HTML
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      })
      pasteEvent.clipboardData?.setData('text/html', '<script>alert("XSS")</script><b>Bold text</b>')
      pasteEvent.clipboardData?.setData('text/plain', 'Bold text')

      fireEvent.paste(container, pasteEvent)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Safe textBold text')
        // Ensure no script tags were executed or added
        expect(document.querySelector('script')).toBeNull()
      })
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles rapid typing without losing characters', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: '' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at start
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 0)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Type rapidly
      const text = 'The quick brown fox jumps over the lazy dog'
      for (const char of text) {
        const event = new InputEvent('beforeinput', {
          data: char,
          inputType: 'insertText',
          bubbles: true,
          cancelable: true,
        })
        container.dispatchEvent(event)
      }

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
      const firstBlock = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement
      const range1 = document.createRange()
      const textNode1 = firstBlock.firstChild || firstBlock
      range1.setStart(textNode1, 5)
      range1.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range1)

      const event1 = new InputEvent('beforeinput', {
        data: ' block',
        inputType: 'insertText',
        bubbles: true,
        cancelable: true,
      })
      container.dispatchEvent(event1)

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('First block')
      })

      // Type at start of second block
      const secondBlock = document.querySelector('[data-block-id="block-2"] .block__content') as HTMLElement
      const range2 = document.createRange()
      const textNode2 = secondBlock.firstChild || secondBlock
      range2.setStart(textNode2, 0)
      range2.collapse(true)

      selection.removeAllRanges()
      selection.addRange(range2)

      const event2 = new InputEvent('beforeinput', {
        data: 'The ',
        inputType: 'insertText',
        bubbles: true,
        cancelable: true,
      })
      container.dispatchEvent(event2)

      await waitFor(() => {
        expect(store.getState().blocks[1].content).toBe('The Second')
      })
    })

    it('handles emoji and special characters', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Hello' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at end
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 5)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Type emoji and special characters
      const specialChars = ' 👋 🌍 © ™ €'
      for (const char of specialChars) {
        const event = new InputEvent('beforeinput', {
          data: char,
          inputType: 'insertText',
          bubbles: true,
          cancelable: true,
        })
        container.dispatchEvent(event)
      }

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Hello 👋 🌍 © ™ €')
      })
    })

    it('recovers from malformed paste data', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: 'Test' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at end
      const range = document.createRange()
      const textNode = blockEl.firstChild || blockEl
      range.setStart(textNode, 4)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Create paste event with malformed JSON
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      })

      pasteEvent.clipboardData?.setData('application/x-kairos-blocks', '{invalid json}')
      pasteEvent.clipboardData?.setData('text/plain', ' fallback')

      fireEvent.paste(container, pasteEvent)

      // Should fall back to plain text
      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Test fallback')
      })
    })

    it('works with browser autofill', async () => {
      const { store } = renderContainer([{ id: 'block-1', type: 'paragraph', content: '' }])

      const container = getContainer()
      const blockEl = document.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement

      // Set cursor at start
      const range = document.createRange()
      range.setStart(blockEl, 0)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Simulate autofill by typing the text
      const email = 'autofilled@email.com'
      for (const char of email) {
        const event = new InputEvent('beforeinput', {
          data: char,
          inputType: 'insertText',
          bubbles: true,
          cancelable: true,
        })
        container.dispatchEvent(event)
      }

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
})
