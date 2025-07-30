# Editor Test Inventory

**Created**: July 30, 2025  
**Purpose**: Comprehensive test catalog for Editor functionality derived from User Stories  
**Status**: Active inventory for tracking test implementation

## Overview

This document catalogs all test cases for the Editor component, extracted from user stories, bug reports, and expected behaviors. Each test is categorized by priority and implementation status.

## Test Priority Levels

- **P0 (Critical)**: Core functionality that must work - blocks testing if broken
- **P1 (Important)**: Key features that users expect - degrades experience if broken
- **P2 (Nice-to-have)**: Edge cases and polish - improves robustness

## Test Categories

### 1. Block Operations

#### Enter Key Behavior (P0)

- [ ] Enter at end of block → creates new block below
- [ ] Enter in middle of text → splits block at cursor position
- [ ] Enter at start of block → creates empty block above (currently broken)
- [ ] Enter in empty block → maintains empty block
- [ ] Enter in list block → creates body block (not another list)
- [ ] Enter with text selection → deletes selection and splits at cursor

#### Block Deletion (P0)

- [ ] Backspace at block start → merges with previous block
- [ ] Delete at block end → merges with next block
- [ ] Delete last block → handled gracefully (currently broken)
- [ ] Backspace in empty block → removes block and focuses previous
- [ ] Delete selection spanning blocks → merges remaining blocks

#### Block Creation (P0)

- [ ] New document starts with one empty block
- [ ] Cannot have zero blocks in document
- [ ] Block IDs are unique and stable
- [ ] Block order is maintained in state

### 2. Placeholder Text

#### Display Behavior (P1)

- [ ] Empty paragraph shows "Start typing or use '/' for commands..."
- [ ] Empty heading shows "Heading"
- [ ] Empty list item shows "List item"
- [ ] Empty quote shows "Quote"
- [ ] Placeholder disappears when typing
- [ ] Placeholder reappears when content deleted

#### Interaction Issues (P0) - Currently Broken

- [ ] Placeholder text not selectable
- [ ] Clicking placeholder focuses block for typing
- [ ] Placeholder doesn't interfere with cursor position
- [ ] Placeholder doesn't cause typing bugs

### 3. Text Formatting

#### Inline Formatting (P0)

- [ ] Bold selection with Ctrl/Cmd+B
- [ ] Italic selection with Ctrl/Cmd+I
- [ ] Underline selection with Ctrl/Cmd+U
- [ ] Code formatting with backticks
- [ ] Link creation with Ctrl/Cmd+K
- [ ] Remove formatting with same shortcut

#### Cross-Block Formatting (P1)

- [ ] Format selection across multiple blocks
- [ ] Preserve formatting when splitting blocks
- [ ] Copy formatted text between blocks
- [ ] Paste preserves formatting

#### Markdown Shortcuts (P1)

- [ ] **Bold** with double asterisks
- [ ] _Italic_ with single asterisks
- [ ] # Heading with hash at start
- [ ] - List with dash at start
- [ ] > Quote with angle bracket at start
- [ ] `code` with backticks

### 4. Slash Commands

#### Menu Behavior (P0)

- [ ] "/" at block start opens menu
- [ ] Typing "/" anywhere opens menu at cursor
- [ ] Menu appears above current block
- [ ] Menu positioned correctly near viewport edges
- [ ] Menu closes on Escape
- [ ] Menu closes on click outside

#### Menu Navigation (P0)

- [ ] Arrow keys navigate options
- [ ] Enter selects highlighted option
- [ ] First option auto-highlighted
- [ ] Tab cycles through options
- [ ] Mouse hover highlights option
- [ ] Click selects option

#### Search Functionality (P1)

- [ ] Search box auto-focuses when menu opens
- [ ] Typing filters options in real-time
- [ ] Fuzzy matching for typos
- [ ] No results shows empty state
- [ ] Clear search resets all options

#### Known Issues (P0)

- [ ] "/" after content moves cursor unexpectedly
- [ ] Cancel doesn't restore "/" character
- [ ] Menu position wrong when scrolled

### 5. Selection

#### Text Selection (P0)

- [ ] Click and drag selects text within block
- [ ] Double-click selects word
- [ ] Triple-click selects block
- [ ] Shift+arrow extends selection
- [ ] Ctrl/Cmd+A selects all content

#### Block Selection (P0)

- [ ] Click block handle selects single block
- [ ] Shift+click handle selects range
- [ ] Ctrl/Cmd+click toggles block selection
- [ ] Drag handle shows selection rectangle
- [ ] Selection persists during operations

#### Cross-Block Selection (P1)

- [ ] Click and drag across blocks selects text
- [ ] Selection includes partial blocks
- [ ] Formatting applies to selection
- [ ] Delete removes selected content
- [ ] Copy includes all selected content

### 6. Copy/Paste

#### Internal Copy/Paste (P0)

- [ ] Copy single block preserves block type
- [ ] Copy multiple blocks preserves all types
- [ ] Cut removes selected blocks
- [ ] Paste with editor focused inserts at cursor
- [ ] Paste with editor unfocused appends to end

#### External Paste (P0)

- [ ] Paste plain text creates paragraph blocks
- [ ] Paste from Google Docs preserves formatting
- [ ] Paste from Notion preserves structure
- [ ] Paste from Word converts appropriately
- [ ] Paste HTML content preserves structure
- [ ] Paste Markdown converts to blocks

#### Clipboard Edge Cases (P1)

- [ ] Copy empty selection does nothing
- [ ] Paste without clipboard data handled
- [ ] Paste with special characters preserved
- [ ] Paste with nested structures flattened appropriately

### 7. Drag and Drop

#### Single Block Drag (P0)

- [ ] Drag handle appears on block hover
- [ ] Drag handle shows grab cursor
- [ ] Dragging shows block preview
- [ ] Drop indicator line appears
- [ ] Block moves to drop position
- [ ] Undo reverses drag operation

#### Multi-Block Drag (P1)

- [ ] Selected blocks drag together
- [ ] Preview shows all dragged blocks
- [ ] Drop indicator spans all blocks
- [ ] Order preserved after drop
- [ ] Non-contiguous selection supported

#### Drag Constraints (P1)

- [ ] Cannot drag outside editor
- [ ] Cannot drop into invalid positions
- [ ] Cannot drag during text selection
- [ ] Escape cancels drag operation

### 8. Keyboard Navigation

#### Basic Navigation (P0)

- [ ] Arrow keys move cursor
- [ ] Home/End move to line boundaries
- [ ] Ctrl/Cmd+Home/End move to document boundaries
- [ ] Page Up/Down scroll document
- [ ] Tab indents in appropriate blocks

#### Block Navigation (P1)

- [ ] Up arrow at block start → previous block end
- [ ] Down arrow at block end → next block start
- [ ] Ctrl/Cmd+Up/Down moves blocks
- [ ] Alt+Up/Down navigates block boundaries

### 9. Undo/Redo

#### Basic Undo/Redo (P0) - Not Implemented

- [ ] Ctrl/Cmd+Z undoes last action
- [ ] Ctrl/Cmd+Shift+Z redoes action
- [ ] Undo stack maintains history
- [ ] Redo cleared on new action
- [ ] Visual feedback on undo/redo

#### Undo Granularity (P1)

- [ ] Text input batched intelligently
- [ ] Block operations atomic
- [ ] Formatting changes undoable
- [ ] Selection state restored

### 10. Performance

#### Large Documents (P1)

- [ ] 100+ blocks render smoothly
- [ ] Typing remains responsive
- [ ] Scrolling performs well
- [ ] Selection across many blocks works
- [ ] Auto-save doesn't block UI

#### Memory Management (P2)

- [ ] Memory usage stable over time
- [ ] Old undo history pruned
- [ ] Event listeners cleaned up
- [ ] DOM nodes recycled efficiently

### 11. Auto-Save

#### Save Behavior (P0)

- [ ] Changes save after 2 second delay
- [ ] Save indicator shows status
- [ ] Failed saves show error
- [ ] Retry on network recovery
- [ ] No data loss on page refresh

#### Conflict Resolution (P2)

- [ ] Detect concurrent edits
- [ ] Show conflict UI
- [ ] Allow manual resolution
- [ ] Preserve both versions

### 12. Accessibility

#### Keyboard Access (P0)

- [ ] All features keyboard accessible
- [ ] Focus indicators visible
- [ ] Tab order logical
- [ ] Shortcuts documented
- [ ] No keyboard traps

#### Screen Reader (P1)

- [ ] Block types announced
- [ ] Editing actions announced
- [ ] Selection state communicated
- [ ] Errors announced
- [ ] Landmark regions correct

### 13. Browser Compatibility

#### Core Browsers (P0)

- [ ] Chrome/Edge latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Mobile browsers basic support

#### Browser Differences (P2)

- [ ] Handle contentEditable quirks
- [ ] Clipboard API fallbacks
- [ ] Selection API differences
- [ ] Input method editor support

## Known Bugs to Regression Test

### Critical Bugs (P0)

- [x] "Typing backwards" bug - Fixed Jan 2025
- [ ] Enter at block start creates block below instead of above
- [ ] Cannot delete last block in document
- [ ] Placeholder text is interactive

### Important Bugs (P1)

- [ ] Slash command "/" character remains after cancel
- [ ] Markdown paste requires re-trigger to format
- [ ] Drop gap only shows single block height
- [ ] Link functionality incomplete (no unlink)

### Minor Bugs (P2)

- [ ] Selection across blocks can be inconsistent
- [ ] Drag preview sometimes flickers
- [ ] Menu position wrong near viewport edge

## Test Implementation Status

### Completed Tests

- Basic block rendering
- Simple text input
- Block type changes via slash commands

### In Progress

- Comprehensive keyboard navigation
- Cross-block operations
- External paste handling

### Not Started

- Undo/redo system
- Performance benchmarks
- Full accessibility audit
- Browser compatibility suite

## Success Metrics

- **Coverage**: All P0 tests implemented and passing
- **Reliability**: No flaky tests in CI
- **Performance**: Test suite runs in < 30 seconds
- **Maintainability**: Tests updated with feature changes

## Next Steps

1. Implement P0 tests for block operations
2. Fix known critical bugs found during testing
3. Add performance benchmarks for large documents
4. Create visual regression tests for UI consistency
5. Set up automated accessibility testing

---

_This inventory is derived from User Stories and actual system behavior. Update as new requirements or bugs are discovered._
