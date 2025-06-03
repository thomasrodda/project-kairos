// apps/web/src/components/Editor/EditorContent/EditorContent.tsx
// Main content area for the block-based editor. Renders the page title and all blocks.
// Manages the overall editor layout and coordinates between individual block components.
// Acts as the container for all editing functionality within the Editor layout.

import { useEditorState } from '../../../contexts/EditorContext'
import { PageTitle } from '../PageTitle'
import { Block } from '../Block'
import './EditorContent.scss'

export function EditorContent() {
  const editorState = useEditorState()
  const { pageTitle, blocks, focusedBlockId } = editorState

  return (
    <div className="editor-content">
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
