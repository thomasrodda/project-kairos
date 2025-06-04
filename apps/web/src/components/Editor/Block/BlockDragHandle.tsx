// apps/web/src/components/Editor/Block/BlockDragHandle.tsx
// Drag handle component that appears when hovering over a block.
// Provides visual feedback and will eventually enable drag & drop reordering.
// Shows only on hover to keep the interface clean while editing.

import { Icon } from '@kairos/ui'
import './BlockDragHandle.scss'

interface BlockDragHandleProps {
  blockId: string
  onDragStart?: (blockId: string) => void
  onSelect?: (blockId: string) => void
}

export function BlockDragHandle({ blockId, onDragStart, onSelect }: BlockDragHandleProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    // For now, we'll just handle selection
    onSelect?.(blockId)
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', blockId)
    onDragStart?.(blockId)
  }

  return (
    <div className="block-drag-handle" draggable onMouseDown={handleMouseDown} onDragStart={handleDragStart}>
      <Icon name="grab" size={16} />
    </div>
  )
}
