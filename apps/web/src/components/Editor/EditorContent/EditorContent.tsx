// apps/web/src/components/Editor/EditorContent/EditorContent.tsx
// Main content area for the block-based editor. Renders the page title and all blocks.
// Manages drag and drop reordering using @dnd-kit for smooth, accessible interactions.
// Supports cross-block text selection using native browser APIs for a Notion-like experience.
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
import { useDismiss, useCrossBlockSelection } from '../../../hooks'
import { PageTitle } from '../PageTitle'
import { DraggableBlock } from '../Block/DraggableBlock'
import { Block } from '../Block'
import './EditorContent.scss'

export function EditorContent() {
  const editorState = useEditorState()
  const dispatch = useEditorDispatch()
  const { pageTitle, blocks, focusedBlockId, selectedBlockIds, crossBlockSelection } = editorState
  const editorRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)

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

  // Track mouse down/up for selection
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Check if we're starting a text selection
      const target = e.target as HTMLElement
      if (target.closest('.block__content')) {
        console.log('Mouse down on block content, starting selection tracking')
        setIsSelecting(true)
      }
    }

    const handleMouseUp = () => {
      if (isSelecting) {
        console.log('Mouse up, ending selection tracking')
        setIsSelecting(false)

        // Force a selection check after a small delay
        setTimeout(() => {
          const selection = window.getSelection()
          if (selection && !selection.isCollapsed) {
            console.log('Forcing selection check after mouse up')
            // Trigger the selection change handler manually
            document.dispatchEvent(new Event('selectionchange'))
          }
        }, 10)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isSelecting])

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
        // Copy selected text
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          // Browser handles copy automatically with selection
          return
        }

        // Cut selected text
        if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
          // Browser handles cut automatically with selection
          return
        }

        // Delete selected text
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // For now, let the browser handle it
          // In the future, we might want custom handling for multi-block deletions
          return
        }

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

    // Handle Select All (Ctrl/Cmd + A)
    const handleSelectAll = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.shiftKey) {
        const target = e.target as HTMLElement

        // If we're in a block's content, let the browser handle it
        if (target.closest('.block__content')) {
          return
        }

        // Otherwise, select all content in the editor
        e.preventDefault()

        if (editorRef.current && blocks.length > 0) {
          const selection = window.getSelection()
          if (selection) {
            const range = document.createRange()

            // Find first and last block content
            const firstBlockContent = editorRef.current.querySelector(`[data-block-id="${blocks[0].id}"] .block__content`)
            const lastBlockContent = editorRef.current.querySelector(`[data-block-id="${blocks[blocks.length - 1].id}"] .block__content`)

            if (firstBlockContent && lastBlockContent) {
              range.setStartBefore(firstBlockContent)
              range.setEndAfter(lastBlockContent)
              selection.removeAllRanges()
              selection.addRange(range)
            }
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keydown', handleSelectAll)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keydown', handleSelectAll)
    }
  }, [selectedBlockIds, focusedBlockId, crossBlockSelection, dispatch, clearSelection, blocks])

  // Handle copy event for cross-block selection
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      if (!crossBlockSelection) return

      // Get the selected content
      const plainText = getSelectedText()
      const markdown = getSelectedMarkdown()

      // Set both plain text and markdown formats
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', plainText)
        e.clipboardData.setData('text/markdown', markdown)
        e.clipboardData.setData('text/html', markdown) // Some apps prefer HTML
      }

      // Announce copy for screen readers
      setAnnouncement('Text copied to clipboard')
      setTimeout(() => setAnnouncement(''), 1000)
    }

    document.addEventListener('copy', handleCopy)
    return () => document.removeEventListener('copy', handleCopy)
  }, [crossBlockSelection, getSelectedText, getSelectedMarkdown])

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

    // Clear any text selection
    if (crossBlockSelection) {
      clearSelection()
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
        className={`editor-content ${activeId ? 'editor-content--sorting' : ''} ${crossBlockSelection ? 'editor-content--selecting' : ''}`}
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
