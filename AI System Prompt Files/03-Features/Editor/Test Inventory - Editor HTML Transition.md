# Test Inventory - Editor HTML Transition

**Created**: July 30, 2025  
**Purpose**: Comprehensive test cases for HTML as Interchange Format transition  
**Source**: Extracted from User Stories documents

## ⚠️ IMPORTANT: Understanding the Status Indicators

The test cases in this document represent the **REQUIREMENTS** for the new HTML-based architecture - all these features must be implemented. However, the status indicators (✅ Working, ❌ Broken, etc.) reflect the **CURRENT IMPLEMENTATION** status, not the target state.

### How to Read This Document

1. **Test Cases = Requirements**: Every test case listed is a requirement for the new architecture
2. **Status = Current State**: The status shows how the feature works (or doesn't) TODAY
3. **After Transition**: ALL test cases should pass, including those currently marked as ❌ Broken

### Why Track Current Status?

1. **Regression Prevention**: Features marked ✅ must continue working
2. **Bug Fix Opportunities**: Features marked ❌ can be fixed during the transition
3. **Priority Guidance**: P0 broken features are high-value fixes
4. **Testing Strategy**: Golden files capture current behavior (including bugs) as a baseline

## Overview

This document contains all test cases needed to ensure the HTML transition maintains 100% feature parity while fixing known issues. Tests are organized by feature area and include current status based on User Stories.

## Test Categories

### 1. Block Operations

#### 1.1 Enter Key Behavior

| Test Case                                           | Current Status | Priority | Notes                            |
| --------------------------------------------------- | -------------- | -------- | -------------------------------- |
| Enter at end of block → new block below             | ✅ Working     | P0       | Core functionality               |
| Enter in middle → splits block correctly            | ✅ Working     | P0       | Cursor position preserved        |
| Enter at start → empty block above                  | ❌ Broken      | P0       | Creates block below instead      |
| Enter in empty block → maintains block              | ✅ Working     | P1       |                                  |
| Enter in list block → creates body block            | ❌ Not Working | P1       | Should not continue list         |
| Enter with selection → deletes selection and splits | ✅ Working     | P1       |                                  |
| Block type preserved when splitting                 | ❌ Issues      | P1       | Block below should maintain type |

#### 1.2 Block Deletion

| Test Case                                           | Current Status | Priority | Notes                    |
| --------------------------------------------------- | -------------- | -------- | ------------------------ |
| Backspace at block start → merges with previous     | ✅ Working     | P0       |                          |
| Delete at block end → merges with next              | ✅ Working     | P1       |                          |
| Delete last block → handled gracefully              | ❌ Broken      | P0       | Cannot delete last block |
| Backspace in empty block → removes block            | ✅ Working     | P0       |                          |
| Delete selection spanning blocks → merges remaining | ✅ Working     | P1       |                          |

#### 1.3 Placeholder Text

| Test Case                                     | Current Status | Priority | Notes                         |
| --------------------------------------------- | -------------- | -------- | ----------------------------- |
| Empty block shows placeholder                 | ✅ Working     | P1       |                               |
| Placeholder disappears on typing              | ✅ Working     | P0       |                               |
| Placeholder not selectable                    | ❌ Broken      | P0       | Can interact with placeholder |
| Placeholder shows correct text per block type | ❓ Unknown     | P2       |                               |

### 2. Slash Commands

#### 2.1 Basic Functionality

| Test Case                     | Current Status | Priority | Notes                      |
| ----------------------------- | -------------- | -------- | -------------------------- |
| "/" at block start opens menu | ✅ Working     | P0       |                            |
| " /" with content opens menu  | ✅ Working     | P0       |                            |
| Menu appears above block      | ✅ Working     | P1       |                            |
| Arrow keys navigate menu      | ✅ Working     | P0       |                            |
| Enter selects option          | ✅ Working     | P0       |                            |
| Escape closes menu            | ✅ Working     | P0       |                            |
| Click outside closes menu     | ✅ Working     | P0       |                            |
| Cancel restores "/"           | ❌ Not Working | P1       | "/" not restored on cancel |

#### 2.2 Search Functionality

| Test Case                     | Current Status | Priority | Notes |
| ----------------------------- | -------------- | -------- | ----- |
| Search box auto-focuses       | ✅ Working     | P0       |       |
| Typing filters options        | ✅ Working     | P0       |       |
| First result auto-highlighted | ✅ Working     | P1       |       |
| No results shows empty state  | ❌ Not Working | P2       |       |
| Clear search resets options   | ✅ Working     | P1       |       |

### 3. Text Formatting

#### 3.1 Inline Formatting

| Test Case                    | Current Status | Priority | Notes         |
| ---------------------------- | -------------- | -------- | ------------- |
| Bold selection (Ctrl+B)      | ✅ Working     | P0       |               |
| Italic selection (Ctrl+I)    | ✅ Working     | P0       |               |
| Underline selection (Ctrl+U) | ✅ Working     | P0       |               |
| Code formatting (backticks)  | ✅ Working     | P1       |               |
| Link formatting (Ctrl+K)     | ✅ Working     | P0       |               |
| Link clickable with Ctrl/Cmd | ✅ Fixed       | P0       | Fixed July 27 |

#### 3.2 Cross-Block Formatting

| Test Case                          | Current Status     | Priority | Notes              |
| ---------------------------------- | ------------------ | -------- | ------------------ |
| Format across block boundaries     | ✅ Working         | P0       |                    |
| Preserve formatting on block split | ✅ Working         | P0       |                    |
| Copy formatted text between blocks | ✅ Working         | P0       |                    |
| Undo formatting across blocks      | ❌ Not Implemented | P2       | No undo system yet |

### 4. Copy/Paste Operations

#### 4.1 Internal Copy/Paste

| Test Case                                | Current Status | Priority | Notes         |
| ---------------------------------------- | -------------- | -------- | ------------- |
| Copy single block preserves type         | ✅ Fixed       | P0       | Fixed July 27 |
| Copy multiple blocks preserves all types | ✅ Fixed       | P0       | Fixed July 27 |
| Cut operation removes blocks             | ✅ Working     | P0       |               |
| Paste with editor focused                | ✅ Working     | P0       |               |
| Paste with editor unfocused              | ✅ Fixed       | P0       | Fixed July 27 |
| Formatting preserved in copy/paste       | ✅ Fixed       | P0       | Fixed July 27 |

#### 4.2 External Copy/Paste

| Test Case              | Current Status | Priority | Notes            |
| ---------------------- | -------------- | -------- | ---------------- |
| Paste from Google Docs | ❓ Unknown     | P1       | Need to test     |
| Paste from Notion      | ❓ Unknown     | P1       | Need to test     |
| Paste from Word        | ❓ Unknown     | P1       | Need to test     |
| Paste plain text       | ✅ Working     | P0       |                  |
| Paste markdown content | ⚠️ Partial     | P0       | Needs re-trigger |

### 5. Markdown Support

#### 5.1 Typing Markdown

| Test Case          | Current Status | Priority | Notes |
| ------------------ | -------------- | -------- | ----- |
| "# " → Heading 1   | ✅ Working     | P0       |       |
| "## " → Heading 2  | ✅ Working     | P0       |       |
| "### " → Heading 3 | ✅ Working     | P0       |       |
| "- " → Bullet list | ✅ Working     | P0       |       |
| "**text**" → Bold  | ✅ Working     | P1       |       |
| "_text_" → Italic  | ✅ Working     | P1       |       |

#### 5.2 Pasting Markdown

| Test Case                         | Current Status | Priority | Notes              |
| --------------------------------- | -------------- | -------- | ------------------ |
| Paste "# Heading" → H1 block      | ⚠️ Issues      | P0       | Needs re-trigger   |
| Each line → separate block        | ✅ Working     | P1       |                    |
| Empty lines → empty blocks        | ❓ Unknown     | P2       | Decision needed    |
| Markdown removed after conversion | ❌ Issues      | P0       | Not always removed |

#### 5.3 Copying as Markdown

| Test Case                     | Current Status | Priority | Notes             |
| ----------------------------- | -------------- | -------- | ----------------- |
| Copy includes markdown syntax | ❌ Issues      | P1       | Extra line breaks |
| Line breaks between blocks    | ❌ Issues      | P1       | 13 line breaks    |
| Works in external apps        | ❓ Unknown     | P1       | Need to test      |

### 6. Drag and Drop

#### 6.1 Single Block Drag

| Test Case                    | Current Status     | Priority | Notes          |
| ---------------------------- | ------------------ | -------- | -------------- |
| Drag handle appears on hover | ✅ Working         | P1       |                |
| Drag preview shows           | ✅ Working         | P1       |                |
| Drop indicator displays      | ✅ Working         | P0       | Purple line    |
| Block moves to new position  | ✅ Working         | P0       |                |
| Undo works after drag        | ❌ Not Implemented | P2       | No undo system |

#### 6.2 Multi-Block Drag

| Test Case                       | Current Status | Priority | Notes              |
| ------------------------------- | -------------- | -------- | ------------------ |
| Select multiple blocks          | ✅ Working     | P0       | Fixed July 24      |
| Drag all selected blocks        | ✅ Working     | P0       | Fixed July 24      |
| Drop indicator spans all blocks | ❌ Issues      | P2       | Only single height |
| Order preserved after drop      | ✅ Working     | P0       |                    |

### 7. Known Bugs to Test

#### 7.1 Critical Bugs

| Bug                            | Status    | Priority | Impact             |
| ------------------------------ | --------- | -------- | ------------------ |
| "Typing backwards" bug         | ❌ Active | P0       | Major UX issue     |
| Invisible text until new block | ❌ Active | P0       | Major UX issue     |
| Can't delete last block        | ❌ Active | P0       | Workflow blocker   |
| Enter at block start broken    | ❌ Active | P0       | Core functionality |

#### 7.2 Placeholder Issues

| Bug                             | Status     | Priority | Impact             |
| ------------------------------- | ---------- | -------- | ------------------ |
| Placeholder text interactive    | ❌ Active  | P0       | Causes typing bugs |
| Placeholder causing typing bugs | ❌ Active  | P0       | Major UX issue     |
| Placeholder positioning issues  | ❓ Unknown | P2       |                    |

#### 7.3 Other Issues

| Bug                             | Status     | Priority | Impact          |
| ------------------------------- | ---------- | -------- | --------------- |
| "/" after content moves cursor  | ❓ Unknown | P2       | Can't reproduce |
| Drop gap size for multi-blocks  | ❌ Active  | P2       | Visual issue    |
| Markdown paste needs re-trigger | ❌ Active  | P1       | UX issue        |

## HTML Transition Specific Tests

### 8. HTML Converters

#### 8.1 toHTML Conversion

| Test Case                   | Priority | Notes |
| --------------------------- | -------- | ----- |
| Paragraph block → `<p>` tag | P0       |       |
| Heading 1 → `<h1>` tag      | P0       |       |
| Heading 2 → `<h2>` tag      | P0       |       |
| Heading 3 → `<h3>` tag      | P0       |       |
| Bullet list → `<ul><li>`    | P0       |       |
| Bold text → `<strong>`      | P0       |       |
| Italic text → `<em>`        | P0       |       |
| Link → `<a href="">`        | P0       |       |
| Block ID → data-kairos-id   | P1       |       |
| Timestamps preserved        | P1       |       |

#### 8.2 fromHTML Conversion

| Test Case                       | Priority | Notes             |
| ------------------------------- | -------- | ----------------- |
| `<p>` → Paragraph block         | P0       |                   |
| `<h1>` → Heading 1 block        | P0       |                   |
| `<strong>` → Bold formatting    | P0       |                   |
| Nested formatting preserved     | P0       |                   |
| Unknown tags handled gracefully | P0       |                   |
| Malformed HTML handled          | P0       |                   |
| XSS prevention                  | P0       | Security critical |

#### 8.3 Round-trip Validation

| Test Case                    | Priority | Notes |
| ---------------------------- | -------- | ----- |
| JSON → HTML → JSON identical | P0       |       |
| Complex nested structures    | P0       |       |
| All metadata preserved       | P0       |       |
| No data loss                 | P0       |       |
| Performance < 50ms           | P1       |       |

## Test Implementation Strategy

### Phase 1: Critical Path (Week 1)

- All P0 tests for basic operations
- HTML converter round-trip tests
- Security tests (XSS prevention)

### Phase 2: Feature Completeness (Week 2)

- All P1 tests
- External paste compatibility
- Performance benchmarks

### Phase 3: Edge Cases (Week 3)

- All P2 tests
- Browser-specific tests
- Stress tests with large documents

## Success Metrics

1. **Zero Regressions**: All currently working features continue to work
2. **Bug Fixes**: At least 4 critical bugs fixed (Enter at start, Delete last block, Placeholder issues, Typing backwards)
3. **Performance**: No noticeable performance degradation
4. **Compatibility**: Works with major external sources (Google Docs, Notion, Word)
5. **Security**: Zero XSS vulnerabilities

## Notes

- Tests marked with ❓ need investigation to determine current status
- Priority levels: P0 (Critical), P1 (Important), P2 (Nice to have)
- This inventory will be updated as implementation progresses
- Each test should have both unit tests and integration tests where applicable
