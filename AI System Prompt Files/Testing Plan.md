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

### 1.1 PageTitle Component Tests (`PageTitle.test.tsx`)

**Priority: P0** | **Complexity: Low**

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

### 1.2 Block Component Tests (`Block.test.tsx`)

**Priority: P0** | **Complexity: Medium**

- **Rendering (Static Types Only)**

  - [ ] Renders blocks with content correctly
  - [ ] Applies correct CSS class based on block type
  - [ ] Shows placeholder "Press '/' for commands..." when focused and empty
  - [ ] Renders bullet point for bullet type blocks

- **Visual States**

  - [ ] Shows drag handle on hover
  - [ ] Hides drag handle when not hovering
  - [ ] Applies selected state styling (blue highlight)
  - [ ] Shows hover effect on non-selected blocks

- **Interactions**
  - [ ] Calls onBlockClick when clicked
  - [ ] Passes blockId to drag handle onSelect
  - [ ] Updates when block prop changes
  - [ ] Maintains isFocused state correctly

### 1.3 BlockDragHandle Component Tests (`BlockDragHandle.test.tsx`)

**Priority: P1** | **Complexity: Low**

- **Rendering**

  - [ ] Renders grab icon
  - [ ] Has correct ARIA attributes
  - [ ] Shows tooltip on hover

- **Mouse Interactions**

  - [ ] Calls onSelect with blockId on mousedown
  - [ ] Passes mouse event for modifier key detection
  - [ ] Changes cursor to grab on hover
  - [ ] Changes cursor to grabbing on mousedown

- **Keyboard Interactions**

  - [ ] Responds to Enter key
  - [ ] Responds to Space key
  - [ ] Prevents default behavior
  - [ ] Maintains focus state

- **Multi-Select Support**
  - [ ] Detects Shift key for range selection
  - [ ] Detects Ctrl/Cmd key for toggle selection
  - [ ] Works with touch events on mobile

### 1.4 ContentEditableContainer Component Tests (`ContentEditableContainer.test.tsx`)

**Priority: P0** | **Complexity: High**

- **Basic Editing**

  - [ ] Prevents default contentEditable behavior
  - [ ] Handles character input at correct position
  - [ ] Maintains cursor position after state updates
  - [ ] Works with different input methods (IME)

- **Block Operations**

  - [ ] Creates new block on Enter key
  - [ ] Splits block content at cursor position
  - [ ] Merges blocks on Backspace at start
  - [ ] Deletes forward on Delete key
  - [ ] Handles selection deletion (single block)
  - [ ] Handles selection deletion (multi-block)

- **Paste Handling**

  - [ ] Pastes plain text at cursor
  - [ ] Creates multiple blocks from multi-line paste
  - [ ] Preserves empty lines in custom format
  - [ ] Handles paste with selection (replaces)
  - [ ] Maintains block types from custom format
  - [ ] Prevents dangerous HTML injection

- **Edge Cases**
  - [ ] Handles rapid typing without losing characters
  - [ ] Works at block boundaries
  - [ ] Handles emoji and special characters
  - [ ] Recovers from malformed paste data
  - [ ] Works with browser autofill

### 1.5 EditorContent Component Tests (`EditorContent.test.tsx`)

**Priority: P0** | **Complexity: High**

- **Component Structure**

  - [ ] Renders PageTitle component
  - [ ] Renders all blocks from state
  - [ ] Wraps blocks in DndContext
  - [ ] Includes screen reader announcements

- **Drag and Drop**

  - [ ] Initiates drag on handle drag
  - [ ] Shows drag overlay during drag
  - [ ] Updates block order on drop
  - [ ] Cancels drag on Escape
  - [ ] Announces drag operations to screen readers
  - [ ] Clears text selection on drag start

- **Selection Management**

  - [ ] Clears selection on empty space click
  - [ ] Clears selection on Escape key
  - [ ] Maintains focus after operations
  - [ ] Integrates with useDismiss hook

- **Keyboard Shortcuts**

  - [ ] Delete key removes selected blocks
  - [ ] Backspace key removes selected blocks
  - [ ] Prevents deletion of last block
  - [ ] Escape clears all selections

- **Copy Operations**
  - [ ] Copies plain text from selection
  - [ ] Copies markdown format
  - [ ] Copies custom Kairos format
  - [ ] Handles partial block selection
  - [ ] Handles full block selection

---

## 2. Hook Tests

### 2.1 useCrossBlockSelection Hook Tests (`useCrossBlockSelection.test.ts`)

**Priority: P0** | **Complexity: High**

- **Selection Calculation**

  - [ ] Detects single block selection
  - [ ] Detects multi-block selection
  - [ ] Calculates correct start/end offsets
  - [ ] Identifies fully vs partially selected blocks
  - [ ] Returns null for collapsed selection
  - [ ] Returns null for non-text selection

- **Event Handling**

  - [ ] Updates on selectionchange event
  - [ ] Updates on mouseup event
  - [ ] Debounces rapid selection changes
  - [ ] Handles keyboard selection (Shift+Arrow)
  - [ ] Cleans up event listeners

- **Text Extraction**

  - [ ] Gets plain text from selection
  - [ ] Generates markdown from selection
  - [ ] Handles empty blocks in selection
  - [ ] Preserves block type formatting

- **State Integration**
  - [ ] Updates EditorContext
  - [ ] Clears block selection on text selection
  - [ ] Disabled during drag operations
  - [ ] Clears on block deletion

### 2.2 useDismiss Hook Tests (`useDismiss.test.ts`)

**Priority: P1** | **Complexity: Low**

- **Click Outside**

  - [ ] Triggers on click outside ref
  - [ ] Ignores clicks inside ref
  - [ ] Respects excludeRefs array
  - [ ] Works with nested elements

- **Keyboard**

  - [ ] Triggers on Escape key
  - [ ] Uses custom onEscape if provided
  - [ ] Respects enabled option

- **Cleanup**
  - [ ] Removes event listeners on unmount
  - [ ] Updates listeners when deps change

---

## 3. Utility Function Tests

### 3.1 textSelection Utilities (`textSelection.test.ts`)

**Priority: P1** | **Complexity: Medium**

- **findBlockFromNode**

  - [ ] Finds block from text node
  - [ ] Finds block from element node
  - [ ] Returns null for non-block nodes
  - [ ] Handles deeply nested nodes

- **getBlockIdsBetween**

  - [ ] Returns single block for same start/end
  - [ ] Returns range for different blocks
  - [ ] Handles reversed selection
  - [ ] Returns empty for invalid IDs

- **categorizeSelectedBlocks**

  - [ ] Identifies fully selected middle blocks
  - [ ] Identifies partially selected first/last
  - [ ] Handles single block selection
  - [ ] Works with empty blocks

- **getCleanOffsets**
  - [ ] Calculates text offset correctly
  - [ ] Handles element containers
  - [ ] Handles text node containers
  - [ ] Works with nested structures

---

## 4. Integration Tests

### 4.1 EditorContext Reducer Tests (`EditorContext.test.tsx`)

**Priority: P0** | **Complexity: Medium**

- **State Management**

  - [ ] Initial state is correct
  - [ ] All actions update state immutably
  - [ ] Invalid actions don't change state

- **Action Tests**

  - [ ] SET_PAGE resets editor state
  - [ ] ADD_BLOCK inserts at correct position
  - [ ] UPDATE_BLOCK modifies content
  - [ ] DELETE_BLOCK maintains valid state
  - [ ] DELETE_BLOCKS handles multiple
  - [ ] REORDER_BLOCKS updates order
  - [ ] SET_FOCUSED_BLOCK manages focus
  - [ ] SET_SELECTED_BLOCKS manages selection
  - [ ] TOGGLE_BLOCK_SELECTION toggles individual blocks
  - [ ] SELECT_BLOCK_RANGE selects block range
  - [ ] CLEAR_SELECTION clears all selections
  - [ ] SET_DRAGGING updates drag state
  - [ ] SET_CROSS_BLOCK_SELECTION manages text selection
  - [ ] CHANGE_BLOCK_TYPE action (not yet used in UI)

- **Business Rules**
  - [ ] Can't delete last block
  - [ ] Focus updates clear selection
  - [ ] Selection clears on text select
  - [ ] Dirty flag tracks changes

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
