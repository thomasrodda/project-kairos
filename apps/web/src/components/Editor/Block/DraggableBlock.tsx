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
}

export function DraggableBlock({ block, isFocused }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: false, // Allow dragging even when editing
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={`draggable-block ${isDragging ? 'draggable-block--dragging' : ''}`} {...attributes}>
      <Block block={block} isFocused={isFocused} dragHandleProps={listeners} />
    </div>
  )
}
