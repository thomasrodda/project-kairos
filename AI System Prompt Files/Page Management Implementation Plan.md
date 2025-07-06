# Page Management Implementation Plan

## Overview

This document outlines the implementation plan for adding page management functionality to Project Kairos. The backend infrastructure is fully implemented - we need to build the frontend UI to expose these capabilities.

## Current State (Verified)

### ✅ What's Already Built

1. **Backend (100% Complete - NO TESTS)**:

   - Full page CRUD API endpoints in Express (NOT serverless functions)
   - Hierarchical page structure with folders
   - Page ordering and moving
   - Database schema with relationships
   - Access control and validation
   - Circular reference prevention
   - **WARNING**: No test coverage for any page-related code

2. **Frontend Infrastructure**:
   - EnhancedEditorProvider handles page loading and context
   - Comprehensive auto-save with debouncing, conflict detection, and retry logic
   - SyncStatus UI component shows save state
   - API client with all page endpoints configured
   - Page initialization in App.dev.tsx
   - **WARNING**: No tests for auto-save functionality

### ❌ What's Missing

1. **Page Navigation UI**:
   - Sidebar shows "File tree will go here" placeholder
   - No visual page tree component
   - "Create Page" button exists but is non-functional
2. **Page Management UI**:
   - No UI for create/rename/delete/move operations
   - No folder creation or management
   - No drag-and-drop for reorganization
3. **User Experience**:
   - No way to switch between pages
   - No breadcrumb navigation
   - No page search or quick switcher
   - Workspace button exists but doesn't work

## Critical Pre-Implementation Task: Add Missing Tests

Before implementing new features, we should add tests for existing page functionality:

1. **Backend Tests (Priority 1)**:

   - Page API endpoint tests (all 6 endpoints)
   - PageService unit tests
   - Test circular reference prevention
   - Test cascade delete behavior

2. **Frontend Tests (Priority 2)**:
   - useAutoSave hook tests
   - useDebounce hook tests
   - EditorProvider sync functionality tests
   - SyncStatus component tests

## Implementation Phases

### Phase 1: Page Tree Component (Days 1-3)

**Goal**: Display hierarchical page structure in sidebar

#### 1.1 Create PageTree Component

```typescript
// apps/web/src/components/Sidebar/PageTree/PageTree.tsx
interface PageTreeProps {
  workspaceId: string
  currentPageId?: string
  onPageSelect: (pageId: string) => void
}
```

**Features**:

- Fetch and display page hierarchy
- Expand/collapse folders
- Highlight current page
- Show page/folder icons
- Loading and error states

#### 1.2 Create PageTreeItem Component

```typescript
// apps/web/src/components/Sidebar/PageTree/PageTreeItem.tsx
interface PageTreeItemProps {
  page: Page
  level: number
  isSelected: boolean
  onSelect: (pageId: string) => void
  onExpand: (pageId: string) => void
  expanded: boolean
}
```

**Features**:

- Render individual page/folder
- Indentation based on level
- Expand/collapse for folders
- Hover and selection states
- Right-click context menu prep

#### 1.3 Integrate with Sidebar

- Replace "File tree will go here" placeholder
- Connect to workspace context
- Handle page selection
- Update current page in editor

### Phase 2: Page Creation (Days 4-5)

**Goal**: Allow users to create new pages and folders

#### 2.1 Create NewPageButton Component

```typescript
// apps/web/src/components/Sidebar/PageTree/NewPageButton.tsx
interface NewPageButtonProps {
  parentId?: string
  isFolder?: boolean
  onPageCreated: (page: Page) => void
}
```

**Features**:

- Inline creation UI (like VS Code)
- Name validation
- Create at specific location
- Auto-focus new page

#### 2.2 Add Creation Logic

- API integration for page creation
- Update page tree after creation
- Handle errors gracefully
- Navigate to new page

### Phase 3: Page Management Operations (Days 6-8)

**Goal**: Enable rename, delete, and move operations

#### 3.1 Create PageContextMenu Component

```typescript
// apps/web/src/components/Sidebar/PageTree/PageContextMenu.tsx
interface PageContextMenuProps {
  page: Page
  onRename: () => void
  onDelete: () => void
  onDuplicate: () => void
  onMove: () => void
}
```

**Features**:

- Right-click context menu
- Keyboard shortcuts
- Confirmation dialogs
- Undo notifications

#### 3.2 Implement Rename Functionality

- Inline rename UI
- Name validation
- API integration
- Update breadcrumbs

#### 3.3 Implement Delete Functionality

- Confirmation dialog
- Handle pages with children
- Soft delete option
- Redirect after delete

### Phase 4: Drag & Drop Reordering (Days 9-10)

**Goal**: Allow users to reorganize page hierarchy

#### 4.1 Add DnD to PageTree

- Use @dnd-kit (already in project)
- Visual drag indicators
- Valid drop zones
- Prevent circular references

#### 4.2 Implement Move Logic

- API integration for move
- Update tree structure
- Maintain expansion state
- Handle edge cases

### Phase 5: Enhanced Navigation (Days 11-12)

**Goal**: Improve page navigation experience

#### 5.1 Create Breadcrumb Component

```typescript
// apps/web/src/components/Editor/Breadcrumb/Breadcrumb.tsx
interface BreadcrumbProps {
  currentPage: Page
  ancestors: Page[]
  onNavigate: (pageId: string) => void
}
```

#### 5.2 Add Quick Switcher

- Cmd/Ctrl+P for quick page search
- Fuzzy search functionality
- Recent pages section
- Keyboard navigation

#### 5.3 Add Page Search

- Search within page tree
- Highlight matches
- Expand to show results
- Clear search functionality

### Phase 6: Polish & Testing (Days 13-15)

**Goal**: Production-ready page management

#### 6.1 Performance Optimization

- Virtual scrolling for large trees
- Lazy load deep hierarchies
- Optimize re-renders
- Cache page data

#### 6.2 Accessibility

- Full keyboard navigation
- ARIA labels
- Screen reader support
- Focus management

#### 6.3 Comprehensive Testing

- Unit tests for all components
- Integration tests for workflows
- E2E tests for critical paths
- Performance benchmarks

## Technical Implementation Details

### State Management

```typescript
// Extend EditorContext with page management
interface PageManagementState {
  pages: Page[]
  expandedFolders: Set<string>
  loadingPages: boolean
  pageError: Error | null
}

// Actions
type PageAction =
  | { type: 'SET_PAGES'; pages: Page[] }
  | { type: 'TOGGLE_FOLDER'; folderId: string }
  | { type: 'CREATE_PAGE'; page: Page }
  | { type: 'UPDATE_PAGE'; page: Page }
  | { type: 'DELETE_PAGE'; pageId: string }
  | { type: 'MOVE_PAGE'; pageId: string; newParentId: string | null; newOrder: number }
```

### API Integration

```typescript
// apps/web/src/hooks/usePages.ts
export function usePages(workspaceId: string) {
  // Fetch pages
  // Handle updates
  // Optimistic updates
  // Error handling
}
```

### Component Structure

```
Sidebar/
├── PageTree/
│   ├── PageTree.tsx
│   ├── PageTree.test.tsx
│   ├── PageTree.module.scss
│   ├── PageTreeItem.tsx
│   ├── PageTreeItem.test.tsx
│   ├── NewPageButton.tsx
│   ├── PageContextMenu.tsx
│   └── index.ts
```

## Success Criteria

1. **Functionality**:

   - Users can see all pages in hierarchy
   - Create pages/folders at any level
   - Rename, delete, move pages
   - Navigate between pages seamlessly

2. **Performance**:

   - Tree renders <100ms for 1000 pages
   - Smooth drag & drop
   - No UI blocking during operations

3. **User Experience**:

   - Intuitive VS Code-like interface
   - Keyboard shortcuts work
   - Clear visual feedback
   - Graceful error handling

4. **Testing**:
   - 95%+ test coverage
   - All user flows tested
   - Performance benchmarks pass

## Dependencies

- @dnd-kit/sortable (already installed)
- No new dependencies needed
- Uses existing design system
- Follows established patterns

## Risks & Mitigations

1. **Large Page Trees**: Implement virtual scrolling
2. **Concurrent Edits**: Use optimistic updates with conflict resolution
3. **Complex Hierarchies**: Add depth limits and circular reference checks
4. **Performance**: Lazy load and cache aggressively

## Next Steps After Page Management

1. **Search & Filters**: Full-text search across pages
2. **Templates**: Page templates for quick creation
3. **Bulk Operations**: Select multiple pages
4. **Import/Export**: Folder-level import/export
5. **Sharing**: Page-level permissions

## Resources

- [Component Structure Guide](./Component Structure Guide.md)
- [Testing Guide](./Testing Guide.md)
- [Backend API Guide](./Backend Api Guide.md)
- Current Implementation: `apps/web/src/components/Sidebar/`

## Verification Summary

After thorough review of the codebase, here's what was discovered:

### ✅ Confirmed Working:

- Database schema with full page hierarchy support
- All 6 page API endpoints (list, get, create, update, delete, move)
- PageService with business logic and circular reference prevention
- EnhancedEditorProvider with page loading and context management
- Comprehensive auto-save system with conflict detection
- SyncStatus UI component

### ⚠️ Important Findings:

- API is Express app, NOT Vercel serverless functions
- **Zero test coverage** for all page-related backend code
- **Zero test coverage** for auto-save functionality
- Error handling has one inconsistency in pageService (line 254)

### 🎯 Actual Development Needs:

1. Write comprehensive tests for existing functionality (critical)
2. Build PageTree UI component for sidebar
3. Implement page switching/navigation
4. Add create/rename/delete UI operations
5. Enable drag-and-drop reordering

The backend is production-ready but lacks tests. The frontend has solid infrastructure but needs the UI layer built.
