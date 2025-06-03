// apps/web/src/components/Editor/Editor.tsx
// Main editor container component that houses the block-based editing experience.
// Provides the layout wrapper for the EditorContent where all blocks are rendered.
// In the future, this may also contain toolbars or other editor UI elements.

import { EditorContent } from './EditorContent'
import './Editor.scss'

export function Editor() {
  return (
    <main className="editor">
      <div className="editor__content">
        <EditorContent />
      </div>
    </main>
  )
}
