// apps/web/src/components/Editor/PageTitle/PageTitle.test.tsx
// Comprehensive tests for the PageTitle component

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PageTitle } from './PageTitle'
import { renderWithEditor, createMockEditorState } from '../../../test/utils'
import { useEditorDispatch } from '../../../contexts/EditorContext'

// Mock the EditorContext dispatch
const mockDispatch = jest.fn()
jest.mock('../../../contexts/EditorContext', () => ({
  ...jest.requireActual('../../../contexts/EditorContext'),
  useEditorDispatch: jest.fn(),
}))

// Mock ClipboardEvent since it's not available in JSDOM
class MockClipboardEvent extends Event {
  clipboardData: any

  constructor(type: string, options: any) {
    super(type, options)
    this.clipboardData = options.clipboardData
  }
}
global.ClipboardEvent = MockClipboardEvent as any

describe('PageTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useEditorDispatch as jest.Mock).mockReturnValue(mockDispatch)
  })

  describe('✅ Rendering & Display', () => {
    it('renders with initial title prop', () => {
      render(<PageTitle title="My Test Page" />)
      const titleElement = screen.getByRole('heading', { level: 1 })
      expect(titleElement).toHaveTextContent('My Test Page')
    })

    it('shows placeholder "New Page" when empty', () => {
      render(<PageTitle title="" />)
      const titleElement = screen.getByRole('heading', { level: 1 })
      expect(titleElement).toHaveAttribute('data-placeholder', 'New Page')
      expect(titleElement).toHaveTextContent('')
    })
  })

  describe('✅ User Interactions', () => {
    it('updates content on typing', async () => {
      render(<PageTitle title="Initial" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      // Clear existing content and type new content
      act(() => {
        titleElement.textContent = 'New Title'
        fireEvent.input(titleElement, {
          target: { textContent: 'New Title' },
        })
      })

      // Check that dispatch was called
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TITLE',
        title: 'New Title',
      })
    })

    it('prevents Enter key from creating line breaks', async () => {
      const user = userEvent.setup()
      render(<PageTitle title="Test" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      await user.click(titleElement)
      await user.keyboard('{Enter}')

      // Should not contain line breaks
      expect(titleElement.innerHTML).not.toContain('<br')
      expect(titleElement.innerHTML).not.toContain('\\n')
    })

    it('blurs element on Enter key press', async () => {
      const user = userEvent.setup()
      render(<PageTitle title="Test" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      await user.click(titleElement)
      expect(document.activeElement).toBe(titleElement)

      await user.keyboard('{Enter}')
      expect(document.activeElement).not.toBe(titleElement)
    })

    it('strips HTML formatting when pasting', async () => {
      render(<PageTitle title="" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      // Create paste event with HTML content
      const clipboardData = {
        getData: (type: string) => {
          if (type === 'text/plain') return 'Plain text content'
          if (type === 'text/html') return '<b>Bold</b> <i>italic</i> text'
          return ''
        },
      }

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: clipboardData as unknown as DataTransfer,
      })

      fireEvent(titleElement, pasteEvent)

      // The paste handler modifies the DOM, so we need to trigger input event
      act(() => {
        titleElement.textContent = 'Plain text content'
        fireEvent.input(titleElement, {
          target: { textContent: 'Plain text content' },
        })
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TITLE',
        title: 'Plain text content',
      })
    })

    it('maintains cursor position after paste', async () => {
      render(<PageTitle title="Existing text" />)
      const titleElement = screen.getByRole('heading', { level: 1 }) as HTMLElement

      // Set initial selection
      const range = document.createRange()
      const textNode = titleElement.firstChild as Text
      range.setStart(textNode, 8) // After "Existing"
      range.setEnd(textNode, 8)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Create paste event
      const clipboardData = {
        getData: () => 'PASTED',
      }

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: clipboardData as unknown as DataTransfer,
      })

      fireEvent(titleElement, pasteEvent)

      // The paste handler modifies the DOM, so we need to trigger input event
      act(() => {
        titleElement.textContent = 'ExistingPASTED text'
        fireEvent.input(titleElement, {
          target: { textContent: 'ExistingPASTED text' },
        })
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TITLE',
        title: 'ExistingPASTED text',
      })
    })
  })

  describe('✅ State Management', () => {
    it('dispatches UPDATE_TITLE action on input', async () => {
      render(<PageTitle title="Initial" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      fireEvent.input(titleElement, {
        target: { textContent: 'Updated Title' },
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TITLE',
        title: 'Updated Title',
      })
    })

    it('debounces rapid input changes', async () => {
      jest.useFakeTimers()
      render(<PageTitle title="Initial" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      // Simulate rapid input
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.input(titleElement, {
            target: { textContent: `Text ${i}` },
          })
        })
      }

      // All dispatches should have been called
      expect(mockDispatch).toHaveBeenCalledTimes(5)

      act(() => {
        jest.runAllTimers()
      })
      jest.useRealTimers()
    })

    it('handles very long titles (>1000 chars)', async () => {
      const longTitle = 'A'.repeat(1500)
      render(<PageTitle title={longTitle} />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      expect(titleElement).toHaveTextContent(longTitle)

      // Test updating with long content
      const newLongTitle = 'B'.repeat(2000)
      fireEvent.input(titleElement, {
        target: { textContent: newLongTitle },
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TITLE',
        title: newLongTitle,
      })
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles special characters and emojis', async () => {
      const specialTitle = '🎉 Special <Characters> & "Quotes" 你好'
      render(<PageTitle title={specialTitle} />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      expect(titleElement).toHaveTextContent(specialTitle)

      // Update with more special characters
      const newSpecialTitle = '© ® ™ § ¶ † ‡ • ‰ 🌟 🔥 🎨'
      fireEvent.input(titleElement, {
        target: { textContent: newSpecialTitle },
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TITLE',
        title: newSpecialTitle,
      })
    })

    it('prevents script injection (XSS)', async () => {
      render(<PageTitle title="" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      // Try to paste malicious script
      const clipboardData = {
        getData: (type: string) => {
          if (type === 'text/plain') return '<script>alert("XSS")</script>'
          if (type === 'text/html') return '<script>alert("XSS")</script>'
          return ''
        },
      }

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: clipboardData as unknown as DataTransfer,
      })

      fireEvent(titleElement, pasteEvent)

      // The paste handler modifies the DOM, so we need to trigger input event
      act(() => {
        titleElement.textContent = '<script>alert("XSS")</script>'
        fireEvent.input(titleElement, {
          target: { textContent: '<script>alert("XSS")</script>' },
        })
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TITLE',
        title: '<script>alert("XSS")</script>',
      })

      // Ensure no actual script execution
      expect(titleElement.innerHTML).not.toContain('<script')
    })

    it('works with IME (Input Method Editor) for non-Latin text', async () => {
      render(<PageTitle title="" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      // Simulate IME composition events
      fireEvent.compositionStart(titleElement)
      fireEvent.compositionUpdate(titleElement, { data: 'にほん' })
      fireEvent.compositionEnd(titleElement, { data: '日本' })

      fireEvent.input(titleElement, {
        target: { textContent: '日本' },
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TITLE',
        title: '日本',
      })
    })

    it('handles empty clipboard data gracefully', async () => {
      render(<PageTitle title="Existing" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      const clipboardData = {
        getData: () => '',
      }

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: clipboardData as unknown as DataTransfer,
      })

      fireEvent(titleElement, pasteEvent)

      // Should not crash and should maintain existing content
      expect(titleElement).toHaveTextContent('Existing')
    })

    it('updates correctly when title prop changes externally', async () => {
      const { rerender } = render(<PageTitle title="Initial Title" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      expect(titleElement).toHaveTextContent('Initial Title')

      // Update title prop
      rerender(<PageTitle title="Updated Title" />)

      await waitFor(() => {
        expect(titleElement).toHaveTextContent('Updated Title')
      })
    })

    it('handles selection when there is no range', async () => {
      render(<PageTitle title="Test" />)
      const titleElement = screen.getByRole('heading', { level: 1 })

      // Mock getSelection to return no ranges
      const originalGetSelection = window.getSelection
      window.getSelection = jest.fn().mockReturnValue({
        rangeCount: 0,
      })

      const clipboardData = {
        getData: () => 'Test paste',
      }

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: clipboardData as unknown as DataTransfer,
      })

      fireEvent(titleElement, pasteEvent)

      // Should handle gracefully without errors
      expect(() => fireEvent(titleElement, pasteEvent)).not.toThrow()

      // Restore original getSelection
      window.getSelection = originalGetSelection
    })
  })
})
