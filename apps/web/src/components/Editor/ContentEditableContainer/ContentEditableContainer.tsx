// apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.tsx
// Single contentEditable container that enables cross-block text selection.
// Handles all text input, keyboard shortcuts, and editing operations.
// Synchronizes changes with the editor state while maintaining cursor position.

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useEditorState, useEditorDispatch } from '../../../contexts/EditorContext'
import type { EditorBlock, BlockType } from '../../../contexts/EditorContext'
import { generateId } from '@kairos/utils'
import './ContentEditableContainer.scss'

interface ContentEditableContainerProps {
  children: React.ReactNode
  onBlockClick?: (blockId: string) => void
}

export function ContentEditableContainer({ children, onBlockClick }: ContentEditableContainerProps) {
  const editorState = useEditorState()
  const dispatch = useEditorDispatch()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  const lastKnownSelection = useRef<{ blockId: string; offset: number } | null>(null)

  // Handle input events (typing)
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      if (isComposing) return

      const container = e.currentTarget

      // Get all block elements
      const blockElements = Array.from(container.querySelectorAll('[data-block-id]')) as HTMLElement[]

      // Update each block's content
      blockElements.forEach((blockEl) => {
        const blockId = blockEl.getAttribute('data-block-id')
        if (!blockId) return

        const content = blockEl.textContent || ''
        const currentBlock = editorState.blocks.find((b) => b.id === blockId)

        // Only update if content changed
        if (currentBlock && currentBlock.content !== content) {
          dispatch({ type: 'UPDATE_BLOCK', blockId, content })
        }
      })
    },
    [dispatch, editorState.blocks, isComposing]
  )

  // Handle key down events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Handle Enter key
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        const container = range.startContainer

        // Find the current block
        let blockElement = container as Node
        while (blockElement && blockElement !== containerRef.current) {
          if (blockElement.nodeType === Node.ELEMENT_NODE) {
            const el = blockElement as HTMLElement
            const blockId = el.getAttribute('data-block-id')
            if (blockId) {
              const block = editorState.blocks.find((b) => b.id === blockId)
              if (block) {
                // Create new block
                const newBlock: EditorBlock = {
                  id: generateId(),
                  type: 'paragraph',
                  content: '',
                  metadata: {},
                }

                // Get the offset in the block
                const blockContent = el.textContent || ''
                const offset = range.startOffset

                // Split content at cursor position
                const beforeCursor = blockContent.substring(0, offset)
                const afterCursor = blockContent.substring(offset)

                // Update current block with content before cursor
                dispatch({ type: 'UPDATE_BLOCK', blockId: block.id, content: beforeCursor })

                // Add new block with content after cursor
                newBlock.content = afterCursor
                dispatch({ type: 'ADD_BLOCK', block: newBlock, afterBlockId: block.id })

                // Store where we want to put the cursor
                lastKnownSelection.current = { blockId: newBlock.id, offset: 0 }

                break
              }
            }
          }
          blockElement = blockElement.parentNode as Node
        }
      }

      // Handle Backspace at beginning of block
      if (e.key === 'Backspace') {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)

        // Check if we're at the beginning of a block
        if (range.startOffset === 0 && range.collapsed) {
          const container = range.startContainer

          // Find the current block
          let blockElement = container as Node
          while (blockElement && blockElement !== containerRef.current) {
            if (blockElement.nodeType === Node.ELEMENT_NODE) {
              const el = blockElement as HTMLElement
              const blockId = el.getAttribute('data-block-id')
              if (blockId) {
                const blockIndex = editorState.blocks.findIndex((b) => b.id === blockId)

                // If this is not the first block, merge with previous
                if (blockIndex > 0) {
                  e.preventDefault()
                  const currentBlock = editorState.blocks[blockIndex]
                  const previousBlock = editorState.blocks[blockIndex - 1]

                  // Merge content
                  const mergedContent = previousBlock.content + currentBlock.content
                  dispatch({ type: 'UPDATE_BLOCK', blockId: previousBlock.id, content: mergedContent })
                  dispatch({ type: 'DELETE_BLOCK', blockId: currentBlock.id })

                  // Store cursor position at merge point
                  lastKnownSelection.current = {
                    blockId: previousBlock.id,
                    offset: previousBlock.content.length,
                  }
                }
                break
              }
            }
            blockElement = blockElement.parentNode as Node
          }
        }
      }
    },
    [dispatch, editorState.blocks]
  )

  // Handle click events to track which block was clicked
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement

      // Find the clicked block
      let blockElement = target
      while (blockElement && blockElement !== containerRef.current) {
        const blockId = blockElement.getAttribute('data-block-id')
        if (blockId) {
          onBlockClick?.(blockId)
          dispatch({ type: 'SET_FOCUSED_BLOCK', blockId })
          break
        }
        blockElement = blockElement.parentElement as HTMLElement
      }
    },
    [dispatch, onBlockClick]
  )

  // Synchronize block content with DOM after updates
  useEffect(() => {
    if (!containerRef.current) return

    // Get all block elements
    const blockElements = Array.from(containerRef.current.querySelectorAll('[data-block-id]')) as HTMLElement[]

    blockElements.forEach((blockEl) => {
      const blockId = blockEl.getAttribute('data-block-id')
      if (!blockId) return

      const block = editorState.blocks.find((b) => b.id === blockId)
      if (!block) return

      // Only update if content is different
      const currentContent = blockEl.textContent || ''
      if (currentContent !== block.content) {
        blockEl.textContent = block.content
      }
    })

    // Restore cursor position if needed
    if (lastKnownSelection.current) {
      const { blockId, offset } = lastKnownSelection.current
      const blockEl = containerRef.current.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement

      if (blockEl) {
        const selection = window.getSelection()
        if (selection) {
          const range = document.createRange()
          const textNode = blockEl.firstChild || blockEl

          try {
            range.setStart(textNode, Math.min(offset, textNode.textContent?.length || 0))
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
          } catch (e) {
            console.error('Failed to restore cursor position:', e)
          }
        }
      }

      lastKnownSelection.current = null
    }
  }, [editorState.blocks])

  // Handle composition events for IME input
  const handleCompositionStart = () => setIsComposing(true)
  const handleCompositionEnd = () => {
    setIsComposing(false)
    // Trigger input handler after composition ends
    if (containerRef.current) {
      handleInput({ currentTarget: containerRef.current } as React.FormEvent<HTMLDivElement>)
    }
  }

  // Handle paste events
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault()

      const text = e.clipboardData.getData('text/plain')
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      range.deleteContents()

      // Insert plain text
      const textNode = document.createTextNode(text)
      range.insertNode(textNode)

      // Move cursor to end of inserted text
      range.setStartAfter(textNode)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)

      // Trigger input handler to update state
      handleInput({ currentTarget: containerRef.current! } as React.FormEvent<HTMLDivElement>)
    },
    [handleInput]
  )

  return (
    <div
      ref={containerRef}
      className="content-editable-container"
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onPaste={handlePaste}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      spellCheck
    >
      {children}
    </div>
  )
}
