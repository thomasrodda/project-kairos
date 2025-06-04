// apps/web/src/components/Editor/Block/Block.tsx
// Individual block component that renders editable content with contentEditable.
// Handles text input, Enter key for new blocks, and displays placeholder text when empty.
// Supports different block types (H1, H2, H3, paragraph, bullet) with appropriate styling.
// Includes a drag handle that appears on hover for block reordering.

import React, { useRef, useEffect, useState } from 'react'
import { useEditorDispatch, useEditorState, BLOCK_PLACEHOLDERS } from '../../../contexts/EditorContext'
import type { EditorBlock } from '../../../contexts/EditorContext'
import { generateId } from '@kairos/utils'
import { BlockDragHandle } from './BlockDragHandle'
import './Block.scss'

interface BlockProps {
  block: EditorBlock
  isFocused: boolean
}

export function Block({ block, isFocused }: BlockProps) {
  const dispatch = useEditorDispatch()
  const editorState = useEditorState()
  // Single RefObject that can point to a <p>, <h1>, <h2>, <h3> or <li>.
  const blockRef = useRef<HTMLHeadingElement | HTMLParagraphElement | HTMLLIElement>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Check if this block is selected from centralized state
  const isSelected = editorState.selectedBlockId === block.id

  // Focus the block when isFocused changes to true
  useEffect(() => {
    if (isFocused && blockRef.current && !isUpdating) {
      blockRef.current.focus()
      const range = document.createRange()
      const selection = window.getSelection()
      if (selection) {
        range.selectNodeContents(blockRef.current)
        range.collapse(false) // collapse to end
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }, [isFocused, isUpdating])

  // Update content when block.content changes (but not during typing)
  useEffect(() => {
    if (!isUpdating && blockRef.current) {
      const currentContent = blockRef.current.textContent || ''
      if (currentContent !== block.content) {
        blockRef.current.textContent = block.content
      }
    }
  }, [block.content, isUpdating])

  // Handle content changes
  const handleInput = (e: React.FormEvent<HTMLHeadingElement | HTMLParagraphElement | HTMLLIElement>) => {
    setIsUpdating(true)
    const content = e.currentTarget.textContent || ''
    dispatch({ type: 'UPDATE_BLOCK', blockId: block.id, content })

    // Reset updating flag after a short delay
    setTimeout(() => setIsUpdating(false), 10)
  }

  // Handle key presses (Enter, Shift+Enter, Backspace)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement | HTMLParagraphElement | HTMLLIElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const newBlock: EditorBlock = {
        id: generateId(),
        type: 'paragraph', // default new block to paragraph
        content: '',
        metadata: {
          placeholder: BLOCK_PLACEHOLDERS.paragraph,
        },
      }
      dispatch({ type: 'ADD_BLOCK', block: newBlock, afterBlockId: block.id })
    } else if (e.key === 'Enter' && e.shiftKey) {
      // shift+Enter → allow default line break
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault()
      dispatch({ type: 'DELETE_BLOCK', blockId: block.id })
    }
  }

  // Handle focus event
  const handleFocus = () => {
    dispatch({ type: 'SET_FOCUSED_BLOCK', blockId: block.id })
  }

  // Handle paste: strip out formatting and insert plain text
  const handlePaste = (e: React.ClipboardEvent<HTMLHeadingElement | HTMLParagraphElement | HTMLLIElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    const selection = window.getSelection()
    if (!selection?.rangeCount) return

    selection.deleteFromDocument()
    selection.getRangeAt(0).insertNode(document.createTextNode(text))
  }

  // Handle drag handle selection
  const handleBlockSelect = (blockId: string) => {
    dispatch({ type: 'SET_SELECTED_BLOCK', blockId })
  }

  // Handle drag start (future drag & drop implementation)
  const handleDragStart = (blockId: string) => {
    console.log('Drag started for block:', blockId)
    // Future: Implement drag & drop logic
  }

  // Determine which HTML tag to use
  const getBlockTag = () => {
    switch (block.type) {
      case 'h1':
        return 'h1'
      case 'h2':
        return 'h2'
      case 'h3':
        return 'h3'
      case 'bullet':
        return 'li'
      default:
        return 'p'
    }
  }
  const Tag = getBlockTag()

  // Render the correct element, casting blockRef to the proper element type each time
  const renderBlockContent = () => {
    // Props common to all tags (everything except ref)
    const commonProps = {
      className: 'block__content',
      contentEditable: true as const,
      suppressContentEditableWarning: true as const,
      onInput: handleInput,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      onPaste: handlePaste,
      'data-placeholder': block.metadata?.placeholder || BLOCK_PLACEHOLDERS[block.type],
    }

    switch (Tag) {
      case 'h1':
        return (
          <h1
            // Cast blockRef to Ref<HTMLHeadingElement> for <h1>
            ref={blockRef as React.Ref<HTMLHeadingElement>}
            {...commonProps}
          />
        )
      case 'h2':
        return (
          <h2
            // Cast blockRef to Ref<HTMLHeadingElement> for <h2>
            ref={blockRef as React.Ref<HTMLHeadingElement>}
            {...commonProps}
          />
        )
      case 'h3':
        return (
          <h3
            // Cast blockRef to Ref<HTMLHeadingElement> for <h3>
            ref={blockRef as React.Ref<HTMLHeadingElement>}
            {...commonProps}
          />
        )
      case 'li':
        return (
          <li
            // Cast blockRef to Ref<HTMLLIElement> for <li>
            ref={blockRef as React.Ref<HTMLLIElement>}
            {...commonProps}
          />
        )
      default:
        return (
          <p
            // Cast blockRef to Ref<HTMLParagraphElement> for <p>
            ref={blockRef as React.Ref<HTMLParagraphElement>}
            {...commonProps}
          />
        )
    }
  }

  return (
    <div className={`block block--${block.type} ${isSelected ? 'block--selected' : ''}`}>
      {/* Drag handle - shows on hover */}
      <BlockDragHandle blockId={block.id} onDragStart={handleDragStart} onSelect={handleBlockSelect} />

      {/* Block content */}
      {renderBlockContent()}
    </div>
  )
}
