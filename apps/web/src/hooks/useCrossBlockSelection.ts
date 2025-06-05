// apps/web/src/hooks/useCrossBlockSelection.ts
// Custom hook for managing cross-block text selection in the editor.
// Tracks browser selection changes and provides selection state that spans multiple blocks.
// Integrates with the editor context to access block data and update selection state.

import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditorState, useEditorDispatch } from '../contexts/EditorContext'
import type { CrossBlockSelection } from '../contexts/EditorContext'
import {
  findBlockFromNode,
  getBlockIdsBetween,
  categorizeSelectedBlocks,
  getRangeText,
  getCleanOffsets,
  shouldTreatAsTextSelection,
} from '../utils/textSelection'

interface UseCrossBlockSelectionOptions {
  enabled?: boolean
  onSelectionChange?: (selection: CrossBlockSelection | null) => void
}

export function useCrossBlockSelection(options: UseCrossBlockSelectionOptions = {}) {
  const { enabled = true, onSelectionChange } = options
  const editorState = useEditorState()
  const dispatch = useEditorDispatch()
  const { blocks } = editorState

  // Local state for tracking selection
  const [selection, setSelection] = useState<CrossBlockSelection | null>(null)

  // Ref to track if we're currently updating to prevent loops
  const isUpdatingRef = useRef(false)

  // Calculate selection from browser selection
  const calculateSelection = useCallback((): CrossBlockSelection | null => {
    const browserSelection = window.getSelection()
    console.log('calculateSelection called, browserSelection:', browserSelection)

    if (!browserSelection || browserSelection.rangeCount === 0) {
      console.log('No browser selection or no ranges')
      return null
    }

    const range = browserSelection.getRangeAt(0)

    // Log the actual containers to see what's being selected
    console.log('Range details:', {
      startContainer: range.startContainer,
      startContainerText: range.startContainer.textContent?.substring(0, 50),
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endContainerText: range.endContainer.textContent?.substring(0, 50),
      endOffset: range.endOffset,
      collapsed: range.collapsed,
      commonAncestorContainer: range.commonAncestorContainer,
      commonAncestorClass: (range.commonAncestorContainer as HTMLElement).className || 'no class',
    })

    // Check if this should be treated as text selection
    if (!shouldTreatAsTextSelection(range)) {
      console.log('Should not treat as text selection')
      return null
    }

    // Find the blocks containing the selection
    const startBlock = findBlockFromNode(range.startContainer)
    const endBlock = findBlockFromNode(range.endContainer)

    console.log('Found blocks:', {
      startBlockId: startBlock?.id,
      endBlockId: endBlock?.id,
      isMultiBlock: startBlock?.id !== endBlock?.id,
    })

    if (!startBlock || !endBlock) {
      console.log('Could not find start or end block')
      return null
    }

    // Calculate clean offsets within the blocks
    const startOffset = getCleanOffsets(startBlock.element, range.startContainer, range.startOffset)
    const endOffset = getCleanOffsets(endBlock.element, range.endContainer, range.endOffset)

    console.log('Calculated offsets:', { startOffset, endOffset })

    // Get the selected text
    const selectedText = getRangeText(range)

    // Categorize which blocks are fully vs partially selected
    const { fullySelected } = categorizeSelectedBlocks(range, startBlock.id, endBlock.id, blocks)

    const newSelection = {
      startBlockId: startBlock.id,
      startOffset,
      endBlockId: endBlock.id,
      endOffset,
      selectedText,
      selectedBlocks: fullySelected,
      isCollapsed: range.collapsed,
    }

    console.log('New selection:', {
      ...newSelection,
      isMultiBlock: startBlock.id !== endBlock.id,
      selectedTextPreview: selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''),
    })

    return newSelection
  }, [blocks])

  // Handle selection changes
  const handleSelectionChange = useCallback(() => {
    console.log('handleSelectionChange called, enabled:', enabled, 'isUpdating:', isUpdatingRef.current)

    if (!enabled || isUpdatingRef.current) return

    const newSelection = calculateSelection()

    // Only update if selection actually changed
    if (JSON.stringify(newSelection) !== JSON.stringify(selection)) {
      console.log('Selection changed from:', selection, 'to:', newSelection)
      setSelection(newSelection)
      onSelectionChange?.(newSelection)

      // Update editor context with cross-block selection
      dispatch({
        type: 'SET_CROSS_BLOCK_SELECTION',
        selection: newSelection,
      })
    }
  }, [enabled, calculateSelection, selection, onSelectionChange, dispatch])

  // Clear selection
  const clearSelection = useCallback(() => {
    console.log('Clearing selection')
    window.getSelection()?.removeAllRanges()
    setSelection(null)
    dispatch({
      type: 'SET_CROSS_BLOCK_SELECTION',
      selection: null,
    })
  }, [dispatch])

  // Get selected content as plain text
  const getSelectedText = useCallback((): string => {
    return selection?.selectedText || ''
  }, [selection])

  // Get selected content as markdown
  const getSelectedMarkdown = useCallback((): string => {
    if (!selection) return ''

    // Get all blocks involved in the selection
    const blockIds = getBlockIdsBetween(selection.startBlockId, selection.endBlockId, blocks)

    if (blockIds.length === 0) return ''

    // Single block - return just the selected text
    if (blockIds.length === 1) {
      return selection.selectedText
    }

    // Multiple blocks - construct markdown
    let markdown = ''

    blockIds.forEach((blockId, index) => {
      const block = blocks.find((b) => b.id === blockId)
      if (!block) return

      let blockMarkdown = ''

      // Determine what part of the block is selected
      if (index === 0) {
        // First block - from start offset to end
        blockMarkdown = block.content.substring(selection.startOffset)
      } else if (index === blockIds.length - 1) {
        // Last block - from beginning to end offset
        blockMarkdown = block.content.substring(0, selection.endOffset)
      } else {
        // Middle blocks - entire content
        blockMarkdown = block.content
      }

      // Add markdown formatting based on block type
      switch (block.type) {
        case 'h1':
          markdown += `# ${blockMarkdown}\n\n`
          break
        case 'h2':
          markdown += `## ${blockMarkdown}\n\n`
          break
        case 'h3':
          markdown += `### ${blockMarkdown}\n\n`
          break
        case 'bullet':
          markdown += `- ${blockMarkdown}\n`
          break
        default:
          markdown += `${blockMarkdown}\n\n`
      }
    })

    return markdown.trim()
  }, [selection, blocks])

  // Restore selection from state (useful after re-renders)
  const restoreSelection = useCallback(() => {
    if (!selection || !enabled) return

    // This is complex and would require creating a Range from our selection state
    // For now, we'll rely on the browser maintaining selection
  }, [selection, enabled])

  // Set up event listeners
  useEffect(() => {
    if (!enabled) {
      console.log('Hook is disabled, not setting up listeners')
      return
    }

    console.log('Setting up selection event listeners')

    // Debounced version of handleSelectionChange
    let selectionTimeout: NodeJS.Timeout | null = null

    const debouncedHandleSelectionChange = () => {
      // Clear any existing timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout)
      }

      // Set a new timeout to handle the selection after a small delay
      selectionTimeout = setTimeout(() => {
        handleSelectionChange()
      }, 50) // 50ms delay to ensure selection is complete
    }

    // Listen to both selectionchange and mouseup for better coverage
    document.addEventListener('selectionchange', debouncedHandleSelectionChange)
    document.addEventListener('mouseup', handleSelectionChange) // Keep immediate on mouseup

    // Also listen for keyboard selection changes
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || e.key === 'Shift') {
        handleSelectionChange()
      }
    }
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      console.log('Cleaning up selection event listeners')
      if (selectionTimeout) {
        clearTimeout(selectionTimeout)
      }
      document.removeEventListener('selectionchange', debouncedHandleSelectionChange)
      document.removeEventListener('mouseup', handleSelectionChange)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [enabled, handleSelectionChange])

  // Clear selection when blocks change significantly
  useEffect(() => {
    if (selection && blocks.length === 0) {
      clearSelection()
    }
  }, [blocks.length, selection, clearSelection])

  return {
    selection,
    clearSelection,
    getSelectedText,
    getSelectedMarkdown,
    restoreSelection,
    isMultiBlockSelection: selection ? selection.startBlockId !== selection.endBlockId : false,
  }
}
