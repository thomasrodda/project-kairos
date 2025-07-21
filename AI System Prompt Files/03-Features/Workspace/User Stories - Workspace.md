# User Stories - Workspace

Workspace management, multi-workspace support, and workspace-related UI patterns for Project Kairos. This includes creating and switching between workspaces, keyboard navigation patterns, and future internal linking features.

## General Actions

### 1. **Approving an Action**

> User Story:
>
> As a user, I want to press "Enter" to approve an action such as applying formatting or renaming a page, so that I can more effectively and consistently use the application.

Acceptance Criteria:

- [x] Pressing "Enter" when performing an action like formatting a block, approves and applies the action
- [x] This should be a consistent UX design feature across the app
- [x] Works in WorkspaceSelector for creating new workspaces
- [x] Works in PageTreeItem for confirming page renames

Notes:

- This has been implemented so far but I'm not sure if there is any code that has been made reusable or if we are rewriting it every time.

Priority: High

**Complexity**: Low

**Status**: Complete

**Dependencies**: None

**Components**:

- `apps/web/src/components/WorkspaceSelector/WorkspaceSelector.tsx`
- `apps/web/src/components/PageTree/PageTreeItem.tsx`
- All form/dialog components

---

### 2. **Cancelling an Action**

> User Story:
>
> As a user, I want to press "Esc" or click off a feature to cancel an action such as applying formatting or renaming a page, so that I can more effectively and consistently use the application.

Acceptance Criteria:

- [x] Pressing "Esc" when performing an action like formatting a block, cancels and closes the action
- [x] Clicking off a popup or feature, cancels and closes the action
- [x] This should be a consistent UX design feature across the app
- [x] useDismiss hook provides consistent implementation
- [x] Works across all popups and dialogs

Notes:

- The `useDismiss` hook provides a consistent implementation pattern
- Can we make sure that this useDismiss hook is actually being used and is properly documented
- Click-outside detection uses event delegation for performance
- Escape key handling is properly cleaned up to avoid memory leaks
- Tested across WorkspaceSelector, PageTreeItem, SlashCommandMenu, and FormattingToolbar

Priority: High

**Complexity**: Low

**Status**: Complete

**Dependencies**:

- `apps/web/src/hooks/useDismiss.ts` hook

**Components**:

- `apps/web/src/components/WorkspaceSelector/WorkspaceSelector.tsx`
- `apps/web/src/components/PageTree/PageTreeItem.tsx`
- `apps/web/src/components/Editor/SlashCommandMenu/SlashCommandMenu.tsx`
- `apps/web/src/components/Editor/FormattingToolbar/FormattingToolbar.tsx`
- All popup/dialog components

---

## Workspace Management

### 1. **Multiple workspaces per user**

> User Story:
>
> As a user, I want to create and switch between multiple workspaces, so that I can separate projects.

Acceptance Criteria:

- [x] Clicking the workspace dropdown opens the list of existing workspaces for that user, as well as the option to create a new one.
- [x] Users can create named workspaces
- [x] Each new workspace gets a default "Getting Started" page
- [x] The "Getting Started" pages are created with a single empty default block
- [ ] The empty default block has placeholder text that says "Start typing..."
- [x] Switching workspace changes the content shown in the editor and file tree
- [x] URL updates to reflect current workspace (`/workspace/:workspaceId/page/:pageId`)
- [x] Workspace names are unique per user

Notes:

- Workspaces are soft-deleted to preserve data integrity - not sure what this means
- Each workspace has a unique ID and belongs to a specific user
- Workspace names must be unique per user
- The displayed URL is a bit messy, not a huge issue

Priority: Medium

**Complexity**: Medium

**Status**: In Progress

**Dependencies**:

- Firebase Authentication
- PostgreSQL database
- Prisma ORM

**Components**:

- `apps/web/src/contexts/WorkspaceContext.tsx` - Centralized workspace state management
- `apps/web/src/components/WorkspaceSelector/WorkspaceSelector.tsx` - Dropdown UI in sidebar
- `apps/web/src/components/Workspace/Workspace.tsx` - Main layout container
- `apps/web/src/services/api/workspaces.ts` - Frontend API client
- `apps/api/workspaces.ts` - Backend serverless function

---

### 2. **Cloud autosave**

> User Story:
>
> As a user, I want my work to be saved automatically in the cloud, so that I never lose progress.

Acceptance Criteria:

- [x] Changes are saved after 1 second of user inactivity, as well as periodically
- [x] Save status indicator shows progress ("All changes saved" or "Unsaved changes")
- [x] Data persists across sessions
- [x] Failed saves are retried automatically
- [x] Block creations, deletions and reorders are properly persisted
- [x] Content creations, deletions and formattings are properly persisted

Notes:

- Auto-save debounced to prevent excessive API calls
- Save status indicator shows at top center of editor
- Handles network failures with retry logic
- Blocks are soft-deleted to allow recovery
- Block deletion persistence bug fixed January 17, 2025
- Currently not saved to the cloud, using local host for development

Priority: High

**Complexity**: Medium

**Status**: Complete

**Dependencies**:

- PostgreSQL database
- API endpoints for pages and blocks

**Components**:

- `apps/web/src/hooks/useAutoSave.ts` - Auto-save hook with debouncing
- `apps/web/src/components/Editor/SaveStatusIndicator/SaveStatusIndicator.tsx`
- API endpoints: `/api/pages/*/blocks/autosave`

---

## Internal Linking

### 1. **Auto-generating backlinks**

> User Story:
>
> As a user, I want to see which pages link to the current one, so that I can understand connections in my workspace.

Acceptance Criteria:

- [ ] The app has a "Backlinks" panel on the right showing all pages that link to the current page displayed in the editor
- [ ] You open the backlinks panel by clicking a button in the top right of the editor
- [ ] Backlinks are clickable and navigate to the linking page
- [ ] Backlinks update in real-time as links are added or removed
- [ ] Shows preview text around the link for context
- [ ] Groups multiple links from the same page

Notes:

- Requires parsing block content for internal links
- Should update in real-time as links are added/removed
- Consider performance impact of real-time parsing
- May need to index links for efficient querying
- Could use a separate links table in database for performance

Priority: Medium

**Complexity**: Medium

**Status**: 📋 TODO

**Dependencies**:

- Internal linking system (must be implemented first)
- Page content parsing for link detection
- Real-time update mechanism

**Components**:

- BacklinksPanel (to be created)
- Link detection utilities (to be created)
- API endpoints for link tracking (to be created)

---

### 2. **Auto linking** (optional)

> User Story:
>
> As a user, it would be helpful if the app created automatic links when I type the name of a page, so that I don't have to create them myself.

Acceptance Criteria:

- [ ] Button in the backlinks panel finds and suggests auto links to pages
- [ ] Clicking the button shows results of possible links with context
- [ ] User can 'Link All' or approve individual link suggestions
- [ ] Approved links apply @mention formatting to those instances
- [ ] System avoids suggesting links for common words
- [ ] Suggestions are ranked by relevance

Notes:

- Smart suggestion system to avoid over-linking
- User must explicitly approve suggested links
- Consider using fuzzy matching for page name variations
- Performance considerations for large workspaces
- Could cache page name index for efficiency

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
- Link suggestion algorithm (to be created)
- @mention rendering system (to be created)

---

### 3. **Workspace Creation with Templates**

> User Story:
>
> As a user, I want to choose a template when creating a new workspace, so that I can start with a structure optimized for my use case.

Acceptance Criteria:

- [ ] Clicking "Create New Workspace" navigates to a dedicated creation screen
- [ ] Creation screen shows 3-4 template cards: Game Master, Novelist, Script Writer, Blank Slate
- [ ] Each template card has a description of what it includes
- [ ] Selecting a template pre-configures the workspace with relevant page types
- [ ] Game Master template starts with block-based pages
- [ ] Novelist template starts with prose editor pages
- [ ] Script Writer template starts with script-formatted pages
- [ ] Blank Slate allows manual configuration
- [ ] User can still name their workspace regardless of template

Notes:

- Need to consider if this is doable or too complicated
- Different templates optimize for different writing workflows
- Templates set default page types but users can change them later
- Page types (block-based, prose, script) are configured per-page, not per-workspace
- Templates just set the initial default for new pages
- Consider allowing custom templates in the future
- UI should make it clear what each template provides

Priority: High

**Complexity**: High

**Status**: 📋 TODO

**Dependencies**:

- Page Type system (see Editor stories - needs to be added)
- New workspace creation UI screen
- Template configuration system

**Components**:

- WorkspaceCreationWizard (to be created)
- Template selection UI (to be created)
- Template configuration (to be created)

---

### 4. **Workspace Renaming**

> User Story:
>
> As a user, I want to rename my workspaces, so that I can better organize my projects as they evolve.

Acceptance Criteria:

- [ ] In the workspace dropdown, the checkmark icon is replaced with an options/ellipsis icon
- [ ] Clicking the options icon shows a menu with "Rename" option
- [ ] Selecting "Rename" enables inline editing of the workspace name
- [ ] Press Enter to save, Escape or click off to cancel
- [ ] Workspace names must remain unique per user
- [ ] Also accessible via Settings button in sidebar

Notes:

- Backend functionality already exists, needs UI implementation
- Should follow same inline editing pattern as page renaming
- Consider adding other options to the menu (delete, duplicate, export)

Priority: Medium

**Complexity**: Low

**Status**: 🔄 Partially Complete (backend exists, UI needed)

**Dependencies**:

- Existing workspace update API

**Components**:

- WorkspaceSelector updates needed
- Settings page (to be created)

---

### 5. **Global Workspace Search**

> User Story:
>
> As a user, I want to search across all pages in my workspace, so that I can quickly find content regardless of which page it's on.

Acceptance Criteria:

- [ ] Search input accessible via keyboard shortcut (Ctrl/Cmd+K)
- [ ] Search shows recent pages by default
- [ ] Search filters results in real-time as user types
- [ ] Results show page names first (exact and fuzzy matches)
- [ ] After page results, show content snippets with search term highlighted
- [ ] Each result shows the page it belongs to
- [ ] Clicking a result navigates to that page (and scrolls to content if applicable)
- [ ] Search works across all text content including formatted text

Notes:

- Performance is critical - consider indexing strategy
- Should search both page titles and block content
- Future: could add filters (by page type, date, etc.)

Priority: High

**Complexity**: Medium

**Status**: 📋 TODO

**Dependencies**:

- Search indexing system
- API endpoint for cross-page search

**Components**:

- GlobalSearch (to be created)
- Search results UI (to be created)
- Search API endpoints (to be created)

---

### 6. **Remember Last Workspace**

> User Story:
>
> As a user, I want the app to remember which workspace I was using, so that I can continue where I left off when I return.

Acceptance Criteria:

- [ ] App remembers the last active workspace per device
- [ ] On login, user is taken directly to their last workspace
- [ ] If last workspace was deleted, fall back to first available workspace
- [ ] If no workspaces exist, show workspace creation screen
- [ ] Memory is device-specific (different on laptop vs phone)

Notes:

- Use localStorage for device-specific memory
- Consider syncing last workspace to user preferences in future

Priority: Medium

**Complexity**: Low

**Status**: 📋 TODO

**Dependencies**:

- LocalStorage or similar client-side storage

**Components**:

- WorkspaceContext updates
- Login flow updates

---

### 7. **Export Workspace**

> User Story:
>
> As a user, I want to export my entire workspace, so that I can backup my work or share it with others.

Acceptance Criteria:

- [ ] Export option available in workspace settings/options menu
- [ ] Exports all pages in the workspace as markdown files
- [ ] Maintains folder structure in a zip file
- [ ] Includes metadata (creation dates, workspace name)
- [ ] Shows progress indicator for large workspaces
- [ ] Also support individual page export

Notes:

- Not required for MVP but important for user confidence
- Markdown format ensures portability
- Consider other formats in future (PDF, DOCX)

Priority: Medium

**Complexity**: Medium

**Status**: 📋 TODO (Post-MVP)

**Dependencies**:

- Export system
- Markdown conversion utilities
- File packaging system

**Components**:

- ExportDialog (to be created)
- Export utilities (to be created)
- Export API endpoints (to be created)

---

## Additional Workspace Features (Future)

### 8. **Workspace Settings**

> User Story:
>
> As a user, I want to customize settings for each workspace, so that I can configure them for different purposes.

Acceptance Criteria:

- [ ] Each workspace has its own settings page
- [ ] Settings include: workspace name, default page settings, sharing options
- [ ] Changes to settings are saved automatically
- [ ] Settings are workspace-specific, not global

Notes:

- Consider what settings make sense at workspace vs global level
- May include theme preferences, export settings, etc.

Priority: Low

**Complexity**: Medium

**Status**: 📋 TODO (Future)

**Dependencies**:

- Settings infrastructure
- Per-workspace configuration storage

**Components**:

- WorkspaceSettings (to be created)
- Settings API endpoints (to be created)

---

### 9. **Workspace Sharing** (Future)

> User Story:
>
> As a user, I want to share workspaces with other users, so that I can collaborate on projects.

Acceptance Criteria:

- [ ] Users can invite others via email to a workspace
- [ ] Different permission levels (view, edit, admin)
- [ ] Shared workspaces appear in user's workspace list
- [ ] Real-time collaboration when multiple users are editing

Notes:

- Future optional feature. Ignore for now.
- Complex feature requiring permissions system
- Consider real-time sync infrastructure
- Security implications for shared data

Priority: Low

**Complexity**: Very High

**Status**: 📋 TODO (Future)

**Dependencies**:

- Permission system
- Real-time collaboration infrastructure
- Invitation system

**Components**:

- Sharing UI (to be created)
- Permission management (to be created)
- Real-time sync (to be created)

---

## Cross-References

### Related User Stories in Other Documents:

- **Editor/Page Types**: Different editor modes (block-based, prose, script) should be documented in Editor stories
- **Page Management**: Individual page export functionality relates to workspace export
- **Authentication**: Workspace access and permissions tie into auth system

### Implementation Notes:

- The workspace system is largely complete for basic functionality
- Major upcoming work involves templates and search functionality
- Export functionality is important for user trust but not MVP critical
