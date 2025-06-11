import React, { useEffect, useRef, useState } from 'react'
import { useEditorState } from '../../../contexts/EditorContext'
import './FormattingToolbar.scss'

interface FormattingToolbarProps {
  containerRef: React.RefObject<HTMLDivElement>
  toolbarRef?: React.RefObject<HTMLDivElement>
}

interface ToolbarPosition {
  top: number
  left: number
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ containerRef, toolbarRef: externalToolbarRef }) => {
  const state = useEditorState()
  const internalToolbarRef = useRef<HTMLDivElement>(null)
  const toolbarRef = externalToolbarRef || internalToolbarRef
  const [position, setPosition] = useState<ToolbarPosition | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasValidSelection, setHasValidSelection] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check browser selection directly for immediate feedback
  useEffect(() => {
    const checkSelection = () => {
      const browserSelection = window.getSelection()
      if (!browserSelection || browserSelection.rangeCount === 0) {
        setHasValidSelection(false)
        return
      }

      const range = browserSelection.getRangeAt(0)
      const hasSelection = !range.collapsed && browserSelection.toString().trim().length > 0
      setHasValidSelection(hasSelection)
    }

    // Check immediately
    checkSelection()

    // Listen to selection changes
    const handleSelectionChange = () => {
      checkSelection()
    }

    // Listen to both selectionchange and mouseup events
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mouseup', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleSelectionChange)
    }
  }, [])

  // Handle toolbar visibility based on selection
  useEffect(() => {
    // Show toolbar if we have a valid browser selection OR crossBlockSelection
    const shouldShow = hasValidSelection || (state.crossBlockSelection && !state.crossBlockSelection.isCollapsed)

    if (shouldShow) {
      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      setIsVisible(true)
    } else {
      // Add a small delay before hiding to prevent flashing
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 100)
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [state.crossBlockSelection, hasValidSelection])

  // Calculate toolbar position
  useEffect(() => {
    if (!isVisible) return

    // Use a small delay to ensure the toolbar is rendered before calculating position
    const timeoutId = setTimeout(() => {
      if (!containerRef.current || !toolbarRef.current) {
        return
      }

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        setPosition(null)
        return
      }

      try {
        const range = selection.getRangeAt(0)
        const rangeRect = range.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        const toolbarRect = toolbarRef.current.getBoundingClientRect()

        // Position toolbar above the selection, centered
        const top = rangeRect.top - containerRect.top - toolbarRect.height - 8 // 8px gap
        const left = rangeRect.left - containerRect.left + rangeRect.width / 2 - toolbarRect.width / 2

        // Ensure toolbar stays within container bounds
        const constrainedLeft = Math.max(8, Math.min(left, containerRect.width - toolbarRect.width - 8))
        const constrainedTop = top < 8 ? rangeRect.bottom - containerRect.top + 8 : top

        setPosition({
          top: constrainedTop,
          left: constrainedLeft,
        })
      } catch (error) {
        console.error('Error calculating toolbar position:', error)
        setPosition(null)
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [isVisible, containerRef, state.crossBlockSelection, hasValidSelection])

  // Format selection
  const handleFormat = (command: string, value?: string) => {
    // TODO: Implement rich text formatting
    // Current architecture stores plain text only
    // This will be implemented when we add rich text support
    console.log(`Format command: ${command}`, value)

    // For now, show a tooltip that formatting is coming soon
    const message = 'Formatting features coming soon!'
    const tooltip = document.createElement('div')
    tooltip.className = 'formatting-toolbar__tooltip'
    tooltip.textContent = message
    tooltip.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--color-surface-elevated-1);
      color: var(--color-text-primary);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1001;
    `

    if (toolbarRef.current) {
      toolbarRef.current.appendChild(tooltip)
      setTimeout(() => tooltip.remove(), 2000)
    }
  }

  // Handle link creation
  const handleLink = () => {
    handleFormat('createLink')
  }

  if (!isVisible) return null

  return (
    <div
      ref={toolbarRef}
      className="formatting-toolbar"
      role="toolbar"
      aria-label="Text formatting"
      style={{
        top: position ? `${position.top}px` : '0',
        left: position ? `${position.left}px` : '0',
        opacity: position ? 1 : 0,
        pointerEvents: position ? 'auto' : 'none',
      }}
      onMouseDown={(e) => {
        // Prevent toolbar clicks from clearing selection
        e.preventDefault()
      }}
    >
      <button className="formatting-toolbar__button" onClick={() => handleFormat('bold')} title="Bold (Ctrl/Cmd+B)" type="button">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M4 2h5.5a3.5 3.5 0 0 1 2.45 6A3.5 3.5 0 0 1 9.5 14H4V2zm1.5 1.5v4h4a2 2 0 0 0 0-4h-4zm0 5.5v4H9a2 2 0 0 0 0-4H5.5z" />
        </svg>
      </button>
      <button className="formatting-toolbar__button" onClick={() => handleFormat('italic')} title="Italic (Ctrl/Cmd+I)" type="button">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M7 2h6v2h-2.2L8.2 12H10v2H4v-2h2.2L8.8 4H7V2z" />
        </svg>
      </button>
      <button className="formatting-toolbar__button" onClick={() => handleFormat('underline')} title="Underline (Ctrl/Cmd+U)" type="button">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M4 2v6a4 4 0 0 0 8 0V2h-2v6a2 2 0 1 1-4 0V2H4zm-1 12h10v1H3v-1z" />
        </svg>
      </button>
      <div className="formatting-toolbar__divider" />
      <button className="formatting-toolbar__button" onClick={handleLink} title="Link (Ctrl/Cmd+K)" type="button">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z" />
        </svg>
      </button>
    </div>
  )
}
