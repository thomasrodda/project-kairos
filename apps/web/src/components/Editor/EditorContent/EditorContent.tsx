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
import { useEditorState, useEditorDispatch, EditorBlock } from '../../../contexts/EditorContext'
import { useDismiss, useCrossBlockSelection } from '../../../hooks'
import { PageTitle } from '../PageTitle'
import { usePageContext } from '../../../contexts/PageContext'
import { DraggableBlock } from '../Block/DraggableBlock'
import { Block } from '../Block'
import { ContentEditableContainer } from '../ContentEditableContainer'
import { FormattingToolbar } from '../FormattingToolbar'
import './EditorContent.scss'

export function EditorContent() {
  const editorState = useEditorState()
  const dispatch = useEditorDispatch()
  const { pageTitle, blocks, focusedBlockId, selectedBlockIds, crossBlockSelection } = editorState
  const { forceSave } = usePageContext()
  const editorRef = useRef<HTMLDivElement>(null)
  const contentEditableRef = useRef<HTMLDivElement>(null)
  const formattingToolbarRef = useRef<HTMLDivElement>(null)
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
        distance: 20, // 20px movement required to start drag (increased from 8px to avoid conflicts with text selection)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle keyboard shortcuts for selected blocks and text
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl/Cmd+S for manual save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        forceSave()
        return
      }

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
  }, [selectedBlockIds, focusedBlockId, crossBlockSelection, dispatch, clearSelection, forceSave])

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

    // Check if a drag selection just completed by looking for the flag on the editor container
    const editorContainer = target.closest('.editor')
    if (editorContainer && editorContainer.getAttribute('data-drag-selection-just-completed') === 'true') {
      return
    }

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

    // Find which block is above the click position
    if (blocks.length > 0) {
      const clickY = e.clientY
      let targetBlockId: string | null = null

      // Find all block elements and their positions
      const blockElements = document.querySelectorAll('.block')

      for (let i = 0; i < blockElements.length; i++) {
        const blockEl = blockElements[i] as HTMLElement
        const rect = blockEl.getBoundingClientRect()

        // If click is below this block
        if (clickY > rect.bottom) {
          const blockId = blockEl.getAttribute('data-block-id')
          if (blockId) {
            targetBlockId = blockId
          }
        } else {
          // We've found a block below the click position, so use the previous block
          break
        }
      }

      // If no target block found (click is above all blocks), use the first block
      if (!targetBlockId && blocks.length > 0) {
        targetBlockId = blocks[0].id
      }

      // If we found a target block, focus it and place cursor at end
      if (targetBlockId) {
        dispatch({ type: 'SET_FOCUSED_BLOCK', blockId: targetBlockId })

        // Place cursor at the end of the target block
        setTimeout(() => {
          const blockElement = document.querySelector(`[data-block-id="${targetBlockId}"] .block__content`) as HTMLElement
          if (blockElement) {
            const range = document.createRange()
            const selection = window.getSelection()

            // Find the text node - it might be inside a span
            let textNode: Node
            if (blockElement.firstChild?.nodeType === Node.TEXT_NODE) {
              textNode = blockElement.firstChild
            } else if (blockElement.firstChild?.firstChild?.nodeType === Node.TEXT_NODE) {
              // Text is inside a span (for placeholder or regular content)
              textNode = blockElement.firstChild.firstChild
            } else {
              // Create a text node if empty
              textNode = document.createTextNode('')
              blockElement.appendChild(textNode)
            }

            // Set cursor at the end of the content
            range.setStart(textNode, textNode.textContent?.length || 0)
            range.collapse(true)

            selection?.removeAllRanges()
            selection?.addRange(range)

            // Focus the contentEditable container
            const container = blockElement.closest('.content-editable-container') as HTMLElement
            container?.focus()
          }
        }, 0)
      }
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
    excludeRefs: [formattingToolbarRef], // Don't dismiss when clicking on formatting toolbar
  })

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const draggedBlockId = event.active.id as string
    setActiveId(draggedBlockId)
    dispatch({ type: 'SET_DRAGGING', isDragging: true })

    // Only clear text selection if we're actually dragging a block
    // This prevents interfering with click-and-drag text selection
    const isDraggingBlock = blocks.some((b) => b.id === draggedBlockId)
    if (crossBlockSelection && isDraggingBlock) {
      clearSelection()
    }

    // If the dragged block is part of a multi-selection, ensure it stays selected
    if (selectedBlockIds.length > 1 && selectedBlockIds.includes(draggedBlockId)) {
      // Keep the multi-selection
    } else if (!selectedBlockIds.includes(draggedBlockId)) {
      // If dragging an unselected block, select only that block
      dispatch({ type: 'SET_SELECTED_BLOCKS', blockIds: [draggedBlockId] })
    }

    // Announce drag start for screen readers
    const blockIndex = blocks.findIndex((b) => b.id === draggedBlockId)
    const dragCount = selectedBlockIds.includes(draggedBlockId) ? selectedBlockIds.length : 1
    if (dragCount > 1) {
      setAnnouncement(`Started dragging ${dragCount} selected blocks`)
    } else {
      setAnnouncement(`Started dragging block ${blockIndex + 1} of ${blocks.length}`)
    }
    setTimeout(() => setAnnouncement(''), 2000)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && over?.id) {
      const draggedBlockId = active.id as string
      const overBlockId = over.id as string

      // Check if we're dragging multiple blocks
      const isDraggingMultiple = selectedBlockIds.length > 1 && selectedBlockIds.includes(draggedBlockId)

      if (isDraggingMultiple) {
        // Multi-block drag logic
        const overIndex = blocks.findIndex((block) => block.id === overBlockId)

        if (overIndex !== -1) {
          // Get all selected blocks in their current order
          const selectedBlocks: EditorBlock[] = []
          const unselectedBlocks: EditorBlock[] = []

          blocks.forEach((block) => {
            if (selectedBlockIds.includes(block.id)) {
              selectedBlocks.push(block)
            } else {
              unselectedBlocks.push(block)
            }
          })

          // Find where to insert the selected blocks
          let insertIndex = 0
          for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].id === overBlockId) {
              // Check if we're dropping above or below the target
              const draggedIndex = blocks.findIndex((b) => b.id === draggedBlockId)
              if (draggedIndex < i) {
                // Dragging down - insert after the target
                insertIndex = unselectedBlocks.findIndex((b) => b.id === overBlockId) + 1
              } else {
                // Dragging up - insert before the target
                insertIndex = unselectedBlocks.findIndex((b) => b.id === overBlockId)
              }
              break
            }
          }

          // Reconstruct the blocks array with selected blocks at the new position
          const newBlocks = [...unselectedBlocks.slice(0, insertIndex), ...selectedBlocks, ...unselectedBlocks.slice(insertIndex)]

          dispatch({ type: 'REORDER_BLOCKS', blocks: newBlocks })

          // Announce successful reorder for screen readers
          setAnnouncement(`Moved ${selectedBlocks.length} blocks to new position`)
          setTimeout(() => setAnnouncement(''), 2000)
        }
      } else {
        // Single block drag logic (existing code)
        const oldIndex = blocks.findIndex((block) => block.id === active.id)
        const newIndex = blocks.findIndex((block) => block.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newBlocks = arrayMove(blocks, oldIndex, newIndex)
          dispatch({ type: 'REORDER_BLOCKS', blocks: newBlocks })

          // Announce successful reorder for screen readers
          setAnnouncement(`Block moved from position ${oldIndex + 1} to position ${newIndex + 1}`)
          setTimeout(() => setAnnouncement(''), 2000)
        }
      }
    } else if (activeId) {
      // Announce if drag was cancelled
      setAnnouncement('Drag cancelled, block returned to original position')
      setTimeout(() => setAnnouncement(''), 2000)
    }

    setActiveId(null)
    dispatch({ type: 'SET_DRAGGING', isDragging: false })
  }

  // Check if we're dragging multiple blocks
  const isDraggingMultiple = activeId && selectedBlockIds.length > 1 && selectedBlockIds.includes(activeId)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        className={`editor-content ${activeId ? 'editor-content--sorting' : ''} ${isDraggingMultiple ? 'editor-content--dragging-multiple' : ''}`}
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
        <div className="editor-content__header">
          <PageTitle title={pageTitle} />
        </div>

        {/* All blocks in a single contentEditable container */}
        <div className="editor-content__blocks" role="group" aria-label="Document blocks">
          <ContentEditableContainer onBlockClick={handleBlockClick} containerRef={contentEditableRef}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block, index) => (
                <div key={block.id} aria-label={`Block ${index + 1} of ${blocks.length}, ${block.type}`}>
                  <DraggableBlock
                    block={block}
                    isFocused={focusedBlockId === block.id}
                    isSelected={selectedBlockIds.includes(block.id)}
                    activeId={activeId}
                    selectedBlockIds={selectedBlockIds}
                  />
                </div>
              ))}
            </SortableContext>
          </ContentEditableContainer>
          {/* Formatting toolbar positioned relative to content container */}
          <FormattingToolbar containerRef={contentEditableRef} toolbarRef={formattingToolbarRef} />
        </div>
      </div>

      {/* Drag overlay that shows the dragged blocks */}
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div style={{ opacity: 1 }}>
            {selectedBlockIds.length > 1 && selectedBlockIds.includes(activeId) ? (
              // Multi-block drag: show all selected blocks
              <div className="dragging-multiple-blocks">
                {blocks
                  .filter((block) => selectedBlockIds.includes(block.id))
                  .map((block) => (
                    <Block key={block.id} block={block} isFocused={false} />
                  ))}
              </div>
            ) : (
              // Single block drag
              blocks.find((b) => b.id === activeId) && <Block block={blocks.find((b) => b.id === activeId)!} isFocused={false} />
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
