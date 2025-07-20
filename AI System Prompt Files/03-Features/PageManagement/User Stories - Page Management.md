# User Stories - Page Management

This document outlines user stories for page management features in Project Kairos, including creating, organizing, and navigating pages within workspaces. These stories focus on the file tree functionality in the sidebar and page-related operations.

_Extracted from AI System Prompt Files/01-Core/User Stories.md_

## Pages & File Tree

### 1. **Creating and deleting pages**

> User Story:
>
> As a user, I want to create and delete pages, so that I can build and manage my workspace content.

Acceptance Criteria:

- [x] There is a button in the sidebar to create a new page.
- [x] The new page automatically opens in the editor, ready for typing
- [x] You can right click on a page in the sidebar to bring up a context menu that includes the delete option
- [x] Pages can be deleted with a confirmation prompt.

Notes:

- _No additional notes yet_

Priority: High

**Complexity**: Low

**Status**: ✅ Complete

**Dependencies**:

- WorkspaceContext for workspace management
- PagesContext for page state management
- Authentication system for user identification

**Components**:

- `PageTree` - Displays hierarchical page structure
- `PageTreeItem` - Individual page item with context menu
- `PagesContext` - State management for pages
- Backend API endpoints for page CRUD operations

---

### 2. Naming & **Renaming pages**

> User Story:
>
> As a user, I want to name and rename pages, so that I can keep my workspace organized and meaningful.

Acceptance Criteria:

- [x] Right clicking on a page in the side bar bring up the popup context menu with the rename option
- [x] Clicking rename will bring up a small floating popup with a field to rename the page
- [x] Pressing enter saves the new name
- [x] Clicking off the popup or pressing escape cancels the action.
- [x] Each page will have its name displayed at the top of its content in the editor
- [x] You can freely type in that name field in the editor to name or rename the page
- [x] The name displayed at the top of the page in the editor is reflected in the sidebar

Notes:

- _No additional notes yet_

Priority: Medium

**Complexity**: Low

**Status**: ✅ Complete

**Dependencies**:

- PagesContext for page state management
- Real-time synchronization between editor and sidebar
- Auto-save functionality for persistence

**Components**:

- `PageTreeItem` - Inline editing functionality
- `PageTitle` - Editable page title in editor
- `EditorContext` - Manages page title state
- Real-time sync system for immediate UI updates

---

### 3. **Reordering pages and folder pages**

> User Story:
>
> As a user, I want to drag and drop pages and folder pages, so that I can organize my workspace visually.

Acceptance Criteria:

- [ ] Pages and folders in the file tree in the sidebar can be reordered by dragging.
- [ ] Nesting pages inside folders is supported.
- [ ] Visual indicators show valid drop targets.

Notes:

- _No additional notes yet_

Priority: Medium

**Complexity**: Medium

**Status**: 🔄 Not Started

**Dependencies**:

- @dnd-kit library for drag and drop functionality
- PagesContext for hierarchical page management
- Backend support for parent-child relationships

**Components**:

- `PageTree` - Needs drag and drop support
- `PageTreeItem` - Draggable wrapper needed
- Backend API for updating page order and nesting

---

### 4. **Creating folder pages**

> User Story:
>
> As a user, I want to create folder pages, so that I can group related pages together.

Acceptance Criteria:

- [ ] There is a plus button that appears at the right end of a page in the file tree when hovered over that page
- [ ] Clicking the plus button turns that page into a folder page if not already
- [ ] Clicking the plus button creates a new page nested inside that page within the file tree
- [ ] Creating the new page automatically opens it in the editor
- [x] Folder pages can contain pages and other folder pages.

Notes:

- _No additional notes yet_

Priority: Medium

**Complexity**: Low

**Status**: 🚧 Partially Complete (backend supports folders, UI needs hover actions)

**Dependencies**:

- PagesContext for hierarchical structure
- Hover state management in PageTreeItem
- Backend already supports isFolder flag

**Components**:

- `PageTreeItem` - Add hover state and plus button
- `PagesContext` - Already supports folder creation
- Backend API - Folder support exists

---

### 5. **Sidebar navigation**

> User Story:
>
> As a user, I want a sidebar showing my page structure, so that I can quickly navigate through my workspace.

Acceptance Criteria:

- [x] A collapsible sidebar displays all pages and folder pages, amongst other things like the create page button.
- [x] Clicking a page opens it in the editor.

Notes:

- _No additional notes yet_

Priority: High

**Complexity**: Low

**Status**: ✅ Complete

**Dependencies**:

- React Router for navigation
- PagesContext for page state
- WorkspaceContext for workspace selection

**Components**:

- `Sidebar` - Main container with collapsible functionality
- `PageTree` - Hierarchical page display
- `PageTreeItem` - Clickable page items
- URL-based routing system
