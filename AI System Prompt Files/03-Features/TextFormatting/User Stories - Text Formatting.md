# User Stories - Text Formatting

_Extracted from AI System Prompt Files/01-Core/User Stories.md_

## Block Based Text Editor

### 3. **Basic formatting with toolbar**

> User Story:
>
> As a user, I want to highlight text and apply formatting, so that I can style my writing (e.g., bold, italic, link).

Acceptance Criteria:

- Highlighting text shows a floating formatting popup above the highlighted text.
- Popup includes options: Bold, Italic, Underline. More options to come in the future.
- Clicking an option applies formatting to the selection.
- Clicking off of the popup or pressing escape closes the popup.

Priority: High

**Complexity**: Medium

---

## Internal Linking

### 1. **@-mention to link to another page**

> User Story:
>
> As a user, I want to type "@" to search and link to other pages, so that I can quickly reference related content.

Acceptance Criteria:

- Typing "@" opens a floating popup search menu of existing pages.
- Selecting a result inserts a link to that page.
- The results can be filtered by typing and searched through with the mouse or arrow keys in the same was as the block formatting for example
- The link is clickable and navigates to the target page.
- The link is the name of the page with a faint highlight colour to indicate it's a link
- When hovered over, the link also gains a underline

Priority: High

**Complexity**: Medium
