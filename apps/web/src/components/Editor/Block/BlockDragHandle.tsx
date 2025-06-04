// apps/web/src/components/Editor/Block/BlockDragHandle.tsx
// Drag handle component that appears when hovering over a block.
// Integrates with @dnd-kit for smooth drag & drop reordering.
// Shows only on hover to keep the interface clean while editing.

import React from 'react'
import { Icon } from '@kairos/ui'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import './BlockDragHandle.scss'

interface BlockDragHandleProps {
  blockId: string
  onSelect?: (blockId: string) => void
  dragHandleProps?: SyntheticListenerMap // Properly typed @dnd-kit listeners
}

export function BlockDragHandle({ blockId, onSelect, dragHandleProps }: BlockDragHandleProps) {
  const handleMouseDown = (_e: React.MouseEvent) => {
    // Select the block when clicking the drag handle
    onSelect?.(blockId)
  }

  return (
    <div
      className="block-drag-handle"
      onMouseDown={handleMouseDown}
      {...dragHandleProps}
      // Prevent contentEditable from interfering
      contentEditable={false}
      // Accessibility improvements
      role="button"
      tabIndex={0}
      aria-label="Drag to reorder block"
      title="Drag to reorder this block"
    >
      <Icon name="grab" size={16} />
    </div>
  )
}
