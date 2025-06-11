# Text Formatting Plan

> **Rich Text Implementation Strategy** - Detailed plan for implementing Notion-style text formatting in Project Kairos's block editor, supporting multiple input methods with seamless markdown conversion.

## 📊 Implementation Status

### ✅ Phase 1: Core Infrastructure (Complete)

- ✅ Updated EditorContext with TextFormat types and formatting field
- ✅ Added formatting action types (APPLY_FORMATTING, REMOVE_FORMATTING, UPDATE_BLOCK_FORMATTING)
- ✅ Created comprehensive text formatting utilities with 41 passing tests
- ✅ Implemented all core formatting functions with edge case handling

### ⏳ Phase 2: Markdown Detection & Conversion (Pending)

### ✅ Phase 3: Rendering Formatted Text (Complete)

- ✅ Created FormattedText renderer component
- ✅ Implemented segment splitting for mixed formatting
- ✅ Added support for all format types (bold, italic, underline, strikethrough, code, link)
- ✅ Integrated rendering into Block component
- ✅ Added CSS styles for all formatting types

### ✅ Phase 4: Formatting Toolbar Integration (Complete)

- ✅ Implemented formatting button click handlers with toggle functionality
- ✅ Added active state detection for formatting buttons
- ✅ Fixed selection preservation after formatting
- ✅ Prevented toolbar from closing during formatting operations
- ✅ Fixed toolbar position flickering/jumping issues
- ✅ Added link creation/removal with URL prompt
- ✅ Improved selection restoration logic to handle DOM changes

### ⏳ Phase 5: Keyboard Shortcuts (Pending)

### ⏳ Phase 6: Cross-Block Formatting (Pending)

---

## 🎯 Overview

This plan outlines the implementation of rich text formatting in Project Kairos's block editor. The goal is to provide a Notion-like experience where users can format text through multiple methods (toolbar, shortcuts, markdown), with markdown syntax being instantly converted to formatted text.

### Core Requirements

- **Multiple Input Methods**: Toolbar buttons, keyboard shortcuts, and markdown syntax
- **Live Markdown Conversion**: Markdown symbols are hidden and formatting is applied immediately
- **WYSIWYG Experience**: Users see formatted text, not markdown syntax
- **Cross-Block Formatting**: Support formatting that spans multiple blocks
- **Clean Data Structure**: Maintain separation between content and formatting

---

## 📊 Data Architecture

### Enhanced Block Structure

```typescript
// Update in EditorContext.tsx
interface EditorBlock {
  id: string
  type: BlockType
  content: string // Plain text only (no markdown symbols)
  formatting?: TextFormat[] // Rich text annotations
  metadata?: {
    placeholder?: string
    listIndex?: number
  }
}

interface TextFormat {
  start: number // Start position in content string
  end: number // End position in content string
  type: FormatType
  url?: string // For links
}

type FormatType = 'bold' | 'italic' | 'underline' | 'code' | 'strikethrough' | 'link'
```

### Example Data

```typescript
// Visual: "This is **bold** and *italic* text"
// Stored as:
{
  id: "block-123",
  type: "paragraph",
  content: "This is bold and italic text",  // Plain text
  formatting: [
    { start: 8, end: 12, type: "bold" },     // "bold"
    { start: 17, end: 23, type: "italic" }   // "italic"
  ]
}
```

---

## 🔧 Implementation Phases

### Phase 1: Core Infrastructure ✅

#### 1.1 Update Data Models ✅

**File: `apps/web/src/contexts/EditorContext.tsx`**

- ✅ Add `TextFormat` interface
- ✅ Add `formatting` field to `EditorBlock`
- ✅ Add new action types:
  - ✅ `APPLY_FORMATTING`: Apply format to selection
  - ✅ `REMOVE_FORMATTING`: Remove format from selection
  - ✅ `UPDATE_BLOCK_FORMATTING`: Update all formatting for a block

#### 1.2 Create Formatting Utilities ✅

**New File: `apps/web/src/utils/textFormatting.ts`**

```typescript
// Core utilities for managing text formatting

export interface FormatRange {
  start: number
  end: number
  type: FormatType
  url?: string
}

// ✅ Apply formatting to a range
export function applyFormat(formats: FormatRange[], start: number, end: number, type: FormatType, url?: string): FormatRange[] {
  // ✅ Implemented with overlap handling and merging
}

// ✅ Remove formatting from a range
export function removeFormat(formats: FormatRange[], start: number, end: number, type?: FormatType): FormatRange[] {
  // ✅ Implemented with proper splitting logic
}

// ✅ Check if a position has a specific format
export function hasFormat(formats: FormatRange[], position: number, type: FormatType): boolean {
  // ✅ Implemented
}

// ✅ Merge overlapping formats of the same type
export function mergeFormats(formats: FormatRange[]): FormatRange[] {
  // ✅ Implemented
}

// ✅ Adjust format positions after text changes
export function adjustFormatsAfterEdit(formats: FormatRange[], editStart: number, deleteLength: number, insertLength: number): FormatRange[] {
  // ✅ Implemented with comprehensive edge case handling
}

// Additional utilities implemented:
// ✅ getFormatsAtPosition() - Get all formats at a cursor position
// ✅ splitIntoSegments() - Split text into segments for rendering
// ✅ isRangeFormatted() - Check if a range is fully formatted
// ✅ toggleFormat() - Toggle formatting on/off for a range
```

### Phase 2: Markdown Detection & Conversion

#### 2.1 Create Markdown Detection System

**New File: `apps/web/src/utils/markdownDetection.ts`**

```typescript
interface MarkdownPattern {
  pattern: RegExp
  type: FormatType
  process: (match: RegExpMatchArray) => {
    start: number
    end: number
    content: string
    url?: string
  }
}

const MARKDOWN_PATTERNS: MarkdownPattern[] = [
  {
    pattern: /\*\*([^*]+)\*\*/g, // **bold**
    type: 'bold',
    process: (match) => ({
      start: match.index!,
      end: match.index! + match[1].length,
      content: match[1],
    }),
  },
  {
    pattern: /\*([^*]+)\*/g, // *italic*
    type: 'italic',
    process: (match) => ({
      start: match.index!,
      end: match.index! + match[1].length,
      content: match[1],
    }),
  },
  {
    pattern: /\[([^\]]+)\]\(([^)]+)\)/g, // [text](url)
    type: 'link',
    process: (match) => ({
      start: match.index!,
      end: match.index! + match[1].length,
      content: match[1],
      url: match[2],
    }),
  },
]

export function detectAndConvertMarkdown(
  text: string,
  cursorPosition: number
): {
  newText: string
  newFormats: FormatRange[]
  newCursorPosition: number
} | null {
  // Detect markdown patterns and convert to formatting
}
```

#### 2.2 Integrate Live Detection

**Update: `apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.tsx`**

Add markdown detection to the input handler:

- Monitor text changes
- Detect completed markdown patterns
- Convert markdown to formatting
- Update block content and formatting
- Maintain cursor position

### Phase 3: Rendering Formatted Text

#### 3.1 Create Format Renderer

**New File: `apps/web/src/components/Editor/FormattedText/FormattedText.tsx`**

```typescript
interface FormattedTextProps {
  content: string
  formatting?: TextFormat[]
  className?: string
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  content,
  formatting = [],
  className
}) => {
  // Split content into segments based on formatting
  const segments = splitIntoSegments(content, formatting)

  return (
    <>
      {segments.map((segment, index) => (
        <FormattedSegment
          key={index}
          text={segment.text}
          formats={segment.formats}
        />
      ))}
    </>
  )
}

const FormattedSegment: React.FC<{
  text: string
  formats: FormatType[]
}> = ({ text, formats }) => {
  // Render segment with appropriate formatting
  if (formats.includes('bold') && formats.includes('italic')) {
    return <strong><em>{text}</em></strong>
  }
  if (formats.includes('bold')) {
    return <strong>{text}</strong>
  }
  if (formats.includes('italic')) {
    return <em>{text}</em>
  }
  // ... other format combinations
  return <>{text}</>
}
```

#### 3.2 Update Block Rendering

**Update: `apps/web/src/components/Editor/Block/Block.tsx`**

Replace plain text rendering with FormattedText component:

- Import FormattedText component
- Pass content and formatting props
- Ensure contentEditable compatibility

### Phase 4: Formatting Toolbar Integration

#### 4.1 Enhance Formatting Toolbar

**Update: `apps/web/src/components/Editor/FormattingToolbar/FormattingToolbar.tsx`**

```typescript
const handleFormat = (formatType: FormatType) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  // Get selection details relative to blocks
  const selectionInfo = getBlockRelativeSelection(selection)

  // Apply formatting through EditorContext
  dispatch({
    type: 'APPLY_FORMATTING',
    blockId: selectionInfo.blockId,
    start: selectionInfo.start,
    end: selectionInfo.end,
    formatType,
  })

  // Restore selection after formatting
  restoreSelection(selectionInfo)
}
```

#### 4.2 Add Format State Detection

Show active formats in toolbar:

- Check formats at cursor position
- Highlight active format buttons
- Support toggle behavior

### Phase 5: Keyboard Shortcuts

#### 5.1 Implement Shortcut Handler

**New Hook: `apps/web/src/hooks/useFormatShortcuts.ts`**

```typescript
export function useFormatShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey

      if (!isMod) return

      switch (e.key) {
        case 'b':
          e.preventDefault()
          applyFormat('bold')
          break
        case 'i':
          e.preventDefault()
          applyFormat('italic')
          break
        case 'u':
          e.preventDefault()
          applyFormat('underline')
          break
        // ... other shortcuts
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
```

### Phase 6: Cross-Block Formatting

#### 6.1 Enhance Cross-Block Selection

**Update: `apps/web/src/hooks/useCrossBlockSelection.ts`**

Add formatting support:

- Track formatting across multiple blocks
- Apply formatting to partial block selections
- Handle format boundaries at block edges

#### 6.2 Multi-Block Format Operations

**New Utility: `apps/web/src/utils/crossBlockFormatting.ts`**

```typescript
export function applyFormatAcrossBlocks(blocks: EditorBlock[], selection: CrossBlockSelection, formatType: FormatType): EditorBlock[] {
  // Apply formatting across multiple blocks
  // Handle partial selections in first/last blocks
  // Apply to full content of middle blocks
}
```

---

## 🔄 Markdown Export/Import

### Export to Markdown

**New Utility: `apps/web/src/utils/markdownExport.ts`**

```typescript
export function blockToMarkdown(block: EditorBlock): string {
  let markdown = block.content
  const sortedFormats = [...(block.formatting || [])].sort((a, b) => b.start - a.start)

  // Apply formatting in reverse order to maintain positions
  for (const format of sortedFormats) {
    const text = markdown.substring(format.start, format.end)
    let formatted = text

    switch (format.type) {
      case 'bold':
        formatted = `**${text}**`
        break
      case 'italic':
        formatted = `*${text}*`
        break
      case 'link':
        formatted = `[${text}](${format.url})`
        break
      // ... other formats
    }

    markdown = markdown.substring(0, format.start) + formatted + markdown.substring(format.end)
  }

  // Apply block-level formatting
  switch (block.type) {
    case 'h1':
      return `# ${markdown}`
    case 'h2':
      return `## ${markdown}`
    // ... other block types
  }

  return markdown
}
```

### Import from Markdown

**New Utility: `apps/web/src/utils/markdownImport.ts`**

```typescript
export function markdownToBlock(markdown: string): Partial<EditorBlock> {
  // Parse block type from markdown
  // Extract inline formatting
  // Return block with content and formatting
}
```

---

## 🧪 Testing Strategy

### Unit Tests

1. **Text Formatting Utilities** ✅

   - ✅ Test format application/removal (7 tests)
   - ✅ Test format merging (5 tests)
   - ✅ Test position adjustments (6 tests)
   - ✅ Test helper functions (23 additional tests)
   - ✅ All 41 tests passing

2. **Markdown Detection**

   - Test pattern recognition
   - Test conversion accuracy
   - Test cursor position maintenance

3. **Format Rendering**
   - Test segment splitting
   - Test nested formatting
   - Test edge cases

### Integration Tests

1. **Toolbar Integration**

   - Test format application via toolbar
   - Test multi-block formatting
   - Test format state detection

2. **Keyboard Shortcuts**

   - Test all shortcut combinations
   - Test with different selections
   - Test cross-platform compatibility

3. **Markdown Conversion**
   - Test live markdown detection
   - Test all markdown patterns
   - Test mixed formatting

### E2E Tests

1. **User Workflows**
   - Format text using all three methods
   - Cross-block formatting scenarios
   - Copy/paste formatted text
   - Export/import with formatting

---

## 📈 Performance Considerations

### Optimizations

1. **Format Merging**: Merge adjacent formats of same type
2. **Segment Caching**: Memoize segment splitting for large blocks
3. **Debounced Detection**: Debounce markdown detection on input
4. **Virtual Rendering**: Only render visible formatted segments

### Benchmarks

- Format application: < 5ms for typical selection
- Markdown detection: < 10ms per keystroke
- Rendering: < 20ms for 50+ formatted segments
- Cross-block formatting: < 50ms for 10 blocks

---

## 🚀 Migration Strategy

### Backward Compatibility

1. Blocks without `formatting` field work as before
2. Plain text blocks remain plain text
3. Existing markdown in content can be converted on demand

### Migration Path

1. Deploy formatting infrastructure
2. Enable for new blocks only
3. Add migration tool for existing content
4. Gradually roll out to all users

---

## 📅 Implementation Timeline

### Week 1: Core Infrastructure

- Data model updates
- Formatting utilities
- Basic rendering

### Week 2: Input Methods

- Toolbar integration
- Keyboard shortcuts
- Markdown detection

### Week 3: Polish & Testing

- Cross-block formatting
- Performance optimization
- Comprehensive testing

### Week 4: Migration & Rollout

- Migration tools
- Documentation
- Gradual rollout

---

This plan provides a complete roadmap for implementing rich text formatting in Project Kairos. The approach balances user experience with technical simplicity, providing a Notion-like editing experience while maintaining a clean, maintainable architecture.
