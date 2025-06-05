// apps/web/src/components/Editor/Block/Block.tsx
// Individual block component that renders content within a single contentEditable container.
// No longer uses individual contentEditable - relies on parent container for editing.
// Handles block-specific behaviors like placeholders and styling.

import React, { useRef, useEffect } from 'react'
import { useEditorDispatch, useEditorState, BLOCK_PLACEHOLDERS } from '../../../contexts/EditorContext'
import type { EditorBlock } from '../../../contexts/EditorContext'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { BlockDragHandle } from './BlockDragHandle'
import './Block.scss'

interface BlockProps {
  block: EditorBlock
  isFocused: boolean
  dragHandleProps?: SyntheticListenerMap
  onBlockClick?: (blockId: string) => void
}

export function Block({ block, isFocused, dragHandleProps, onBlockClick }: BlockProps) {
  const dispatch = useEditorDispatch()
  const editorState = useEditorState()
  const blockRef = useRef<HTMLDivElement>(null)

  // Check if this block is selected from centralized state
  const isSelected = editorState.selectedBlockIds.includes(block.id)

  // Handle drag handle selection with multi-block support
  const handleBlockSelect = (blockId: string, event?: MouseEvent) => {
    // Check if Shift key is held for multi-selection
    if (event?.shiftKey && editorState.selectedBlockIds.length > 0) {
      // Range selection: select from last selected to current
      const lastSelectedId = editorState.selectedBlockIds[editorState.selectedBlockIds.length - 1]
      dispatch({ type: 'SELECT_BLOCK_RANGE', startBlockId: lastSelectedId, endBlockId: blockId })
    } else if (event?.ctrlKey || event?.metaKey) {
      // Toggle individual block selection (Ctrl/Cmd+click)
      dispatch({ type: 'TOGGLE_BLOCK_SELECTION', blockId })
    } else {
      // Single selection (clear others and select this one)
      dispatch({ type: 'SET_SELECTED_BLOCKS', blockIds: [blockId] })
    }
  }

  // Handle click on block
  const handleClick = () => {
    onBlockClick?.(block.id)
  }

  // Determine the appropriate placeholder text
  const getPlaceholder = () => {
    if (isFocused && block.content === '') {
      return "Press '/' for commands, or 'space' for AI..."
    }
    return ''
  }

  // Render the appropriate block type
  const renderContent = () => {
    const content = block.content || ''
    const placeholder = getPlaceholder()

    // Always use the same DOM structure to prevent React errors
    // Use a consistent span element with conditional className
    return <span className={content === '' && placeholder ? 'block__placeholder' : ''}>{content === '' && placeholder ? placeholder : content}</span>
  }

  // Get the appropriate class for the block type
  const getBlockClass = () => {
    const baseClass = 'block__content'
    const typeClass = `block__content--${block.type}`
    const focusedClass = isFocused ? 'block__content--focused' : ''
    const emptyClass = isFocused && block.content === '' ? 'block__content--empty' : ''

    return `${baseClass} ${typeClass} ${focusedClass} ${emptyClass}`.trim()
  }

  return (
    <div className={`block block--${block.type} ${isSelected ? 'block--selected' : ''}`} data-block-id={block.id} onClick={handleClick}>
      {/* Drag handle - shows on hover */}
      <BlockDragHandle blockId={block.id} onSelect={handleBlockSelect} dragHandleProps={dragHandleProps} />

      {/* Block content - no longer contentEditable */}
      <div ref={blockRef} className={getBlockClass()} data-block-id={block.id} suppressContentEditableWarning>
        {renderContent()}
      </div>
    </div>
  )
}
