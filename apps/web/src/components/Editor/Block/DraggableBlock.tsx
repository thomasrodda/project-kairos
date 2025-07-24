// apps/web/src/components/Editor/Block/DraggableBlock.tsx
// Wrapper component that adds drag and drop functionality to blocks using @dnd-kit.
// Provides smooth animations, touch support, and accessibility features for reordering blocks.

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Block } from './Block'
import type { EditorBlock } from '../../../contexts/EditorContext'
import './DraggableBlock.scss'

interface DraggableBlockProps {
  block: EditorBlock
  isFocused: boolean
  isSelected: boolean
  activeId: string | null
  selectedBlockIds: string[]
  overId: string | null
}

export function DraggableBlock({ block, isFocused, isSelected, activeId, selectedBlockIds, overId }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: false, // Allow dragging even when editing
    animateLayoutChanges: () => false, // Disable default animations to use our own
  })

  // Check if this block should appear as dragging
  // It should appear as dragging if:
  // 1. It's the block being dragged (isDragging), OR
  // 2. It's selected AND any selected block is being dragged
  const shouldShowAsDragging = isDragging || (isSelected && activeId && selectedBlockIds.includes(activeId))

  // For multi-block drag, sync transform with the active block
  const isPartOfMultiDrag = isSelected && activeId && selectedBlockIds.includes(activeId) && selectedBlockIds.length > 1
  const isActiveBlock = block.id === activeId

  // Hide dragging blocks (they're shown in the overlay)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Custom smooth transition
    opacity: shouldShowAsDragging ? 0 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-block ${shouldShowAsDragging ? 'draggable-block--dragging' : ''} ${isSelected && activeId && selectedBlockIds.length > 1 ? 'draggable-block--multi-drag' : ''}`}
      {...attributes}
    >
      <Block block={block} isFocused={isFocused} dragHandleProps={listeners} />
    </div>
  )
}
