# User Stories - Page Management

_Extracted from AI System Prompt Files/01-Core/User Stories.md_

## Pages & File Tree

### 1. **Creating and deleting pages**

> User Story:
>
> As a user, I want to create and delete pages, so that I can build and manage my workspace content.

Acceptance Criteria:

- There is a button in the sidebar to create a new page.
- The new page automatically opens in the editor, ready for typing
- You can right click on a page in the sidebar to bring up a context menu that includes the delete option
- Pages can be deleted with a confirmation prompt.

Priority: High

**Complexity**: Low

---

### 2. Naming & **Renaming pages**

> User Story:
>
> As a user, I want to name and rename pages, so that I can keep my workspace organized and meaningful.

Acceptance Criteria:

- Right clicking on a page in the side bar bring up the popup context menu with the rename option
- Clicking rename will bring up a small floating popup with a field to rename the page
- Pressing enter saves the new name
- Clicking off the popup or pressing escape cancels the action.
- Each page will have its name displayed at the top of its content in the editor
- You can freely type in that name field in the editor to name or rename the page
- The name displayed at the top of the page in the editor is reflected in the sidebar

Priority: Medium

**Complexity**: Low

---

### 3. **Reordering pages and folder pages**

> User Story:
>
> As a user, I want to drag and drop pages and folder pages, so that I can organize my workspace visually.

Acceptance Criteria:

- Pages and folders in the file tree in the sidebar can be reordered by dragging.
- Nesting pages inside folders is supported.
- Visual indicators show valid drop targets.

Priority: Medium

**Complexity**: Medium

---

### 4. **Creating folder pages**

> User Story:
>
> As a user, I want to create folder pages, so that I can group related pages together.

Acceptance Criteria:

- There is a plus button that appears at the right end of a page in the file tree when hovered over that page
- Clicking the plus button turns that page into a folder page if not already
- Clicking the plus button creates a new page nested inside that page within the file tree
- Creating the new page automatically opens it in the editor
- Folder pages can contain pages and other folder pages.

Priority: Medium

**Complexity**: Low

---

### 5. **Sidebar navigation**

> User Story:
>
> As a user, I want a sidebar showing my page structure, so that I can quickly navigate through my workspace.

Acceptance Criteria:

- A collapsible sidebar displays all pages and folder pages, amongst other things like the create page button.
- Clicking a page opens it in the editor.

Priority: High

**Complexity**: Low
