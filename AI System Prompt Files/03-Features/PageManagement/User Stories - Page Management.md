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
- [ ] The new page automatically opens in the editor, ready for typing
- [x] You can right click on a page in the sidebar to bring up a context menu that includes the delete option
- [x] Pages can be deleted with a confirmation prompt.

Notes:

- The newly created page is not automatically selected and displayed in the editor
- When clicking create page, a field appears in the sidebar below the other pages. I would prefer if instead a new page was auto created and displayed in the editor, with the default name of 'New Page'.
- When a new page is created, the page title should display the placeholder name of 'New Page' styled with placeholder colour
- When a new page is creaed, the page title should be auto focused, ready for the user to rename it.
- The right click context menu options need their styling improved.

Priority: High

**Complexity**: Low

**Status**: In Progress

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
- [x] Clicking rename in the sidebar context menu will make the displayed name in the sidebar into an editable field
- [x] Pressing enter saves the new name
- [x] Clicking off the field or pressing escape cancels the action.
- [x] Each page will have its name displayed at the top of its content in the editor
- [x] You can freely type in that name field in the editor to name or rename the page
- [x] The name displayed at the top of the page in the editor is reflected in the sidebar in real time

Notes:

- The styling for the sidebar rename field needs work

Priority: Medium

**Complexity**: Low

**Status**: In Progress

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

- [ ] Pages and folders in the file tree in the sidebar can be reordered by clicking and dragging.
- [ ] Nesting pages inside folders is supported.
- [ ] Visual indicators show valid drop targets.

Notes:

- The folder expand/collapse icon needs its rotation changed.
- Consider not having folders and instead having pages that act as databases, like Notion.

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

- Saving file changes of file content inside folders does not work
- Currently creating folders is done with a folder button.
- You can also create sub folders through the right click context menu.
- Content of pages within folders is not being saved.
- Consider not having folders and instead having pages that act as databases, like Notion.

Priority: Medium

**Complexity**: Low

**Status**: In Progress

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
- [x] The page tree scrolls when not tall enough for the page list

Notes:

- _No additional notes yet_

Priority: High

**Complexity**: Low

**Status**: Complete

**Dependencies**:

- React Router for navigation
- PagesContext for page state
- WorkspaceContext for workspace selection

**Components**:

- `Sidebar` - Main container with collapsible functionality
- `PageTree` - Hierarchical page display
- `PageTreeItem` - Clickable page items
- URL-based routing system

---

## Related Documentation

- **[User Stories Guide](../../01-Core/User Stories Guide.md)** - How to write and organize user stories
- **[Feature Dependencies](../Feature Dependencies.md)** - How Page Management relates to other features
- **[Component-UserStory-Mapping](../Component-UserStory-Mapping.md)** - Component usage across features
- **[Current State](../../01-Core/Current State.md)** - Current implementation status of page features
