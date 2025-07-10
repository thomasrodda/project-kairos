import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { renderWithEditor } from '../../../test/utils'
import { Editor } from '../Editor'
import { EditorBlock } from '../../../contexts/EditorContext'

describe('ContentEditableContainer - Block Markdown Manual Test', () => {
  it('should convert "# " to H1 block when typed manually', async () => {
    const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
    const { store } = renderWithEditor(<Editor />, { initialBlocks })

    // Wait for render
    await waitFor(() => {
      const container = document.querySelector('.content-editable-container')
      expect(container).toBeTruthy()
    })

    // Simulate typing "# " character by character through dispatch
    await act(async () => {
      // Type "#"
      store.dispatch({
        type: 'UPDATE_BLOCK',
        blockId: 'test-block-1',
        content: '#',
      })
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Verify # was typed
    expect(store.getState().blocks[0].content).toBe('#')
    expect(store.getState().blocks[0].type).toBe('paragraph')

    // Now simulate typing the space which should trigger conversion
    // In the real implementation, this would happen through the beforeinput handler
    const { shouldConvertBlockMarkdown, removeMarkdownPrefix } = await import('../../../utils/blockMarkdownDetection')

    // Simulate what the beforeinput handler would do
    const newContent = '# '
    const pattern = shouldConvertBlockMarkdown(newContent, 2, ' ')

    if (pattern) {
      const cleanContent = removeMarkdownPrefix(newContent, pattern)

      await act(async () => {
        store.dispatch({
          type: 'UPDATE_BLOCK',
          blockId: 'test-block-1',
          content: cleanContent,
        })
        store.dispatch({
          type: 'CHANGE_BLOCK_TYPE',
          blockId: 'test-block-1',
          blockType: pattern.blockType,
        })
      })
    }

    // Check the result
    expect(store.getState().blocks[0].type).toBe('h1')
    expect(store.getState().blocks[0].content).toBe('')
  })

  it('demonstrates the block markdown conversion flow', async () => {
    const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
    const { store } = renderWithEditor(<Editor />, { initialBlocks })

    // Test all patterns
    const testCases = [
      { input: '# ', expectedType: 'h1' },
      { input: '## ', expectedType: 'h2' },
      { input: '### ', expectedType: 'h3' },
      { input: '- ', expectedType: 'bullet' },
      { input: '* ', expectedType: 'bullet' },
    ]

    for (const testCase of testCases) {
      // Reset block
      await act(async () => {
        store.dispatch({
          type: 'CHANGE_BLOCK_TYPE',
          blockId: 'test-block-1',
          blockType: 'paragraph',
        })
        store.dispatch({
          type: 'UPDATE_BLOCK',
          blockId: 'test-block-1',
          content: '',
        })
      })

      // Simulate typing the pattern
      const { shouldConvertBlockMarkdown, removeMarkdownPrefix } = await import('../../../utils/blockMarkdownDetection')
      const pattern = shouldConvertBlockMarkdown(testCase.input, testCase.input.length, ' ')

      expect(pattern).toBeTruthy()
      expect(pattern?.blockType).toBe(testCase.expectedType)

      if (pattern) {
        const cleanContent = removeMarkdownPrefix(testCase.input, pattern)
        expect(cleanContent).toBe('')
      }
    }
  })
})
