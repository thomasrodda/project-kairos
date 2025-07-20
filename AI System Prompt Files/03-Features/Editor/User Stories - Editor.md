# User Stories - Editor

_Extracted from AI System Prompt Files/01-Core/User Stories.md_

## Block Based Text Editor

### 1. **Typing and creating blocks**

> User Story:
>
> As a user, I want to press "Enter" to create a new text block, so that I can write my content one section at a time.

Acceptance Criteria:

- Pressing "Enter" splits the current block and creates a new one below.
- The new block is focused and ready for typing.
- The new block defaults to Body type, unless we are continuing something like a bullet point list.

Priority: High

**Complexity**: Low

---

### 2. **Changing block type via slash command**

> User Story:
>
> As a user, I want to type "/" to open a block menu, so that I can change a block into a heading, list, or other type.

Acceptance Criteria:

- Typing "/" at the start of a block opens a floating menu.
- Typing " /" inside a block that may already have content opens the floating menu.
- Menu shows options like Heading 1, Heading 2, Bullet List, Paragraph.
- Selecting an option changes the block format.
- You can select an option using mouse or arrow keys and enter.
- The top option is automatically highlighted.
- Pressing enter will apply the highlighted option.
- There will be a search box that is automatically focused when the popup is triggered.
- Typing in the search box filters the formatting options in real time.
- Clicking off the popup or pressing escape closes it.

Priority: High

**Complexity**: Medium

---

### 2b. **Markdown compatibility for block formatting**

> User Story:
>
> As a user, I want to type markdown syntax and have it automatically format blocks, and I want to copy/paste markdown content seamlessly between the app and other markdown-compatible applications.

Acceptance Criteria:

**Typing markdown syntax:**

- Typing "# " at the start of a block automatically converts it to Heading 1 format but preserves the "# " characters in the content.
- Typing "## " at the start of a block automatically converts it to Heading 2 format but preserves the "## " characters in the content.
- Typing "- " or "\* " at the start of a block automatically converts it to a Bullet List item but preserves the markdown characters.
- The visual formatting changes immediately after typing the space character following the markdown syntax.
- The block displays with proper heading/list styling while maintaining the underlying markdown syntax.

**Pasting markdown content:**

- When pasting text that contains markdown syntax (like "# Heading" or "- List item"), the app automatically creates properly formatted blocks.
- Each markdown element becomes a separate block with the appropriate type and formatting.
- The original markdown syntax is preserved in the content.

**Copying formatted content:**

- When copying blocks from the app, the copied text includes the proper markdown syntax.
- Pasting this copied content into other markdown-compatible applications (like GitHub, Notion, etc.) displays correctly with formatting.
- Multiple blocks are copied as properly formatted markdown with appropriate line breaks.

Priority: High

**Complexity**: Medium-High

---

### 4. **Reordering blocks**

> User Story:
>
> As a user, I want to drag and drop blocks, so that I can rearrange my content easily.

Acceptance Criteria:

- Each block has a drag handle on the left that appears when the block is hovered over.
- Clicking, holding and dragging the handle will begin to move the block.
- You can click in empty space and drag over blocks to select multiple blocks for deletion.
- Blocks can be clicked and dragged vertically.
- A coloured line appears between blocks to indicate the location where the dragged block will be dropped.
- This line only appears where the dragged block is hovered over.
- Dropping moves the block to the new position.

Priority: Medium

**Complexity**: Medium–High

---

### 5. **Undo/redo support**

> User Story:
>
> As a user, I want to undo and redo my changes, so that I can easily fix mistakes.

Acceptance Criteria:

- Cmd/Ctrl+Z undoes the last action.
- Cmd/Ctrl+Shift+Z or Y redoes it.
- Actions like typing, formatting, and moving blocks are tracked.

Priority: Medium

**Complexity**: Medium

---

### 6. **Deleting a block**

> User Story:
>
> As a user, I want to delete a block, so that I can remove unwanted content.

Acceptance Criteria:

- Pressing backspace in an empty block deletes it and focuses the previous block.
- Clicking on the drag handle highlights the block. Pressing delete removes the highlighted block.
- You can click in empty space and drag over blocks to select multiple blocks for deletion.
- There's no confirmation for deleting empty blocks.

Priority: Medium

**Complexity**: Low

---

### 7. Copy/Paste **support**

> User Story:
>
> As a user, I want to copy and paste blocks, so that I can produce content more quickly.

Acceptance Criteria:

- Cmd/Ctrl+C copies the selected block(s) or text
- Cmd/Ctrl+V pastes the selected block(s) in the next space below the block with the cursor
- Cmd/Ctrl+V pastes the selected text at the cursor location inside the block

Priority: Medium

**Complexity**: Medium
