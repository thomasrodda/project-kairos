// apps/web/src/components/Editor/Editor.test.tsx
// Tests for the main Editor component

import { render, screen } from '@testing-library/react'
import { Editor } from './Editor'
import { EditorProvider } from '../../contexts/EditorContext'

// Mock EditorContent
jest.mock('./EditorContent', () => ({
  EditorContent: () => <div data-testid="editor-content">Editor Content</div>,
}))

describe('Editor', () => {
  const renderEditor = () => {
    return render(
      <EditorProvider>
        <Editor />
      </EditorProvider>
    )
  }

  describe('✅ Core Functionality', () => {
    it('renders editor container', () => {
      renderEditor()
      const editor = screen.getByRole('main')
      expect(editor).toHaveClass('editor')
    })

    it('renders editor content wrapper', () => {
      const { container } = renderEditor()
      const contentWrapper = container.querySelector('.editor__content')
      expect(contentWrapper).toBeInTheDocument()
    })

    it('renders EditorContent component', () => {
      renderEditor()
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('provides proper semantic structure', () => {
      renderEditor()
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
      expect(main.tagName).toBe('MAIN')
    })
  })

  describe('✅ Layout', () => {
    it('applies correct class structure', () => {
      const { container } = renderEditor()
      const editor = container.querySelector('.editor')
      const content = container.querySelector('.editor__content')

      expect(editor).toBeInTheDocument()
      expect(content).toBeInTheDocument()
      expect(content?.parentElement).toBe(editor)
    })

    it('maintains proper DOM hierarchy', () => {
      const { container } = renderEditor()
      const editor = container.querySelector('.editor')
      const content = editor?.querySelector('.editor__content')
      const editorContent = content?.querySelector('[data-testid="editor-content"]')

      expect(editor).toBeInTheDocument()
      expect(content).toBeInTheDocument()
      expect(editorContent).toBeInTheDocument()
    })
  })

  describe('✅ Integration', () => {
    it('works within EditorProvider context', () => {
      expect(() => renderEditor()).not.toThrow()
    })

    it('maintains consistent structure across renders', () => {
      const { container: container1 } = renderEditor()
      const { container: container2 } = renderEditor()

      const structure1 = container1.querySelector('.editor')?.innerHTML
      const structure2 = container2.querySelector('.editor')?.innerHTML

      expect(structure1).toBe(structure2)
    })
  })
})
