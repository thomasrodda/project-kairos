// apps/web/src/components/Editor/EditorContent/EditorContent.tsx
// Main content area for the block-based editor. Renders the page title and all blocks.
// Manages drag and drop reordering using @dnd-kit for smooth, accessible interactions.
// Acts as the container for all editing functionality within the Editor layout.

import { useRef, useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEditorState, useEditorDispatch } from '../../../contexts/EditorContext'
import { useDismiss } from '../../../hooks'
import { PageTitle } from '../PageTitle'
import { DraggableBlock } from '../Block/DraggableBlock'
import { Block } from '../Block'
import './EditorContent.scss'

export function EditorContent() {
  const editorState = useEditorState()
  const dispatch = useEditorDispatch()
  const { pageTitle, blocks, focusedBlockId, selectedBlockIds } = editorState
  const editorRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Screen reader announcements for accessibility
  const [announcement, setAnnouncement] = useState<string>('')

  // Configure drag sensors for better UX
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle keyboard shortcuts for selected blocks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if blocks are selected (not focused for editing)
      if (selectedBlockIds.length === 0 || focusedBlockId) return

      // Delete or Backspace key deletes the selected blocks
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()

        if (selectedBlockIds.length === 1) {
          // Single block deletion
          dispatch({ type: 'DELETE_BLOCK', blockId: selectedBlockIds[0] })
          setAnnouncement('Block deleted')
        } else {
          // Multiple block deletion
          dispatch({ type: 'DELETE_BLOCKS', blockIds: selectedBlockIds })
          setAnnouncement(`${selectedBlockIds.length} blocks deleted`)
        }

        setTimeout(() => setAnnouncement(''), 1000)
      }

      // Escape key clears selection
      if (e.key === 'Escape') {
        dispatch({ type: 'CLEAR_SELECTION' })
        setAnnouncement('Selection cleared')
        setTimeout(() => setAnnouncement(''), 1000)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedBlockIds, focusedBlockId, dispatch])

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
      dispatch({ type: 'CLEAR_SELECTION' })
      dispatch({ type: 'SET_FOCUSED_BLOCK', blockId: null })
    },
    enabled: !!(selectedBlockIds.length > 0 || focusedBlockId), // Fixed variable name
  })

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const draggedBlockId = event.active.id as string
    setActiveId(draggedBlockId)
    dispatch({ type: 'SET_DRAGGING', isDragging: true })

    // Announce drag start for screen readers
    const blockIndex = blocks.findIndex((b) => b.id === draggedBlockId)
    setAnnouncement(`Started dragging block ${blockIndex + 1} of ${blocks.length}`)
    setTimeout(() => setAnnouncement(''), 2000)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && over?.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id)
      const newIndex = blocks.findIndex((block) => block.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = arrayMove(blocks, oldIndex, newIndex)
        dispatch({ type: 'REORDER_BLOCKS', blocks: newBlocks })

        // Announce successful reorder for screen readers
        setAnnouncement(`Block moved from position ${oldIndex + 1} to position ${newIndex + 1}`)
        setTimeout(() => setAnnouncement(''), 2000)
      }
    } else if (activeId) {
      // Announce if drag was cancelled
      setAnnouncement('Drag cancelled, block returned to original position')
      setTimeout(() => setAnnouncement(''), 2000)
    }

    setActiveId(null)
    dispatch({ type: 'SET_DRAGGING', isDragging: false })
  }

  // Find the active block for the drag overlay
  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className={`editor-content ${activeId ? 'editor-content--sorting' : ''}`}
        ref={editorRef}
        onClick={handleEmptySpaceClick}
        // Accessibility improvements
        role="document"
        aria-label="Document editor"
      >
        {/* Screen reader announcements */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}
        >
          {announcement}
        </div>

        {/* Page title - always visible and editable */}
        <PageTitle title={pageTitle} />

        {/* All blocks in the page */}
        <div className="editor-content__blocks" role="group" aria-label="Document blocks">
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block, index) => (
              <div key={block.id} aria-label={`Block ${index + 1} of ${blocks.length}, ${block.type}`}>
                <DraggableBlock block={block} isFocused={focusedBlockId === block.id} />
              </div>
            ))}
          </SortableContext>
        </div>
      </div>

      {/* Drag overlay for smooth dragging animation */}
      <DragOverlay>
        {activeBlock ? (
          <div style={{ opacity: 0.8 }} role="img" aria-label="Dragging block">
            <Block block={activeBlock} isFocused={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
