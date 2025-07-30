// apps/web/src/components/Editor/Block/Block.tsx
// Individual block component that renders content within a single contentEditable container.
// No longer uses individual contentEditable - relies on parent container for editing.
// Handles block-specific behaviors like placeholders and styling.

import React, { useRef } from 'react'
import { useEditorDispatch, useEditorState } from '../../../contexts/EditorContext'
import type { EditorBlock } from '../../../contexts/EditorContext'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { BlockDragHandle } from './BlockDragHandle'
import { renderFormattedText } from '../../../utils/formattingRenderer'
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
      // If clicking on an already selected block (part of multi-selection), don't change selection
      // This allows dragging multiple selected blocks
      if (editorState.selectedBlockIds.length > 1 && editorState.selectedBlockIds.includes(blockId)) {
        // Do nothing - keep the current multi-selection
        return
      }
      // Single selection (clear others and select this one)
      dispatch({ type: 'SET_SELECTED_BLOCKS', blockIds: [blockId] })
    }
  }

  // Handle click on block
  const handleClick = (e: React.MouseEvent) => {
    // Check if the click is on a link
    const target = e.target as HTMLElement
    if (target.tagName === 'A' || target.closest('a')) {
      // Allow link clicks to propagate normally
      return
    }
    onBlockClick?.(block.id)
  }

  // Determine the appropriate placeholder text
  const getPlaceholder = () => {
    if (isFocused && (!block.content || block.content === '')) {
      return "Press '/' for commands, or 'space' for AI..."
    }
    return ''
  }

  // Validate and filter formatting
  const validateFormatting = () => {
    if (!block.formatting || block.formatting.length === 0) {
      return []
    }

    const content = block.content || ''
    const contentLength = content.length

    // Filter out invalid formatting
    const validFormatting = block.formatting
      .filter((format) => {
        // Check bounds
        if (format.start < 0 || format.end < 0 || format.start >= format.end) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Invalid formatting range: start=${format.start}, end=${format.end}`)
          }
          return false
        }

        // Check if format extends beyond content
        if (format.start >= contentLength) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Invalid formatting: start position ${format.start} is beyond content length ${contentLength}`)
          }
          return false
        }

        // Validate link URLs
        if (format.type === 'link' && (!format.url || format.url === '')) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Invalid formatting: link format missing URL`)
          }
          return false
        }

        return true
      })
      .map((format) => {
        // Clamp end position to content length
        if (format.end > contentLength) {
          return { ...format, end: contentLength }
        }
        return format
      })

    return validFormatting
  }

  // Render the appropriate block type
  const renderContent = () => {
    const content = block.content || ''
    const placeholder = getPlaceholder()

    // Show placeholder if empty
    if (content === '' && placeholder) {
      return <span className="block__placeholder">{placeholder}</span>
    }

    // Validate and render formatted text if block has formatting
    const validFormatting = validateFormatting()
    if (validFormatting.length > 0) {
      return renderFormattedText({ content, formatting: validFormatting })
    }

    // Otherwise render plain text
    return <span>{content}</span>
  }

  // Get the appropriate class for the block type
  const getBlockClass = () => {
    // Validate block type
    const validTypes = ['h1', 'h2', 'h3', 'paragraph', 'bullet']
    const blockType = validTypes.includes(block.type) ? block.type : 'paragraph'

    if (process.env.NODE_ENV === 'development' && !validTypes.includes(block.type)) {
      console.error(`Invalid block type: ${block.type}. Falling back to paragraph.`)
    }

    const baseClass = 'block__content'
    const typeClass = `block__content--${blockType}`
    const focusedClass = isFocused ? 'block__content--focused' : ''
    const emptyClass = isFocused && (!block.content || block.content === '') ? 'block__content--empty' : ''

    return `${baseClass} ${typeClass} ${focusedClass} ${emptyClass}`.trim()
  }

  // Validate block type for outer div class
  const validTypes = ['h1', 'h2', 'h3', 'paragraph', 'bullet']
  const blockType = validTypes.includes(block.type) ? block.type : 'paragraph'

  return (
    <div className={`block block--${blockType} ${isSelected ? 'block--selected' : ''}`} data-block-id={block.id} onClick={handleClick}>
      {/* Drag handle - shows on hover */}
      <BlockDragHandle blockId={block.id} onSelect={handleBlockSelect} dragHandleProps={dragHandleProps} />

      {/* Block content - no longer contentEditable */}
      <div ref={blockRef} className={getBlockClass()} data-block-id={block.id} suppressContentEditableWarning>
        {renderContent()}
      </div>
    </div>
  )
}
