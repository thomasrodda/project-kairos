// apps/web/src/components/Editor/EditorContent/EditorContent.tsx
// Main content area for the block-based editor. Renders the page title and all blocks.
// Manages the overall editor layout and coordinates between individual block components.
// Acts as the container for all editing functionality within the Editor layout.

import { useRef } from 'react'
import { useEditorState, useEditorDispatch } from '../../../contexts/EditorContext'
import { useDismiss } from '../../../hooks'
import { PageTitle } from '../PageTitle'
import { Block } from '../Block'
import './EditorContent.scss'

export function EditorContent() {
  const editorState = useEditorState()
  const dispatch = useEditorDispatch()
  const { pageTitle, blocks, focusedBlockId, selectedBlockId } = editorState
  const editorRef = useRef<HTMLDivElement>(null)

  // Dismiss selection when clicking outside editor or pressing escape
  useDismiss(editorRef, {
    onDismiss: () => {
      // Clear both selection and focus
      dispatch({ type: 'SET_SELECTED_BLOCK', blockId: null })
      dispatch({ type: 'SET_FOCUSED_BLOCK', blockId: null })
    },
    enabled: !!(selectedBlockId || focusedBlockId), // Only enable when something is selected/focused
  })

  return (
    <div className="editor-content" ref={editorRef}>
      {/* Page title - always visible and editable */}
      <PageTitle title={pageTitle} />

      {/* All blocks in the page */}
      <div className="editor-content__blocks">
        {blocks.map((block) => (
          <Block key={block.id} block={block} isFocused={focusedBlockId === block.id} />
        ))}
      </div>
    </div>
  )
}
