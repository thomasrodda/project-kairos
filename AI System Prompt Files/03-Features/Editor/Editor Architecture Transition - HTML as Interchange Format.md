# Editor Architecture Transition: HTML as Interchange Format

**Created**: July 27, 2025  
**Status**: FUNDAMENTAL ARCHITECTURE CHANGE - TEST IMPLEMENTATION  
**Priority**: Critical  
**Scope**: Editor Core Architecture

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

#### 1. **Create Comprehensive Test Suite**

**Test Discovery Process**:

a) **Extract from User Stories**

- Systematically review every User Story document
- Convert each acceptance criteria into a test case
- Include all "Notes" sections as edge case tests
- Example: "User Stories - Editor.md" → 50+ specific test cases

b) **Catalog Current Behavior**

- Create "golden file" tests that capture exact current output
- Record DOM structure for each operation
- Capture event sequences and state changes
- Document browser-specific behaviors

c) **Test Inventory Structure**:

```markdown
## Editor Test Inventory

### Block Operations (from User Stories - Editor.md)

- [ ] Enter at end of block → new block below
- [ ] Enter in middle → splits block correctly
- [ ] Enter at start → empty block above
- [ ] Delete last block → handled gracefully
- [ ] Backspace at block start → merges blocks

### Text Formatting (from User Stories - Editor.md)

- [ ] Bold selection (Ctrl+B)
- [ ] Italic selection (Ctrl+I)
- [ ] Format across block boundaries
- [ ] Preserve formatting on block split

### Known Issues to Test (from Notes sections)

- [ ] "Typing backwards" bug
- [ ] Invisible text until new block
- [ ] Placeholder interaction issues
- [ ] Slash command after content
```

d) **Review Process**

- Present complete test inventory for review
- Verify understanding of each feature
- Add any missing scenarios
- Prioritize critical vs nice-to-have tests

#### 2. **Build HTML Converters in Isolation**

**Safe Development Approach**:

a) **Separate Module**

- Create `packages/editor-interchange/` package
- Zero dependencies on existing editor code
- Can be developed and tested independently

b) **Comprehensive Testing**

```typescript
// Test every conversion scenario
describe('HTML Converters', () => {
  test('paragraph block → <p> tag', () => {})
  test('heading block → <h1-h6> tags', () => {})
  test('formatted text → <strong>, <em>', () => {})
  test('nested lists → <ul>/<ol> structure', () => {})
  // ... test for EVERY block type and format
})
```

c) **Round-trip Validation**

- JSON → HTML → JSON must be identical
- Test with complex nested structures
- Verify metadata preservation
- Handle edge cases gracefully

#### 3. **Direct Implementation in Branch**

**Since we're using a separate branch, we can skip prototypes and directly:**

a) **Test as We Go**

- Make changes directly in the branch
- Test each feature immediately
- Revert specific commits if something doesn't work

b) **Incremental Progress**

- Start with HTML converters
- Test with existing features
- Only proceed if things work well

c) **Success Criteria**

- All existing features still work
- Code becomes simpler
- Edge cases are reduced
- Performance remains good

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
