// apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.tsx
// Single contentEditable container that enables cross-block text selection.
// Prevents block merging by intercepting browser editing operations.
// Maintains block structure while allowing seamless text selection.

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useEditorState, useEditorDispatch } from '../../../contexts/EditorContext'
import type { EditorBlock, BlockType, FormatType } from '../../../contexts/EditorContext'
import { generateId } from '@kairos/utils'
import { SlashCommandMenu } from '../SlashCommandMenu'
import { shouldConvertMarkdown, convertMarkdownToFormatting, extractLinkUrl } from '../../../utils/markdownDetection'
import { toggleFormat } from '../../../utils/textFormatting'
import './ContentEditableContainer.scss'

interface ContentEditableContainerProps {
  children: React.ReactNode
  onBlockClick?: (blockId: string) => void
  containerRef?: React.RefObject<HTMLDivElement>
}

export function ContentEditableContainer({ children, onBlockClick, containerRef: externalRef }: ContentEditableContainerProps) {
  const editorState = useEditorState()
  const dispatch = useEditorDispatch()
  const internalRef = useRef<HTMLDivElement>(null)
  const containerRef = externalRef || internalRef
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

  const setCursorPosition = useCallback(
    (blockId: string, offset: number) => {
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
    },
    [containerRef]
  )

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

    // When slash menu is cancelled, we need to restore focus and cursor position
    if (slashCommandBlockId && slashCommandStartOffset !== null) {
      // First, focus the editor container if it's not already focused
      if (!containerRef.current?.contains(document.activeElement)) {
        containerRef.current?.focus()
      }

      // Then position cursor after the '/' character
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

      // Check for markdown pattern completion
      const markdownPattern = shouldConvertMarkdown(newContent, offset + data.length, data)

      if (markdownPattern) {
        // Convert markdown to formatting
        const { newText, newCursorPosition, format, range } = convertMarkdownToFormatting(newContent, markdownPattern)

        // Extract URL if it's a link
        const url = format === 'link' ? extractLinkUrl(newContent, markdownPattern.originalStart) : undefined

        // Save cursor position for after update
        savedSelection.current = { blockId, offset: newCursorPosition }

        // Mark that we're doing an internal update
        isInternalUpdate.current = true

        // Update block content (removing markdown symbols)
        dispatch({ type: 'UPDATE_BLOCK', blockId, content: newText })

        // Apply formatting to the text range
        dispatch({
          type: 'APPLY_FORMATTING',
          blockId,
          format,
          range,
          url,
        })
      } else {
        // No markdown pattern, proceed normally
        // Save cursor position for after update
        savedSelection.current = { blockId, offset: offset + data.length }

        // Mark that we're doing an internal update
        isInternalUpdate.current = true

        // Update block content
        dispatch({ type: 'UPDATE_BLOCK', blockId, content: newContent })
      }
    },
    [dispatch, editorState.blocks, handleDeleteSelection, showSlashMenu]
  )

  // Handle keyboard shortcuts for formatting
  const handleFormatShortcut = useCallback(
    (format: FormatType) => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      if (range.collapsed) return // No text selected

      const startBlock = findBlockElement(range.startContainer)
      const endBlock = findBlockElement(range.endContainer)

      if (!startBlock || !endBlock) return

      const startBlockId = startBlock.getAttribute('data-block-id')
      const endBlockId = endBlock.getAttribute('data-block-id')

      if (!startBlockId || !endBlockId) {
        return
      }

      // Get offsets for the selection
      const startOffset = getTextOffset(startBlock, range.startContainer, range.startOffset)
      const endOffset = getTextOffset(endBlock, range.endContainer, range.endOffset)

      // Store the selected text before making changes
      const selectedText = selection.toString()

      // Notify toolbar that formatting is in progress by dispatching a custom event
      const formattingEvent = new CustomEvent('formatting-start', { detail: { isFormatting: true } })
      window.dispatchEvent(formattingEvent)

      // Check if this is a single block or multi-block selection
      const isSingleBlock = startBlockId === endBlockId

      if (isSingleBlock) {
        // Single block formatting - existing logic
        const block = editorState.blocks.find((b) => b.id === startBlockId)
        if (!block) return

        // Handle link format specially
        if (format === 'link') {
          const existingFormats = block.formatting || []
          const isLink = existingFormats.some((f) => f.type === 'link' && f.start <= startOffset && f.end >= endOffset)

          if (isLink) {
            // Remove link
            const newFormats = toggleFormat(existingFormats, startOffset, endOffset, 'link')
            dispatch({
              type: 'UPDATE_BLOCK_FORMATTING',
              blockId: startBlockId,
              formatting: newFormats,
            })
          } else {
            // Show prompt for URL
            const url = window.prompt('Enter URL:')
            if (url) {
              const newFormats = toggleFormat(existingFormats, startOffset, endOffset, 'link', url)
              dispatch({
                type: 'UPDATE_BLOCK_FORMATTING',
                blockId: startBlockId,
                formatting: newFormats,
              })
            }
          }
        } else {
          // Regular format toggle (bold, italic, underline)
          const existingFormats = block.formatting || []
          const newFormats = toggleFormat(existingFormats, startOffset, endOffset, format)

          dispatch({
            type: 'UPDATE_BLOCK_FORMATTING',
            blockId: startBlockId,
            formatting: newFormats,
          })
        }
      } else {
        // Multi-block formatting
        const startBlockIndex = editorState.blocks.findIndex((b) => b.id === startBlockId)
        const endBlockIndex = editorState.blocks.findIndex((b) => b.id === endBlockId)

        if (startBlockIndex === -1 || endBlockIndex === -1) return

        // Handle link format for multi-block
        if (format === 'link') {
          const url = window.prompt('Enter URL:')
          if (!url) return

          // Apply link formatting to each block in the selection
          for (let i = startBlockIndex; i <= endBlockIndex; i++) {
            const block = editorState.blocks[i]
            const existingFormats = block.formatting || []

            let blockStartOffset = 0
            let blockEndOffset = block.content.length

            if (i === startBlockIndex) {
              blockStartOffset = startOffset
            }
            if (i === endBlockIndex) {
              blockEndOffset = endOffset
            }

            const newFormats = toggleFormat(existingFormats, blockStartOffset, blockEndOffset, 'link', url)
            dispatch({
              type: 'UPDATE_BLOCK_FORMATTING',
              blockId: block.id,
              formatting: newFormats,
            })
          }
        } else {
          // Regular format toggle for multi-block
          for (let i = startBlockIndex; i <= endBlockIndex; i++) {
            const block = editorState.blocks[i]
            const existingFormats = block.formatting || []

            let blockStartOffset = 0
            let blockEndOffset = block.content.length

            if (i === startBlockIndex) {
              blockStartOffset = startOffset
            }
            if (i === endBlockIndex) {
              blockEndOffset = endOffset
            }

            const newFormats = toggleFormat(existingFormats, blockStartOffset, blockEndOffset, format)
            dispatch({
              type: 'UPDATE_BLOCK_FORMATTING',
              blockId: block.id,
              formatting: newFormats,
            })
          }
        }
      }

      // Restore selection after formatting
      const tryRestoreSelection = () => {
        const selection = window.getSelection()
        if (!selection) return

        if (isSingleBlock) {
          // Single block selection restoration
          const blockElement = document.querySelector(`[data-block-id="${startBlockId}"]`)
          if (blockElement) {
            const contentElement = blockElement.querySelector('.block__content') || blockElement

            if (contentElement && selectedText) {
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
                  } catch (e) {
                    console.error('Failed to restore selection:', e)
                  }
                }
              }
            }
          }
        } else {
          // Multi-block selection restoration
          try {
            const startBlockElement = document.querySelector(`[data-block-id="${startBlockId}"]`)
            const endBlockElement = document.querySelector(`[data-block-id="${endBlockId}"]`)

            if (startBlockElement && endBlockElement) {
              const startContent = startBlockElement.querySelector('.block__content') || startBlockElement
              const endContent = endBlockElement.querySelector('.block__content') || endBlockElement

              const range = document.createRange()

              // Set start position
              const startWalker = document.createTreeWalker(startContent, NodeFilter.SHOW_TEXT, null)
              let currentOffset = 0
              let node
              let startSet = false

              while ((node = startWalker.nextNode())) {
                const nodeLength = node.textContent?.length || 0
                const nodeEndOffset = currentOffset + nodeLength

                if (nodeEndOffset > startOffset) {
                  range.setStart(node, startOffset - currentOffset)
                  startSet = true
                  break
                }

                currentOffset = nodeEndOffset
              }

              // Set end position
              const endWalker = document.createTreeWalker(endContent, NodeFilter.SHOW_TEXT, null)
              currentOffset = 0
              let endSet = false

              while ((node = endWalker.nextNode())) {
                const nodeLength = node.textContent?.length || 0
                const nodeEndOffset = currentOffset + nodeLength

                if (nodeEndOffset >= endOffset) {
                  range.setEnd(node, endOffset - currentOffset)
                  endSet = true
                  break
                }

                currentOffset = nodeEndOffset
              }

              if (startSet && endSet) {
                selection.removeAllRanges()
                selection.addRange(range)
              }
            }
          } catch (e) {
            console.error('Failed to restore multi-block selection:', e)
          }
        }

        // Notify toolbar that formatting is complete
        setTimeout(() => {
          const formattingEndEvent = new CustomEvent('formatting-end', { detail: { isFormatting: false } })
          window.dispatchEvent(formattingEndEvent)
        }, 100)
      }

      // Restore selection after formatting
      // For single-block, use a small delay to allow React to update
      // For multi-block, restore immediately in the next frame
      if (isSingleBlock) {
        setTimeout(tryRestoreSelection, 50)
      } else {
        // Use requestAnimationFrame for smoother restoration
        requestAnimationFrame(() => {
          tryRestoreSelection()
        })
      }
    },
    [dispatch, editorState.blocks]
  )

  // Handle Enter key to create new blocks
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Handle formatting shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault()
            handleFormatShortcut('bold')
            return
          case 'i':
            e.preventDefault()
            handleFormatShortcut('italic')
            return
          case 'u':
            e.preventDefault()
            handleFormatShortcut('underline')
            return
          case 'k':
            e.preventDefault()
            handleFormatShortcut('link')
            return
        }
      }

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
    [dispatch, editorState.blocks, handleDeleteSelection, showSlashMenu, handleFormatShortcut]
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

  // Restore cursor position after state updates
  useEffect(() => {
    if (!containerRef.current) return

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
