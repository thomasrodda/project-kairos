# User Stories - Editor

This document contains user stories for the block-based text editor, including text formatting and internal linking features, which comprise the core editing experience in Project Kairos.

## Block Based Text Editor

### 1. **Typing and creating blocks**

> User Story:
>
> As a user, I want to press "Enter" to create a new text block, so that I can write my content one section at a time.

Acceptance Criteria:

- [x] Pressing "Enter" splits the current block at the cursor location and creates a new one below.
- [x] The new block is focused and ready for typing with the cursor at the start of the new block.
- [ ] The new block defaults to Body type, unless we are continuing a list type block.
- [x] Cursor position is preserved when splitting mid-text.
- [x] Empty blocks are created when pressing Enter at the end of a block.
- [ ] Pressing Enter at the start of a block creates an empty block above.
- [ ] Empty blocks that have the cursor in them display placegholder text that you can't interact with
- [x] The placeholder text disappears when the block has content in it.

Notes:

- Pressing enter at the start of a block moves the content of the block down into a new block and therefore changes it's block type. In this case, it should not change the block type. The block above should be body type, but the block below should maintain its type
- Pressing enter on a list block does not create another list, it just creates a body type
- The placeholder text displays at the right time but it can sometimes be interacted with.
- I have experienced occasional bugs with typing that seemed to be related to either the placeholder text or trying to delete the last block. This resulted in typing text that I couldn't see until I created a new block, as well as the typing backwards bug.

Priority: High

**Complexity**: Low

**Status**: In Progress

**Dependencies**: None

**Components**:

- `apps/web/src/components/Editor/EditorContent.tsx` - Handles Enter key events
- `apps/web/src/contexts/EditorContext.tsx` - ADD_BLOCK action
- `apps/web/src/utils/blockUtils.ts` - createBlock() function

---

### 2. **Changing block type via slash command**

> User Story:
>
> As a user, I want to type "/" to open a block menu, so that I can change a block into a heading, list, or other type.

Acceptance Criteria:

- [x] Typing "/" at the start of a block opens a floating menu.
- [x] Typing " /" inside a block that may already have content opens the floating menu.
- [x] Menu shows options like Heading 1, Heading 2, Bullet List, Paragraph. Displayed in a scrollable list.
- [x] Menu displays above the block where the slash was typed.
- [x] Selecting an option changes the block format.
- [x] You can select an option using mouse or arrow keys and enter.
- [x] The top option is automatically highlighted.
- [x] Pressing enter will apply the highlighted option.
- [x] There will be a search box at the top of the floating menu that is automatically focused when the popup is triggered.
- [x] Typing in the search box filters the formatting options in real time.
- [x] Each time the search is altered, the highlighted option gets reset to the top result.
- [ ] Empty state shows when no pages match the search
- [x] Clicking off the popup or pressing escape closes it and no block type change takes place, cancelling the operation.
- [ ] Cancelling the operation should reinsert the typed "/" or " /" where it was typed.

Notes:

- Typing "/" directly after content in a block moves the cursor back to the start of the block. This should just type a "/" without triggering the menu. - Edit: I can no longer reproduce this. Let's look into it.

Priority: High

**Complexity**: Medium

**Status**: In Progress

**Dependencies**:

- Block creation must be implemented first

**Components**:

- `apps/web/src/components/Editor/SlashCommandMenu/` - Menu component
- `apps/web/src/components/Editor/EditorContent.tsx` - Triggers menu
- `apps/web/src/hooks/useSlashCommands.ts` - Menu logic

---

### 2b. **Markdown compatibility for block formatting**

> User Story:
>
> As a user, I want to type markdown syntax and have it automatically format blocks, and I want to copy/paste markdown content seamlessly between the app and other markdown-compatible applications.

Acceptance Criteria:

**Typing markdown syntax:**

- [x] Typing "# " or other markdown syntax at the start of a block automatically converts it to Heading 1 (or other relevant) and automatically removes the markdown from the block content.
- [x] The visual formatting changes immediately after typing the space character following the markdown syntax.
- [x] The block displays with proper heading/list styling while maintaining the underlying markdown syntax.

**Pasting markdown content:**

- [ ] When pasting text that contains markdown syntax (like "# Heading" or "- List item"), the app automatically creates properly formatted blocks.
- [ ] Each markdown element becomes a separate block with the appropriate type and formatting.
- [ ] The markdown is removed and the blocks are styled accordingly.

**Copying formatted content:**

- [ ] When copying text, the copied text includes the proper markdown syntax that matches the blocks.
- [ ] Pasting this copied content into other markdown-compatible applications (like GitHub, Notion, etc.) displays correctly with markdown formatting.
- [ ] Multiple blocks are copied as properly formatted markdown with appropriate line breaks. There should be a line break between each block that gets copied into the markdown.

Notes:

- Pasting markdown into the app doesn't get formatted unless you readd the space after the markdown, or retype a "\*".
- Each line of markdown does become a separate block, this does include empty lines. Need to make a decision on this.
- Copying text across multiple blocks pastes without markdown and with 13 line breaks between lines where there should be none.

Priority: High

**Complexity**: Medium-High

**Status**: In Progress

**Dependencies**:

- Block creation must be implemented first

**Components**:

- `apps/web/src/components/Editor/EditorContent.tsx` - Markdown detection
- `apps/web/src/utils/markdownUtils.ts` - Markdown parsing logic
- `apps/web/src/contexts/EditorContext.tsx` - Block type changes

---

### 4. **Reordering blocks**

> User Story:
>
> As a user, I want to drag and drop blocks, so that I can rearrange my content easily.

Acceptance Criteria:

- [x] Each block has a drag handle on the left that appears when the block is hovered over.
- [x] Clicking, holding and dragging the handle will begin to move the block.
- [x] You can click in empty space and drag over blocks to select multiple blocks.
- [x] You can then use the drag handle of any selected block to drag and drop the selection.
- [x] Blocks can be clicked and dragged vertically.
- [x] Dropping moves the block(s) to the new position.
- [x] When multiple blocks are selected, dragging any selected block's grab handle moves all selected blocks together.

Notes:

- Drag selection implemented (July 2025) - Click and drag in empty space to create a purple selection box
- Selection box only appears after dragging 5+ pixels to avoid interfering with normal clicks
- Cursor remains as default arrow during selection
- Fixed text selection within blocks (July 24, 2025) - Drag selection now only activates when starting drag outside contentEditable areas
- Multi-block drag and drop implemented (July 24, 2025) - Selected blocks maintain their relative order when dragged together
- Fixed drag selection within editor content (July 24, 2025) - Resolved click event race condition that was clearing selections

Priority: Medium

**Complexity**: Medium–High

**Status**: Completed

**Dependencies**:

- Block creation must be implemented first
- Multi-block selection system

**Components**:

- `apps/web/src/components/Editor/DraggableBlock.tsx` - Drag wrapper
- `apps/web/src/components/Editor/Block.tsx` - Block component with drag handle
- `apps/web/src/contexts/EditorContext.tsx` - MOVE_BLOCK action
- `apps/web/src/hooks/useDragSelection.ts` - Drag selection logic (July 2025)
- `apps/web/src/components/Editor/SelectionBox/` - Visual selection box (July 2025)
- Uses @dnd-kit library for drag functionality

---

### 5. **Undo/redo support**

> User Story:
>
> As a user, I want to undo and redo my changes, so that I can easily fix mistakes.

Acceptance Criteria:

- [ ] Cmd/Ctrl+Z undoes the last action.
- [ ] Cmd/Ctrl+Shift+Z redoes it.
- [ ] Actions like typing, formatting, and moving blocks are tracked.

Notes:

- _No additional notes yet_

Priority: Medium

**Complexity**: Medium

**Status**: Not Started

**Dependencies**:

- Editor state management must be established
- All block operations must be tracked

**Components**: Not yet implemented

**Proposed Implementation**:

- Command pattern for action history
- UndoManager service in `apps/web/src/services/`
- Integration with EditorContext

---

### 6. **Deleting a block**

> User Story:
>
> As a user, I want to delete a block, so that I can remove unwanted content.

Acceptance Criteria:

- [x] Pressing backspace in an empty block deletes it and focuses the previous block.
- [x] Clicking on the drag handle highlights the block. Pressing delete removes the highlighted block.
- [x] You can click in empty space and drag over blocks to select multiple blocks for deletion.
- [x] There's no confirmation for deleting empty blocks but you can undo it.
- [x] Pressing backspace at the start of a block merges it with the previous block.
- [ ] Deleting the last block in a page recreates the default starter block that a new page starts with.

Notes:

- Currently you cannot delete the last block in the page. Which is a solution, but I would rather it deletes and creates the default block.

Priority: Medium

**Complexity**: Low

**Status**: In Progress

**Dependencies**:

- Block creation and selection system

**Components**:

- `apps/web/src/components/Editor/EditorContent.tsx` - Backspace handling
- `apps/web/src/components/Editor/Block.tsx` - Selection UI
- `apps/web/src/contexts/EditorContext.tsx` - DELETE_BLOCK action
- `apps/web/src/hooks/useCrossBlockSelection.ts` - Multi-block selection

---

### 7. **Copy/Paste support**

> User Story:
>
> As a user, I want to copy and paste blocks, so that I can produce content more quickly.

Acceptance Criteria:

- [x] Cmd/Ctrl+C copies the selected block(s) or text
- [ ] Cmd/Ctrl+V pastes the selected block(s) in the next space below the block with the cursor
- [x] Cmd/Ctrl+V pastes the selected text at the cursor location inside the block
- [ ] Formatting is preserved when copying/pasting within Kairos
- [x] Pasting from external sources converts content to Kairos blocks
- [x] Cmd/Ctrl+X cuts the selected block(s)

Notes:

- Basic block copy/paste implemented July 25, 2025
- Current implementation issues:
  - Blocks lose their type when pasted (all become paragraphs)
  - Text formatting (bold, italic, etc.) is not preserved when copying blocks
  - Pasting blocks while focused in a block should create new blocks below, not insert text
- Exports to three clipboard formats: plain text, markdown, and custom Kairos format
- Screen reader announcements work for all copy/paste operations

Priority: Medium

**Complexity**: Medium

**Status**: In Progress

**Dependencies**:

- Block selection system
- Text formatting system

**Components**:

- `apps/web/src/components/Editor/EditorContent.tsx` - Copy/paste handlers (lines 312-393)
- `apps/web/src/components/Editor/ContentEditableContainer.tsx` - Paste handling (lines 824-956)
- Custom Kairos clipboard format (`application/x-kairos-blocks`) for preserving formatting

---

### 8. **Basic formatting with toolbar**

> User Story:
>
> As a user, I want to highlight text and apply formatting, so that I can style my writing (e.g., bold, italic, link).

**Status**: In Progress

**Dependencies**:

- EditorContext for state management
- Text selection utilities
- Formatting renderer

**Components**:

- `apps/web/src/components/Editor/FormattingToolbar/` - Floating toolbar component
- `apps/web/src/utils/textFormatting.ts` - Core formatting logic
- `apps/web/src/utils/formattingRenderer.tsx` - Renders formatted text
- `apps/web/src/contexts/EditorContext.tsx` - TextFormat types and actions

**Acceptance Criteria:**

- [x] Highlighting text shows a floating formatting popup above the highlighted text
- [x] Popup includes options: Bold, Italic, Underline
- [x] Clicking an option applies formatting to the selection
- [x] Clicking off of the popup or pressing escape closes the popup
- [x] Keyboard shortcuts work (Ctrl/Cmd+B/I/U)
- [x] Link formatting supported (Ctrl/Cmd+K). A dialog box appears for the link.
- [ ] Clicking the link while holding Ctrl/Cmd opens the link in a new tab.
- [x] Formatting persists to database
- [x] Cross-block formatting works when selecting across multiple blocks
- [x] Inline markdown auto-converts (e.g., **bold**, _italic_)
- [x] Formatting markdown symbols are removed once applied
- [x] Selection is restored after formatting is applied
- [x] Toolbar position stays stable (doesn't flicker/jump)
- [x] Format buttons show active state when cursor is in formatted text

**Notes:**

- Clicking off the formatting popup causes it to momentarily appear in the top left of the editor
- There is a slight delay when using key shortcuts for the bold/italic/underline icons to change colour
- Linking works but needs work. Unlinking requires you to make the exact same selection. Clicking the link doesn
- Selection restoration handles DOM changes from formatting
- Link input box needs styling

**Priority**: High

**Complexity**: Medium

---

## Internal Linking

### 9. **@-mention to link to another page**

> User Story:
>
> As a user, I want to type "@" to search and link to other pages, so that I can quickly reference related content.

**Status**: Not Started

**Dependencies**:

- Page search functionality (needs implementation)
- PagesContext for page list (✅ already exists)
- Floating menu component (can reuse SlashCommandMenu pattern)
- Link formatting system (✅ already exists)

**Components**:

- `apps/web/src/components/Editor/MentionMenu/` - To be created
- Integration with existing link formatting in `utils/textFormatting.ts`
- Page search/filter utilities - To be created
- Hook into `ContentEditableContainer` for "@" key detection

**Acceptance Criteria:**

- [ ] Typing "@" at the start of a block opens a floating menu.
- [ ] Typing " @" inside a block that may already have content opens the floating menu.
- [ ] Menu displays list of pages. Maybe recent pages?
- [ ] Menu displays above the block where the "@" was typed.
- [ ] You can select an option using mouse or arrow keys and enter.
- [ ] The top option is automatically highlighted.
- [ ] Pressing enter will apply the highlighted option.
- [ ] There will be a search box at the top of the floating menu that is automatically focused when the popup is triggered.
- [ ] Typing in the search box filters the page results in real time.
- [ ] Each time the search is altered, the highlighted option gets reset to the top result.
- [ ] Clicking off the popup or pressing escape closes it, cancelling the operation.
- [ ] Cancelling the operation should reinsert the typed "@" or " @" where it was typed.
- [ ] Selecting a result inserts a link to that page
- [ ] The link is clickable and navigates to the target page
- [ ] The link is the name of the page with a faint highlight color to indicate it's a link
- [ ] When hovered over, the link also gains an underline
- [ ] Menu position adjusts to avoid viewport edges
- [ ] The "@" character is removed after selecting a page
- [ ] Empty state shows when no pages match the search
- [ ] Menu works within formatted text (e.g., inside bold/italic text) and any block type.
- [ ] Page renames are reflected in existing mentions

**Notes:**

- Can follow the same pattern as SlashCommandMenu implementation. Would be a good idea to look into making some reuseable components and styles
- May need to add page search API endpoint for performance with many pages
- Should show page hierarchy in search results (e.g., "Parent > Child")

**Priority**: High

**Complexity**: Medium

---

## Page Types (Editor Modes)

### 1. **Page Type Selection**

> User Story:
>
> As a user, I want to choose between different editor types for each page, so that I can use the best writing format for my content type.

Acceptance Criteria:

- [ ] Each page has an editor type setting that can be changed in page settings
- [ ] Available editor types: Block-based (default), Prose, Script
- [ ] Changing editor type converts existing content appropriately
- [ ] Editor type is persisted with the page
- [ ] Visual indicator shows current editor type
- [ ] Warning shown when switching types if content might be affected

Notes:

- Block-based: Current implementation with blocks, drag-drop, slash commands
- Prose: Traditional word processor style with paragraph indentation, continuous text flow
- Script: Specialized formatting for screenplays and scripts
- Editor type is per-page, not per-workspace
- Conversion between types should preserve content where possible

Priority: High

**Complexity**: Very High

**Status**: 📋 TODO

**Dependencies**:

- Page settings UI
- Multiple editor implementations
- Content conversion system

**Components**:

- PageSettings (to be created)
- ProseEditor (to be created)
- ScriptEditor (to be created)
- EditorTypeSelector (to be created)

---

### 2. **Prose Editor Mode**

> User Story:
>
> As a novelist, I want a traditional prose writing experience, so that I can write with familiar paragraph formatting and indentation.

Acceptance Criteria:

- [ ] Prose mode shows continuous text without visible block boundaries
- [ ] Tab key creates paragraph indentation (first line indent)
- [ ] Enter creates new paragraphs with proper spacing
- [ ] Text flows continuously like a traditional word processor
- [ ] Supports all text formatting (bold, italic, underline, links)
- [ ] No slash commands or block types in prose mode
- [ ] Word count and reading time displayed
- [ ] Export maintains proper prose formatting

Notes:

- Should feel like Microsoft Word or Google Docs
- Maintains compatibility with markdown export
- May still use blocks internally but presents as continuous text
- Consider page breaks and chapter markers

Priority: Medium

**Complexity**: High

**Status**: 📋 TODO

**Dependencies**:

- Page Type system
- Modified editor rendering

**Components**:

- ProseEditor (to be created)
- ProseRenderer (to be created)
- WordCount component (to be created)

---

### 3. **Script Editor Mode**

> User Story:
>
> As a screenwriter, I want specialized script formatting, so that I can write properly formatted screenplays.

Acceptance Criteria:

- [ ] Script mode provides standard screenplay formatting elements
- [ ] Character names automatically uppercase and centered
- [ ] Dialogue properly indented
- [ ] Action lines in standard format
- [ ] Scene headings (INT./EXT.) recognized and formatted
- [ ] Transitions (CUT TO:, FADE IN:) right-aligned
- [ ] Tab key cycles through element types
- [ ] Export to standard screenplay format

Notes:

- Follow industry-standard screenplay formatting
- Consider integration with specialized script formats (Final Draft, etc.)
- May need custom keyboard shortcuts for element switching

Priority: Low

**Complexity**: Very High

**Status**: 📋 TODO (Future)

**Dependencies**:

- Page Type system
- Specialized formatting engine

**Components**:

- ScriptEditor (to be created)
- ScriptFormatter (to be created)
- ScriptElements (to be created)

---

## Related Documentation

- **[User Stories Guide](../../01-Core/User Stories Guide.md)** - How to write and organize user stories
- **[Enhanced Custom Editor Plan](./Enhanced Custom Editor Plan.md)** - Technical architecture and implementation strategy
- **[Text Formatting Plan](./Text Formatting Plan.md)** - Rich text formatting implementation details
- **[Workspace User Stories](../Workspace/User Stories - Workspace.md)** - Workspace templates that set default page types
- **[Component Structure Guide](../Component Structure Guide.md)** - General component patterns used in the editor
- **[Current State](../../01-Core/Current State.md)** - Current implementation status of editor features
