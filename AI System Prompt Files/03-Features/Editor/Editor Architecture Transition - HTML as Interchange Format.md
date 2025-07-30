# Editor Architecture Transition: HTML as Interchange Format

**Created**: July 27, 2025  
**Last Updated**: July 30, 2025  
**Status**: PHASE 0 COMPLETE - Foundation & Testing Done  
**Priority**: Critical  
**Scope**: Editor Core Architecture

## 🎯 Progress Update (July 30, 2025)

✅ **Phase 0 Complete**: Foundation and testing infrastructure established

- Created comprehensive Editor Test Inventory (200+ test cases)
- Built `@kairos/editor-interchange` package with HTML/JSON converters
- Achieved 90% test coverage with 26 tests
- Ready to proceed with Phase 1: Clipboard Enhancement

## ⚠️ Critical Notice

This document describes a fundamental shift in the editor's data philosophy. It is NOT just about clipboard functionality - it's about how the editor conceptualizes data exchange with the outside world.

## The Paradigm Shift

### From: Application-Centric Model

```
┌─────────────────────┐
│   Kairos Editor     │
│                     │
│  "Our JSON format   │
│   is the truth"     │
│                     │
│  Everyone else must │
│  adapt to us        │
└─────────────────────┘
```

### To: Web-Native Model

```
┌─────────────────────┐
│   Kairos Editor     │
│                     │
│  "HTML is the       │
│   lingua franca"    │
│                     │
│  We speak the web's │
│  native language    │
└─────────────────────┘
```

## The Core Problem

Every modern editor faces the same challenge: How do you maintain rich internal state while seamlessly exchanging data with the outside world?

### Current Reality: The Translation Tax

Every time data crosses the editor boundary, we pay a "translation tax":

```
Internal World          Boundary               External World
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          ↓
JSON Blocks    →    [TRANSLATE]    →    Markdown/HTML/Plain
                          ↓
EditorBlock[]  →    [TRANSLATE]    →    User's Clipboard
                          ↓
Our Format     →    [TRANSLATE]    →    Other Apps
                          ↓
Custom Types   →    [TRANSLATE]    →    Mobile Platforms
```

**Every arrow is complexity. Every translation is a potential bug.**

## The Architectural Vision

### HTML as Universal Interchange

Instead of forcing the world to understand our JSON, we adopt HTML as the canonical interchange format:

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Internal State │         │   Interchange   │         │ External World  │
│                 │         │                 │         │                 │
│  JSON (private) │ <-----> │  HTML (public)  │ <-----> │ Everything Else │
│  Optimized for  │         │  Universal      │         │ Notion, Google  │
│  React/Editor   │         │  Standard       │         │ Docs, Mobile... │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### What This Means

1. **Import Anything**: If it's HTML, we can import it
2. **Export Anywhere**: Our content works everywhere
3. **Copy/Paste Naturally**: No special handling needed
4. **Mobile Ready**: Native HTML support on all platforms
5. **Future Features**: Templates, sharing, collaboration - all HTML-based

## Implementation Philosophy

### Phase 1: Establish the Bridge (Current Focus)

- Create robust HTML ↔ JSON converters
- Replace custom clipboard format with HTML
- Maintain full fidelity in conversions
- Keep JSON as internal format

### Phase 2: Expand the Bridge (Future)

- Import/export features use HTML
- Templates stored as HTML
- Sharing mechanisms use HTML
- API responses include HTML representation

### Phase 3: Consider Full Migration (Distant Future)

- Evaluate storing HTML in database
- Consider HTML as internal format
- Align with libraries like ProseMirror/Slate

## Technical Implementation

### Core Converters

```typescript
// The heart of the architecture transition
interface EditorInterchange {
  // Serialize our internal state to HTML
  toHTML(blocks: EditorBlock[]): string

  // Parse HTML into our internal state
  fromHTML(html: string): EditorBlock[]

  // Graceful degradation to markdown
  toMarkdown(blocks: EditorBlock[]): string

  // Smart detection of content type
  detectFormat(content: string): 'html' | 'markdown' | 'plain'
}
```

### HTML Structure

```html
<!-- Our blocks become semantic HTML -->
<article data-kairos-page>
  <h1>Document Title</h1>
  <p>This is <strong>rich</strong> text with <a href="#">links</a>.</p>
  <ul>
    <li>Bullet points</li>
    <li>Naturally represented</li>
  </ul>
</article>
```

### Data Preservation

```html
<!-- Kairos-specific data preserved in attributes -->
<p data-kairos-id="block123" data-kairos-created="2025-07-27T10:00:00Z" data-kairos-version="1">Content with metadata</p>
```

## Impact Analysis

### Immediate Benefits

1. **Clipboard**: Works in all scenarios (focused/unfocused)
2. **Interoperability**: Paste from any source preserves structure
3. **Mobile Path**: Clear strategy for mobile apps

### Long-term Benefits

1. **Standards-based**: Leverage web standards instead of fighting them
2. **Ecosystem**: Integrate with any HTML-aware tool
3. **Future-proof**: HTML will outlive any proprietary format

### Risks and Mitigations

| Risk                    | Impact | Mitigation                                             |
| ----------------------- | ------ | ------------------------------------------------------ |
| HTML parsing complexity | High   | Use battle-tested libraries (DOMParser, sanitize-html) |
| Performance overhead    | Medium | Cache conversions, optimize hot paths                  |
| Feature parity          | Medium | Careful mapping, progressive enhancement               |
| Security (XSS)          | High   | Strict sanitization, whitelist approach                |

## Success Metrics

1. **Functional**: All current features work through HTML interchange
2. **Performance**: < 50ms for typical conversions
3. **Compatibility**: Works with Notion, Google Docs, MS Word
4. **Security**: Zero XSS vulnerabilities
5. **Developer Experience**: Clear, maintainable conversion code

## Migration Strategy

### Branch Strategy

**Working in `editor-transition` branch means:**

- ✅ Zero risk to main development
- ✅ Can experiment freely
- ✅ Easy rollback if approach doesn't work
- ✅ Can skip extensive prototyping phase

### Phase 0: Foundation & Testing (Start Here)

**Goal**: Build test suite and HTML converters

#### 1. **Create Comprehensive Test Suite** ✅ COMPLETED (July 30, 2025)

**Test Discovery Process**:

a) **Extract from User Stories**

- [x] Review `User Stories - Editor.md` systematically
  - [x] Read through "Typing and creating blocks" story
  - [x] Extract each acceptance criteria as a test case
  - [x] Note all issues mentioned in "Notes" section
  - [x] Create test cases for each edge case mentioned
- [x] Review `User Stories - Page Management.md`
  - [x] Extract tests for page creation/deletion impact on editor
  - [x] Note any editor-related behaviors
- [x] Review `User Stories - Workspace.md`
  - [x] Extract tests for workspace switching impact on editor
  - [x] Note auto-save related test cases
- [x] Convert acceptance criteria format to test cases
  - [x] Map "[x]" items to "should work" tests
  - [x] Map "[ ]" items to "should implement" tests
  - [x] Map "Notes" bugs to regression tests

**Result**: Created comprehensive `Editor Test Inventory.md` with 13 test categories covering all editor functionality

b) **Catalog Current Behavior**

- [x] Set up golden file test infrastructure
  - [x] Create test harness for capturing DOM snapshots
  - [x] Set up event recording mechanism
  - [x] Create state change logger
- [ ] Record baseline behaviors
  - [ ] Capture DOM structure for empty editor
  - [ ] Record DOM after typing text
  - [ ] Capture DOM after each block operation
  - [ ] Document selection states
- [ ] Capture event sequences
  - [ ] Log keyboard events for common operations
  - [ ] Record mouse events for drag operations
  - [ ] Capture clipboard events
  - [ ] Document custom event dispatches
- [ ] Test browser variations
  - [ ] Test in Chrome and capture baselines
  - [ ] Test in Firefox and note differences
  - [ ] Test in Safari and note differences
  - [ ] Document any browser-specific workarounds

c) **Test Inventory Structure**:

```markdown
## Editor Test Inventory

### Block Operations (from User Stories - Editor.md)

#### Enter Key Behavior

- [ ] Enter at end of block → new block below
- [ ] Enter in middle → splits block correctly
- [ ] Enter at start → empty block above (currently broken)
- [ ] Enter in empty block → maintains block
- [ ] Enter in list block → creates body block (not another list)
- [ ] Enter with selection → deletes selection and splits

#### Block Deletion

- [ ] Backspace at block start → merges with previous
- [ ] Delete at block end → merges with next
- [ ] Delete last block → handled gracefully (currently broken)
- [ ] Backspace in empty block → removes block
- [ ] Delete selection spanning blocks → merges remaining

#### Placeholder Text

- [ ] Empty block shows placeholder
- [ ] Placeholder disappears on typing
- [ ] Placeholder not selectable (currently broken)
- [ ] Placeholder shows correct text per block type

### Text Formatting (from User Stories - Editor.md)

#### Inline Formatting

- [ ] Bold selection (Ctrl+B)
- [ ] Italic selection (Ctrl+I)
- [ ] Underline selection (Ctrl+U)
- [ ] Code formatting (backticks)
- [ ] Link formatting (Ctrl+K)

#### Cross-Block Formatting

- [ ] Format across block boundaries
- [ ] Preserve formatting on block split
- [ ] Copy formatted text between blocks
- [ ] Undo formatting across blocks

### Slash Commands (from User Stories - Editor.md)

#### Basic Slash Command

- [ ] "/" at block start opens menu
- [ ] " /" with content opens menu
- [ ] Menu appears above block
- [ ] Arrow keys navigate menu
- [ ] Enter selects option
- [ ] Escape closes menu
- [ ] Click outside closes menu

#### Search Functionality

- [ ] Search box auto-focuses
- [ ] Typing filters options
- [ ] First result auto-highlighted
- [ ] No results shows empty state
- [ ] Clear search resets options

### Copy/Paste Operations

#### Internal Copy/Paste

- [ ] Copy single block preserves type
- [ ] Copy multiple blocks preserves all types
- [ ] Cut operation removes blocks
- [ ] Paste with editor focused
- [ ] Paste with editor unfocused (recently fixed)

#### External Copy/Paste

- [ ] Paste from Google Docs
- [ ] Paste from Notion
- [ ] Paste from Word
- [ ] Paste plain text
- [ ] Paste markdown content

### Drag and Drop

#### Single Block Drag

- [ ] Drag handle appears on hover
- [ ] Drag preview shows
- [ ] Drop indicator displays
- [ ] Block moves to new position
- [ ] Undo works after drag

#### Multi-Block Drag

- [ ] Select multiple blocks
- [ ] Drag all selected blocks
- [ ] Drop indicator spans all blocks
- [ ] Order preserved after drop

### Known Issues to Test (from Notes sections)

#### Critical Bugs

- [ ] "Typing backwards" bug
- [ ] Invisible text until new block
- [ ] Can't delete last block
- [ ] Enter at block start broken

#### Placeholder Issues

- [ ] Placeholder text interactive
- [ ] Placeholder causing typing bugs
- [ ] Placeholder positioning issues

#### Slash Command Issues

- [ ] "/" after content moves cursor
- [ ] Cancel doesn't restore "/"
- [ ] Menu position with scrolling

#### Markdown Issues

- [ ] Paste markdown needs re-trigger
- [ ] Multiple line breaks on copy
- [ ] Markdown not removed on paste
```

d) **Review Process**

- [x] Create initial test inventory document
  - [x] Organize by feature area
  - [x] Include priority levels
  - [x] Note current pass/fail status
- [ ] Present inventory for review
  - [ ] Schedule review session
  - [ ] Walk through each test category
  - [ ] Gather feedback on missing cases
  - [ ] Update based on feedback
- [x] Prioritize test implementation
  - [x] Mark P0 (critical) tests
  - [x] Mark P1 (important) tests
  - [x] Mark P2 (nice-to-have) tests
  - [x] Create implementation order
- [ ] Set up continuous tracking
  - [ ] Create test coverage dashboard
  - [ ] Track implementation progress
  - [ ] Update as new issues found

#### 2. **Build HTML Converters in Isolation** ✅ COMPLETED (July 30, 2025)

**Safe Development Approach**:

a) **Separate Module**

- [x] Create new package structure
  - [x] Run `mkdir -p packages/editor-interchange/src`
  - [x] Create `packages/editor-interchange/package.json`
  - [x] Set up TypeScript configuration
  - [x] Configure build process
- [x] Set up zero dependencies
  - [x] No imports from existing editor code
  - [x] Define own type interfaces
  - [x] Use only standard DOM APIs
  - [x] Add sanitization library (DOMPurify)
- [x] Create module exports
  - [x] Export toHTML function
  - [x] Export fromHTML function
  - [x] Export format detection function
  - [x] Export type definitions

**Result**: Created `@kairos/editor-interchange` package with full HTML/JSON conversion capabilities

b) **Comprehensive Testing** ✅ COMPLETED (July 30, 2025)

- [x] Set up test infrastructure
  - [x] Install Jest and jsdom
  - [x] Configure test environment
  - [x] Create test utilities
  - [x] Set up coverage reporting

**Result**: 26 comprehensive tests with 90% statement coverage and 79% branch coverage

- [ ] Create block type conversion tests
  - [ ] `paragraph block → <p> tag`
  - [ ] `heading1 block → <h1> tag`
  - [ ] `heading2 block → <h2> tag`
  - [ ] `heading3 block → <h3> tag`
  - [ ] `bulletList block → <ul><li> structure`
  - [ ] `numberedList block → <ol><li> structure`
  - [ ] `quote block → <blockquote> tag`
  - [ ] `code block → <pre><code> tags`
- [ ] Create formatting conversion tests
  - [ ] `bold text → <strong> tag`
  - [ ] `italic text → <em> tag`
  - [ ] `underline text → <u> tag`
  - [ ] `code inline → <code> tag`
  - [ ] `link → <a> tag with href`
  - [ ] `nested formatting → proper nesting`
- [ ] Create metadata preservation tests
  - [ ] Block IDs preserved in data attributes
  - [ ] Creation timestamps preserved
  - [ ] Version numbers preserved
  - [ ] Custom properties preserved
- [ ] Create edge case tests
  - [ ] Empty blocks
  - [ ] Blocks with only whitespace
  - [ ] Deeply nested structures
  - [ ] Special characters and escaping
  - [ ] XSS prevention tests

c) **Round-trip Validation**

- [ ] Implement round-trip test suite
  - [ ] Create test data generator
  - [ ] Generate 100+ test cases
  - [ ] Test simple structures
  - [ ] Test complex nested structures
- [ ] Verify data integrity
  - [ ] JSON → HTML → JSON produces identical structure
  - [ ] All block properties preserved
  - [ ] All formatting maintained
  - [ ] No data loss in conversion
- [ ] Handle edge cases
  - [ ] Malformed HTML input
  - [ ] Invalid JSON structures
  - [ ] Missing required fields
  - [ ] Graceful error handling
- [ ] Performance testing
  - [ ] Measure conversion time
  - [ ] Test with large documents
  - [ ] Memory usage profiling
  - [ ] Identify optimization opportunities

#### 3. **Direct Implementation in Branch**

**Since we're using a separate branch, we can skip prototypes and directly:**

a) **Test as We Go**

- [x] Set up branch workflow
  - [x] Create `editor-transition` branch from main (already created)
  - [ ] Set up CI to run tests on branch
  - [ ] Configure branch protection rules
  - [ ] Document branch purpose in README
- [ ] Implement iterative testing
  - [ ] Write converter function
  - [ ] Add unit test immediately
  - [ ] Run full test suite
  - [ ] Commit only if tests pass
- [ ] Track progress systematically
  - [ ] Update checkboxes after each step
  - [ ] Document any issues found
  - [ ] Note performance metrics
  - [ ] Keep decision log updated

b) **Incremental Progress**

- [ ] Phase 1: Basic HTML converters
  - [ ] Implement toHTML for paragraph blocks
  - [ ] Test with real editor content
  - [ ] Implement fromHTML for paragraphs
  - [ ] Verify round-trip works
- [ ] Phase 2: Add block types incrementally
  - [ ] Add heading conversions
  - [ ] Add list conversions
  - [ ] Add quote conversions
  - [ ] Test each addition thoroughly
- [ ] Phase 3: Add formatting support
  - [ ] Implement bold/italic/underline
  - [ ] Add link handling
  - [ ] Support inline code
  - [ ] Test with complex formatting
- [ ] Phase 4: Integration testing
  - [ ] Test with actual clipboard operations
  - [ ] Verify external paste works
  - [ ] Check performance impact
  - [ ] Ensure no regressions

c) **Success Criteria**

- [ ] Feature parity validation
  - [ ] All current features work identically
  - [ ] No user-visible changes (except improvements)
  - [ ] All tests pass
  - [ ] No performance degradation
- [ ] Code quality metrics
  - [ ] Reduced lines of code
  - [ ] Fewer edge case handlers
  - [ ] Clearer data flow
  - [ ] Better error messages
- [ ] Bug reduction verification
  - [ ] "Enter at start" bug fixed
  - [ ] "Delete last block" bug fixed
  - [ ] Placeholder issues resolved
  - [ ] Clipboard works when unfocused
- [ ] Performance benchmarks
  - [ ] Conversion time < 50ms for typical content
  - [ ] No noticeable lag on paste
  - [ ] Memory usage stable
  - [ ] Smooth typing experience maintained

### Phase 1: Clipboard Enhancement (Low Risk)

**Goal**: Fix clipboard while maintaining all current functionality

1. **Dual-Mode Clipboard**

   - ADD HTML format to clipboard (don't remove JSON yet)
   - Test extensively with external apps
   - Keep JSON format as fallback

2. **Progressive Rollout**

   - Enable HTML clipboard behind feature flag
   - Test with small group first
   - Monitor for issues before full rollout

3. **Edge Case Handling**
   - Handle paste from Word, Google Docs, websites
   - Preserve as much formatting as possible
   - Graceful degradation for unknown content

### Phase 2: Internal Simplifications (Medium Risk)

**Goal**: Reduce complexity by leveraging HTML internally

1. **Simplify Selection Management**

   - Use browser's native selection for text
   - Keep custom selection only for blocks
   - Remove complex offset calculations

2. **Reduce Event Interception**

   - Let browser handle more native editing
   - Only intercept where necessary
   - Simplify cursor management

3. **Fix Current Edge Cases**
   - Enter at start of block
   - Delete last block
   - Placeholder interactions

### Phase 3: Import/Export (Low Risk, High Value)

- Document import uses HTML parser
- Export includes HTML option
- Templates stored as HTML
- API responses include HTML representation

### Phase 4: Consider Full Migration (Future)

- Evaluate storing HTML in database
- Consider HTML as internal format
- Align with libraries like ProseMirror/Slate

## The Bigger Picture

This transition positions Kairos as a truly web-native editor:

- **Not just in the browser**: Part of the web ecosystem
- **Not just using web tech**: Embracing web standards
- **Not just another editor**: A participant in the broader web

When a user copies from Kairos and pastes into their blog, email, or notes app, it should "just work" - because we're all speaking the same language: HTML.

## Functionality Preservation Guarantee

### What We Keep (100% Preserved)

✅ **Block Operations**

- Drag-and-drop reordering
- Block selection with handles
- Block type transformations
- Slash commands

✅ **Text Editing**

- All formatting (bold, italic, underline, etc.)
- Cross-block text selection
- Keyboard shortcuts
- Undo/redo

✅ **UI/UX Features**

- Hover states
- Visual feedback
- Smooth animations
- Responsive design

✅ **Data Integrity**

- All block metadata
- Creation timestamps
- Version tracking
- User preferences

### What Gets Better

🚀 **Copy/Paste**

- Works when editor not focused
- Preserves formatting from external sources
- No more custom clipboard handlers

🚀 **Performance**

- Less JavaScript execution per keystroke
- Native browser optimizations
- Reduced state updates

🚀 **Maintainability**

- Fewer edge cases
- Simpler codebase
- Standard patterns

## Decision Log

**July 27, 2025**:

- Recognized that clipboard issues reveal deeper architectural concerns
- Decided to adopt HTML as interchange format (not internal format)
- Acknowledged this is a fundamental shift in data philosophy
- Committed to phased approach to manage risk

**July 30, 2025**:

- Added Phase 0 for risk reduction and testing
- Emphasized functionality preservation
- Created explicit guarantees about feature retention
- Prioritized building confidence before major changes

## For Future Implementers

You're not just implementing copy/paste. You're building the bridge between Kairos and the rest of the web. Every HTML parser you write, every converter you optimize, is making Kairos more connected to the broader ecosystem.

Remember: The goal isn't to replace our internal architecture. It's to make our editor a first-class citizen of the web.
