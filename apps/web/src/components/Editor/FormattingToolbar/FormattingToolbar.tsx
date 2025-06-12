import React, { useEffect, useRef, useState } from 'react'
import { useEditorState, useEditorDispatch, FormatType } from '../../../contexts/EditorContext'
import { isRangeFormatted, toggleFormat } from '../../../utils/textFormatting'
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
  const dispatch = useEditorDispatch()
  const internalToolbarRef = useRef<HTMLDivElement>(null)
  const toolbarRef = externalToolbarRef || internalToolbarRef
  const [position, setPosition] = useState<ToolbarPosition | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasValidSelection, setHasValidSelection] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Set<FormatType>>(new Set())
  const [isFormatting, setIsFormatting] = useState(false)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const savedPositionRef = useRef<ToolbarPosition | null>(null)

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

    // Track mouse state
    const handleMouseDown = () => {
      setIsMouseDown(true)
    }

    const handleMouseUp = () => {
      setIsMouseDown(false)
      // Check selection after mouse release
      setTimeout(checkSelection, 0)
    }

    // Listen to selection changes
    const handleSelectionChange = () => {
      // Only check selection if mouse is not down (not actively selecting)
      if (!isMouseDown) {
        checkSelection()
      }
    }

    // Listen to mouse and selection events
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('selectionchange', handleSelectionChange)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [isMouseDown])

  // Listen for formatting events from keyboard shortcuts
  useEffect(() => {
    const handleFormattingStart = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.isFormatting) {
        setIsFormatting(true)
        // Save current position to prevent jumping
        if (position) {
          savedPositionRef.current = position
        }
      }
    }

    const handleFormattingEnd = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.isFormatting === false) {
        setIsFormatting(false)
        savedPositionRef.current = null

        // Force immediate update of active formats after formatting ends
        // This ensures the toolbar reflects the correct state immediately
        setTimeout(() => {
          const blockSelection = getBlockRelativeSelection()
          if (blockSelection) {
            const block = state.blocks.find((b) => b.id === blockSelection.blockId)
            if (block && block.formatting) {
              const newActiveFormats = new Set<FormatType>()
              const formatTypes: FormatType[] = ['bold', 'italic', 'underline', 'code', 'strikethrough', 'link']

              formatTypes.forEach((formatType) => {
                if (isRangeFormatted(block.formatting || [], blockSelection.startOffset, blockSelection.endOffset, formatType)) {
                  newActiveFormats.add(formatType)
                }
              })

              setActiveFormats(newActiveFormats)
            }
          }
        }, 0)
      }
    }

    window.addEventListener('formatting-start', handleFormattingStart)
    window.addEventListener('formatting-end', handleFormattingEnd)

    return () => {
      window.removeEventListener('formatting-start', handleFormattingStart)
      window.removeEventListener('formatting-end', handleFormattingEnd)
    }
  }, [position, state.blocks])

  // Handle toolbar visibility based on selection
  useEffect(() => {
    // Only show toolbar if mouse is not down (not actively selecting)
    const shouldShow = !isMouseDown && (hasValidSelection || (state.crossBlockSelection && !state.crossBlockSelection.isCollapsed) || isFormatting)

    if (shouldShow) {
      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      setIsVisible(true)
    } else if (!isFormatting) {
      // Add a small delay before hiding to prevent flashing (but not if we're formatting)
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 100)
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [state.crossBlockSelection, hasValidSelection, isMouseDown, isFormatting])

  // Calculate toolbar position
  useEffect(() => {
    if (!isVisible) return

    // Use saved position while formatting to prevent flicker
    if (isFormatting && savedPositionRef.current) {
      setPosition(savedPositionRef.current)
      return
    }

    // Don't recalculate position while formatting to prevent flicker
    if (isFormatting && position) return

    // Use a small delay to ensure the toolbar is rendered before calculating position
    const timeoutId = setTimeout(() => {
      if (!containerRef.current || !toolbarRef.current) {
        return
      }

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        // Keep existing position if we're formatting
        if (!isFormatting) {
          setPosition(null)
        }
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
        // Keep existing position if we're formatting
        if (!isFormatting) {
          setPosition(null)
        }
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [isVisible, containerRef, state.crossBlockSelection, hasValidSelection, isFormatting, position, toolbarRef])

  // Get selection range relative to block
  const getBlockRelativeSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)

    // Find the block element containing the selection
    let startNode = range.startContainer
    let endNode = range.endContainer

    // If text node, get parent element
    if (startNode.nodeType === Node.TEXT_NODE) {
      startNode = startNode.parentElement!
    }
    if (endNode.nodeType === Node.TEXT_NODE) {
      endNode = endNode.parentElement!
    }

    // Find block elements
    const startBlock = (startNode as HTMLElement).closest('[data-block-id]')
    const endBlock = (endNode as HTMLElement).closest('[data-block-id]')

    if (!startBlock || !endBlock) return null

    const startBlockId = startBlock.getAttribute('data-block-id')
    const endBlockId = endBlock.getAttribute('data-block-id')

    if (!startBlockId || !endBlockId) return null

    // For single block selection
    if (startBlockId === endBlockId) {
      // Calculate offsets within the block's text content
      const blockElement = startBlock

      // Find the block content element
      const blockContentElement = blockElement.querySelector('.block__content') || blockElement

      // Get the actual text offset by traversing the DOM
      const getTextOffset = (container: Node, offset: number): number => {
        let textOffset = 0
        const walker = document.createTreeWalker(blockContentElement, NodeFilter.SHOW_TEXT, null)

        let node: Node | null
        while ((node = walker.nextNode())) {
          if (node === container) {
            return textOffset + offset
          }
          textOffset += node.textContent?.length || 0
        }
        return textOffset
      }

      const startOffset = getTextOffset(range.startContainer, range.startOffset)
      const endOffset = getTextOffset(range.endContainer, range.endOffset)

      return {
        blockId: startBlockId,
        startOffset,
        endOffset,
      }
    }

    // For cross-block selection, use the crossBlockSelection state
    return null
  }

  // Update active formats based on selection
  useEffect(() => {
    const updateActiveFormats = () => {
      // Don't update active formats while formatting is in progress
      // This prevents the flash of inactive buttons during keyboard shortcuts
      if (isFormatting) return

      if (!hasValidSelection && !state.crossBlockSelection) {
        setActiveFormats(new Set())
        return
      }

      const newActiveFormats = new Set<FormatType>()

      // Check single block selection
      const blockSelection = getBlockRelativeSelection()
      if (blockSelection) {
        const block = state.blocks.find((b) => b.id === blockSelection.blockId)
        if (block && block.formatting) {
          const formatTypes: FormatType[] = ['bold', 'italic', 'underline', 'code', 'strikethrough', 'link']

          formatTypes.forEach((formatType) => {
            if (isRangeFormatted(block.formatting || [], blockSelection.startOffset, blockSelection.endOffset, formatType)) {
              newActiveFormats.add(formatType)
            }
          })
        }
      }

      setActiveFormats(newActiveFormats)
    }

    updateActiveFormats()

    // Also update when selection changes
    const intervalId = setInterval(updateActiveFormats, 100)
    return () => clearInterval(intervalId)
  }, [hasValidSelection, state.crossBlockSelection, state.blocks, isFormatting])

  // Format selection
  const handleFormat = (formatType: FormatType) => {
    const blockSelection = getBlockRelativeSelection()

    if (blockSelection) {
      const block = state.blocks.find((b) => b.id === blockSelection.blockId)
      if (!block) return

      // Set formatting flag to prevent toolbar from hiding
      setIsFormatting(true)

      // Save current position to prevent jumping
      if (position) {
        savedPositionRef.current = position
      }

      // Store the current selection range before any changes
      const selection = window.getSelection()
      const selectedText = selection?.toString() || ''

      // Store selection details
      const { blockId, startOffset, endOffset } = blockSelection

      // Toggle the format
      const currentFormatting = block.formatting || []
      const newFormatting = toggleFormat(currentFormatting, startOffset, endOffset, formatType)

      // Update block formatting
      dispatch({
        type: 'UPDATE_BLOCK_FORMATTING',
        blockId: blockId,
        formatting: newFormatting,
      })

      // Restore selection after React re-renders
      const tryRestoreSelection = () => {
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`)
        if (blockElement) {
          const contentElement = blockElement.querySelector('.block__content') || blockElement
          const selection = window.getSelection()

          if (selection && contentElement) {
            const textContent = contentElement.textContent || ''

            // Find the selected text in the new content
            const searchStart = Math.max(0, startOffset - 10) // Look a bit before the expected position
            const searchEnd = Math.min(textContent.length, endOffset + 10) // Look a bit after
            const searchText = textContent.substring(searchStart, searchEnd)
            const indexInSearch = searchText.indexOf(selectedText)

            if (indexInSearch !== -1) {
              // Found the text, calculate the actual positions
              const actualStartOffset = searchStart + indexInSearch
              const actualEndOffset = actualStartOffset + selectedText.length

              // Now create the selection at the correct position
              const range = document.createRange()
              const walker = document.createTreeWalker(contentElement, NodeFilter.SHOW_TEXT, null)

              let currentOffset = 0
              let startNode = null
              let startNodeOffset = 0
              let endNode = null
              let endNodeOffset = 0
              let node

              while ((node = walker.nextNode())) {
                const nodeLength = node.textContent?.length || 0
                const nodeEndOffset = currentOffset + nodeLength

                if (!startNode && nodeEndOffset > actualStartOffset) {
                  startNode = node
                  startNodeOffset = actualStartOffset - currentOffset
                }

                if (!endNode && nodeEndOffset >= actualEndOffset) {
                  endNode = node
                  endNodeOffset = actualEndOffset - currentOffset
                  break
                }

                currentOffset = nodeEndOffset
              }

              if (startNode && endNode) {
                try {
                  range.setStart(startNode, startNodeOffset)
                  range.setEnd(endNode, endNodeOffset)
                  selection.removeAllRanges()
                  selection.addRange(range)
                  setHasValidSelection(true)
                } catch (e) {
                  console.error('Failed to restore selection:', e)
                }
              }
            } else {
              // Fallback: use the original offsets
              const range = document.createRange()
              const walker = document.createTreeWalker(contentElement, NodeFilter.SHOW_TEXT, null)

              let currentOffset = 0
              let startNode = null
              let startNodeOffset = 0
              let endNode = null
              let endNodeOffset = 0
              let node

              while ((node = walker.nextNode())) {
                const nodeLength = node.textContent?.length || 0
                const nodeEndOffset = currentOffset + nodeLength

                if (!startNode && nodeEndOffset > startOffset) {
                  startNode = node
                  startNodeOffset = startOffset - currentOffset
                }

                if (!endNode && nodeEndOffset >= endOffset) {
                  endNode = node
                  endNodeOffset = endOffset - currentOffset
                  break
                }

                currentOffset = nodeEndOffset
              }

              if (startNode && endNode) {
                try {
                  range.setStart(startNode, startNodeOffset)
                  range.setEnd(endNode, endNodeOffset)
                  selection.removeAllRanges()
                  selection.addRange(range)
                  setHasValidSelection(true)
                } catch (e) {
                  console.error('Failed to restore selection:', e)
                }
              }
            }
          }
        }

        // Clear formatting flag and saved position
        setTimeout(() => {
          setIsFormatting(false)
          savedPositionRef.current = null
        }, 100)
      }

      // Try to restore selection after a short delay
      setTimeout(tryRestoreSelection, 50)
    } else if (state.crossBlockSelection) {
      // TODO: Implement cross-block formatting
      console.log('Cross-block formatting not yet implemented')
    }
  }

  // Handle link creation
  const handleLink = () => {
    const blockSelection = getBlockRelativeSelection()
    if (!blockSelection) return

    const block = state.blocks.find((b) => b.id === blockSelection.blockId)
    if (!block) return

    // Set formatting flag to prevent toolbar from hiding
    setIsFormatting(true)

    // Save current position to prevent jumping
    if (position) {
      savedPositionRef.current = position
    }

    // Store selection details
    const { blockId, startOffset, endOffset } = blockSelection

    // Check if already has link formatting
    const currentFormatting = block.formatting || []
    const hasLink = isRangeFormatted(currentFormatting, startOffset, endOffset, 'link')

    // Store the selected text before any changes
    const selection = window.getSelection()
    const selectedText = selection?.toString() || ''

    const restoreSelection = () => {
      setTimeout(() => {
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`)
        if (blockElement) {
          const contentElement = blockElement.querySelector('.block__content') || blockElement
          const selection = window.getSelection()

          if (selection && contentElement && selectedText) {
            const textContent = contentElement.textContent || ''

            // Find the selected text in the new content
            const searchStart = Math.max(0, startOffset - 10)
            const searchEnd = Math.min(textContent.length, endOffset + 10)
            const searchText = textContent.substring(searchStart, searchEnd)
            const indexInSearch = searchText.indexOf(selectedText)

            if (indexInSearch !== -1) {
              // Found the text, calculate the actual positions
              const actualStartOffset = searchStart + indexInSearch
              const actualEndOffset = actualStartOffset + selectedText.length

              // Now create the selection at the correct position
              const range = document.createRange()
              const walker = document.createTreeWalker(contentElement, NodeFilter.SHOW_TEXT, null)

              let currentOffset = 0
              let startNode = null
              let startNodeOffset = 0
              let endNode = null
              let endNodeOffset = 0
              let node

              while ((node = walker.nextNode())) {
                const nodeLength = node.textContent?.length || 0
                const nodeEndOffset = currentOffset + nodeLength

                if (!startNode && nodeEndOffset > actualStartOffset) {
                  startNode = node
                  startNodeOffset = actualStartOffset - currentOffset
                }

                if (!endNode && nodeEndOffset >= actualEndOffset) {
                  endNode = node
                  endNodeOffset = actualEndOffset - currentOffset
                  break
                }

                currentOffset = nodeEndOffset
              }

              if (startNode && endNode) {
                try {
                  range.setStart(startNode, startNodeOffset)
                  range.setEnd(endNode, endNodeOffset)
                  selection.removeAllRanges()
                  selection.addRange(range)
                  setHasValidSelection(true)
                } catch (e) {
                  console.error('Failed to restore selection:', e)
                }
              }
            } else {
              // Fallback: use the original offsets
              const range = document.createRange()
              const walker = document.createTreeWalker(contentElement, NodeFilter.SHOW_TEXT, null)

              let currentOffset = 0
              let startNode = null
              let startNodeOffset = 0
              let endNode = null
              let endNodeOffset = 0
              let node

              while ((node = walker.nextNode())) {
                const nodeLength = node.textContent?.length || 0
                const nodeEndOffset = currentOffset + nodeLength

                if (!startNode && nodeEndOffset > startOffset) {
                  startNode = node
                  startNodeOffset = startOffset - currentOffset
                }

                if (!endNode && nodeEndOffset >= endOffset) {
                  endNode = node
                  endNodeOffset = endOffset - currentOffset
                  break
                }

                currentOffset = nodeEndOffset
              }

              if (startNode && endNode) {
                try {
                  range.setStart(startNode, startNodeOffset)
                  range.setEnd(endNode, endNodeOffset)
                  selection.removeAllRanges()
                  selection.addRange(range)
                  setHasValidSelection(true)
                } catch (e) {
                  console.error('Failed to restore selection:', e)
                }
              }
            }
          }
        }

        // Clear formatting flag and saved position
        setTimeout(() => {
          setIsFormatting(false)
          savedPositionRef.current = null
        }, 100)
      }, 50)
    }

    if (hasLink) {
      // Remove link
      const newFormatting = toggleFormat(currentFormatting, startOffset, endOffset, 'link')

      dispatch({
        type: 'UPDATE_BLOCK_FORMATTING',
        blockId: blockId,
        formatting: newFormatting,
      })

      restoreSelection()
    } else {
      // Add link
      const url = prompt('Enter URL:')
      if (url) {
        const newFormatting = toggleFormat(currentFormatting, startOffset, endOffset, 'link', url)

        dispatch({
          type: 'UPDATE_BLOCK_FORMATTING',
          blockId: blockId,
          formatting: newFormatting,
        })

        restoreSelection()
      } else {
        // User cancelled, just clear formatting flag and saved position
        setTimeout(() => {
          setIsFormatting(false)
          savedPositionRef.current = null
        }, 100)
      }
    }
  }

  if (!isVisible) return null

  return (
    <div
      ref={toolbarRef}
      className={`formatting-toolbar ${isFormatting ? 'formatting-toolbar--formatting' : ''}`}
      role="toolbar"
      aria-label="Text formatting"
      style={{
        top: position ? `${position.top}px` : savedPositionRef.current ? `${savedPositionRef.current.top}px` : undefined,
        left: position ? `${position.left}px` : savedPositionRef.current ? `${savedPositionRef.current.left}px` : undefined,
        opacity: position || isFormatting ? 1 : 0,
        pointerEvents: position || isFormatting ? 'auto' : 'none',
        visibility: position || savedPositionRef.current ? 'visible' : 'hidden',
      }}
      onMouseDown={(e) => {
        // Prevent toolbar clicks from clearing selection
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <button
        className={`formatting-toolbar__button ${activeFormats.has('bold') ? 'formatting-toolbar__button--active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleFormat('bold')
        }}
        title="Bold (Ctrl/Cmd+B)"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M4 2h5.5a3.5 3.5 0 0 1 2.45 6A3.5 3.5 0 0 1 9.5 14H4V2zm1.5 1.5v4h4a2 2 0 0 0 0-4h-4zm0 5.5v4H9a2 2 0 0 0 0-4H5.5z" />
        </svg>
      </button>
      <button
        className={`formatting-toolbar__button ${activeFormats.has('italic') ? 'formatting-toolbar__button--active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleFormat('italic')
        }}
        title="Italic (Ctrl/Cmd+I)"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M7 2h6v2h-2.2L8.2 12H10v2H4v-2h2.2L8.8 4H7V2z" />
        </svg>
      </button>
      <button
        className={`formatting-toolbar__button ${activeFormats.has('underline') ? 'formatting-toolbar__button--active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleFormat('underline')
        }}
        title="Underline (Ctrl/Cmd+U)"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M4 2v6a4 4 0 0 0 8 0V2h-2v6a2 2 0 1 1-4 0V2H4zm-1 12h10v1H3v-1z" />
        </svg>
      </button>
      <div className="formatting-toolbar__divider" />
      <button
        className={`formatting-toolbar__button ${activeFormats.has('link') ? 'formatting-toolbar__button--active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleLink()
        }}
        title="Link (Ctrl/Cmd+K)"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z" />
        </svg>
      </button>
    </div>
  )
}
