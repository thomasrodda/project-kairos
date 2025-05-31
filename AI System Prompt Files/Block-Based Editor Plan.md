# Block-Based Editor Plan

> A comprehensive implementation guide for Project Kairos's custom block-based editor. This document outlines the architecture, data structures, and implementation approach for our Notion-style editor with full markdown support.

---

## 🎯 Core Requirements Summary

### Editor Features

- **Block Types**: H1, H2, H3, Paragraph, Bullet List
- **Block Creation**: Enter key creates new blocks, Shift+Enter for line breaks
- **Slash Commands**: Type `/` after space to open block type menu
- **Formatting Toolbar**: Bold, Italic, Underline on text selection
- **Drag & Drop**: Reorder blocks via drag handles
- **Markdown Support**: Live conversion + export/copy as markdown
- **Multi-block Selection**: Select across blocks, copy as markdown
- **Undo/Redo**: Full history for all operations
- **Autosave**: Every 5 minutes + 1 second after inactivity

---

## 📐 Architecture Overview

### Component Hierarchy

```
Editor/
├── Editor.tsx                    # Main container, manages all blocks
├── EditorContext.tsx            # Global editor state (React Context)
├── PageTitle.tsx                # Editable page title component
├── Block/
│   ├── Block.tsx                # Wrapper with drag handle
│   ├── BlockContent.tsx         # Actual editable content
│   └── BlockDragHandle.tsx     # Drag handle component
├── SlashMenu/
│   ├── SlashMenu.tsx            # Floating menu container
│   ├── SlashMenuItem.tsx        # Individual menu option
│   └── SlashMenuSearch.tsx     # Search/filter input
├── FormattingToolbar/
│   ├── FormattingToolbar.tsx   # Floating toolbar
│   └── FormatButton.tsx         # Individual format button
└── hooks/
    ├── useBlockManagement.ts    # Block CRUD operations
    ├── useMarkdownConversion.ts # Markdown parsing/serialization
    ├── useUndoRedo.ts          # History management
    └── useAutosave.ts          # Debounced save logic
```

---

## 🗃️ Data Structures

### Page Data Model

```typescript
interface Page {
  id: string
  title: string // Editable page title (default: "New Page")
  blocks: EditorBlock[] // Always starts with one empty paragraph
  settings?: {
    width?: 'slim' | 'wide' | 'full' // Future feature
  }
}
```

### Block Data Model

```typescript
interface EditorBlock {
  id: string // Unique identifier for drag/drop
  type: BlockType // 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet'
  content: string // Plain text content
  metadata?: {
    placeholder?: string // Type-specific placeholder
    listIndex?: number // For ordered lists (future)
  }
}

type BlockType = 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet'

interface EditorState {
  blocks: EditorBlock[]
  focusedBlockId: string | null
  selectedRange?: {
    startBlockId: string
    startOffset: number
    endBlockId: string
    endOffset: number
  }
}

// Placeholder text map
const PLACEHOLDERS: Record<BlockType, string> = {
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  paragraph: 'Start writing...',
  bullet: 'List item',
}
```

### Markdown Serialization Strategy

Instead of storing markdown syntax, we'll:

1. Store blocks as structured data (type + content)
2. Serialize to markdown on-demand (copy/export)
3. Parse markdown on paste to create blocks

**Copy/Paste Behavior:**

- **Partial text selection** → Copy as plain text
- **Full block(s) selection** → Copy as markdown
- **Page export** → Always markdown format

```typescript
// Example serialization
const blockToMarkdown = (block: EditorBlock): string => {
  switch (block.type) {
    case 'h1':
      return `# ${block.content}`
    case 'h2':
      return `## ${block.content}`
    case 'h3':
      return `### ${block.content}`
    case 'bullet':
      return `* ${block.content}`
    default:
      return block.content
  }
}
```

---

## 🎮 Key Interactions

### 1. Slash Command Flow

```
User types " /" → Detect slash after space → Show menu at cursor
↓
User types "hea" → Filter to "Heading 1, Heading 2, Heading 3"
↓
User presses Enter → Convert block → Remove "/" → Focus block
```

### 2. Markdown Conversion Flow

```
User types "# " → Detect markdown pattern → Convert to H1
↓
Remove "# " from content → Update block type → Continue typing
```

### 3. Copy/Paste Flow

```
User selects across blocks → Build selection range
↓
Copy → Check if full blocks or partial → Serialize accordingly
↓
Paste → Parse markdown → Create new blocks → Insert at cursor
```

### 4. Page Export Flow

```
User clicks export → Serialize title + all blocks to markdown
↓
Format: "# {Page Title}\n\n{blocks as markdown}"
↓
Download as .md file or copy to clipboard
```

---

## 🏗️ Implementation Phases

### Phase 1: Core Block System

1. Create `PageTitle` component (editable, non-removable)
2. Create `EditorBlock` component with contentEditable
3. Implement basic typing and content updates
4. Add Enter key handling for new blocks
5. Add placeholder text for empty blocks
6. Style different block types (H1, H2, H3, P)
7. Initialize new pages with title "New Page" and one empty paragraph

### Phase 2: Block Management

1. Add drag handles (hover to show)
2. Implement drag & drop reordering
3. Add block deletion (via drag handle selection)
4. Implement Shift+Enter for line breaks

### Phase 3: Slash Commands

1. Create floating `SlashMenu` component
2. Detect "/" after space
3. Add search/filter functionality
4. Implement keyboard navigation
5. Add block type conversion

### Phase 4: Markdown Support

1. Implement live markdown detection (# , ## , \* , etc.)
2. Add markdown-to-block parser for paste
3. Add block-to-markdown serializer for copy
4. Handle multi-block selection

### Phase 5: Formatting Toolbar

1. Create floating toolbar component
2. Add text selection detection
3. Implement bold, italic, underline
4. Add fade-in animation

### Phase 6: Polish & Optimization

1. Add undo/redo system
2. Implement autosave
3. Add performance optimizations
4. Write comprehensive tests

---

## 🔧 Technical Decisions

### ContentEditable vs Input

- Use `contentEditable` for rich text support
- Carefully manage cursor position
- Prevent default formatting (no <div> wrapping)

### State Management

- React Context for global editor state
- Local state for individual block editing
- Immutable updates for undo/redo

### Unique IDs

- Use crypto.randomUUID() or nanoid
- IDs needed for drag/drop and multi-block selection

### Event Handling Priority

1. Keyboard shortcuts (Enter, Backspace, etc.)
2. Selection changes
3. Content changes
4. Mouse interactions

---

## 🚨 Edge Cases to Handle

1. **Cursor Management**

   - Maintain cursor position during block type changes
   - Handle cursor at block boundaries
   - Restore cursor after undo/redo

2. **Selection Across Blocks**

   - Track selection that spans multiple blocks
   - Handle partial block selection
   - Maintain selection during operations

3. **Paste Handling**

   - Plain text vs markdown detection
   - Multi-line paste creating multiple blocks
   - Paste into middle of block

4. **Performance**
   - Virtualize for 100+ blocks
   - Debounce frequent operations
   - Optimize re-renders

---

## 📝 Component Specifications

### Page Title Component

```typescript
interface PageTitleProps {
  title: string
  onUpdate: (title: string) => void
  placeholder?: string // Defaults to "New Page"
}
```

### Block Component

```typescript
interface BlockProps {
  block: EditorBlock
  isFocused: boolean
  onUpdate: (content: string) => void
  onDelete: () => void
  onTypeChange: (type: BlockType) => void
  onFocus: () => void
  onKeyDown: (e: KeyboardEvent) => void
}
```

### Slash Menu Component

```typescript
interface SlashMenuProps {
  position: { top: number; left: number }
  onSelect: (type: BlockType) => void
  onCancel: () => void
  filter: string
}
```

### Formatting Toolbar

```typescript
interface FormattingToolbarProps {
  selection: Selection
  onFormat: (format: 'bold' | 'italic' | 'underline') => void
}
```

---

## 🎨 Styling Guidelines

### Block Spacing

```scss
.block {
  &--h1 {
    margin: 2rem 0 1rem;
  }
  &--h2 {
    margin: 1.5rem 0 0.75rem;
  }
  &--h3 {
    margin: 1.25rem 0 0.5rem;
  }
  &--paragraph {
    margin: 0.5rem 0;
  }
  &--bullet {
    margin: 0.25rem 0;
  }
}
```

### Placeholder Styles

```scss
.block__content:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-muted);
  pointer-events: none;
}
```

---

## 🔄 Undo/Redo Strategy

### Operation Types

1. **Text Change**: Batch changes until pause (500ms)
2. **Block Creation**: Single operation
3. **Block Deletion**: Single operation
4. **Block Type Change**: Single operation
5. **Block Reorder**: Single operation

### Implementation

- Maintain operation history stack
- Store full editor state snapshots
- Limit history to last 50 operations

---

## 🚀 Future Enhancements

Once MVP is complete, we can add:

- Numbered lists with auto-numbering
- Code blocks with syntax highlighting
- Block indentation (nested lists)
- Image/file blocks
- Table blocks
- @-mentions within blocks
- Collaborative editing preparation

---

## ⚡ Performance Optimizations

### Development Approach

**Start simple, optimize when needed.** We'll build without virtualization first and add it if/when performance issues arise with long documents.

1. **Initial Implementation**

   - Render all blocks directly
   - Use React.memo for block components
   - Monitor performance with React DevTools

2. **Optimization Triggers** (add when we see):

   - Slow typing in documents with 50+ blocks
   - Laggy scrolling or interactions
   - High memory usage

3. **Optimization Strategy** (when needed):
   - Virtual scrolling for 100+ blocks
   - Lazy render blocks outside viewport
   - Debounce expensive operations
   - Use transform for drag animations
   - Batch state updates

---

This plan provides a solid foundation for building our block-based editor. Each phase builds on the previous one, allowing us to test and refine as we go.
