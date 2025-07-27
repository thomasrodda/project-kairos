# Editor Architecture Transition: HTML as Interchange Format

**Created**: July 27, 2025  
**Status**: FUNDAMENTAL ARCHITECTURE CHANGE - TEST IMPLEMENTATION  
**Priority**: Critical  
**Scope**: Editor Core Architecture

## ⚠️ Critical Notice

This is not just a clipboard change. This represents a fundamental shift in how the editor handles data interchange, potentially affecting:

- Block serialization/deserialization
- Import/export functionality
- Copy/paste operations
- Future mobile app compatibility
- Data persistence format
- External integrations

## Executive Summary

This document outlines a fundamental architectural transition to adopt HTML as the primary interchange format for the Kairos editor, replacing the current custom JSON-based approach. While initially motivated by clipboard limitations, this change has far-reaching implications for the entire editor architecture.

## Current Architecture

### Internal Data Model

```typescript
// Current: Blocks stored as JSON objects
{
  id: string,
  type: 'h1' | 'h2' | 'paragraph' | 'bullet',
  content: string,
  formatting: [{ type: 'bold', start: 0, end: 5 }]
}
```

### Current Data Flow

1. **Internal State**: JSON objects in React state
2. **Rendering**: React components render from JSON
3. **Editing**: ContentEditable → DOM changes → Sync to JSON state
4. **Persistence**: JSON saved to database
5. **Interchange**: Custom format for copy/paste

### Current Problems

1. **Clipboard Limitations**:

   - Unfocused paste loses block types and formatting
   - Browser security restrictions with custom MIME types
   - Poor mobile compatibility

2. **Architectural Constraints**:
   - Two separate systems: JSON for state, DOM for editing
   - Complex synchronization between DOM and state
   - Custom format limits interoperability
   - Future mobile apps would need custom clipboard handling

## Proposed Architecture

### Philosophical Shift

**HTML becomes the canonical interchange format** - the "lingua franca" for moving data in and out of the editor. The internal JSON representation remains, but HTML serves as the bridge to the outside world.

### New Data Flow

1. **Internal State**: Keep JSON objects (no change initially)
2. **Rendering**: Keep React components (no change)
3. **Editing**: Keep ContentEditable (no change)
4. **Interchange**: HTML as primary format
5. **Import/Export**: HTML-based
6. **Copy/Paste**: HTML + Markdown in plain text

### Benefits

- **Universal compatibility**: Works everywhere (web, desktop, mobile)
- **Graceful degradation**: Rich content → HTML → Markdown → Plain text
- **Future-proof**: Natural path to mobile apps
- **Industry standard**: How Notion, Google Docs, and others work

### HTML Format Structure

```html
<!-- Heading 1 -->
<h1 data-kairos-block-id="block123">Page Title</h1>

<!-- Heading 2 -->
<h2 data-kairos-block-id="block456">Section Header</h2>

<!-- Paragraph with formatting -->
<p data-kairos-block-id="block789">This is <strong>bold</strong> and <em>italic</em> text with a <a href="https://example.com">link</a>.</p>

<!-- Bullet list -->
<ul>
  <li data-kairos-block-id="block012">First item</li>
  <li data-kairos-block-id="block345">Second item</li>
</ul>

<!-- Inline formatting data -->
<p
  data-kairos-block-id="block678"
  data-kairos-formatting='[{"type":"bold","start":5,"end":10},{"type":"link","start":15,"end":20,"url":"https://example.com"}]'
>
  Some formatted text here
</p>
```

### Plain Text Format

```markdown
# Page Title

## Section Header

This is **bold** and _italic_ text with a [link](https://example.com).

- First item
- Second item

Some formatted text here
```

## Architectural Implications

### What This Changes

1. **Import/Export**: Future import/export features would use HTML
2. **Templates**: Page templates could be stored as HTML
3. **Sharing**: Shared content would be HTML-based
4. **Mobile**: Native mobile apps can handle HTML natively
5. **Integrations**: Third-party tools expect HTML

### What Stays The Same (For Now)

1. **Internal State**: Still JSON-based EditorBlock[]
2. **Database**: Still stores JSON (can migrate later)
3. **React Components**: No changes needed
4. **Editor Logic**: Core editing remains unchanged

### Future Considerations

This transition opens the door to:

- Storing HTML in database instead of JSON
- Using HTML as internal format (like ProseMirror)
- Rich text editing libraries that work with HTML
- Better WYSIWYG experience

## Implementation Steps

### Phase 1: Copy Implementation

1. **Modify copy handler** in `EditorContent.tsx`

   - Remove custom Kairos format
   - Add HTML generation
   - Ensure plain text includes markdown syntax

2. **Create HTML generator** utility

   ```typescript
   // utils/clipboardHtml.ts
   export function blocksToHtml(blocks: EditorBlock[]): string
   export function formatToHtml(text: string, formatting: TextFormat[]): string
   ```

3. **Update existing markdown generation**
   - Ensure all block types properly convert
   - Add inline markdown for formatting (bold, italic)

### Phase 2: Paste Implementation

1. **Modify paste handlers** in both:

   - `ContentEditableContainer.tsx` (focused paste)
   - `EditorContent.tsx` (unfocused paste)

2. **Create HTML parser** utility

   ```typescript
   // utils/clipboardHtml.ts
   export function htmlToBlocks(html: string): EditorBlock[]
   export function parseHtmlFormatting(element: HTMLElement): TextFormat[]
   ```

3. **Update markdown detection**
   - Keep existing `blockMarkdownDetection.ts`
   - Use as fallback when no HTML available

### Phase 3: Testing & Edge Cases

1. **Test matrix**:

   - Copy from Kairos → Paste in Kairos (focused)
   - Copy from Kairos → Paste in Kairos (unfocused)
   - Copy from Kairos → Paste in external editor
   - Copy from external → Paste in Kairos
   - Multi-block operations
   - Complex formatting combinations

2. **Edge cases to handle**:
   - Malformed HTML
   - XSS prevention
   - Nested formatting
   - Unknown HTML elements
   - Character encoding

### Phase 4: Cleanup

1. Remove old custom format code
2. Update tests
3. Update documentation

## File Changes Required

### Files to Modify

1. `/apps/web/src/components/Editor/EditorContent/EditorContent.tsx`

   - Update copy event handler
   - Update unfocused paste handler

2. `/apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.tsx`

   - Update focused paste handler

3. `/apps/web/src/utils/clipboardHtml.ts` (NEW FILE)

   - HTML generation functions
   - HTML parsing functions
   - Security/sanitization

4. `/apps/web/src/utils/formattingRenderer.tsx`
   - May need updates for HTML generation

### Files to Keep (with modifications)

1. `/apps/web/src/utils/blockMarkdownDetection.ts` - Keep as fallback
2. `/apps/web/src/utils/textFormatting.ts` - Still needed for internal use

## Security Considerations

### HTML Sanitization

- **Required**: Sanitize all pasted HTML to prevent XSS
- **Library Option**: Consider DOMPurify or similar
- **Allowed Tags**: `<p>`, `<h1-h6>`, `<ul>`, `<li>`, `<strong>`, `<em>`, `<u>`, `<a>`, `<code>`
- **Allowed Attributes**: `href` (for links), `data-kairos-*` (for metadata)

### URL Validation

- Continue using existing URL sanitization
- Block `javascript:` and `data:` URLs

## Migration Path

### For Existing Users

- No migration needed - this only affects copy/paste
- Old clipboard data won't persist anyway

### Rollback Plan

1. Keep old code in git history
2. Document commit hash before changes
3. Can revert by restoring three files

## Risks and Mitigation

### Technical Risks

1. **HTML Parsing Complexity**

   - Risk: HTML parsing is complex and error-prone
   - Mitigation: Use battle-tested libraries, extensive testing

2. **Performance Impact**

   - Risk: HTML generation/parsing slower than JSON
   - Mitigation: Profile and optimize, cache where possible

3. **Data Loss**

   - Risk: HTML can't represent all JSON features
   - Mitigation: Use data attributes, careful mapping

4. **Security**
   - Risk: XSS vulnerabilities from pasted HTML
   - Mitigation: Strict sanitization, whitelist approach

### Architectural Risks

1. **Scope Creep**

   - Risk: Temptation to rewrite entire editor
   - Mitigation: Strict phases, clear boundaries

2. **Two-System Problem**

   - Risk: HTML and JSON drift apart
   - Mitigation: Single source of truth, clear conversion rules

3. **Migration Difficulty**
   - Risk: Hard to migrate existing content
   - Mitigation: This is interchange only, not storage

## Success Criteria

1. ✅ All paste scenarios work (focused and unfocused)
2. ✅ Block types preserved in all cases
3. ✅ Text formatting preserved when possible
4. ✅ Works with external editors (Notion, Google Docs, VS Code)
5. ✅ No security vulnerabilities
6. ✅ Performance acceptable (< 100ms for typical paste)

## Testing Checklist

### Basic Operations

- [ ] Copy single block → paste focused
- [ ] Copy single block → paste unfocused
- [ ] Copy multiple blocks → paste focused
- [ ] Copy multiple blocks → paste unfocused
- [ ] Cut operations work correctly

### Formatting Preservation

- [ ] Bold text preserved
- [ ] Italic text preserved
- [ ] Links preserved and clickable
- [ ] Mixed formatting preserved
- [ ] Block types (H1, H2, bullet) preserved

### External Integration

- [ ] Copy from Kairos → paste in Notion
- [ ] Copy from Notion → paste in Kairos
- [ ] Copy from Kairos → paste in Google Docs
- [ ] Copy from Kairos → paste in VS Code (markdown)
- [ ] Copy from web page → paste in Kairos

### Edge Cases

- [ ] Empty blocks
- [ ] Very long blocks (1000+ characters)
- [ ] Special characters and unicode
- [ ] Malformed HTML doesn't crash
- [ ] XSS attempts are blocked

## Notes for Future Implementation

1. **Start with Phase 1** - Get copy working first
2. **Test extensively** before moving to Phase 2
3. **Keep console.logs during testing** - Remove before final commit
4. **Browser compatibility**: Test in Chrome, Firefox, Safari, Edge
5. **This is a TEST** - Be prepared to revert if issues arise

## Related Documentation

- [User Stories - Copy Paste.md](./User Stories - Copy Paste.md) - Original requirements
- [User Stories - Editor.md](./User Stories - Editor.md) - Editor context
- [Current State.md](../../01-Core/Current State.md) - Update after implementation

## Decision Log

**July 27, 2025**:

- Initially created as "Clipboard Transition Plan" to solve unfocused paste issue
- Renamed to "Editor Architecture Transition" after recognizing the fundamental implications
- Decision: Adopt HTML as the interchange format while keeping JSON as internal state
- Rationale:
  - Solves immediate clipboard problems
  - Prepares for mobile apps
  - Industry standard approach
  - Allows gradual migration
- Risk acknowledged: This is a significant architectural change disguised as a simple fix
