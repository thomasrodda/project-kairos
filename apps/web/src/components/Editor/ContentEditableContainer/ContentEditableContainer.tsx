// apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.tsx
// Single contentEditable container that enables cross-block text selection.
// Prevents block merging by intercepting browser editing operations.
// Maintains block structure while allowing seamless text selection.

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useEditorState, useEditorDispatch } from '../../../contexts/EditorContext'
import type { EditorBlock } from '../../../contexts/EditorContext'
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
  const isInternalUpdate = useRef(false)
  const savedSelection = useRef<{ blockId: string; offset: number } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Utility functions (moved up to be available for all callbacks)
  const findBlockElement = (node: Node): HTMLElement | null => {
    let current = node
    while (current && current !== containerRef.current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const el = current as HTMLElement
        if (el.classList.contains('block__content')) {
          return el
        }
      }
      current = current.parentNode!
    }
    return null
  }

  const getTextOffset = (blockEl: HTMLElement, container: Node, offset: number): number => {
    // Handle different container scenarios
    if (container === blockEl) {
      return offset
    }

    // If container is a span element, get its text node
    if (container.nodeType === Node.ELEMENT_NODE && container.firstChild?.nodeType === Node.TEXT_NODE) {
      container = container.firstChild
      // If we were selecting at the element level, offset refers to child index
      if (offset === 0) return 0
      if (offset === 1) return container.textContent?.length || 0
    }

    // For text nodes, calculate the real offset
    let textOffset = 0
    const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT, null)

    let node
    while ((node = walker.nextNode())) {
      if (node === container) {
        return textOffset + offset
      }
      textOffset += node.textContent?.length || 0
    }

    return offset
  }

  const setCursorPosition = (blockId: string, offset: number) => {
    // Use requestAnimationFrame to ensure DOM is updated before setting cursor
    requestAnimationFrame(() => {
      const blockEl = containerRef.current?.querySelector(`[data-block-id="${blockId}"] .block__content`) as HTMLElement
      if (!blockEl) return

      const selection = window.getSelection()
      if (!selection) return

      try {
        // Create a tree walker to find the correct text node
        const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT, null)

        let currentOffset = 0
        let targetNode: Node | null = null
        let targetOffset = 0

        // Find the text node that contains our target offset
        let node: Node | null
        while ((node = walker.nextNode())) {
          const nodeLength = node.textContent?.length || 0
          if (currentOffset + nodeLength >= offset) {
            targetNode = node
            targetOffset = offset - currentOffset
            break
          }
          currentOffset += nodeLength
        }

        // If no text node found, use the block element itself
        if (!targetNode) {
          targetNode = blockEl
          targetOffset = 0
        }

        const range = document.createRange()
        range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0))
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      } catch (e) {
        console.error('Failed to set cursor position:', e)
      }
    })
  }

  // Handle selection deletion
  const handleDeleteSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)

    const startBlock = findBlockElement(range.startContainer)
    const endBlock = findBlockElement(range.endContainer)

    if (!startBlock || !endBlock) return

    const startBlockId = startBlock.getAttribute('data-block-id')
    const endBlockId = endBlock.getAttribute('data-block-id')

    if (!startBlockId || !endBlockId) return

    const startOffset = getTextOffset(startBlock, range.startContainer, range.startOffset)
    const endOffset = getTextOffset(endBlock, range.endContainer, range.endOffset)

    if (startBlockId === endBlockId) {
      // Selection within single block
      const block = editorState.blocks.find((b) => b.id === startBlockId)
      if (!block) return

      const newContent = block.content.slice(0, startOffset) + block.content.slice(endOffset)
      // Save cursor position for after update
      savedSelection.current = { blockId: startBlockId, offset: startOffset }

      dispatch({ type: 'UPDATE_BLOCK', blockId: startBlockId, content: newContent })
    } else {
      // Selection across multiple blocks
      const startIndex = editorState.blocks.findIndex((b) => b.id === startBlockId)
      const endIndex = editorState.blocks.findIndex((b) => b.id === endBlockId)

      const startBlockContent = editorState.blocks[startIndex].content.slice(0, startOffset)
      const endBlockContent = editorState.blocks[endIndex].content.slice(endOffset)

      // Merge content
      const mergedContent = startBlockContent + endBlockContent

      // Save cursor position for after update
      savedSelection.current = { blockId: startBlockId, offset: startOffset }

      // Update first block
      dispatch({ type: 'UPDATE_BLOCK', blockId: startBlockId, content: mergedContent })

      // Delete blocks in between and end block
      const blocksToDelete = editorState.blocks.slice(startIndex + 1, endIndex + 1).map((b) => b.id)

      if (blocksToDelete.length > 0) {
        dispatch({ type: 'DELETE_BLOCKS', blockIds: blocksToDelete })
      }
    }
  }, [dispatch, editorState.blocks])

  // Save current cursor position
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const blockEl = findBlockElement(range.startContainer)
    if (!blockEl) return

    const blockId = blockEl.getAttribute('data-block-id')
    if (!blockId) return

    const offset = getTextOffset(blockEl, range.startContainer, range.startOffset)
    savedSelection.current = { blockId, offset }
  }, [])

  // Restore saved cursor position
  const restoreCursorPosition = useCallback(() => {
    if (!savedSelection.current) return
    const { blockId, offset } = savedSelection.current
    setCursorPosition(blockId, offset)
    savedSelection.current = null
  }, [])

  // Prevent default contentEditable behavior and handle input manually
  const handleBeforeInput = useCallback(
    (e: Event) => {
      e.preventDefault()

      const inputEvent = e as InputEvent
      const data = inputEvent.data

      if (!data) return

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)

      // Find which block we're in
      const blockEl = findBlockElement(range.startContainer)
      if (!blockEl) return

      const blockId = blockEl.getAttribute('data-block-id')
      if (!blockId) return

      const block = editorState.blocks.find((b) => b.id === blockId)
      if (!block) return

      // Get the text offset within the block
      const offset = getTextOffset(blockEl, range.startContainer, range.startOffset)

      // Insert the typed character at the correct position
      const newContent = block.content.slice(0, offset) + data + block.content.slice(offset)

      // Save cursor position for after update
      savedSelection.current = { blockId, offset: offset + data.length }

      // Update block content
      dispatch({ type: 'UPDATE_BLOCK', blockId, content: newContent })
    },
    [dispatch, editorState.blocks]
  )

  // Handle Enter key to create new blocks
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        const blockEl = findBlockElement(range.startContainer)
        if (!blockEl) return

        const blockId = blockEl.getAttribute('data-block-id')
        if (!blockId) return

        const block = editorState.blocks.find((b) => b.id === blockId)
        if (!block) return

        const offset = getTextOffset(blockEl, range.startContainer, range.startOffset)

        // Split content at cursor
        const beforeCursor = block.content.substring(0, offset)
        const afterCursor = block.content.substring(offset)

        // Update current block
        dispatch({ type: 'UPDATE_BLOCK', blockId: block.id, content: beforeCursor })

        // Create new block
        const newBlock: EditorBlock = {
          id: generateId(),
          type: 'paragraph',
          content: afterCursor,
        }

        // Save cursor position for new block
        savedSelection.current = { blockId: newBlock.id, offset: 0 }

        dispatch({ type: 'ADD_BLOCK', block: newBlock, afterBlockId: block.id })
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)

        if (range.collapsed) {
          // Single cursor, no selection
          const blockEl = findBlockElement(range.startContainer)
          if (!blockEl) return

          const blockId = blockEl.getAttribute('data-block-id')
          if (!blockId) return

          const block = editorState.blocks.find((b) => b.id === blockId)
          if (!block) return

          const offset = getTextOffset(blockEl, range.startContainer, range.startOffset)

          if (offset === 0) {
            // At beginning of block - merge with previous
            e.preventDefault()
            const blockIndex = editorState.blocks.findIndex((b) => b.id === blockId)

            if (blockIndex > 0) {
              const previousBlock = editorState.blocks[blockIndex - 1]
              const mergedContent = previousBlock.content + block.content

              // Save cursor position for merged block
              savedSelection.current = { blockId: previousBlock.id, offset: previousBlock.content.length }

              dispatch({ type: 'UPDATE_BLOCK', blockId: previousBlock.id, content: mergedContent })
              dispatch({ type: 'DELETE_BLOCK', blockId: block.id })
            }
          } else {
            // Normal backspace within block
            e.preventDefault()
            const newContent = block.content.slice(0, offset - 1) + block.content.slice(offset)

            // Save cursor position after backspace
            savedSelection.current = { blockId, offset: offset - 1 }

            dispatch({ type: 'UPDATE_BLOCK', blockId, content: newContent })
          }
        } else {
          // Has selection - delete it
          e.preventDefault()
          handleDeleteSelection()
        }
      }

      // Handle Delete key
      if (e.key === 'Delete') {
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)

        if (!range.collapsed) {
          e.preventDefault()
          handleDeleteSelection()
        }
      }
    },
    [dispatch, editorState.blocks, handleDeleteSelection]
  )

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault()

      const text = e.clipboardData.getData('text/plain')
      const lines = text.split('\n')

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)

      // Delete any selected content first
      if (!range.collapsed) {
        handleDeleteSelection()
      }

      // Get current position
      const blockEl = findBlockElement(range.startContainer)
      if (!blockEl) return

      const blockId = blockEl.getAttribute('data-block-id')
      if (!blockId) return

      const block = editorState.blocks.find((b) => b.id === blockId)
      if (!block) return

      const offset = getTextOffset(blockEl, range.startContainer, range.startOffset)

      if (lines.length === 1) {
        // Single line paste
        const newContent = block.content.slice(0, offset) + lines[0] + block.content.slice(offset)

        // Save cursor position after paste
        savedSelection.current = { blockId, offset: offset + lines[0].length }

        dispatch({ type: 'UPDATE_BLOCK', blockId, content: newContent })
      } else {
        // Multi-line paste
        const beforeCursor = block.content.slice(0, offset)
        const afterCursor = block.content.slice(offset)

        // Update first block
        dispatch({ type: 'UPDATE_BLOCK', blockId, content: beforeCursor + lines[0] })

        // Create middle blocks
        let lastBlockId = blockId
        for (let i = 1; i < lines.length - 1; i++) {
          const newBlock: EditorBlock = {
            id: generateId(),
            type: 'paragraph',
            content: lines[i],
          }
          dispatch({ type: 'ADD_BLOCK', block: newBlock, afterBlockId: lastBlockId })
          lastBlockId = newBlock.id
        }

        // Create last block with remaining content
        const lastBlock: EditorBlock = {
          id: generateId(),
          type: 'paragraph',
          content: lines[lines.length - 1] + afterCursor,
        }
        // Save cursor position for last pasted block
        savedSelection.current = { blockId: lastBlock.id, offset: lines[lines.length - 1].length }

        dispatch({ type: 'ADD_BLOCK', block: lastBlock, afterBlockId: lastBlockId })
      }
    },
    [dispatch, editorState.blocks, handleDeleteSelection]
  )

  // Update DOM when blocks change
  useEffect(() => {
    if (!containerRef.current || isInternalUpdate.current) return

    // Restore cursor position after React has updated the DOM
    if (savedSelection.current) {
      restoreCursorPosition()
    }

    isInternalUpdate.current = false
  }, [editorState.blocks, restoreCursorPosition])

  // Properly typed event handler for beforeinput
  const handleBeforeInputTyped = handleBeforeInput as unknown as React.FormEventHandler<HTMLDivElement>

  return (
    <div
      ref={containerRef}
      className="content-editable-container"
      contentEditable
      suppressContentEditableWarning
      onBeforeInput={handleBeforeInputTyped}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onClick={(e) => {
        const target = e.target as HTMLElement
        const blockEl = findBlockElement(target)
        if (blockEl) {
          const blockId = blockEl.parentElement?.getAttribute('data-block-id')
          if (blockId) {
            onBlockClick?.(blockId)
          }
        }
      }}
      spellCheck
    >
      {children}
    </div>
  )
}
