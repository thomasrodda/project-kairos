// apps/web/src/components/Editor/Editor.integration.test.tsx
// Integration tests for the complete Editor component with all features

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Editor } from './Editor'
import { EditorProvider } from '../../contexts/EditorContext'
import { renderWithEditor, createMockEditorState } from '../../test/utils'
import { generateId } from '@kairos/utils'

// Don't mock EditorContent for integration tests
jest.unmock('./EditorContent')

describe('Editor Integration', () => {
  const renderEditor = (initialBlocks?: any[]) => {
    return renderWithEditor(<Editor />, { initialBlocks })
  }

  describe('✅ Full Editor Functionality', () => {
    it('renders complete editor with page title and content area', () => {
      renderEditor()

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('document')).toBeInTheDocument()
    })

    it('allows typing in page title', async () => {
      const user = userEvent.setup()
      renderEditor()

      const titleInput = screen.getByRole('heading', { level: 1 })
      await user.clear(titleInput)
      await user.type(titleInput, 'My New Page')

      expect(titleInput).toHaveTextContent('My New Page')
    })

    it('creates new block when pressing Enter in title', async () => {
      const user = userEvent.setup()
      renderEditor()

      const titleInput = screen.getByRole('heading', { level: 1 })
      await user.click(titleInput)
      await user.keyboard('{Enter}')

      // Title should blur and editor should be ready for new content
      expect(titleInput).not.toHaveFocus()
    })

    it('has editable blocks', () => {
      const { container } = renderEditor()

      const contentEditableContainer = container.querySelector('.content-editable-container') as HTMLElement
      expect(contentEditableContainer).toBeInTheDocument()
      expect(contentEditableContainer).toHaveAttribute('contenteditable', 'true')

      // Should have at least one block
      const blocks = container.querySelectorAll('.block')
      expect(blocks.length).toBeGreaterThan(0)
    })

    it('supports block structure', () => {
      const { container } = renderEditor()

      // Check for block structure
      const block = container.querySelector('.block') as HTMLElement
      expect(block).toBeInTheDocument()

      // Should have drag handle
      const dragHandle = within(block).getByTitle(/Drag to reorder/)
      expect(dragHandle).toBeInTheDocument()

      // Should have content area
      const blockContent = block.querySelector('.block__content')
      expect(blockContent).toBeInTheDocument()
    })

    it('renders with proper ARIA attributes', () => {
      const { container } = renderEditor()

      // Check document structure
      const editorContent = screen.getByRole('document')
      expect(editorContent).toHaveAttribute('aria-label', 'Document editor')

      // Check blocks group
      const blocksGroup = screen.getByRole('group')
      expect(blocksGroup).toHaveAttribute('aria-label', 'Document blocks')
    })
  })

  describe('✅ Block Interaction', () => {
    it('has draggable blocks', () => {
      const { container } = renderEditor()

      // All blocks should be draggable
      const draggableBlocks = container.querySelectorAll('.draggable-block')
      expect(draggableBlocks.length).toBeGreaterThan(0)

      // Check first draggable block has proper attributes
      const firstDraggable = draggableBlocks[0]
      expect(firstDraggable).toHaveAttribute('aria-roledescription', 'sortable')
      expect(firstDraggable).toHaveAttribute('role', 'button')
    })

    it('block drag handles have proper accessibility', () => {
      const { container } = renderEditor()

      const dragHandles = container.querySelectorAll('.block-drag-handle')
      expect(dragHandles.length).toBeGreaterThan(0)

      const firstHandle = dragHandles[0]
      expect(firstHandle).toHaveAttribute('role', 'button')
      expect(firstHandle).toHaveAttribute('aria-label')
      expect(firstHandle).toHaveAttribute('title')
    })

    it('supports different block types', () => {
      const { container } = renderEditor()

      // Check that blocks can have different types
      const blocks = container.querySelectorAll('.block')
      blocks.forEach((block) => {
        const classList = Array.from(block.classList)
        const hasBlockType = classList.some((className) => className.match(/^block--(h1|h2|h3|paragraph|bullet)$/))
        expect(hasBlockType).toBe(true)
      })
    })
  })

  describe('✅ Editor Structure', () => {
    it('has proper component hierarchy', () => {
      const { container } = renderEditor()

      // Editor > editor__content > EditorContent
      const editor = container.querySelector('.editor')
      expect(editor).toBeInTheDocument()

      const editorContentWrapper = editor?.querySelector('.editor__content')
      expect(editorContentWrapper).toBeInTheDocument()

      const editorContent = editorContentWrapper?.querySelector('.editor-content')
      expect(editorContent).toBeInTheDocument()
    })

    it('contentEditable is at container level', () => {
      const { container } = renderEditor()

      // ContentEditable container should exist
      const contentEditableContainer = container.querySelector('.content-editable-container')
      expect(contentEditableContainer).toBeInTheDocument()
      expect(contentEditableContainer).toHaveAttribute('contenteditable', 'true')

      // PageTitle is also contentEditable (separate from blocks)
      const pageTitle = container.querySelector('.page-title')
      expect(pageTitle).toHaveAttribute('contenteditable', 'true')

      // Individual blocks should not be contentEditable
      const blocks = container.querySelectorAll('.block')
      blocks.forEach((block) => {
        expect(block).not.toHaveAttribute('contenteditable', 'true')
      })
    })

    it('has proper keyboard navigation support', () => {
      const { container } = renderEditor()

      // Draggable blocks should be keyboard accessible
      const draggableBlocks = container.querySelectorAll('.draggable-block')
      draggableBlocks.forEach((block) => {
        expect(block).toHaveAttribute('tabindex', '0')
      })
    })
  })
})
