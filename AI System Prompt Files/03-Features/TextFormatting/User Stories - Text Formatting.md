# User Stories - Text Formatting

User stories for text formatting features in the block-based editor, including rich text formatting toolbar and internal linking capabilities.

## Block Based Text Editor

### 3. **Basic formatting with toolbar**

> User Story:
>
> As a user, I want to highlight text and apply formatting, so that I can style my writing (e.g., bold, italic, link).

**Status**: ✅ Complete

**Dependencies**:

- EditorContext for state management
- Text selection utilities
- Formatting renderer

**Components**:

- `FormattingToolbar/` - Floating toolbar component
- `utils/textFormatting.ts` - Core formatting logic
- `utils/formattingRenderer.tsx` - Renders formatted text

**Acceptance Criteria:**

- [x] Highlighting text shows a floating formatting popup above the highlighted text
- [x] Popup includes options: Bold, Italic, Underline
- [x] Clicking an option applies formatting to the selection
- [x] Clicking off of the popup or pressing escape closes the popup
- [x] Keyboard shortcuts work (Ctrl/Cmd+B/I/U)
- [x] Link formatting supported (Ctrl/Cmd+K)
- [x] Formatting persists to database

**Notes:**

- _No additional notes yet_

**Priority**: High

**Complexity**: Medium

---

## Internal Linking

### 1. **@-mention to link to another page**

> User Story:
>
> As a user, I want to type "@" to search and link to other pages, so that I can quickly reference related content.

**Status**: 🔄 Not Started

**Dependencies**:

- Page search functionality
- PagesContext for page list
- Floating menu component (similar to SlashCommandMenu)
- Link formatting system

**Components**:

- `MentionMenu/` - To be created
- Integration with existing link formatting
- Page search/filter utilities

**Acceptance Criteria:**

- [ ] Typing "@" opens a floating popup search menu of existing pages
- [ ] Selecting a result inserts a link to that page
- [ ] The results can be filtered by typing and searched through with the mouse or arrow keys (similar to slash commands)
- [ ] The link is clickable and navigates to the target page
- [ ] The link is the name of the page with a faint highlight color to indicate it's a link
- [ ] When hovered over, the link also gains an underline

**Notes:**

- _No additional notes yet_

**Priority**: High

**Complexity**: Medium
