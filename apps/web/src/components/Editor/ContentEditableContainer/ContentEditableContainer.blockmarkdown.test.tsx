import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditorProvider } from '../../../contexts/EditorContext'
import { ContentEditableContainer } from './ContentEditableContainer'
import { EditorContent } from '../EditorContent'
import { renderWithEditor } from '../../../test/utils'
import { Editor } from '../Editor'
import { EditorBlock } from '../../../contexts/EditorContext'

// Test wrapper that provides editor context with custom blocks
function TestEditor({ blocks }: { blocks: EditorBlock[] }) {
  return <Editor />
}

// Helper to simulate typing character by character
const simulateTyping = async (container: HTMLElement, blockId: string, text: string, position: number = 0) => {
  // Wait for the block element to be available
  await waitFor(() => {
    const block = container.querySelector(`[data-block-id="${blockId}"]`)
    expect(block).toBeTruthy()
  })

  const blockEl = container.querySelector(`[data-block-id="${blockId}"] .block__content`) as HTMLElement

  if (!blockEl) {
    throw new Error(`Block content element not found for block ${blockId}`)
  }

  // Focus the container first
  container.focus()

  // Wait a bit for focus to settle
  await new Promise((resolve) => setTimeout(resolve, 50))

  // Set up selection in the block
  const selection = window.getSelection()!
  const range = document.createRange()

  // Ensure block has at least an empty text node
  if (!blockEl.firstChild) {
    blockEl.appendChild(document.createTextNode(''))
  }

  // Set the cursor at the beginning of the block
  range.setStart(blockEl.firstChild || blockEl, 0)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)

  // Focus the container (ContentEditableContainer needs this)
  container.focus()

  // Wait for focus to settle
  await new Promise((resolve) => setTimeout(resolve, 50))

  // Simulate typing character by character
  for (const char of text) {
    // Dispatch beforeinput event
    const beforeInputEvent = new InputEvent('beforeinput', {
      data: char,
      inputType: 'insertText',
      bubbles: true,
      cancelable: true,
    })

    await act(async () => {
      // The ContentEditableContainer should prevent default and handle the input
      container.dispatchEvent(beforeInputEvent)
    })

    // Small delay to allow state updates
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
  }
}

describe('ContentEditableContainer - Block Markdown Conversion', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks()
  })

  describe('Heading conversions', () => {
    it('should convert "# " to H1 block', async () => {
      const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      // Wait for the component to be fully rendered
      await waitFor(() => {
        const container = document.querySelector('.content-editable-container')
        expect(container).toBeTruthy()
      })

      const container = document.querySelector('.content-editable-container') as HTMLDivElement

      // Ensure the container has the event listener attached
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
      })

      // Type "# "
      await simulateTyping(container, 'test-block-1', '# ')

      // First check if content is being updated
      await waitFor(() => {
        const blocks = store.getState().blocks
        console.log('Block content:', blocks[0].content)
        console.log('Block type:', blocks[0].type)
        expect(blocks[0].content).toBe('# ')
      })

      // Then check if block type changed
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks[0].type).toBe('h1')
        expect(blocks[0].content).toBe('')
      })
    })

    it('should convert "## " to H2 block', async () => {
      const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      const container = document.querySelector('.content-editable-container') as HTMLDivElement

      // Type "## "
      await simulateTyping(container, 'test-block-1', '## ')

      // Wait for the block type to change
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks[0].type).toBe('h2')
        expect(blocks[0].content).toBe('')
      })
    })

    it('should convert "### " to H3 block', async () => {
      const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      const container = document.querySelector('.content-editable-container') as HTMLDivElement

      // Type "### "
      await simulateTyping(container, 'test-block-1', '### ')

      // Wait for the block type to change
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks[0].type).toBe('h3')
        expect(blocks[0].content).toBe('')
      })
    })
  })

  describe('List conversions', () => {
    it('should convert "- " to bullet block', async () => {
      const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      const container = document.querySelector('.content-editable-container') as HTMLDivElement

      // Type "- "
      await simulateTyping(container, 'test-block-1', '- ')

      // Wait for the block type to change
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks[0].type).toBe('bullet')
        expect(blocks[0].content).toBe('')
      })
    })

    it('should convert "* " to bullet block', async () => {
      const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      const container = document.querySelector('.content-editable-container') as HTMLDivElement

      // Type "* "
      await simulateTyping(container, 'test-block-1', '* ')

      // Wait for the block type to change
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks[0].type).toBe('bullet')
        expect(blocks[0].content).toBe('')
      })
    })
  })

  describe('Content after markdown conversion', () => {
    it('should allow typing content after H1 conversion', async () => {
      const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      const container = document.querySelector('.content-editable-container') as HTMLDivElement

      // Type "# My Heading" - all in one go to test continuous typing
      await simulateTyping(container, 'test-block-1', '# My Heading')

      // Wait for the block type to change and content to be updated
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks[0].type).toBe('h1')
        expect(blocks[0].content).toBe('My Heading')
      })
    })

    it('should allow typing content after bullet conversion', async () => {
      const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      const container = document.querySelector('.content-editable-container') as HTMLDivElement

      // Type "- My list item" - all in one go
      await simulateTyping(container, 'test-block-1', '- My list item')

      // Wait for the block type to change and content to be updated
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks[0].type).toBe('bullet')
        expect(blocks[0].content).toBe('My list item')
      })
    })
  })

  describe('Non-conversion cases', () => {
    it('should not convert "#" without space', async () => {
      const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      const container = document.querySelector('.content-editable-container') as HTMLDivElement

      // Type "#heading" without space
      await simulateTyping(container, 'test-block-1', '#heading')

      // Should still be a paragraph
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks[0].type).toBe('paragraph')
        expect(blocks[0].content).toBe('#heading')
      })
    })

    it('should not convert markdown patterns in middle of text', async () => {
      const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      const container = document.querySelector('.content-editable-container') as HTMLDivElement

      // Type text with markdown pattern in middle
      await simulateTyping(container, 'test-block-1', 'Some text # not a heading')

      // Should still be a paragraph
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks[0].type).toBe('paragraph')
        expect(blocks[0].content).toBe('Some text # not a heading')
      })
    })
  })
})
