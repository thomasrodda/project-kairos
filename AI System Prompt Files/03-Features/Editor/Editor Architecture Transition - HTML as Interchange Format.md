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

### Phase 1: Clipboard (Immediate)

- Replace custom clipboard format
- Implement HTML generators/parsers
- Maintain backward compatibility

### Phase 2: Import/Export (Next Quarter)

- Document import uses HTML parser
- Export includes HTML option
- Templates use HTML format

### Phase 3: Storage (Future Consideration)

- Evaluate HTML storage benefits
- Migration tools for existing content
- Performance analysis

## The Bigger Picture

This transition positions Kairos as a truly web-native editor:

- **Not just in the browser**: Part of the web ecosystem
- **Not just using web tech**: Embracing web standards
- **Not just another editor**: A participant in the broader web

When a user copies from Kairos and pastes into their blog, email, or notes app, it should "just work" - because we're all speaking the same language: HTML.

## Decision Log

**July 27, 2025**:

- Recognized that clipboard issues reveal deeper architectural concerns
- Decided to adopt HTML as interchange format (not internal format)
- Acknowledged this is a fundamental shift in data philosophy
- Committed to phased approach to manage risk

## For Future Implementers

You're not just implementing copy/paste. You're building the bridge between Kairos and the rest of the web. Every HTML parser you write, every converter you optimize, is making Kairos more connected to the broader ecosystem.

Remember: The goal isn't to replace our internal architecture. It's to make our editor a first-class citizen of the web.
