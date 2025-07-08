import React from 'react'
import { PageTreeItem } from './PageTreeItem'
import { usePageTree } from './usePageTree'
import { Page } from '../../../utils/api/types'
import styles from './PageTree.module.scss'

interface PageTreeProps {
  workspaceId: string
  currentPageId?: string
  onPageSelect: (pageId: string) => void
}

export const PageTree: React.FC<PageTreeProps> = ({ workspaceId, currentPageId, onPageSelect }) => {
  const { pageTree, loading, error, expandedFolders, toggleFolder, handlePageSelect } = usePageTree({
    workspaceId,
    currentPageId,
    onPageSelect,
  })

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingText}>Loading pages...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorText}>Failed to load pages</div>
          <div className={styles.errorDetail}>{error.message}</div>
        </div>
      </div>
    )
  }

  if (pageTree.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <div className={styles.emptyText}>No pages yet</div>
          <div className={styles.emptyHint}>Create your first page to get started</div>
        </div>
      </div>
    )
  }

  const renderPageTree = (pages: (Page & { children?: Page[] })[], level = 0) => {
    return pages.map((page) => (
      <PageTreeItem
        key={page.id}
        page={page}
        level={level}
        isSelected={currentPageId === page.id}
        isExpanded={expandedFolders.has(page.id)}
        onSelect={handlePageSelect}
        onToggleExpand={toggleFolder}
        currentPageId={currentPageId}
        expandedFolders={expandedFolders}
      />
    ))
  }

  return (
    <div className={styles.container} role="tree" aria-label="Page tree">
      {renderPageTree(pageTree)}
    </div>
  )
}
