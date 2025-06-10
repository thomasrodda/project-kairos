// apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.tsx
// Single contentEditable container that enables cross-block text selection.
// Prevents block merging by intercepting browser editing operations.
// Maintains block structure while allowing seamless text selection.

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useEditorState, useEditorDispatch } from '../../../contexts/EditorContext'
import type { EditorBlock, BlockType } from '../../../contexts/EditorContext'
import { generateId } from '@kairos/utils'
import { SlashCommandMenu } from '../SlashCommandMenu'
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

  // Slash command menu state
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const [slashCommandBlockId, setSlashCommandBlockId] = useState<string | null>(null)
  const [slashCommandStartOffset, setSlashCommandStartOffset] = useState<number>(0)

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

  const setCursorPosition = useCallback((blockId: string, offset: number) => {
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
  }, [])

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

  // Restore saved cursor position
  const restoreCursorPosition = useCallback(() => {
    if (!savedSelection.current) return
    const { blockId, offset } = savedSelection.current
    setCursorPosition(blockId, offset)
    savedSelection.current = null
  }, [setCursorPosition])

  // Handle slash command selection
  const handleSlashCommandSelect = useCallback(
    (blockType: BlockType) => {
      if (!slashCommandBlockId) return

      const block = editorState.blocks.find((b) => b.id === slashCommandBlockId)
      if (!block) return

      // Remove the slash from the content
      const newContent = block.content.slice(0, slashCommandStartOffset) + block.content.slice(slashCommandStartOffset + 1)

      // Update block content first
      dispatch({ type: 'UPDATE_BLOCK', blockId: slashCommandBlockId, content: newContent })

      // Then change block type
      dispatch({ type: 'CHANGE_BLOCK_TYPE', blockId: slashCommandBlockId, blockType })

      // Save cursor position
      savedSelection.current = { blockId: slashCommandBlockId, offset: slashCommandStartOffset }

      // Close menu
      setShowSlashMenu(false)
      setSlashCommandBlockId(null)
    },
    [slashCommandBlockId, slashCommandStartOffset, editorState.blocks, dispatch]
  )

  // Handle slash command menu close
  const handleSlashMenuClose = useCallback(() => {
    setShowSlashMenu(false)

    // Only restore focus if we're still within the editor
    // This prevents focus issues when clicking outside
    const isEditorFocused = containerRef.current?.contains(document.activeElement)

    if (isEditorFocused && slashCommandBlockId && slashCommandStartOffset !== null) {
      // Position cursor after the '/' character
      setCursorPosition(slashCommandBlockId, slashCommandStartOffset + 1)
    }

    setSlashCommandBlockId(null)
  }, [slashCommandBlockId, slashCommandStartOffset, setCursorPosition])

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

      // Handle selection deletion first if there's selected text
      if (!range.collapsed) {
        handleDeleteSelection()
      }

      // Find which block we're in
      const blockEl = findBlockElement(range.startContainer)
      if (!blockEl) return

      const blockId = blockEl.getAttribute('data-block-id')
      if (!blockId) return

      const block = editorState.blocks.find((b) => b.id === blockId)
      if (!block) return

      // Get the text offset within the block
      const offset = getTextOffset(blockEl, range.startContainer, range.startOffset)

      // Check for slash command trigger
      if (data === '/') {
        // Check if this is at the start of a block or after a space
        const isValidSlashPosition = offset === 0 || (offset > 0 && block.content[offset - 1] === ' ')

        if (isValidSlashPosition) {
          // Calculate menu position
          const rect = blockEl.getBoundingClientRect()

          setSlashMenuPosition({
            top: rect.top,
            left: rect.left,
          })
          setSlashCommandBlockId(blockId)
          setSlashCommandStartOffset(offset)
          setShowSlashMenu(true)
        }
      } else if (showSlashMenu) {
        // Hide slash menu if typing something other than slash
        // This allows the menu to stay open while the user continues typing
        // but we might want to implement filtering in the future
        setShowSlashMenu(false)
        setSlashCommandBlockId(null)
      }

      // Insert the typed character at the correct position
      const newContent = block.content.slice(0, offset) + data + block.content.slice(offset)

      // Save cursor position for after update
      savedSelection.current = { blockId, offset: offset + data.length }

      // Mark that we're doing an internal update
      isInternalUpdate.current = true

      // Update block content
      dispatch({ type: 'UPDATE_BLOCK', blockId, content: newContent })
    },
    [dispatch, editorState.blocks, handleDeleteSelection, showSlashMenu]
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
        // Hide slash menu if active
        if (showSlashMenu) {
          setShowSlashMenu(false)
          setSlashCommandBlockId(null)
        }

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
    [dispatch, editorState.blocks, handleDeleteSelection, showSlashMenu]
  )

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault()

      // Check for custom Kairos block format first
      const kairosBlocksData = e.clipboardData.getData('application/x-kairos-blocks')
      let blocksToInsert: { type: string; content: string }[] = []

      if (kairosBlocksData) {
        // Use custom format that preserves empty blocks
        try {
          blocksToInsert = JSON.parse(kairosBlocksData)
        } catch (err) {
          console.error('Failed to parse Kairos blocks data:', err)
        }
      }

      // Fall back to plain text if no custom format
      if (blocksToInsert.length === 0) {
        const text = e.clipboardData.getData('text/plain')
        // Split by newlines but filter out empty lines to prevent empty blocks
        const allLines = text.split('\n')
        // Keep empty lines only if they're between non-empty lines (preserve intentional spacing)
        const lines: string[] = []
        for (let i = 0; i < allLines.length; i++) {
          const line = allLines[i]
          const prevLine = i > 0 ? allLines[i - 1] : ''
          const nextLine = i < allLines.length - 1 ? allLines[i + 1] : ''

          // Keep the line if it's non-empty OR if it's an empty line between two non-empty lines
          if (line !== '' || (prevLine !== '' && nextLine !== '')) {
            lines.push(line)
          }
        }

        // If all lines were empty, treat as single empty line
        if (lines.length === 0) {
          lines.push('')
        }

        // Convert to block format
        blocksToInsert = lines.map((line) => ({ type: 'paragraph', content: line }))
      }

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)

      // Delete any selected content first
      if (!range.collapsed) {
        handleDeleteSelection()
      }

      // Get current position after potential deletion
      const currentSelection = window.getSelection()
      if (!currentSelection || currentSelection.rangeCount === 0) return
      const currentRange = currentSelection.getRangeAt(0)

      // Get current position
      const blockEl = findBlockElement(currentRange.startContainer)
      if (!blockEl) return

      const blockId = blockEl.getAttribute('data-block-id')
      if (!blockId) return

      const block = editorState.blocks.find((b) => b.id === blockId)
      if (!block) return

      const offset = getTextOffset(blockEl, currentRange.startContainer, currentRange.startOffset)

      if (blocksToInsert.length === 1) {
        // Single block paste
        const newContent = block.content.slice(0, offset) + blocksToInsert[0].content + block.content.slice(offset)

        // Save cursor position after paste
        savedSelection.current = { blockId, offset: offset + blocksToInsert[0].content.length }

        // Mark as internal update
        isInternalUpdate.current = true

        dispatch({ type: 'UPDATE_BLOCK', blockId, content: newContent })
      } else {
        // Multi-block paste
        const beforeCursor = block.content.slice(0, offset)
        const afterCursor = block.content.slice(offset)

        // Mark as internal update for all operations
        isInternalUpdate.current = true

        // Update first block with first pasted content
        const firstNewContent = beforeCursor + blocksToInsert[0].content
        dispatch({ type: 'UPDATE_BLOCK', blockId, content: firstNewContent })

        // Create middle blocks
        const newBlocks: EditorBlock[] = []

        for (let i = 1; i < blocksToInsert.length - 1; i++) {
          const newBlock: EditorBlock = {
            id: generateId(),
            type: blocksToInsert[i].type as EditorBlock['type'],
            content: blocksToInsert[i].content,
          }
          newBlocks.push(newBlock)
        }

        // Create last block with remaining content
        const lastBlock: EditorBlock = {
          id: generateId(),
          type: blocksToInsert[blocksToInsert.length - 1].type as EditorBlock['type'],
          content: blocksToInsert[blocksToInsert.length - 1].content + afterCursor,
        }
        newBlocks.push(lastBlock)

        // Save cursor position for last pasted block
        savedSelection.current = { blockId: lastBlock.id, offset: blocksToInsert[blocksToInsert.length - 1].content.length }

        // Add all new blocks in a batch
        newBlocks.forEach((block, index) => {
          const afterId = index === 0 ? blockId : newBlocks[index - 1].id
          dispatch({ type: 'ADD_BLOCK', block, afterBlockId: afterId })
        })
      }
    },
    [dispatch, editorState.blocks, handleDeleteSelection]
  )

  // Update DOM when blocks change
  useEffect(() => {
    if (!containerRef.current) return

    // Update the DOM to reflect the state changes
    const blocks = containerRef.current.querySelectorAll('.block__content')

    blocks.forEach((blockEl) => {
      const blockId = blockEl.getAttribute('data-block-id')
      if (!blockId) return

      const block = editorState.blocks.find((b) => b.id === blockId)
      if (!block) return

      // Only update if content has changed
      if (blockEl.textContent !== block.content) {
        blockEl.textContent = block.content
      }
    })

    // Restore cursor position after React has updated the DOM
    if (savedSelection.current) {
      restoreCursorPosition()
    }

    isInternalUpdate.current = false
  }, [editorState.blocks, restoreCursorPosition])

  // Handle input event as fallback for environments that don't support beforeinput
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      // Only process if we haven't already handled it via beforeinput
      if (isInternalUpdate.current) return

      const target = e.target as HTMLElement
      const blockEl = findBlockElement(target)
      if (!blockEl) return

      const blockId = blockEl.getAttribute('data-block-id')
      if (!blockId) return

      const block = editorState.blocks.find((b) => b.id === blockId)
      if (!block) return

      // Get the new content from the DOM
      const newContent = blockEl.textContent || ''

      if (newContent !== block.content) {
        // Save cursor position
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const offset = getTextOffset(blockEl, range.startContainer, range.startOffset)
          savedSelection.current = { blockId, offset }
        }

        isInternalUpdate.current = true
        dispatch({ type: 'UPDATE_BLOCK', blockId, content: newContent })
      }
    },
    [dispatch, editorState.blocks]
  )

  // Properly typed event handler for beforeinput
  const handleBeforeInputTyped = handleBeforeInput as unknown as React.FormEventHandler<HTMLDivElement>

  return (
    <>
      <div
        ref={containerRef}
        className="content-editable-container"
        contentEditable
        suppressContentEditableWarning
        onBeforeInput={handleBeforeInputTyped}
        onInput={handleInput}
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
      {showSlashMenu && <SlashCommandMenu position={slashMenuPosition} onSelect={handleSlashCommandSelect} onClose={handleSlashMenuClose} />}
    </>
  )
}
