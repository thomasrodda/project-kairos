# User Stories - Workspace

_Workspace management, multi-workspace support, and workspace-related UI patterns for Project Kairos_

## General Actions

### 1. Approving an Action

> User Story:
>
> As a user, I want to press "Enter" to approve an action such as applying formatting or renaming a page, so that I can more effectively and consistently use the application.

Acceptance Criteria:

- [ ] Pressing "Enter" when performing an action like formatting a block, approves and applies the action.
- [ ] This should be a consistent UX design feature across the app

Notes:

- _No additional notes yet_

Priority: High

**Complexity**: Low

**Status**: 🔄 Partially Complete

- ✅ Implemented in WorkspaceSelector for creating new workspaces
- ✅ Implemented in inline page rename functionality
- 📋 TODO: Verify implementation across all dialogs and forms

**Dependencies**: None

**Components**:

- `WorkspaceSelector.tsx`
- `PageTreeItem.tsx`
- All form/dialog components

---

### 2. Cancelling an Action

> User Story:
>
> As a user, I want to press "Esc" or click off a feature to cancel an action such as applying formatting or renaming a page, so that I can more effectively and consistently use the application.

Acceptance Criteria:

- [ ] Pressing "Esc" when performing an action like formatting a block, cancels and closes the action.
- [ ] Clicking off a popup or feature, cancels and closes the action.
- [ ] This should be a consistent UX design feature across the app

Notes:

- _No additional notes yet_

Priority: High

**Complexity**: Low

**Status**: 🔄 Partially Complete

- ✅ Implemented in WorkspaceSelector for canceling workspace creation
- ✅ Implemented in inline page rename functionality
- ✅ useDismiss hook created for consistent behavior
- 📋 TODO: Verify implementation across all dialogs and popups

**Dependencies**:

- `useDismiss` hook

**Components**:

- `WorkspaceSelector.tsx`
- `PageTreeItem.tsx`
- `SlashCommandMenu.tsx`
- `FormattingToolbar.tsx`
- All popup/dialog components

---

## Workspace & Sync

### 2. **Multiple workspaces per user**

> User Story:
>
> As a user, I want to create and switch between multiple workspaces, so that I can separate projects.

Acceptance Criteria:

- [x] Users can create named workspaces.
- [x] Workspace list is accessible from a menu at the top of the sidebar.
- [x] Switching changes the content shown in the editor and file tree.

Notes:

- _No additional notes yet_

Priority: Medium

**Complexity**: Medium

**Status**: ✅ Complete (Phase 4.2)

**Dependencies**:

- Firebase Authentication
- PostgreSQL database
- Prisma ORM

**Components**:

- `WorkspaceContext.tsx` - Centralized workspace state management
- `WorkspaceSelector.tsx` - Dropdown UI in sidebar
- `WorkspaceProvider.tsx` - Context provider
- API endpoints: `/api/workspaces/*`

---

### 3. **Cloud autosave**

> User Story:
>
> As a user, I want my work to be saved automatically in the cloud, so that I never lose progress.

Acceptance Criteria:

- [x] Changes are saved in real-time or every few seconds.
- [x] Save status indicator shows progress.
- [x] Data persists across sessions.

Notes:

- _No additional notes yet_

Priority: High

**Complexity**: Medium

**Status**: ✅ Complete (Phase 1)

**Dependencies**:

- PostgreSQL database
- API endpoints for pages and blocks

**Components**:

- `useAutoSave` hook
- `SaveStatusIndicator.tsx`
- API endpoints: `/api/pages/*/blocks/autosave`

---

## Internal Linking

### 2. **Auto-generating backlinks**

> User Story:
>
> As a user, I want to see which pages link to the current one, so that I can understand connections in my workspace.

Acceptance Criteria:

- [ ] The app has a "Backlinks" panel on the right showing all pages that link to the current page displayed in the editor.
- [ ] Backlinks are clickable and update in real-time as links are added or removed.

Notes:

- _No additional notes yet_

Priority: Medium

**Complexity**: Medium

**Status**: 📋 TODO

**Dependencies**:

- Internal linking system (must be implemented first)
- Page content parsing for link detection
- Real-time update mechanism

**Components**:

- BacklinksPanel (to be created)
- Link detection utilities
- API endpoints for link tracking

---

### 3. Auto linking (optional)

> User Story:
>
> As a user, it would be helpful if the app created automatic links when I type the name of a page, so that I don't have to create them myself.

Acceptance Criteria:

- [ ] Autolinking while typing may present issues, especially if you have a page with common word for a name, this would fill the page with unwanted links
- [ ] Instead we could have a button in the backlinks panel that finds and suggests auto links to pages with names that have been typed in the currently displayed page.
- [ ] Clicking this button would show results of possible links
- [ ] The user would have the option to 'Link All' or approve individual link suggestions
- [ ] Approving links would then apply a @mention to those instances

Notes:

- _No additional notes yet_

Priority: Low (MVP optional)

**Complexity**: High

**Status**: 📋 TODO (Optional)

**Dependencies**:

- Internal linking system
- Backlinks panel
- Page name index for efficient searching
- @mention system implementation

**Components**:

- AutoLinkSuggestions (to be created)
- Link suggestion algorithm
- @mention rendering system
