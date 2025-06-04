// apps/web/src/components/Editor/EditorContent/EditorContent.tsx
// Main content area for the block-based editor. Renders the page title and all blocks.
// Manages the overall editor layout and coordinates between individual block components.
// Acts as the container for all editing functionality within the Editor layout.

import { useRef, useEffect } from 'react'
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

  // Handle keyboard shortcuts for selected blocks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if a block is selected (not focused for editing)
      if (!selectedBlockId || focusedBlockId) return

      // Delete or Backspace key deletes the selected block
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        dispatch({ type: 'DELETE_BLOCK', blockId: selectedBlockId })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedBlockId, focusedBlockId, dispatch])

  // Handle clicks in empty space to focus the nearest block above cursor
  const handleEmptySpaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement

    // Check if the click was on a block content element or any interactive element
    const isOnBlock = target.closest('.block__content') !== null
    const isOnDragHandle = target.closest('.block-drag-handle') !== null
    const isOnPageTitle = target.closest('.page-title') !== null

    // Only handle clicks that are NOT on interactive elements
    if (isOnBlock || isOnDragHandle || isOnPageTitle) {
      return
    }

    // Get cursor position
    const clickY = e.clientY

    // Find all block elements in the DOM
    const blockElements = Array.from(editorRef.current?.querySelectorAll('.block[data-block-id]') || []) as HTMLElement[]

    if (blockElements.length === 0) return

    // Find the block that's closest above the cursor position
    let bestDistance = Infinity
    let bestBlockId: string | null = null

    blockElements.forEach((blockElement) => {
      const rect = blockElement.getBoundingClientRect()
      const blockBottom = rect.bottom

      // Get the block ID from the data attribute
      const blockId = blockElement.getAttribute('data-block-id')
      if (!blockId) return

      // Calculate distance from cursor to bottom of block
      const distance = clickY - blockBottom

      // If click is below this block and it's closer than our current best
      if (distance > 0 && distance < bestDistance) {
        bestDistance = distance
        bestBlockId = blockId
      }
    })

    // Determine which block to focus
    let targetBlockId: string | null = null

    if (bestBlockId) {
      // If we found a block above the cursor, focus it
      targetBlockId = bestBlockId
    } else {
      // If cursor is above all blocks, focus the first block
      targetBlockId = blocks[0]?.id || null
    }

    // Focus the target block
    if (targetBlockId) {
      dispatch({ type: 'SET_FOCUSED_BLOCK', blockId: targetBlockId })
    }
  }

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
    <div className="editor-content" ref={editorRef} onClick={handleEmptySpaceClick}>
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
