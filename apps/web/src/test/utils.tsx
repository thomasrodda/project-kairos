// Test utilities for rendering components with required contexts
import { render, RenderOptions } from '@testing-library/react'
import React, { ReactElement, ReactNode } from 'react'
import { EditorProvider, EditorState, useEditorState, useEditorDispatch, EditorAction } from '../contexts/EditorContext'
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
  selectionAnchorId: null,
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

// Extended options for rendering with editor
interface ExtendedRenderOptions extends CustomRenderOptions {
  initialBlocks?: EditorState['blocks']
}

// Custom render function that includes EditorProvider
export function renderWithEditor(ui: ReactElement, options?: ExtendedRenderOptions) {
  const { initialState, initialBlocks, ...renderOptions } = options || {}

  // Store reference to access state in tests
  let editorState: EditorState | null = null
  let editorDispatch: React.Dispatch<EditorAction> | null = null

  function TestWrapper({ children }: { children: ReactNode }) {
    const state = useEditorState()
    const dispatch = useEditorDispatch()

    // Store references for test access
    React.useEffect(() => {
      editorState = state
      editorDispatch = dispatch
    })

    // Set up initial blocks if provided
    React.useEffect(() => {
      if (initialBlocks && initialBlocks.length > 0) {
        dispatch({
          type: 'SET_PAGE',
          pageId: 'test-page',
          title: 'Test Page',
          blocks: initialBlocks,
        })
      }
    }, []) // Run only once on mount

    return <>{children}</>
  }

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <EditorProvider>
        <TestWrapper>{children}</TestWrapper>
      </EditorProvider>
    )
  }

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions })

  // Return render result with store accessor
  return {
    ...renderResult,
    store: {
      getState: () => editorState!,
      dispatch: (action: EditorAction) => editorDispatch!(action),
    },
  }
}
