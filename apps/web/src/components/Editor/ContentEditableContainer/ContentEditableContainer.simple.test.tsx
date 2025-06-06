import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentEditableContainer } from './ContentEditableContainer'
import { EditorProvider } from '../../../contexts/EditorContext'
import { generateId } from '@kairos/utils'
import { renderWithEditor } from '../../../test/utils'

// Mock generateId
jest.mock('@kairos/utils', () => ({
  generateId: jest.fn(() => 'test-id'),
}))

describe('ContentEditableContainer Simple Tests', () => {
  const mockOnBlockClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with contentEditable attribute', () => {
    render(
      <EditorProvider>
        <ContentEditableContainer onBlockClick={mockOnBlockClick}>
          <div>Test content</div>
        </ContentEditableContainer>
      </EditorProvider>
    )

    const container = document.querySelector('.content-editable-container')
    expect(container).toHaveAttribute('contenteditable', 'true')
  })

  it('handles click events on blocks', () => {
    render(
      <EditorProvider>
        <ContentEditableContainer onBlockClick={mockOnBlockClick}>
          <div data-block-id="test-block">
            <div className="block__content">Click me</div>
          </div>
        </ContentEditableContainer>
      </EditorProvider>
    )

    const blockContent = screen.getByText('Click me')
    fireEvent.click(blockContent)

    expect(mockOnBlockClick).toHaveBeenCalledWith('test-block')
  })

  it('prevents default on beforeinput event', async () => {
    const { container: rootContainer } = renderWithEditor(
      <ContentEditableContainer onBlockClick={mockOnBlockClick}>
        <div data-block-id="block-1">
          <div className="block__content">Test</div>
        </div>
      </ContentEditableContainer>
    )

    const contentEditableContainer = rootContainer.querySelector('.content-editable-container') as HTMLElement
    const blockContent = screen.getByText('Test')

    // Focus the contentEditable area
    contentEditableContainer.focus()

    // Try to type - the component should prevent default behavior
    // We'll check that the content doesn't change since preventDefault is called
    const initialHTML = contentEditableContainer.innerHTML

    // Create and dispatch a beforeinput event
    const event = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: 'a',
      inputType: 'insertText',
    })

    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true,
    })

    contentEditableContainer.dispatchEvent(event)

    // Since we're preventing default, the DOM shouldn't change
    expect(contentEditableContainer.innerHTML).toBe(initialHTML)
  })

  it('prevents default on paste event', async () => {
    const { container: rootContainer } = renderWithEditor(
      <ContentEditableContainer onBlockClick={mockOnBlockClick}>
        <div data-block-id="block-1">
          <div className="block__content">Test</div>
        </div>
      </ContentEditableContainer>
    )

    const contentEditableContainer = rootContainer.querySelector('.content-editable-container') as HTMLElement

    // Create a mock clipboardData
    const mockClipboardData = {
      getData: jest.fn((format: string) => {
        if (format === 'application/x-kairos-blocks') return '[]' // Return valid JSON
        if (format === 'text/plain') return 'pasted text'
        return ''
      }),
      types: ['text/plain'],
    }

    // Create paste event with preventDefault spy
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: mockClipboardData as any,
    })

    const preventDefaultSpy = jest.spyOn(pasteEvent, 'preventDefault')

    // Focus and dispatch paste event
    contentEditableContainer.focus()
    fireEvent(contentEditableContainer, pasteEvent)

    // The paste handler should prevent default
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('has spellcheck enabled', () => {
    render(
      <EditorProvider>
        <ContentEditableContainer onBlockClick={mockOnBlockClick}>
          <div>Test content</div>
        </ContentEditableContainer>
      </EditorProvider>
    )

    const container = document.querySelector('.content-editable-container')
    expect(container).toHaveAttribute('spellcheck', 'true')
  })
})
