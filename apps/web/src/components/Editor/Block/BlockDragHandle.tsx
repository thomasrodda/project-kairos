// apps/web/src/components/Editor/Block/BlockDragHandle.tsx
// Drag handle component that appears when hovering over a block.
// Integrates with @dnd-kit for smooth drag & drop reordering and supports multi-block selection.
// Shows only on hover to keep the interface clean while editing.

import React from 'react'
import { Icon } from '@kairos/ui'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import './BlockDragHandle.scss'

interface BlockDragHandleProps {
  blockId: string
  onSelect?: (blockId: string, event?: MouseEvent) => void // Updated to pass mouse event
  dragHandleProps?: SyntheticListenerMap // Properly typed @dnd-kit listeners
}

export function BlockDragHandle({ blockId, onSelect, dragHandleProps }: BlockDragHandleProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    // Convert React MouseEvent to native MouseEvent for modifier key detection
    const nativeEvent = e.nativeEvent

    // Select the block when clicking the drag handle, passing the mouse event
    onSelect?.(blockId, nativeEvent)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard activation (Enter or Space)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      // For keyboard activation, we don't have modifier keys to check
      onSelect?.(blockId)
    }
  }

  return (
    <div
      className="block-drag-handle"
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      {...dragHandleProps}
      // Prevent contentEditable from interfering
      contentEditable={false}
      // Accessibility improvements
      role="button"
      tabIndex={0}
      aria-label="Drag to reorder block, or click to select. Use Shift+click to select multiple blocks."
      title="Drag to reorder • Click to select • Shift+click for multi-select"
      data-testid={`drag-handle-${blockId}`}
    >
      <Icon name="grab" size={16} />
    </div>
  )
}
