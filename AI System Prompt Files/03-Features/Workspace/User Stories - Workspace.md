# User Stories - Workspace

_Extracted from AI System Prompt Files/01-Core/User Stories.md_

## General Actions

### 1. Approving an Action

> User Story:
>
> As a user, I want to press "Enter" to approve an action such as applying formatting or renaming a page, so that I can more effectively and consistently use the application.

Acceptance Criteria:

- Pressing "Enter" when performing an action like formatting a block, approves and applies the action.
- This should be a consistent UX design feature across the app

Priority: High

**Complexity**: Low

---

### 2. Cancelling an Action

> User Story:
>
> As a user, I want to press "Esc" or click off a feature to cancel an action such as applying formatting or renaming a page, so that I can more effectively and consistently use the application.

Acceptance Criteria:

- Pressing "Esc" when performing an action like formatting a block, cancels and closes the action.
- Clicking off a popup or feature, cancels and closes the action.
- This should be a consistent UX design feature across the app

Priority: High

**Complexity**: Low

---

## Workspace & Sync

### 2. **Multiple workspaces per user**

> User Story:
>
> As a user, I want to create and switch between multiple workspaces, so that I can separate projects.

Acceptance Criteria:

- Users can create named workspaces.
- Workspace list is accessible from a menu at the top of the sidebar.
- Switching changes the content shown in the editor and file tree.

Priority: Medium

**Complexity**: Medium

---

### 3. **Cloud autosave**

> User Story:
>
> As a user, I want my work to be saved automatically in the cloud, so that I never lose progress.

Acceptance Criteria:

- Changes are saved in real-time or every few seconds.
- Save status indicator shows progress.
- Data persists across sessions.

Priority: High

**Complexity**: Medium

---

## Internal Linking

### 2. **Auto-generating backlinks**

> User Story:
>
> As a user, I want to see which pages link to the current one, so that I can understand connections in my workspace.

Acceptance Criteria:

- The app has a "Backlinks" panel on the right showing all pages that link to the current page displayed in the editor.
- Backlinks are clickable and update in real-time as links are added or removed.

Priority: Medium

**Complexity**: Medium

---

### 3. Auto linking (optional)

> User Story:
>
> As a user, it would be helpful if the app created automatic links when I type the name of a page, so that I don't have to create them myself.

Acceptance Criteria:

- Autolinking while typing may present issues, especially if you have a page with common word for a name, this would fill the page with unwanted links
- Instead we could have a button in the backlinks panel that finds and suggests auto links to pages with names that have been typed in the currently displayed page.
- Clicking this button would show results of possible links
- The user would have the option to 'Link All' or approve individual link suggestions
- Approving links would then apply a @mention to those instances

Priority: Low (MVP optional)

**Complexity**: High
