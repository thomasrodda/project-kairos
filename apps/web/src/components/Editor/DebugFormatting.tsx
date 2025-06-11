import React from 'react'
import { useEditorState } from '../../contexts/EditorContext'

export function DebugFormatting() {
  const editorState = useEditorState()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        background: 'white',
        border: '1px solid black',
        padding: '10px',
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto',
        fontSize: '12px',
      }}
    >
      <h4>Debug: Block Formatting</h4>
      {editorState.blocks.map((block) => (
        <div key={block.id} style={{ marginBottom: '10px' }}>
          <strong>Block {block.id}:</strong>
          <div>Content: &quot;{block.content}&quot;</div>
          <div>Formatting: {JSON.stringify(block.formatting || [], null, 2)}</div>
        </div>
      ))}
    </div>
  )
}
