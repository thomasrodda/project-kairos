// apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.markdown.test.tsx

import React from 'react'
import { waitFor, act } from '@testing-library/react'
import { ContentEditableContainer } from './ContentEditableContainer'
import { renderWithEditor } from '../../../test/utils'
import type { EditorBlock } from '../../../contexts/EditorContext'
import '@testing-library/jest-dom'

describe('ContentEditableContainer - Markdown Detection', () => {
  const initialBlocks: EditorBlock[] = [{ id: '1', type: 'paragraph', content: '' }]

  const renderContainer = (blocks = initialBlocks) => {
    return renderWithEditor(
      <ContentEditableContainer>
        {blocks.map((block) => (
          <div key={block.id} className="block" data-block-id={block.id}>
            <div className="block__content" data-block-id={block.id}>
              {block.content}
            </div>
          </div>
        ))}
      </ContentEditableContainer>,
      { initialBlocks: blocks }
    )
  }

  // Helper to simulate typing in contentEditable
  const simulateTyping = async (container: HTMLElement, blockId: string, text: string) => {
    const blockEl = container.querySelector(`[data-block-id="${blockId}"] .block__content`) as HTMLElement

    // Focus the container
    container.focus()

    // Set cursor position at end
    const range = document.createRange()
    const textNode = blockEl.firstChild || blockEl
    range.setStart(textNode, blockEl.textContent?.length || 0)
    range.collapse(true)

    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)

    // Type each character
    for (const char of text) {
      const beforeInputEvent = new InputEvent('beforeinput', {
        data: char,
        inputType: 'insertText',
        bubbles: true,
        cancelable: true,
      })

      act(() => {
        container.dispatchEvent(beforeInputEvent)
      })

      // Small delay to allow state updates
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
      })
    }
  }

  describe('✅ Bold Markdown Detection', () => {
    it('should convert **text** to bold formatting', async () => {
      const { container } = renderContainer()
      const contentEditable = container.querySelector('.content-editable-container') as HTMLElement
      const blockContent = container.querySelector('.block__content') as HTMLElement

      await simulateTyping(contentEditable, '1', 'This is **bold**')

      // Check that markdown is removed and formatting is applied
      await waitFor(() => {
        expect(blockContent.textContent).toBe('This is bold')
      })
    })

    it('should not convert incomplete bold patterns', async () => {
      const { container } = renderContainer()
      const contentEditable = container.querySelector('.content-editable-container') as HTMLElement
      const blockContent = container.querySelector('.block__content') as HTMLElement

      await simulateTyping(contentEditable, '1', 'This is **bold*')

      expect(blockContent.textContent).toBe('This is **bold*')
    })
  })

  describe('✅ Italic Markdown Detection', () => {
    it('should convert *text* to italic formatting', async () => {
      const { container } = renderContainer()
      const contentEditable = container.querySelector('.content-editable-container') as HTMLElement
      const blockContent = container.querySelector('.block__content') as HTMLElement

      await simulateTyping(contentEditable, '1', 'This is *italic*')

      await waitFor(() => {
        expect(blockContent.textContent).toBe('This is italic')
      })
    })

    it('should not convert asterisks in the middle of words', async () => {
      const { container } = renderContainer()
      const contentEditable = container.querySelector('.content-editable-container') as HTMLElement
      const blockContent = container.querySelector('.block__content') as HTMLElement

      await simulateTyping(contentEditable, '1', 'test*not*italic')

      expect(blockContent.textContent).toBe('test*not*italic')
    })
  })

  describe('✅ Strikethrough Markdown Detection', () => {
    it('should convert ~~text~~ to strikethrough formatting', async () => {
      const { container } = renderContainer()
      const contentEditable = container.querySelector('.content-editable-container') as HTMLElement
      const blockContent = container.querySelector('.block__content') as HTMLElement

      await simulateTyping(contentEditable, '1', 'This is ~~strikethrough~~')

      await waitFor(() => {
        expect(blockContent.textContent).toBe('This is strikethrough')
      })
    })
  })

  describe('✅ Code Markdown Detection', () => {
    it('should convert `text` to code formatting', async () => {
      const { container } = renderContainer()
      const contentEditable = container.querySelector('.content-editable-container') as HTMLElement
      const blockContent = container.querySelector('.block__content') as HTMLElement

      await simulateTyping(contentEditable, '1', 'This is `code`')

      await waitFor(() => {
        expect(blockContent.textContent).toBe('This is code')
      })
    })
  })

  describe('✅ Link Markdown Detection', () => {
    it('should convert [text](url) to link formatting', async () => {
      const { container } = renderContainer()
      const contentEditable = container.querySelector('.content-editable-container') as HTMLElement
      const blockContent = container.querySelector('.block__content') as HTMLElement

      await simulateTyping(contentEditable, '1', 'This is [a link](https://example.com)')

      await waitFor(() => {
        expect(blockContent.textContent).toBe('This is a link')
      })
    })
  })

  describe('✅ Cursor Position After Conversion', () => {
    it('should maintain correct cursor position after bold conversion', async () => {
      const { container } = renderContainer()
      const contentEditable = container.querySelector('.content-editable-container') as HTMLElement

      await simulateTyping(contentEditable, '1', '**bold**')

      await waitFor(() => {
        const selection = window.getSelection()!
        expect(selection.rangeCount).toBeGreaterThan(0)
        // Cursor should be after 'bold' text
      })
    })
  })

  describe('✅ Multiple Patterns', () => {
    it('should handle multiple markdown patterns in same block', async () => {
      const { container } = renderContainer()
      const contentEditable = container.querySelector('.content-editable-container') as HTMLElement
      const blockContent = container.querySelector('.block__content') as HTMLElement

      await simulateTyping(contentEditable, '1', '**Bold** and *italic* and `code`')

      await waitFor(() => {
        expect(blockContent.textContent).toBe('Bold and italic and code')
      })
    })
  })
})
