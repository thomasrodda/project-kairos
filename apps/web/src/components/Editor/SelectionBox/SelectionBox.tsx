// apps/web/src/components/Editor/SelectionBox/SelectionBox.tsx
// Visual selection box component that appears during drag-to-select operations.
// Renders a semi-transparent purple rectangle to indicate the selection area.

import React from 'react'
import './SelectionBox.scss'

interface SelectionBoxProps {
  rect: {
    left: number
    top: number
    width: number
    height: number
  } | null
}

export function SelectionBox({ rect }: SelectionBoxProps) {
  if (!rect) return null

  return (
    <div
      className="selection-box"
      style={{
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
    />
  )
}
