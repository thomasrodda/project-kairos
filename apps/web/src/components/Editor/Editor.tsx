// apps/web/src/components/Editor/Editor.tsx
// Main editor container component that houses the block-based editing experience.
// Provides the layout wrapper for the EditorContent where all blocks are rendered.
// In the future, this may also contain toolbars or other editor UI elements.

import { forwardRef, useRef } from 'react'
import { EditorContent } from './EditorContent'
import { SaveStatusIndicator } from '../SaveStatusIndicator'
import { usePageContext } from '../../contexts/PageContext'
import { useEditorState } from '../../contexts/EditorContext'
import { useDragSelection } from '../../hooks'
import { SelectionBox } from './SelectionBox'
import './Editor.scss'

export const Editor = forwardRef<HTMLElement>((props, ref) => {
  const { saveStatus, lastSaved, forceSave } = usePageContext()
  const { isDirty, isDragging } = useEditorState()
  const editorRef = useRef<HTMLElement>(null)

  // Use drag selection hook for visual selection box
  const { isSelecting, selectionRect } = useDragSelection({
    containerRef: editorRef,
    enabled: !isDragging, // Only disable during block drag operations
  })

  return (
    <main ref={editorRef} className={`editor ${isSelecting ? 'editor--selecting' : ''}`} tabIndex={-1}>
      <div className="editor__save-indicator">
        <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} isDirty={isDirty} onRetry={forceSave} />
      </div>
      <div className="editor__content">
        <EditorContent />
      </div>

      {/* Visual selection box for drag selection */}
      {isSelecting && <SelectionBox rect={selectionRect} />}
    </main>
  )
})

Editor.displayName = 'Editor'
