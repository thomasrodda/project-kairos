// apps/web/src/components/Editor/EditorContent/EditorContent.tsx
// Main content area for the block-based editor. Renders the page title and all blocks.
// Uses a single contentEditable container to enable cross-block text selection.
// Manages drag and drop reordering using @dnd-kit for smooth, accessible interactions.

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
import { useDismiss, useCrossBlockSelection } from '../../../hooks'
import { PageTitle } from '../PageTitle'
import { DraggableBlock } from '../Block/DraggableBlock'
import { Block } from '../Block'
import { ContentEditableContainer } from '../ContentEditableContainer'
import './EditorContent.scss'

export function EditorContent() {
  const editorState = useEditorState()
  const dispatch = useEditorDispatch()
  const { pageTitle, blocks, focusedBlockId, selectedBlockIds, crossBlockSelection } = editorState
  const editorRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Screen reader announcements for accessibility
  const [announcement, setAnnouncement] = useState<string>('')

  // Use cross-block selection hook
  const { clearSelection, getSelectedText, getSelectedMarkdown } = useCrossBlockSelection({
    enabled: !activeId, // Disable during drag operations
    onSelectionChange: (newSelection) => {
      // Selection state is already updated in the hook
      // This callback is for any additional side effects
      if (newSelection) {
        // Clear block selection when text is selected
        if (selectedBlockIds.length > 0) {
          dispatch({ type: 'CLEAR_SELECTION' })
        }
      }
    },
  })

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

  // Handle keyboard shortcuts for selected blocks and text
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle text selection shortcuts first
      if (crossBlockSelection) {
        // Escape clears text selection
        if (e.key === 'Escape') {
          e.preventDefault()
          clearSelection()
          return
        }
      }

      // Only handle block selection shortcuts if no text is selected
      if (selectedBlockIds.length === 0 || focusedBlockId || crossBlockSelection) return

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
  }, [selectedBlockIds, focusedBlockId, crossBlockSelection, dispatch, clearSelection])

  // Handle copy event for cross-block selection
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      if (!crossBlockSelection) return

      // Get the selected content
      const plainText = getSelectedText()
      const markdown = getSelectedMarkdown()

      // Create a custom format that preserves block structure
      const selectedBlockData = (() => {
        const { startBlockId, endBlockId, startOffset, endOffset } = crossBlockSelection
        const startIndex = blocks.findIndex((b) => b.id === startBlockId)
        const endIndex = blocks.findIndex((b) => b.id === endBlockId)

        if (startIndex === -1 || endIndex === -1) return []

        return blocks.slice(startIndex, endIndex + 1).map((block, index) => {
          let content = block.content

          // Trim content based on selection for first and last blocks
          if (index === 0 && startIndex === endIndex) {
            // Single block selection
            content = block.content.substring(startOffset, endOffset)
          } else if (index === 0) {
            // First block of multi-block selection
            content = block.content.substring(startOffset)
          } else if (index === endIndex - startIndex) {
            // Last block of multi-block selection
            content = block.content.substring(0, endOffset)
          }

          return {
            type: block.type,
            content: content,
            isEmpty: content === '',
          }
        })
      })()

      // Set both plain text and custom format
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', plainText)
        e.clipboardData.setData('text/markdown', markdown)
        e.clipboardData.setData('application/x-kairos-blocks', JSON.stringify(selectedBlockData))
      }

      // Prevent default to avoid double copying
      e.preventDefault()

      // Announce copy for screen readers
      setAnnouncement('Text copied to clipboard')
      setTimeout(() => setAnnouncement(''), 1000)
    }

    document.addEventListener('copy', handleCopy)
    return () => document.removeEventListener('copy', handleCopy)
  }, [crossBlockSelection, getSelectedText, getSelectedMarkdown, blocks])

  // Handle clicks in empty space
  const handleEmptySpaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement

    // Check if the click was on specific elements
    const isOnBlock = target.closest('.block') !== null
    const isOnPageTitle = target.closest('.page-title') !== null
    const isOnContainer = target.closest('.content-editable-container') !== null

    // Only handle clicks on truly empty space
    if (isOnBlock || isOnPageTitle || isOnContainer) {
      return
    }

    // Clear selections
    if (crossBlockSelection) {
      clearSelection()
    }

    if (selectedBlockIds.length > 0) {
      dispatch({ type: 'CLEAR_SELECTION' })
    }

    // Focus the last block if clicking below all content
    if (blocks.length > 0) {
      dispatch({ type: 'SET_FOCUSED_BLOCK', blockId: blocks[blocks.length - 1].id })
    }
  }

  // Handle block click from ContentEditableContainer
  const handleBlockClick = (blockId: string) => {
    // This is now handled by the ContentEditableContainer
    // We just need to ensure focus is set properly
    dispatch({ type: 'SET_FOCUSED_BLOCK', blockId })
  }

  // Dismiss selection when clicking outside editor or pressing escape
  useDismiss(editorRef, {
    onDismiss: () => {
      // Clear both selection and focus
      dispatch({ type: 'CLEAR_SELECTION' })
      dispatch({ type: 'SET_FOCUSED_BLOCK', blockId: null })
      clearSelection()
    },
    enabled: !!(selectedBlockIds.length > 0 || focusedBlockId || crossBlockSelection),
  })

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const draggedBlockId = event.active.id as string
    setActiveId(draggedBlockId)
    dispatch({ type: 'SET_DRAGGING', isDragging: true })

    // Clear any text selection when starting drag
    if (crossBlockSelection) {
      clearSelection()
    }

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
        role="document"
        aria-label="Document editor"
      >
        {/* Screen reader announcements */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          {announcement}
        </div>

        {/* Page title - always visible and editable */}
        <PageTitle title={pageTitle} />

        {/* All blocks in a single contentEditable container */}
        <div className="editor-content__blocks" role="group" aria-label="Document blocks">
          <ContentEditableContainer onBlockClick={handleBlockClick}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block, index) => (
                <div key={block.id} aria-label={`Block ${index + 1} of ${blocks.length}, ${block.type}`}>
                  <DraggableBlock block={block} isFocused={focusedBlockId === block.id} />
                </div>
              ))}
            </SortableContext>
          </ContentEditableContainer>
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
