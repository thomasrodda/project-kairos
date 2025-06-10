// apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.slashcommand.test.tsx
// Tests for slash command functionality in ContentEditableContainer

import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ContentEditableContainer } from './ContentEditableContainer'
import { renderWithEditor } from '../../../test/utils'

describe('ContentEditableContainer - Slash Commands', () => {
  const renderComponent = (initialBlocks = [{ id: 'block-1', type: 'paragraph' as const, content: 'Test content' }]) => {
    return renderWithEditor(
      <ContentEditableContainer>
        {initialBlocks.map((block) => (
          <div key={block.id} className="block" data-block-id={block.id}>
            <div className="block__content" data-block-id={block.id}>
              {block.content}
            </div>
          </div>
        ))}
      </ContentEditableContainer>,
      { initialBlocks }
    )
  }

  // Helper to simulate typing in contentEditable
  const simulateBeforeInput = (container: HTMLElement, data: string) => {
    const beforeInputEvent = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data,
      inputType: 'insertText',
    })

    act(() => {
      container.dispatchEvent(beforeInputEvent)
    })
  }

  // Helper to set cursor position
  const setCursorPosition = (blockContent: HTMLElement, position: number) => {
    const range = document.createRange()
    const textNode = blockContent.firstChild || blockContent
    range.setStart(textNode, position)
    range.collapse(true)

    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Slash Command Trigger', () => {
    it('shows slash menu when typing / at start of block', async () => {
      const { container } = renderComponent([{ id: 'block-1', type: 'paragraph', content: '' }])

      // Wait for the content to be rendered
      await waitFor(() => {
        expect(container.querySelector('.block__content')).toBeInTheDocument()
      })

      const contentEditableContainer = container.querySelector('.content-editable-container') as HTMLDivElement
      const blockContent = container.querySelector('.block__content')!

      // Focus the container
      contentEditableContainer.focus()

      // Add a small delay to ensure focus is processed
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      // Set cursor at start of block
      setCursorPosition(blockContent as HTMLElement, 0)

      // Simulate typing slash
      simulateBeforeInput(contentEditableContainer, '/')

      await waitFor(
        () => {
          expect(screen.getByPlaceholderText('Search block types...')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })

    it('shows slash menu when typing / after a space', async () => {
      const { container } = renderComponent([{ id: 'block-1', type: 'paragraph', content: 'Test ' }])
      const contentEditableContainer = container.querySelector('.content-editable-container') as HTMLDivElement
      const blockContent = container.querySelector('.block__content')!

      // Focus the container
      contentEditableContainer.focus()

      // Set cursor after the space
      setCursorPosition(blockContent as HTMLElement, 5) // After "Test "

      // Simulate typing slash
      simulateBeforeInput(contentEditableContainer, '/')

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search block types...')).toBeInTheDocument()
      })
    })

    it('does not show slash menu when typing / in middle of word', async () => {
      const { container } = renderComponent([{ id: 'block-1', type: 'paragraph', content: 'Testing' }])
      const contentEditableContainer = container.querySelector('.content-editable-container') as HTMLDivElement
      const blockContent = container.querySelector('.block__content')!

      // Focus the container
      contentEditableContainer.focus()

      // Set cursor in the middle of "Testing"
      setCursorPosition(blockContent as HTMLElement, 4) // After "Test"

      // Simulate typing slash
      simulateBeforeInput(contentEditableContainer, '/')

      // Menu should not appear
      expect(screen.queryByPlaceholderText('Search block types...')).not.toBeInTheDocument()
    })
  })

  describe('✅ Slash Command Interaction', () => {
    it('hides menu when typing non-slash character', async () => {
      const { container } = renderComponent([{ id: 'block-1', type: 'paragraph', content: '' }])
      const contentEditableContainer = container.querySelector('.content-editable-container') as HTMLDivElement
      const blockContent = container.querySelector('.block__content')!

      // Focus the container
      contentEditableContainer.focus()

      // Set cursor at start
      setCursorPosition(blockContent as HTMLElement, 0)

      // Type slash to show menu
      simulateBeforeInput(contentEditableContainer, '/')

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search block types...')).toBeInTheDocument()
      })

      // Type another character
      simulateBeforeInput(contentEditableContainer, 'a')

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search block types...')).not.toBeInTheDocument()
      })
    })

    it('hides menu when pressing Backspace', async () => {
      const { container } = renderComponent([{ id: 'block-1', type: 'paragraph', content: '' }])
      const contentEditableContainer = container.querySelector('.content-editable-container') as HTMLDivElement
      const blockContent = container.querySelector('.block__content')!

      // Focus the container
      contentEditableContainer.focus()

      // Set cursor at start
      setCursorPosition(blockContent as HTMLElement, 0)

      // Type slash to show menu
      simulateBeforeInput(contentEditableContainer, '/')

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search block types...')).toBeInTheDocument()
      })

      // Press Backspace
      fireEvent.keyDown(contentEditableContainer, {
        key: 'Backspace',
      })

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search block types...')).not.toBeInTheDocument()
      })
    })
  })

  describe('✅ Block Type Conversion', () => {
    it('changes block type when selecting from menu', async () => {
      const { container, store } = renderComponent([{ id: 'block-1', type: 'paragraph', content: '' }])
      const contentEditableContainer = container.querySelector('.content-editable-container') as HTMLDivElement
      const blockContent = container.querySelector('.block__content')!

      // Focus the container
      contentEditableContainer.focus()

      // Set cursor at start
      setCursorPosition(blockContent as HTMLElement, 0)

      // Type slash to show menu
      simulateBeforeInput(contentEditableContainer, '/')

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search block types...')).toBeInTheDocument()
      })

      // Select Heading 1
      const h1Button = screen.getByText('Heading 1').closest('button')!
      fireEvent.click(h1Button)

      await waitFor(() => {
        const state = store.getState()
        const block = state.blocks.find((b) => b.id === 'block-1')
        expect(block?.type).toBe('h1')
        expect(block?.content).toBe('') // Slash should be removed
      })
    })

    it('removes slash character when converting block type', async () => {
      const { container, store } = renderComponent([{ id: 'block-1', type: 'paragraph', content: 'Hello ' }])
      const contentEditableContainer = container.querySelector('.content-editable-container') as HTMLDivElement
      const blockContent = container.querySelector('.block__content')!

      // Focus the container
      contentEditableContainer.focus()

      // Position cursor after the space
      setCursorPosition(blockContent as HTMLElement, 6) // After "Hello "

      // Type slash to trigger menu
      simulateBeforeInput(contentEditableContainer, '/')

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search block types...')).toBeInTheDocument()
      })

      // Select Bullet List
      const bulletButton = screen.getByText('Bullet List').closest('button')!
      fireEvent.click(bulletButton)

      await waitFor(() => {
        const state = store.getState()
        const block = state.blocks.find((b) => b.id === 'block-1')
        expect(block?.type).toBe('bullet')
        expect(block?.content).toBe('Hello ') // Slash removed
      })
    })
  })
})
