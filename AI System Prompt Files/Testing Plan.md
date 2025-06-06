# Comprehensive Editor Testing Plan

## Overview

This document outlines all tests needed for the Project Kairos block-based editor. Tests are organized by priority and include complexity estimates.

## Currently Implemented Features

The editor currently supports:

- Basic block rendering (fixed types: h1, h2, h3, paragraph, bullet)
- Typing and editing within blocks
- Creating new blocks with Enter key
- Merging blocks with Backspace
- Drag and drop reordering
- Multi-block selection via drag handles
- Cross-block text selection
- Copy/paste with custom format support
- Focus and selection management

**Not Yet Implemented**: Slash commands, block type changing, formatting toolbar, undo/redo, markdown conversion, AI features

## Test Priority Levels

- **P0 (Critical)**: Core functionality that must work
- **P1 (High)**: Important features that affect user experience
- **P2 (Medium)**: Edge cases and nice-to-have coverage
- **P3 (Low)**: Future-proofing and advanced scenarios

---

## 1. Unit Tests for Core Components

### 1.1 PageTitle Component Tests (`PageTitle.test.tsx`) ✅

**Priority: P0** | **Complexity: Low** | **Status: Complete (17/17 tests)**

- **Rendering & Display**

  - [x] Renders with initial title prop
  - [x] Shows placeholder "New Page" when empty
  - [x] Maintains contentEditable attribute

- **User Interactions**

  - [x] Updates content on typing
  - [x] Prevents Enter key from creating line breaks
  - [x] Blurs element on Enter key press
  - [x] Strips HTML formatting when pasting
  - [x] Maintains cursor position after paste

- **State Management**

  - [x] Dispatches UPDATE_TITLE action on input
  - [x] Debounces rapid input changes
  - [x] Handles very long titles (>1000 chars)

- **Edge Cases**
  - [x] Handles special characters and emojis
  - [x] Prevents script injection (XSS)
  - [x] Works with IME (Input Method Editor) for non-Latin text

### 1.2 Block Component Tests (`Block.test.tsx`) ✅

**Priority: P0** | **Complexity: Medium** | **Status: Complete (25/25 tests)**

- **Rendering (Static Types Only)**

  - [x] Renders blocks with content correctly
  - [x] Applies correct CSS class based on block type
  - [x] Shows placeholder "Press '/' for commands..." when focused and empty
  - [x] Renders bullet point for bullet type blocks

- **Visual States**

  - [x] Shows drag handle on hover
  - [x] Hides drag handle when not hovering
  - [x] Applies selected state styling (blue highlight)
  - [x] Shows hover effect on non-selected blocks

- **Interactions**
  - [x] Calls onBlockClick when clicked
  - [x] Passes blockId to drag handle onSelect
  - [x] Updates when block prop changes
  - [x] Maintains isFocused state correctly

### 1.3 BlockDragHandle Component Tests (`BlockDragHandle.test.tsx`) ✅

**Priority: P1** | **Complexity: Low** | **Status: Complete (25/25 tests)**

- **Rendering**

  - [x] Renders grab icon
  - [x] Has correct ARIA attributes
  - [x] Shows tooltip on hover

- **Mouse Interactions**

  - [x] Calls onSelect with blockId on mousedown
  - [x] Passes mouse event for modifier key detection
  - [x] Changes cursor to grab on hover
  - [x] Changes cursor to grabbing on mousedown

- **Keyboard Interactions**

  - [x] Responds to Enter key
  - [x] Responds to Space key
  - [x] Prevents default behavior
  - [x] Maintains focus state

- **Multi-Select Support**
  - [x] Detects Shift key for range selection
  - [x] Detects Ctrl/Cmd key for toggle selection
  - [x] Works with touch events on mobile

### 1.4 ContentEditableContainer Component Tests (`ContentEditableContainer.test.tsx`) ✅

**Priority: P0** | **Complexity: High** | **Status: Complete (23/23 tests)**

- **Basic Editing**

  - [x] Prevents default contentEditable behavior
  - [x] Handles character input at correct position
  - [x] Maintains cursor position after state updates
  - [x] Works with different input methods (IME)

- **Block Operations**

  - [x] Creates new block on Enter key
  - [x] Splits block content at cursor position
  - [x] Merges blocks on Backspace at start
  - [x] Deletes forward on Delete key
  - [x] Handles selection deletion (single block)
  - [x] Handles selection deletion (multi-block)

- **Paste Handling**

  - [x] Pastes plain text at cursor
  - [x] Creates multiple blocks from multi-line paste
  - [x] Preserves empty lines in custom format
  - [x] Handles paste with selection (replaces)
  - [x] Maintains block types from custom format
  - [x] Prevents dangerous HTML injection

- **Edge Cases**

  - [x] Handles rapid typing without losing characters
  - [x] Works at block boundaries
  - [x] Handles emoji and special characters
  - [x] Recovers from malformed paste data
  - [x] Works with browser autofill

- **Click Handling**
  - [x] Calls onBlockClick when clicking on a block
  - [x] Handles clicks on nested elements within blocks

### 1.5 EditorContent Component Tests (`EditorContent.test.tsx`) ✅

**Priority: P0** | **Complexity: High** | **Status: Complete (57/58 tests)**

- **Component Structure**

  - [x] Renders PageTitle component
  - [x] Renders all blocks from state
  - [x] Wraps blocks in DndContext
  - [x] Includes screen reader announcements
  - [x] Renders ContentEditableContainer with blocks
  - [x] Renders SortableContext for drag and drop
  - [x] Applies focused state to focused block
  - [x] Renders drag overlay when dragging
  - [x] Adds ARIA labels to blocks
  - [x] Has proper document role and aria-label
  - [x] Has proper group role for blocks container

- **Drag and Drop**

  - [x] Initiates drag on handle drag
  - [x] Shows drag overlay during drag
  - [x] Updates block order on drop
  - [x] Cancels drag on Escape
  - [x] Announces drag operations to screen readers
  - [x] Clears text selection on drag start
  - [x] Applies sorting class during drag
  - [x] Handles invalid block IDs during drag
  - [x] Disables cross-block selection during drag

- **Selection Management**

  - [x] Clears selection on empty space click
  - [x] Clears selection on Escape key
  - [x] Maintains focus after operations
  - [x] Integrates with useDismiss hook
  - [x] Clears text selection on empty space click
  - [x] Focuses last block when clicking below all content
  - [x] Clears block selection when text is selected
  - [x] Does not clear selection when clicking on blocks
  - [x] Does not clear selection when clicking on page title
  - [x] Does not clear selection when clicking on content editable container
  - [x] Announces selection cleared to screen readers
  - [x] Clears text selection on Escape when text is selected
  - [x] Prioritizes text selection escape over block selection

- **Keyboard Shortcuts**

  - [x] Delete key removes selected blocks
  - [x] Backspace key removes selected blocks
  - [x] Prevents deletion of last block
  - [x] Escape clears all selections
  - [x] Ignores shortcuts when block is focused
  - [x] Ignores shortcuts when text is selected
  - [x] Announces single block deletion to screen readers
  - [x] Announces multiple block deletion to screen readers
  - [x] Prevents default behavior for handled shortcuts
  - [x] Does not handle shortcuts when no blocks are selected
  - [x] Cleans up keyboard event listeners on unmount
  - [x] Handles Escape key for text selection first

- **Copy Operations**
  - [x] Copies plain text from selection
  - [x] Copies markdown format
  - [x] Copies custom Kairos format
  - [x] Handles partial block selection
  - [x] Handles full block selection
  - [x] Handles empty blocks in selection
  - [x] Does not copy when no text is selected
  - [x] Announces copy to screen readers
  - [x] Handles invalid block IDs in selection
  - [x] Cleans up copy event listener on unmount
  - [x] Handles single block selection correctly
  - [x] Preserves block types in custom format

---

## 2. Hook Tests

### 2.1 useCrossBlockSelection Hook Tests (`useCrossBlockSelection.test.tsx`) ✅

**Priority: P0** | **Complexity: High** | **Status: Complete (23/23 tests)**

- **Selection Calculation**

  - [x] Detects single block selection
  - [x] Detects multi-block selection
  - [x] Calculates correct start/end offsets
  - [x] Identifies fully vs partially selected blocks
  - [x] Returns null for collapsed selection
  - [x] Returns null for non-text selection

- **Event Handling**

  - [x] Updates on selectionchange event
  - [x] Updates on mouseup event
  - [x] Debounces rapid selection changes
  - [x] Handles keyboard selection (Shift+Arrow)
  - [x] Cleans up event listeners

- **Text Extraction**

  - [x] Gets plain text from selection
  - [x] Generates markdown from selection
  - [x] Handles empty blocks in selection
  - [x] Preserves block type formatting

- **State Integration**
  - [x] Updates EditorContext
  - [x] Clears block selection on text selection
  - [x] Disabled during drag operations
  - [x] Clears on block deletion

### 2.2 useDismiss Hook Tests (`useDismiss.test.ts`) ✅

**Priority: P1** | **Complexity: Low** | **Status: Complete (13/13 tests)**

- **Click Outside**

  - [x] Triggers on click outside ref
  - [x] Ignores clicks inside ref
  - [x] Respects excludeRefs array
  - [x] Works with nested elements

- **Keyboard**

  - [x] Triggers on Escape key
  - [x] Uses custom onEscape if provided
  - [x] Respects enabled option

- **Cleanup**
  - [x] Removes event listeners on unmount
  - [x] Updates listeners when deps change

---

## 3. Utility Function Tests

### 3.1 textSelection Utilities (`textSelection.test.ts`) ✅

**Priority: P1** | **Complexity: Medium** | **Status: Complete (36/36 tests)**

- **findBlockFromNode**

  - [x] Finds block from text node
  - [x] Finds block from element node
  - [x] Returns null for non-block nodes
  - [x] Handles deeply nested nodes
  - [x] Finds block from parent block element
  - [x] Returns null when block content is missing from parent block

- **getBlockIdsBetween**

  - [x] Returns single block for same start/end
  - [x] Returns range for different blocks
  - [x] Handles reversed selection
  - [x] Returns empty for invalid IDs
  - [x] Returns empty when start ID is invalid
  - [x] Returns empty when end ID is invalid
  - [x] Handles selection across all blocks

- **categorizeSelectedBlocks**

  - [x] Identifies fully selected middle blocks
  - [x] Identifies partially selected first/last
  - [x] Handles single block selection
  - [x] Works with empty blocks
  - [x] Handles two block selection
  - [x] Returns empty arrays for invalid block IDs
  - [x] Handles reversed selection correctly

- **getCleanOffsets**

  - [x] Calculates text offset correctly
  - [x] Handles element containers
  - [x] Handles text node containers
  - [x] Works with nested structures
  - [x] Returns offset for container equal to blockElement
  - [x] Handles empty text nodes
  - [x] Returns offset as-is for text node not found in block

- **Additional Functions**
  - [x] isMultiBlockSelection - detects multi-block selections
  - [x] shouldTreatAsTextSelection - determines selection type
  - [x] getRangeText - extracts text from range

---

## 4. Integration Tests

### 4.1 EditorContext Reducer Tests (`EditorContext.test.tsx`) ✅

**Priority: P0** | **Complexity: Medium** | **Status: Complete (41/41 tests)**

- **State Management**

  - [x] Initial state is correct
  - [x] All actions update state immutably
  - [x] Invalid actions don't change state

- **Action Tests**

  - [x] SET_PAGE resets editor state
  - [x] ADD_BLOCK inserts at correct position
  - [x] UPDATE_BLOCK modifies content
  - [x] DELETE_BLOCK maintains valid state
  - [x] DELETE_BLOCKS handles multiple
  - [x] REORDER_BLOCKS updates order
  - [x] SET_FOCUSED_BLOCK manages focus
  - [x] SET_SELECTED_BLOCKS manages selection
  - [x] TOGGLE_BLOCK_SELECTION toggles individual blocks
  - [x] SELECT_BLOCK_RANGE selects block range
  - [x] CLEAR_SELECTION clears all selections
  - [x] SET_DRAGGING updates drag state
  - [x] SET_CROSS_BLOCK_SELECTION manages text selection
  - [x] CHANGE_BLOCK_TYPE action (not yet used in UI)
  - [x] MARK_SAVED updates save state
  - [x] RESET_EDITOR returns to initial state

- **Business Rules**
  - [x] Can't delete last block
  - [x] Focus updates clear selection
  - [x] Selection clears on text select
  - [x] Dirty flag tracks changes

### 4.2 Cross-Component Integration Tests

**Priority: P1** | **Complexity: High**

- **Selection + Copy/Paste**

  - [ ] Select across blocks and copy
  - [ ] Paste preserves block structure
  - [ ] Custom Kairos format maintains block types

- **Drag + Selection**

  - [ ] Drag clears text selection
  - [ ] Multi-select drag moves all
  - [ ] Can't drag during text selection

- **Focus + Navigation**
  - [ ] Click focuses blocks
  - [ ] Arrow keys move through text
  - [ ] Selection state managed correctly

---

## 5. E2E Tests (Cypress)

### 5.1 Basic Editor Operations (`editor-basic.cy.ts`)

**Priority: P0** | **Complexity: Medium**

```typescript
describe('Editor Basic Operations', () => {
  it('types text into blocks')
  it('creates new blocks with Enter key')
  it('merges blocks with Backspace at start')
  it('deletes characters with Delete key')
  it('shows placeholder text when block is empty')
  it('handles empty document state')
})
```

### 5.2 Selection Scenarios (`editor-selection.cy.ts`)

**Priority: P0** | **Complexity: High**

```typescript
describe('Cross-Block Selection', () => {
  it('selects text within single block')
  it('selects text across multiple blocks')
  it('extends selection with keyboard')
  it('copies selection in multiple formats')
  it('clears selection appropriately')
})
```

### 5.3 Advanced Operations (`editor-advanced.cy.ts`)

**Priority: P1** | **Complexity: High**

```typescript
describe('Advanced Editor Features', () => {
  it('handles complex paste scenarios')
  it('handles drag and drop with multiple blocks')
  it('maintains performance with 100+ blocks')
  it('handles rapid typing without losing characters')
})
```

---

## 6. Non-Functional Tests

### 6.1 Performance Tests

**Priority: P1** | **Complexity: High**

- **Metrics to Track**

  - [ ] Input latency < 16ms (60fps)
  - [ ] Drag operation < 100ms
  - [ ] Selection update < 50ms
  - [ ] Memory usage < 50MB for 100 blocks

- **Test Scenarios**
  - [ ] Large document (500+ blocks)
  - [ ] Rapid typing (100+ WPM)
  - [ ] Complex selections
  - [ ] Multiple drag operations

### 6.2 Accessibility Tests

**Priority: P0** | **Complexity: Medium**

- **Keyboard Navigation**

  - [ ] All features keyboard accessible
  - [ ] Focus indicators visible
  - [ ] Tab order logical
  - [ ] Shortcuts documented

- **Screen Reader**
  - [ ] Announcements clear and timely
  - [ ] Structure navigable
  - [ ] Actions describable
  - [ ] State changes announced

### 6.3 Browser Compatibility Tests

**Priority: P0** | **Complexity: High**

- **Browsers to Test**

  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
  - [ ] Mobile Safari
  - [ ] Chrome Android

- **Features to Verify**
  - [ ] ContentEditable behavior
  - [ ] Selection API
  - [ ] Drag and drop
  - [ ] Copy/paste formats
  - [ ] Performance

### 6.4 Security Tests

**Priority: P0** | **Complexity: Medium**

- **XSS Prevention**

  - [ ] Script tags stripped
  - [ ] Event handlers removed
  - [ ] Dangerous attributes blocked
  - [ ] Safe paste handling

- **Data Validation**
  - [ ] Block content sanitized
  - [ ] IDs properly generated
  - [ ] State updates validated

---

## 7. Test Implementation Strategy

### Phase 1: Critical Path (Week 1)

1. EditorContext reducer tests
2. ContentEditableContainer basic tests
3. Block rendering tests
4. Basic E2E smoke tests

### Phase 2: Core Features (Week 2)

1. Cross-block selection tests
2. Copy/paste integration tests
3. Drag and drop tests
4. Accessibility tests

### Phase 3: Edge Cases (Week 3)

1. Browser compatibility tests
2. Performance benchmarks
3. Security tests
4. Error recovery tests

### Phase 4: Polish (Week 4)

1. Visual regression tests
2. Mobile interaction tests
3. Advanced integration tests
4. Documentation tests

---

## 8. Testing Infrastructure

### Required Test Utilities

```typescript
// Test helpers needed
- renderWithEditor() - Render component with EditorContext
- createMockBlock() - Generate test blocks
- selectText() - Simulate text selection
- dragBlock() - Simulate drag operation
- pasteContent() - Simulate paste event
```

### Mock Requirements

- Window.getSelection() API
- ClipboardEvent with data
- DragEvent with dataTransfer
- DOM mutations for contentEditable
- Firebase auth state

### CI/CD Integration

- Run unit tests on every commit
- Run E2E tests on PR
- Performance tests nightly
- Browser tests weekly
- Accessibility audit monthly

---

## 9. Success Metrics

### Coverage Goals

- Unit tests: 90%+ coverage
- Integration tests: 80%+ coverage
- E2E tests: Critical paths covered
- Zero P0 bugs in production

### Performance Targets

- All tests run < 5 minutes
- Unit tests < 30 seconds
- E2E tests < 3 minutes
- Flaky test rate < 1%

---

## 10. Maintenance Plan

### Regular Tasks

- Review and update tests with new features
- Refactor slow tests quarterly
- Update browser matrix annually
- Archive obsolete tests
- Monitor test execution metrics

### Documentation

- Keep test names descriptive
- Document complex test setups
- Maintain test data fixtures
- Update this plan quarterly
