# User Stories - Copy/Paste

This document contains detailed user stories and testing scenarios for the copy/paste functionality in the Project Kairos editor.

## Copy/Paste Support

> User Story:
>
> As a user, I want to copy and paste blocks, so that I can produce content more quickly.

### Acceptance Criteria

- [x] Cmd/Ctrl+C copies the selected block(s) or text
- [x] Cmd/Ctrl+V pastes the selected block(s) in the next space below the block with the cursor
- [x] Cmd/Ctrl+V pastes the selected text at the cursor location inside the block
- [x] Formatting is preserved when copying/pasting within Kairos
- [x] Pasting from external sources converts content to Kairos blocks
- [x] Cmd/Ctrl+X cuts the selected block(s)

### Testing Checklist

#### Single Block Copy/Paste

- [x] Copy a paragraph block and paste it - should create a new paragraph block
- [x] Copy an H1 block and paste it - should create a new H1 block
- [x] Copy an H2 block and paste it - should create a new H2 block
- [x] Copy an H3 block and paste it - should create a new H3 block
- [x] Copy a bullet list block and paste it - should create a new bullet block

#### Block Type Preservation

- [x] Copy heading block, paste into empty block - empty block should become heading
- [x] Copy bullet block, paste into empty block - empty block should become bullet
- [x] Copy any block, paste into non-empty block - should create new block below with correct type

#### Text Formatting Preservation

- [x] Copy block with bold text - bold formatting should be preserved
- [x] Copy block with italic text - italic formatting should be preserved
- [x] Copy block with underlined text - underline formatting should be preserved
- [x] Copy block with link - link should be preserved and clickable
- [x] Copy block with mixed formatting (bold + italic) - all formatting should be preserved

#### Multi-Block Copy/Paste

- [x] Select and copy 2+ blocks - all blocks should paste with correct types
- [x] Copy mix of headings and paragraphs - each block type should be preserved
- [x] Copy blocks with different formatting - each block's formatting should be preserved
- [x] Copy blocks, paste in middle of another block - should split block and insert all copied blocks

#### Paste Behavior in Different Contexts

- [x] Paste blocks while cursor is at start of block - blocks inserted before current content
- [x] Paste blocks while cursor is in middle of block - block splits, new blocks inserted
- [x] Paste blocks while cursor is at end of block - blocks inserted after current content
- [x] Paste single block into empty block - replaces empty block entirely

#### External Content Paste

- [x] Paste plain text - creates paragraph blocks (one per line)
- [x] Paste "# Heading" - creates H1 block without the # symbol
- [x] Paste "## Heading" - creates H2 block without the ## symbols
- [x] Paste "### Heading" - creates H3 block without the ### symbols
- [x] Paste "- List item" - creates bullet block without the - symbol
- [x] Paste multi-line markdown - each line converts to appropriate block type

#### Cross-Block Selection Copy/Paste

- [x] Select partial text across 2 blocks, copy/paste - selection preserved correctly
- [x] Select from middle of one block to middle of another - partial content copied
- [x] Paste partial selection - inserts inline as text, not as blocks

#### Cut Operations

- [x] Cut single block - block removed and can be pasted elsewhere
- [x] Cut multiple blocks - all selected blocks removed and can be pasted
- [x] Cut partial text - text removed and can be pasted

#### Edge Cases

- [x] Copy/paste empty block - creates new empty block
- [ ] Copy formatted text, paste into plain text editor, paste back - loses Kairos formatting but preserves content
- [x] Copy from Kairos, paste into another Kairos editor instance - all formatting preserved
- [x] Rapid copy/paste operations - no data loss or corruption

### Issues Found

- ⚠️ PARTIALLY FIXED (July 27, 2025): When pasting without the cursor in a block (unfocused editor), only plain text paste is supported due to browser security restrictions. Block types are preserved via markdown detection (e.g., "# Heading" becomes H1), but custom Kairos formatting is not preserved.
- ✅ FIXED (July 27, 2025): Linked text formatting does get copied but links don't work. Now links are clickable with Ctrl/Cmd+click (standard contenteditable behavior)
- ✅ FIXED (July 27, 2025): When copying multiple blocks and pasting with the cursor inside an existing block, the first of the copied blocks gets pasted inside the cursor block and loses its own block type. Now creates proper blocks for all pasted content.
- ⚠️ LIMITATION: When pasting with unfocused editor, only plain text is available (browser security limitation). Markdown patterns are detected to preserve block types.
- ✅ FIXED (July 27, 2025): Cutting and pasting multiple blocks does not preserve formatting for the first block. Fixed with the multi-block paste improvements.
- Text formatting is not preserved when copied from the editor to notepad, or visa versa. (This is expected behavior - external apps don't support our custom formatting)

### Implementation Notes

**Timeline:**

- Basic block copy/paste implemented July 25, 2025
- Copy/paste fixes implemented July 27, 2025

**Key Fixes (July 27, 2025):**

- Fixed: Block types are now preserved when pasting (headings remain headings, bullets remain bullets)
- Fixed: Text formatting (bold, italic, etc.) is now preserved when copying blocks
- Fixed: Pasting blocks while focused in a block now creates new blocks below instead of inserting text inline
- Added: Plain text with markdown syntax (e.g., "# Heading", "- List") is automatically converted to proper block types
- Fixed: Unfocused editor paste now uses paste event API for better browser compatibility with custom clipboard formats
- Fixed: Multi-block paste now preserves the first block's type instead of merging it into the current block
- Fixed: Editor automatically focuses on the first pasted block after paste operations
- Fixed: Cut and paste operations now preserve all block types and formatting correctly
- Fixed: Links in copied text are now clickable with Ctrl/Cmd+click (standard contenteditable behavior)

**Technical Details:**

- Exports to three clipboard formats: plain text, markdown, and custom Kairos format
- Screen reader announcements work for all copy/paste operations
- Custom Kairos clipboard format (`application/x-kairos-blocks`) preserves all formatting and block metadata
- **Browser Limitation**: When pasting with unfocused editor, only `navigator.clipboard.readText()` is available due to security restrictions
- Markdown detection ensures block types are preserved even with plain text paste
- Uses paste event API instead of navigator.clipboard.read() for better browser compatibility with custom MIME types

### Components

- `apps/web/src/components/Editor/EditorContent.tsx` - Copy/paste handlers (unfocused editor paste: lines 112-280, copy event: lines 354-461)
- `apps/web/src/components/Editor/ContentEditableContainer.tsx` - Paste handling (lines 824-1000+)
- `apps/web/src/utils/blockMarkdownDetection.ts` - Markdown pattern detection for paste

### Priority & Status

**Priority**: Medium

**Complexity**: Medium

**Status**: Complete (July 27, 2025) - All major copy/paste functionality implemented with block type and formatting preservation

**Dependencies**:

- Block selection system
- Text formatting system
- Markdown detection utilities

### Future Enhancements

- [ ] Copy/paste for tables and advanced block types (when implemented)
- [ ] Copy/paste for code blocks with syntax highlighting (when implemented)
- [ ] Paste from Microsoft Word with formatting preservation
- [ ] Paste images with automatic upload and insertion
- [ ] Copy/paste history (clipboard manager)
- [ ] Smart paste that detects content type and suggests formatting

## Related Documentation

- **[Editor Architecture Transition - HTML as Interchange Format](./Editor Architecture Transition - HTML as Interchange Format.md)** - FUNDAMENTAL: Plan to adopt HTML as the primary interchange format for the editor (July 27, 2025)
