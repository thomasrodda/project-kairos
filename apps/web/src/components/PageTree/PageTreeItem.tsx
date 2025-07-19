import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Icon } from '@kairos/ui'
import { usePagesContext } from '../../contexts/PagesContext'
import './PageTreeItem.scss'

interface PageWithChildren {
  id: string
  title: string
  workspaceId: string
  parentId: string | null
  order: number
  icon: string | null
  isFolder?: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  children?: PageWithChildren[]
}

interface PageTreeItemProps {
  page: PageWithChildren
  level: number
  isSelected: boolean
  onSelect: (pageId: string, isFolder: boolean) => void
}

export function PageTreeItem({ page, level, isSelected, onSelect }: PageTreeItemProps) {
  const { expandedPageIds, togglePageExpanded, updatePage, updatePageLocally, deletePage, createPage, selectedPageId } = usePagesContext()

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(page.title)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const isExpanded = expandedPageIds.has(page.id)
  const hasChildren = page.children && page.children.length > 0

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false)
      }
    }

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showContextMenu])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()

      if (page.isFolder && hasChildren) {
        togglePageExpanded(page.id)
      }

      onSelect(page.id, page.isFolder || false)
    },
    [page.id, page.isFolder, hasChildren, togglePageExpanded, onSelect]
  )

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }, [])

  const handleRename = useCallback(() => {
    setIsEditing(true)
    setEditTitle(page.title)
    setShowContextMenu(false)

    setTimeout(() => {
      inputRef.current?.select()
    }, 0)
  }, [page.title])

  const handleSaveRename = useCallback(async () => {
    const trimmedTitle = editTitle.trim()

    if (trimmedTitle && trimmedTitle !== page.title) {
      // Update locally first for immediate feedback
      updatePageLocally(page.id, { title: trimmedTitle })
      // Then update via API
      await updatePage(page.id, { title: trimmedTitle })
    }

    setIsEditing(false)
  }, [page.id, page.title, editTitle, updatePage, updatePageLocally])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSaveRename()
      } else if (e.key === 'Escape') {
        setIsEditing(false)
        setEditTitle(page.title)
      }
    },
    [handleSaveRename, page.title]
  )

  const handleDelete = useCallback(async () => {
    setShowContextMenu(false)

    const confirmMessage = page.isFolder
      ? 'Are you sure you want to delete this folder? All pages inside will also be deleted.'
      : 'Are you sure you want to delete this page?'

    if (confirm(confirmMessage)) {
      await deletePage(page.id)
    }
  }, [page.id, page.isFolder, deletePage])

  const handleCreateSubpage = useCallback(async () => {
    setShowContextMenu(false)

    const title = prompt('Enter page title:')
    if (!title?.trim()) return

    await createPage(title.trim(), page.id, false)

    // Auto-expand parent to show new page
    if (!isExpanded) {
      togglePageExpanded(page.id)
    }
  }, [page.id, isExpanded, createPage, togglePageExpanded])

  const handleCreateSubfolder = useCallback(async () => {
    setShowContextMenu(false)

    const title = prompt('Enter folder name:')
    if (!title?.trim()) return

    await createPage(title.trim(), page.id, true)

    // Auto-expand parent to show new folder
    if (!isExpanded) {
      togglePageExpanded(page.id)
    }
  }, [page.id, isExpanded, createPage, togglePageExpanded])

  const baseIndent = 8 - 3 // Account for 3px border
  const indent = baseIndent + level * 20

  return (
    <>
      <div
        className={`page-tree-item ${isSelected ? 'page-tree-item--selected' : ''}`}
        style={{ paddingLeft: `${indent}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="page-tree-item__content">
          {(page.isFolder || hasChildren) && (
            <button
              className={`page-tree-item__expand ${isExpanded ? 'page-tree-item__expand--expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                togglePageExpanded(page.id)
              }}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <Icon name="large-arrow" />
            </button>
          )}

          {!page.isFolder && !hasChildren && <div className="page-tree-item__expand-placeholder" />}

          <Icon name={page.isFolder ? 'folder' : 'page'} className="page-tree-item__icon" />

          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="page-tree-item__edit-input"
            />
          ) : (
            <span className="page-tree-item__title">{page.title}</span>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="page-tree-item__children">
          {page.children!.map((child) => (
            <PageTreeItem key={child.id} page={child} level={level + 1} isSelected={selectedPageId === child.id} onSelect={onSelect} />
          ))}
        </div>
      )}

      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="page-tree-item__context-menu"
          style={{
            position: 'fixed',
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
          }}
        >
          <button onClick={handleRename} className="page-tree-item__context-menu-item">
            Rename
          </button>

          {page.isFolder && (
            <>
              <button onClick={handleCreateSubpage} className="page-tree-item__context-menu-item">
                New Page
              </button>
              <button onClick={handleCreateSubfolder} className="page-tree-item__context-menu-item">
                New Folder
              </button>
            </>
          )}

          <div className="page-tree-item__context-menu-divider" />

          <button onClick={handleDelete} className="page-tree-item__context-menu-item page-tree-item__context-menu-item--danger">
            Delete
          </button>
        </div>
      )}
    </>
  )
}
