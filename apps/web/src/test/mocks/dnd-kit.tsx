// Mock for @dnd-kit libraries to enable drag and drop testing
import React from 'react'

// Global drag state to simulate real drag behavior
let dragState = {
  activeId: null as string | null,
  overId: null as string | null,
  isDragging: false,
  draggedElement: null as HTMLElement | null,
}

// Helper to reset drag state between tests
export const resetDragState = () => {
  dragState = {
    activeId: null,
    overId: null,
    isDragging: false,
    draggedElement: null,
  }
}

// Helper to get current drag state
export const getDragState = () => ({ ...dragState })

// Mock @dnd-kit/core
jest.mock('@dnd-kit/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')

  return {
    DndContext: ({ children, onDragStart, onDragEnd }: any) => {
      // Store callbacks globally for testing
      if (onDragStart || onDragEnd) {
        ;(global as any).__dndCallbacks = { onDragStart, onDragEnd }
      }
      return React.createElement('div', { 'data-testid': 'dnd-context' }, children)
    },
    DragOverlay: ({ children }: any) => React.createElement('div', { 'data-testid': 'drag-overlay' }, children),
    useSensor: jest.fn(),
    useSensors: jest.fn(() => []),
    PointerSensor: jest.fn(),
    KeyboardSensor: jest.fn(),
    closestCenter: jest.fn(),
  }
})

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')

  return {
    arrayMove: jest.fn(<T,>(arr: T[], from: number, to: number) => {
      const result = [...arr]
      const [removed] = result.splice(from, 1)
      result.splice(to, 0, removed)
      return result
    }),
    SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    sortableKeyboardCoordinates: jest.fn(),
    verticalListSortingStrategy: jest.fn(),
    useSortable: jest.fn((options: { id: string }) => {
      const isDragging = dragState.activeId === options.id
      const isOver = dragState.overId === options.id

      // Calculate transform based on drag state
      let transform = null
      if (isDragging && dragState.draggedElement) {
        // Simulate drag transform
        transform = {
          x: 0,
          y: isDragging ? 20 : 0, // Small offset when dragging
          scaleX: 1,
          scaleY: 1,
        }
      }

      return {
        attributes: {
          role: 'button',
          tabIndex: 0,
          'aria-describedby': `DndDescribedBy-${options.id}`,
          'aria-disabled': 'false',
          'aria-roledescription': 'sortable',
          'aria-pressed': isDragging ? 'true' : 'false',
        },
        listeners: {
          onMouseDown: jest.fn((e: MouseEvent) => {
            // Simulate drag start
            dragState.activeId = options.id
            dragState.isDragging = true
            dragState.draggedElement = e.currentTarget as HTMLElement
          }),
          onTouchStart: jest.fn((e: TouchEvent) => {
            // Simulate touch drag start
            dragState.activeId = options.id
            dragState.isDragging = true
            dragState.draggedElement = e.currentTarget as HTMLElement
          }),
          onKeyDown: jest.fn((e: KeyboardEvent) => {
            // Space or Enter to start keyboard drag
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              dragState.activeId = options.id
              dragState.isDragging = true
              dragState.draggedElement = e.currentTarget as HTMLElement
            }
          }),
        },
        setNodeRef: jest.fn((node: HTMLElement | null) => {
          if (node && isDragging) {
            dragState.draggedElement = node
          }
        }),
        transform,
        transition: isDragging ? 'transform 250ms ease' : null,
        isDragging,
        isOver,
        isSorting: isDragging,
        overIndex: isOver ? 0 : -1,
        index: 0,
        active: isDragging ? { id: options.id } : null,
        over: isOver ? { id: dragState.overId } : null,
      }
    }),
  }
})

// Mock @dnd-kit/utilities
jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn((transform) => {
        if (!transform) return ''
        return `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
      }),
    },
    Transition: {
      toString: jest.fn((transition) => transition || ''),
    },
  },
}))

// Export test helpers
export const simulateDragStart = (elementId: string) => {
  dragState.activeId = elementId
  dragState.isDragging = true

  const callbacks = (global as any).__dndCallbacks
  if (callbacks?.onDragStart) {
    callbacks.onDragStart({
      active: { id: elementId },
    })
  }
}

export const simulateDragOver = (elementId: string) => {
  dragState.overId = elementId
}

export const simulateDragEnd = (activeId: string, overId: string | null) => {
  const callbacks = (global as any).__dndCallbacks
  if (callbacks?.onDragEnd) {
    callbacks.onDragEnd({
      active: { id: activeId },
      over: overId ? { id: overId } : null,
    })
  }

  // Reset drag state
  resetDragState()
}

export const simulateDragCancel = (elementId: string) => {
  simulateDragEnd(elementId, null)
}

// Helper to simulate keyboard-initiated drag
export const simulateKeyboardDrag = (elementId: string, targetId: string) => {
  simulateDragStart(elementId)
  simulateDragOver(targetId)
  simulateDragEnd(elementId, targetId)
}
