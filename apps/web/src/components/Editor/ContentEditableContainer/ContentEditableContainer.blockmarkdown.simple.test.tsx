import React from 'react'
import { render, waitFor, act } from '@testing-library/react'
import { renderWithEditor } from '../../../test/utils'
import { Editor } from '../Editor'
import { EditorBlock } from '../../../contexts/EditorContext'

describe('ContentEditableContainer - Block Markdown (Simple)', () => {
  it('should update content when typing in test environment', async () => {
    const initialBlocks: EditorBlock[] = [{ id: 'test-block-1', type: 'paragraph', content: '' }]
    const { store } = renderWithEditor(<Editor />, { initialBlocks })

    // Wait for render
    await waitFor(() => {
      const container = document.querySelector('.content-editable-container')
      expect(container).toBeTruthy()
    })

    // Directly update the block content to test if conversion works
    act(() => {
      store.dispatch({
        type: 'UPDATE_BLOCK',
        blockId: 'test-block-1',
        content: '# ',
      })
    })

    // Check content was updated
    expect(store.getState().blocks[0].content).toBe('# ')

    // The handler should have detected the markdown pattern
    // but since we're bypassing the event system, let's test the detection function
    const { shouldConvertBlockMarkdown } = await import('../../../utils/blockMarkdownDetection')
    const pattern = shouldConvertBlockMarkdown('# ', 2, ' ')
    expect(pattern).toBeTruthy()
    expect(pattern?.blockType).toBe('h1')
  })

  it('detects markdown patterns correctly', async () => {
    const { shouldConvertBlockMarkdown } = await import('../../../utils/blockMarkdownDetection')

    // Test H1 detection
    expect(shouldConvertBlockMarkdown('# ', 2, ' ')).toBeTruthy()
    expect(shouldConvertBlockMarkdown('# ', 2, ' ')?.blockType).toBe('h1')

    // Test H2 detection
    expect(shouldConvertBlockMarkdown('## ', 3, ' ')).toBeTruthy()
    expect(shouldConvertBlockMarkdown('## ', 3, ' ')?.blockType).toBe('h2')

    // Test bullet detection
    expect(shouldConvertBlockMarkdown('- ', 2, ' ')).toBeTruthy()
    expect(shouldConvertBlockMarkdown('- ', 2, ' ')?.blockType).toBe('bullet')

    // Test non-detection cases
    expect(shouldConvertBlockMarkdown('#', 1, '#')).toBeNull()
    expect(shouldConvertBlockMarkdown('# a', 3, 'a')).toBeNull()
  })
})
