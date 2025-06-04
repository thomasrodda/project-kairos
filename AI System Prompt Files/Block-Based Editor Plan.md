# Block-Based Editor Plan

> A comprehensive implementation guide for Project Kairos's custom block-based editor. This document outlines the architecture, data structures, and implementation approach for our Notion-style editor with full markdown support.

---

## 🎯 Core Requirements Summary

### Editor Features

- **Block Types**: H1, H2, H3, Paragraph, Bullet List. More to come later.
- **Block Creation**: Enter key creates new blocks, Shift+Enter for line breaks within the current block
- **Slash Commands**: Type `/` in an empty block or after ` ` in any block to open Slash Command menu. Appears above focused block.
- **Formatting Toolbar**: Bold, Italic, Underline on text selection. Appears above selected text.
- **Drag & Drop**: Reorder blocks via drag handles with smooth animations
- **Markdown Support**: Live conversion + export/copy as markdown
- **Multi-block Selection**: Select across blocks, copy as markdown
- **Undo/Redo**: Full history for all operations
- **Autosave**: Every 5 minutes + 1 second after inactivity

---

## 🎯 Implementation Decisions

### Agreed Technical Approaches

1. **ContentEditable Strategy**

   - Use `contentEditable` for rich text support and cross-block text selection
   - Wrap carefully to control browser inconsistencies
   - Each block will have its own `contentEditable` element
   - Custom handling for cross-block selection tracking

2. **State Management Architecture**

   - Use React Context WITH useReducer pattern
   - Provides global access with organized state updates
   - Better support for complex operations (undo/redo, multi-block operations)

3. **Component Structure**

   - Create `EditorContent` as its own component (inside the existing Editor layout)
   - Keep Editor.tsx as the main container
   - EditorContent will house all blocks and editing functionality

4. **Drag & Drop Implementation** ✨ **UPDATED**

   - Use **@dnd-kit** library for smooth, accessible drag & drop
   - Provides touch support, keyboard navigation, and beautiful animations
   - Much more reliable than HTML5 Drag & Drop API
   - Includes built-in accessibility features

5. **Testing Strategy**

   - "Test critical parts" approach
   - Test individual components as built
   - Skip complex integration tests until features complete
   - Focus on happy path testing first

6. **Styling Approach**
   - Use existing design tokens from the design system
   - Keep styling minimal during development
   - Style tweaks will come after functionality is complete

---

## 📐 Architecture Overview

### Component Hierarchy

```
Editor/
├── Editor.tsx                    # Main container, layout wrapper
├── EditorContent/
│   ├── EditorContent.tsx        # Houses all blocks and manages editing
│   └── EditorContent.scss       # Specific styles for content area
├── EditorContext.tsx            # Global editor state (React Context + useReducer)
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
  pageId: string | null
  pageTitle: string
  blocks: EditorBlock[]
  focusedBlockId: string | null
  selectedBlockId: string | null
  isDragging: boolean // Simplified from previous approach
  selectedRange?: {
    startBlockId: string
    startOffset: number
    endBlockId: string
    endOffset: number
  }
  isDirty: boolean
  lastSaved: Date | null
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
User types "/" in an empty block or after " " in any block → Detect slash in correct situation → Show menu above focused block and focus menu, highlight first formatting option
↓
User types "hea" → Filter to "Heading 1, Heading 2, Heading 3"
↓
User can use arrow keys or mouse → Change which formatting option is highlighted
↓
User presses Enter → Convert block to highlighted option → Remove "/" → Focus block
```

### 2. Markdown Conversion Flow

```
User types "# " at the start of a block → Detect markdown pattern → Convert to relevant block type
↓
Remove "# " from content → Continue typing
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

**Testing Approach**: Test critical functionality as we build each phase, focusing on component rendering and basic interactions. Complex integration tests will come after features are complete.

# Block-Based Editor Implementation Progress

## Phase 1: Core Block System ✅ COMPLETE

- [x] Create `EditorContext` with useReducer pattern
- [x] Create `EditorContent` component
- [x] Create `PageTitle` component (editable, non-removable)
- [x] Create `EditorBlock` component with contentEditable
- [x] Implement basic typing and content updates
- [x] Add Enter key handling for new blocks
- [x] Add placeholder text for empty blocks
- [x] Style different block types (H1, H2, H3, P) using design tokens
- [x] Initialize new pages with title "New Page" and one empty paragraph
- [x] Add click-to-focus functionality in editor empty space
- [x] Implement proper cursor management and focus handling
- [x] Add multi-element contentEditable support with TypeScript typing

## Phase 2: Block Management

- [x] Add drag handles (hover to show)
- [x] Add block selection via drag handle click
- [x] Add block deletion (via drag handle selection + keyboard)
- [x] Implement keyboard deletion of selected blocks (Delete/Backspace)
- [x] Implement Shift+Enter for line breaks
- [x] Add click-away and escape key dismiss behavior (useDismiss hook)
- [x] Implement block state management (focused vs selected states)
- [x] Implement drag & drop reordering
- [x] Add visual feedback during drag operations
- [ ] Add multi-block selection

## Phase 3: Slash Commands

- [ ] Create floating `SlashMenu` component
- [ ] Detect "/" after space or in empty blocks
- [ ] Add search/filter functionality
- [ ] Implement keyboard navigation (arrow keys + Enter)
- [ ] Add block type conversion
- [ ] Add menu positioning logic
- [ ] Handle menu dismiss on escape/click-away

## Phase 4: Markdown Support

- [ ] Implement live markdown detection (# , ## , \* , etc.)
- [ ] Add markdown-to-block parser for paste
- [ ] Add block-to-markdown serializer for copy
- [ ] Handle multi-block selection and copying
- [ ] Add markdown export functionality
- [ ] Handle complex paste scenarios (multiple lines, mixed content)

## Phase 5: Formatting Toolbar

- [ ] Create floating toolbar component
- [ ] Add text selection detection across blocks
- [ ] Implement bold, italic, underline formatting
- [ ] Add toolbar positioning logic (above selection)
- [ ] Add fade-in animation and smooth transitions
- [ ] Handle toolbar dismiss behavior

## Phase 6: Polish & Optimization

- [ ] Add undo/redo system with operation history
- [ ] Implement autosave with debouncing
- [ ] Add performance optimizations (virtualization for large documents)
- [ ] Write comprehensive tests for all components
- [ ] Add accessibility improvements (ARIA labels, screen reader support)
- [ ] Add keyboard shortcuts documentation
- [ ] Optimize bundle size and loading performance

---

## 🔧 Technical Decisions

### ContentEditable Implementation

- Use `contentEditable` for rich text support
- Each block has its own `contentEditable` element
- Carefully manage cursor position and selection state
- Prevent default formatting (no `<div>` wrapping)
- Custom implementation for cross-block text selection

### State Management

- React Context with useReducer pattern for global editor state
- Actions for all state changes (better debugging and undo/redo)
- Immutable updates for undo/redo support
- Centralized state for selection tracking across blocks

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
   - Coordinate selection state between individual contentEditable elements
   - Custom implementation for cross-block text selection and operations

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

**Note**: All styling will use existing design tokens from the design system. Final style adjustments will be made after functionality is complete.

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
