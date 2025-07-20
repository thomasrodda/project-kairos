import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePages } from '../../contexts/PagesContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { PageTreeItem } from './PageTreeItem'
import { Icon } from '@kairos/ui'
import './PageTree.scss'

export function PageTree() {
  const navigate = useNavigate()
  const pagesContext = usePages()
  const { currentWorkspace } = useWorkspace()
  const [isCreating, setIsCreating] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePageSelect = useCallback(
    (pageId: string, isFolder: boolean) => {
      if (!isFolder && currentWorkspace) {
        navigate(`/workspace/${currentWorkspace.id}/page/${pageId}`)
      }
    },
    [navigate, currentWorkspace]
  )

  const handleCreatePage = useCallback(async () => {
    if (!newPageTitle.trim() || isSubmitting || !pagesContext) return

    setIsSubmitting(true)
    const newPage = await pagesContext.createPage(newPageTitle.trim())
    setIsSubmitting(false)

    if (newPage) {
      // Success - clear the form and navigate if it's not a folder
      setNewPageTitle('')
      setIsCreating(false)

      if (!newPage.isFolder) {
        // Navigate to the new page
        handlePageSelect(newPage.id, false)
      }
    }
    // If createPage returned null (error), keep the input visible
  }, [newPageTitle, pagesContext, handlePageSelect, isSubmitting])

  const handleCreateFolder = useCallback(async () => {
    if (!pagesContext) return
    const folderName = prompt('Enter folder name:')
    if (!folderName?.trim()) return

    await pagesContext.createPage(folderName.trim(), null, true)
  }, [pagesContext])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleCreatePage()
      }
      if (e.key === 'Escape') {
        setNewPageTitle('')
        setIsCreating(false)
      }
    },
    [handleCreatePage]
  )

  // If context is not available yet, show loading state
  if (!pagesContext) {
    return (
      <div className="page-tree page-tree--loading">
        <div className="page-tree__spinner">Loading...</div>
      </div>
    )
  }

  const { pages, loading, error, selectedPageId, createPage } = pagesContext

  if (loading) {
    return (
      <div className="page-tree page-tree--loading">
        <div className="page-tree__spinner">Loading pages...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-tree page-tree--error">
        <div className="page-tree__error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="page-tree">
      <div className="page-tree__header">
        <h3 className="page-tree__title">Pages</h3>
        <div className="page-tree__actions">
          <button className="page-tree__action-button" onClick={handleCreateFolder} title="Create folder" aria-label="Create folder">
            <Icon name="folder" />
          </button>
          <button className="page-tree__action-button" onClick={() => setIsCreating(true)} title="Create page" aria-label="Create page">
            <Icon name="add" />
          </button>
        </div>
      </div>

      <div className="page-tree__content">
        {pages.length === 0 && !isCreating ? (
          <div className="page-tree__empty">
            <p>No pages yet</p>
            <button className="page-tree__empty-button" onClick={() => setIsCreating(true)}>
              Create your first page
            </button>
          </div>
        ) : (
          <div className="page-tree__items">
            {pages.map((page) => (
              <PageTreeItem key={page.id} page={page} level={0} isSelected={selectedPageId === page.id} onSelect={handlePageSelect} />
            ))}
          </div>
        )}

        {isCreating && (
          <div className="page-tree__create-input">
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newPageTitle.trim() && !isSubmitting) {
                  setIsCreating(false)
                }
              }}
              placeholder="Page title..."
              autoFocus
              className="page-tree__input"
            />
          </div>
        )}
      </div>
    </div>
  )
}
