// apps/web/src/components/Editor/Editor.tsx
// Main editor container component that houses the block-based editing experience.
// Provides the layout wrapper for the EditorContent where all blocks are rendered.
// In the future, this may also contain toolbars or other editor UI elements.

import { forwardRef } from 'react'
import { EditorContent } from './EditorContent'
import { SaveStatusIndicator } from '../SaveStatusIndicator'
import { usePageContext } from '../../contexts/PageContext'
import { useEditorState } from '../../contexts/EditorContext'
import './Editor.scss'

export const Editor = forwardRef<HTMLElement>((props, ref) => {
  const { saveStatus, lastSaved, forceSave } = usePageContext()
  const { isDirty } = useEditorState()

  return (
    <main ref={ref} className="editor" tabIndex={-1}>
      <div className="editor__save-indicator">
        <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} isDirty={isDirty} onRetry={forceSave} />
      </div>
      <div className="editor__content">
        <EditorContent />
      </div>
    </main>
  )
})

Editor.displayName = 'Editor'
