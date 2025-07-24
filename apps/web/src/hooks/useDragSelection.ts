// apps/web/src/hooks/useDragSelection.ts
// Hook for implementing drag-to-select functionality with a visual selection box.
// Tracks mouse drag events and calculates which blocks are within the selection area.

import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditorState, useEditorDispatch } from '../contexts/EditorContext'

interface SelectionBox {
  startX: number
  startY: number
  endX: number
  endY: number
}

interface UseDragSelectionOptions {
  containerRef: React.RefObject<HTMLElement>
  enabled?: boolean
}

export function useDragSelection({ containerRef, enabled = true }: UseDragSelectionOptions) {
  const { blocks } = useEditorState()
  const dispatch = useEditorDispatch()

  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)
  const isPotentialDragRef = useRef(false)
  const hasMovedEnoughRef = useRef(false)
  const MIN_DRAG_DISTANCE = 5 // Minimum pixels to move before starting selection

  // Calculate the selection box rectangle for rendering
  const getSelectionRect = useCallback(() => {
    if (!selectionBox) return null

    const { startX, startY, endX, endY } = selectionBox
    return {
      left: Math.min(startX, endX),
      top: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY),
    }
  }, [selectionBox])

  // Check if a block element intersects with the selection box
  const isBlockInSelection = useCallback(
    (blockElement: HTMLElement, box: SelectionBox) => {
      const blockRect = blockElement.getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect()

      if (!containerRect) return false

      // Convert selection box coordinates to absolute positions
      const selectionLeft = Math.min(box.startX, box.endX) + containerRect.left
      const selectionTop = Math.min(box.startY, box.endY) + containerRect.top
      const selectionRight = Math.max(box.startX, box.endX) + containerRect.left
      const selectionBottom = Math.max(box.startY, box.endY) + containerRect.top

      // Check intersection
      return !(
        blockRect.right < selectionLeft ||
        blockRect.left > selectionRight ||
        blockRect.bottom < selectionTop ||
        blockRect.top > selectionBottom
      )
    },
    [containerRef]
  )

  // Update selected blocks based on selection box
  const updateSelectedBlocks = useCallback(
    (box: SelectionBox) => {
      if (!containerRef.current) return

      // Find all block elements
      const blockElements = containerRef.current.querySelectorAll('[data-block-id]')
      const selectedBlockIds: string[] = []

      blockElements.forEach((element) => {
        const blockId = element.getAttribute('data-block-id')
        if (blockId && isBlockInSelection(element as HTMLElement, box)) {
          selectedBlockIds.push(blockId)
        }
      })

      // Update selection in editor state
      dispatch({ type: 'SET_SELECTED_BLOCKS', blockIds: selectedBlockIds })
    },
    [containerRef, isBlockInSelection, dispatch]
  )

  // Handle mouse down - prepare for potential selection
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!enabled || !containerRef.current) return

      const target = e.target as HTMLElement

      // Don't start selection if clicking on certain elements
      const isOnDragHandle = target.closest('.block-drag-handle') !== null
      const isOnFormattingToolbar = target.closest('.formatting-toolbar') !== null
      const isOutsideEditor = !containerRef.current.contains(target)

      if (isOnDragHandle || isOnFormattingToolbar || isOutsideEditor) return

      // Get container-relative coordinates
      const containerRect = containerRef.current.getBoundingClientRect()
      const startX = e.clientX - containerRect.left
      const startY = e.clientY - containerRect.top

      // Store potential start point but don't start selection yet
      startPointRef.current = { x: startX, y: startY }
      isPotentialDragRef.current = true
      hasMovedEnoughRef.current = false
    },
    [enabled, containerRef]
  )

  // Handle mouse move - start selection if moved enough
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const currentX = e.clientX - containerRect.left
      const currentY = e.clientY - containerRect.top

      // Check if we should start selection
      if (isPotentialDragRef.current && startPointRef.current && !hasMovedEnoughRef.current) {
        const distance = Math.sqrt(Math.pow(currentX - startPointRef.current.x, 2) + Math.pow(currentY - startPointRef.current.y, 2))

        if (distance >= MIN_DRAG_DISTANCE) {
          hasMovedEnoughRef.current = true
          setIsSelecting(true)

          // Clear any existing text selection
          window.getSelection()?.removeAllRanges()
        }
      }

      // Update selection box if selecting
      if (isSelecting && startPointRef.current) {
        const newBox = {
          startX: startPointRef.current.x,
          startY: startPointRef.current.y,
          endX: currentX,
          endY: currentY,
        }

        setSelectionBox(newBox)
        updateSelectedBlocks(newBox)
      }
    },
    [isSelecting, containerRef, updateSelectedBlocks]
  )

  // Handle mouse up - finish selection or cancel potential drag
  const handleMouseUp = useCallback(() => {
    isPotentialDragRef.current = false
    hasMovedEnoughRef.current = false

    if (isSelecting) {
      setIsSelecting(false)
      setSelectionBox(null)
    }

    startPointRef.current = null
  }, [isSelecting])

  // Set up event listeners
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current

    // Add event listeners - use capture phase for mousedown to intercept before other handlers
    container.addEventListener('mousedown', handleMouseDown, true)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      // Clean up event listeners - use same capture flag as when adding
      container.removeEventListener('mousedown', handleMouseDown, true)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [enabled, containerRef, handleMouseDown, handleMouseMove, handleMouseUp])

  return {
    isSelecting,
    selectionRect: getSelectionRect(),
  }
}
