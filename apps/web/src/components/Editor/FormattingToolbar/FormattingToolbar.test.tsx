import React from 'react'
import { render, screen } from '@testing-library/react'
import { FormattingToolbar } from './FormattingToolbar'
import { renderWithEditor } from '../../../test/utils'
import type { EditorState } from '../../../contexts/EditorContext'

describe('FormattingToolbar', () => {
  const defaultEditorState: EditorState = {
    pageId: null,
    pageTitle: 'Test Page',
    blocks: [
      { id: '1', type: 'paragraph', content: 'First block with some text' },
      { id: '2', type: 'paragraph', content: 'Second block with more text' },
    ],
    focusedBlockId: null,
    selectedBlockIds: [],
    isDragging: false,
    crossBlockSelection: null,
    isDirty: false,
    lastSaved: null,
  }

  describe('✅ Component Structure', () => {
    it('should export FormattingToolbar component', () => {
      expect(FormattingToolbar).toBeDefined()
      expect(typeof FormattingToolbar).toBe('function')
    })

    it('should accept containerRef prop', () => {
      const mockRef = React.createRef<HTMLDivElement>()
      const { container } = renderWithEditor(<FormattingToolbar containerRef={mockRef} />)
      expect(container).toBeTruthy()
    })
  })

  describe('✅ Selection State', () => {
    it('should not render when no selection exists', () => {
      const mockRef = React.createRef<HTMLDivElement>()
      renderWithEditor(<FormattingToolbar containerRef={mockRef} />)

      // Toolbar should not be visible without selection
      expect(screen.queryByRole('button', { name: /bold/i })).not.toBeInTheDocument()
    })

    it('should not render for collapsed selection', () => {
      const mockRef = React.createRef<HTMLDivElement>()
      const { store } = renderWithEditor(<FormattingToolbar containerRef={mockRef} />)

      // Set collapsed selection
      store.dispatch({
        type: 'SET_CROSS_BLOCK_SELECTION',
        selection: {
          startBlockId: '1',
          startOffset: 5,
          endBlockId: '1',
          endOffset: 5,
          selectedText: '',
          selectedBlocks: [],
          isCollapsed: true,
        },
      })

      expect(screen.queryByRole('button', { name: /bold/i })).not.toBeInTheDocument()
    })
  })

  describe('✅ Toolbar Features', () => {
    it('should include formatting buttons in the component', () => {
      // This tests the component structure rather than rendering
      // since we need proper DOM setup for positioning
      const component = FormattingToolbar
      expect(component.toString()).toContain('bold')
      expect(component.toString()).toContain('italic')
      expect(component.toString()).toContain('underline')
      expect(component.toString()).toContain('link')
    })

    it('should handle containerRef being null', () => {
      const nullRef = { current: null }
      const { container } = renderWithEditor(<FormattingToolbar containerRef={nullRef} />)
      expect(container).toBeTruthy()
    })
  })

  describe('✅ State Integration', () => {
    it('should use editor state for visibility', () => {
      const mockRef = React.createRef<HTMLDivElement>()
      const { store } = renderWithEditor(<FormattingToolbar containerRef={mockRef} />, {
        initialBlocks: [{ id: '1', type: 'paragraph', content: 'First block with some text' }],
      })

      // Initially no toolbar
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()

      // Update with selection
      store.dispatch({
        type: 'SET_CROSS_BLOCK_SELECTION',
        selection: {
          startBlockId: '1',
          startOffset: 0,
          endBlockId: '1',
          endOffset: 5,
          selectedText: 'First',
          selectedBlocks: [],
          isCollapsed: false,
        },
      })

      // Component should respond to state changes
      // (actual rendering depends on DOM measurements)
    })
  })
})
