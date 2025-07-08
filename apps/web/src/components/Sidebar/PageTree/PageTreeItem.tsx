import React, { useCallback } from 'react'
import { Icon } from '@kairos/ui'
import { Page } from '../../../utils/api/types'
import styles from './PageTreeItem.module.scss'

interface PageTreeItemProps {
  page: Page & { children?: Page[] }
  level: number
  isSelected: boolean
  isExpanded: boolean
  onSelect: (pageId: string) => void
  onToggleExpand: (pageId: string) => void
  currentPageId?: string
  expandedFolders: Set<string>
}

export const PageTreeItem: React.FC<PageTreeItemProps> = ({
  page,
  level,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  currentPageId,
  expandedFolders,
}) => {
  const hasChildren = page.isFolder && page.children && page.children.length > 0

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()

      if (page.isFolder) {
        onToggleExpand(page.id)
      } else {
        onSelect(page.id)
      }
    },
    [page.id, page.isFolder, onSelect, onToggleExpand]
  )

  const handleExpandClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleExpand(page.id)
    },
    [page.id, onToggleExpand]
  )

  return (
    <>
      <div
        className={`${styles.item} ${isSelected ? styles['item--selected'] : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        role="treeitem"
        aria-expanded={page.isFolder ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={0}
      >
        {/* Expand/collapse chevron for folders */}
        {hasChildren && (
          <button
            className={`${styles.expandButton} ${isExpanded ? styles['expandButton--expanded'] : ''}`}
            onClick={handleExpandClick}
            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
            tabIndex={-1}
          >
            <Icon name="large-arrow" size={12} />
          </button>
        )}

        {/* Spacer for folders without children */}
        {page.isFolder && !hasChildren && <div className={styles.expandSpacer} />}

        {/* Icon */}
        <div className={styles.icon}>
          <Icon name={page.isFolder ? 'folder' : 'page'} size={16} />
        </div>

        {/* Title */}
        <span className={styles.title}>{page.title}</span>
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div role="group">
          {page.children!.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child as Page & { children?: Page[] }}
              level={level + 1}
              isSelected={currentPageId === child.id}
              isExpanded={expandedFolders.has(child.id)}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              currentPageId={currentPageId}
              expandedFolders={expandedFolders}
            />
          ))}
        </div>
      )}
    </>
  )
}
