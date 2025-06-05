// Test utilities for rendering components with required contexts
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { EditorProvider, EditorState } from '../contexts/EditorContext'
import { generateId } from '@kairos/utils'

// Default editor state for testing
export const createMockEditorState = (overrides?: Partial<EditorState>): EditorState => ({
  pageId: 'test-page-id',
  pageTitle: 'Test Page',
  blocks: [
    {
      id: generateId(),
      type: 'paragraph',
      content: 'Test block content',
    },
  ],
  focusedBlockId: null,
  selectedBlockIds: [],
  crossBlockSelection: null,
  isDragging: false,
  isDirty: false,
  lastSaved: new Date(),
  ...overrides,
})

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // For future use when EditorProvider supports custom initial state
  initialState?: EditorState
}

// Custom render function that includes EditorProvider
export function renderWithEditor(ui: ReactElement, options?: CustomRenderOptions) {
  const { initialState, ...renderOptions } = options || {}

  function Wrapper({ children }: { children: ReactNode }) {
    // Note: EditorProvider currently doesn't support custom initial state
    // This is here for future compatibility
    return <EditorProvider>{children}</EditorProvider>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
