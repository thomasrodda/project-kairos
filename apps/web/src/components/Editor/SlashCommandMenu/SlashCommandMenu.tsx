// apps/web/src/components/Editor/SlashCommandMenu/SlashCommandMenu.tsx
// Floating menu for block type transformations triggered by slash command.
// Provides searchable list of block types with keyboard navigation.

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { BlockType } from '../../../contexts/EditorContext'
import { useDismiss } from '../../../hooks/useDismiss'
import './SlashCommandMenu.scss'

interface SlashCommandMenuProps {
  onSelect: (blockType: BlockType) => void
  onClose: () => void
  position: { top: number; left: number }
}

interface BlockTypeOption {
  type: BlockType
  label: string
  shortcut?: string
}

const BLOCK_TYPE_OPTIONS: BlockTypeOption[] = [
  { type: 'h1', label: 'Heading 1', shortcut: '#' },
  { type: 'h2', label: 'Heading 2', shortcut: '##' },
  { type: 'h3', label: 'Heading 3', shortcut: '###' },
  { type: 'paragraph', label: 'Paragraph', shortcut: 'p' },
  { type: 'bullet', label: 'Bullet List', shortcut: '-' },
]

export function SlashCommandMenu({ onSelect, onClose, position }: SlashCommandMenuProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Dismiss menu when clicking outside or pressing Escape
  useDismiss(menuRef, {
    onDismiss: onClose,
    enabled: true,
  })

  // Filter options based on search query
  const filteredOptions = BLOCK_TYPE_OPTIONS.filter((option) => {
    const query = searchQuery.toLowerCase()
    return (
      option.label.toLowerCase().includes(query) ||
      option.type.toLowerCase().includes(query) ||
      (option.shortcut && option.shortcut.toLowerCase().includes(query))
    )
  })

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  // Focus search input on mount
  useEffect(() => {
    // Use setTimeout to ensure DOM is ready and component is fully rendered
    const timeoutId = setTimeout(() => {
      searchInputRef.current?.focus()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (filteredOptions.length > 0) {
            setSelectedIndex((prev) => (prev + 1) % filteredOptions.length)
          }
          break

        case 'ArrowUp':
          e.preventDefault()
          if (filteredOptions.length > 0) {
            setSelectedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length)
          }
          break

        case 'Enter':
          e.preventDefault()
          if (filteredOptions.length > 0 && filteredOptions[selectedIndex]) {
            onSelect(filteredOptions[selectedIndex].type)
          }
          break

        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [filteredOptions, selectedIndex, onSelect, onClose]
  )

  // Handle option click
  const handleOptionClick = (blockType: BlockType) => {
    onSelect(blockType)
  }

  // Handle mouse enter on option
  const handleOptionMouseEnter = (index: number) => {
    setSelectedIndex(index)
  }

  return createPortal(
    <div ref={menuRef} className="slash-command-menu" style={{ top: position.top, left: position.left }}>
      <div className="slash-command-menu__search">
        <input
          ref={searchInputRef}
          type="text"
          className="slash-command-menu__search-input"
          placeholder="Search block types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="slash-command-menu__options">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => (
            <button
              key={option.type}
              className={`slash-command-menu__option ${index === selectedIndex ? 'slash-command-menu__option--selected' : ''}`}
              onClick={() => handleOptionClick(option.type)}
              onMouseEnter={() => handleOptionMouseEnter(index)}
            >
              <span className="slash-command-menu__option-label">{option.label}</span>
              {option.shortcut && <span className="slash-command-menu__option-shortcut">{option.shortcut}</span>}
            </button>
          ))
        ) : (
          <div className="slash-command-menu__empty">No matching block types</div>
        )}
      </div>
    </div>,
    document.body
  )
}
