# Enhanced Custom Editor Plan

> **UPDATED: Professional Editor Enhancement Strategy** - A comprehensive implementation guide for Project Kairos's block-based editor enhancement. This builds professional features like cross-block selection, intelligent copy/paste, and enhanced undo/redo on our proven custom editor foundation.

---

## 🎯 Core Requirements Summary

### Editor Features

- **Block Types**: H1, H2, H3, Paragraph, Bullet List. More to come later.
- **Block Creation**: Enter key creates new blocks, Shift+Enter for line breaks within the current block
- **Slash Commands**: Type `/` to open command menu with our custom block types
- **Formatting Toolbar**: Bold, Italic, Underline on text selection with our custom styling
- **Drag & Drop**: Reorder blocks via drag handles with smooth animations ✅ **COMPLETE**
- **Cross-Block Text Selection**: Select text spanning multiple blocks using native browser APIs
- **Markdown Support**: Live conversion + export/copy as markdown
- **Intelligent Copy/Paste**: Partial selection = text, full blocks = markdown
- **Multi-block Selection**: Select across blocks, copy as markdown ✅ **COMPLETE**
- **Enhanced Undo/Redo**: Command pattern for all operations with intelligent merging
- **Autosave**: Every 5 minutes + 1 second after inactivity

---

## 🎯 **NEW**: Implementation Decisions

### **Enhanced Custom Editor Architecture** ⭐ **UPDATED**

1. **Why Enhance Our Custom Editor?**

   - Complete control over every feature and interaction
   - Perfect integration with our design system and SCSS
   - No external dependencies or version conflicts
   - Optimal performance tailored to our specific needs
   - Easy to understand, debug, and extend

2. **Professional Features Strategy**

   - **Cross-block text selection** using native `Selection` and `Range` APIs
   - **Intelligent copy/paste** with automatic content type detection
   - **Enhanced undo/redo** using command pattern with intelligent merging
   - **Live markdown conversion** for seamless writing experience
   - **Custom UI components** perfectly styled with our design tokens

3. **Technical Approach**

   - **Native Browser APIs**: Leverage modern web standards for robust functionality
   - **Incremental Enhancement**: Build professional features on proven foundation
   - **State Integration**: Work seamlessly with existing EditorContext
   - **Performance Focus**: Optimize for large documents and smooth interactions

4. **Custom Implementation Benefits**
   - **Complete Design Control**: Every pixel matches our design system
   - **Optimal Performance**: Only features we need, optimized for our use case
   - **Easy Debugging**: Full understanding of codebase and feature interactions
   - **Future-Proof**: Simple to add new features tailored to our users

---

## 📐 **NEW**: Architecture Overview

### Component Hierarchy

```
Editor/
├── Editor.tsx                    # Main container, layout wrapper
├── EditorContent/
│   ├── EditorContent.tsx        # Enhanced with cross-block selection
│   └── EditorContent.scss       # Styles for content area
├── EditorContext.tsx            # Enhanced state management
├── PageTitle.tsx                # Editable page title component
├── Block/                       # Enhanced block components
│   ├── Block.tsx               # Enhanced with text selection support
│   ├── BlockDragHandle.tsx     # Existing drag & drop ✅
│   └── DraggableBlock.tsx      # Existing @dnd-kit integration ✅
├── SlashMenu/                   # NEW: Custom slash command menu
│   ├── SlashMenu.tsx           # Menu component with our design
│   ├── SlashMenuItem.tsx       # Individual menu options
│   └── SlashMenu.scss          # Styled with design tokens
├── FormattingToolbar/           # NEW: Text formatting toolbar
│   ├── FormattingToolbar.tsx   # Floating toolbar on selection
│   ├── FormatButton.tsx        # Individual format buttons
│   └── FormattingToolbar.scss  # Styled with design tokens
└── hooks/                       # NEW: Professional feature hooks
    ├── useCrossBlockSelection.ts # Cross-block text selection
    ├── useEditorHistory.ts      # Enhanced undo/redo with commands
    ├── useMarkdownDetection.ts  # Live markdown conversion
    ├── useClipboard.ts          # Intelligent copy/paste
    └── useSlashMenu.ts          # Slash command menu logic
```

---

## 🗃️ **NEW**: Data Structures

### Page Data Model (Enhanced)

```typescript
interface Page {
  id: string
  title: string // Managed by EditorContext
  blocks: EditorBlock[] // Enhanced with cross-block selection support
  settings?: {
    width?: 'slim' | 'wide' | 'full' // Future feature
  }
  history?: {
    commands: EditorCommand[]
    currentIndex: number
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

// Enhanced EditorContext with professional features
interface EditorState {
  // Existing state (preserved)
  pageId: string | null
  pageTitle: string
  blocks: EditorBlock[]
  focusedBlockId: string | null
  selectedBlockIds: string[] // Existing multi-block selection ✅
  isDragging: boolean
  isDirty: boolean
  lastSaved: Date | null

  // NEW: Professional features
  crossBlockSelection: CrossBlockSelection | null
  editorHistory: EditorHistory
  slashMenuState: SlashMenuState | null
  formattingToolbarState: FormattingToolbarState | null
}

// NEW: Cross-block text selection
interface CrossBlockSelection {
  startBlockId: string
  startOffset: number
  endBlockId: string
  endOffset: number
  selectedText: string
  selectedBlocks: string[] // Fully selected block IDs
}

// NEW: Enhanced undo/redo system
interface EditorHistory {
  commands: EditorCommand[]
  currentIndex: number
  maxSize: number
}

// NEW: Command pattern for undo/redo
interface EditorCommand {
  type: string
  execute: () => void
  undo: () => void
  merge?: (other: EditorCommand) => EditorCommand | null
  timestamp: number
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

## 🎮 **NEW**: Key Interactions with Enhanced Editor

### 1. Cross-Block Text Selection Flow

```
User starts text selection → Browser Selection API tracks → Calculate block spans
↓
Show visual highlight across blocks → Copy preserves cross-block text
↓
Paste works intelligently based on selection type
```

### 2. Intelligent Copy/Paste Flow

```
User copies selection → Detect if partial text or full blocks
↓
Partial text → Copy as plain text | Full blocks → Copy as markdown
↓
Paste detects content type → Auto-convert markdown to blocks if applicable
```

### 3. Enhanced Undo/Redo Flow

```
User performs action → Wrap in EditorCommand → Execute and add to history
↓
Undo: Execute previous command's undo() → Redo: Execute command again
↓
Smart merging: Typing commands merge, complex operations remain separate
```

### 4. Live Markdown Conversion Flow

```
User types "# " → Detect markdown pattern → Convert block to H1
↓
Continue typing → Normal text input → Smart detection for next conversion
```

### 5. Page Export Flow

```
User clicks export → Serialize title + all blocks to markdown
↓
Format: "# {Page Title}\n\n{blocks as markdown}"
↓
Download as .md file or copy to clipboard
```

---

## 🏗️ **UPDATED**: Implementation Phases

**Testing Approach**: Test critical functionality as we build each phase, focusing on component rendering and basic interactions. Complex integration tests will come after features are complete.

### Phase 1: Foundation Complete ✅ **DONE**

- [x] Block-based editor with all block types (H1, H2, H3, paragraph, bullet)
- [x] Drag & drop reordering with @dnd-kit
- [x] Multi-block selection via drag handles
- [x] Clean component architecture and state management
- [x] Design system integration with SCSS

### Phase 2: Cross-Block Text Selection **🔄 CURRENT FOCUS**

**Files to Create:**

- `apps/web/src/hooks/useCrossBlockSelection.ts`
- `apps/web/src/utils/textSelection.ts`

**Files to Enhance:**

- `apps/web/src/components/Editor/EditorContent/EditorContent.tsx`
- `apps/web/src/components/Editor/Block/Block.tsx`
- `apps/web/src/contexts/EditorContext.tsx`

**Implementation:**

```typescript
// useCrossBlockSelection.ts - Core hook
export function useCrossBlockSelection() {
  const [selection, setSelection] = useState<CrossBlockSelection | null>(null)

  useEffect(() => {
    const handleSelectionChange = () => {
      const browserSelection = document.getSelection()
      if (browserSelection && browserSelection.rangeCount > 0) {
        const newSelection = calculateCrossBlockSelection(browserSelection)
        setSelection(newSelection)
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  return { selection, clearSelection: () => setSelection(null) }
}
```

### Phase 3: Intelligent Copy/Paste **📋 PLANNED**

**Files to Create:**

- `apps/web/src/utils/clipboard.ts`
- `apps/web/src/utils/markdown.ts`
- `apps/web/src/hooks/useClipboard.ts`

**Features:**

- Detect selection type (partial text vs full blocks)
- Copy appropriate format (plain text vs markdown)
- Smart paste with markdown conversion

### Phase 4: Enhanced Undo/Redo **📋 PLANNED**

**Files to Create:**

- `apps/web/src/hooks/useEditorHistory.ts`
- `apps/web/src/utils/commands.ts`

**Features:**

- Command pattern for all operations
- Intelligent command merging for typing
- Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)

### Phase 5: Live Markdown & UI Enhancements **📋 PLANNED**

**Files to Create:**

- `apps/web/src/hooks/useMarkdownDetection.ts`
- `apps/web/src/components/Editor/SlashMenu/` (folder)
- `apps/web/src/components/Editor/FormattingToolbar/` (folder)

**Features:**

- Live markdown conversion while typing
- Custom slash command menu
- Floating formatting toolbar on text selection

---

## 🎯 **CURRENT MILESTONE**: Phase 2 - Cross-Block Text Selection

**Focus**: Enable text selection spanning multiple blocks using native browser APIs

**Success Criteria**:

- [ ] Text selection works across multiple blocks seamlessly
- [ ] Visual highlighting spans blocks with our design tokens
- [ ] Copy operation extracts cross-block text correctly
- [ ] No interference with existing block selection system
- [ ] Performance is smooth with 50+ blocks

**Implementation Approach**:

1. **Use Native Selection API**: Leverage `document.getSelection()` and `Range`
2. **Block Span Calculation**: Determine which blocks are partially/fully selected
3. **Visual Integration**: Apply our design tokens for selection highlighting
4. **State Coordination**: Work with existing EditorContext and block selection

**Files Ready to Implement**:

- `apps/web/src/hooks/useCrossBlockSelection.ts` - Main selection logic
- `apps/web/src/utils/textSelection.ts` - Selection calculation utilities
- Enhanced `EditorContent.tsx` - Integration with existing editor

---

## 🔧 **NEW**: Technical Implementation Details

### Cross-Block Selection

```typescript
// textSelection.ts - Utility functions
export function calculateCrossBlockSelection(browserSelection: Selection): CrossBlockSelection | null {
  const range = browserSelection.getRangeAt(0)
  const startBlock = findBlockFromNode(range.startContainer)
  const endBlock = findBlockFromNode(range.endContainer)

  if (!startBlock || !endBlock) return null

  return {
    startBlockId: startBlock.id,
    startOffset: range.startOffset,
    endBlockId: endBlock.id,
    endOffset: range.endOffset,
    selectedText: range.toString(),
    selectedBlocks: getFullySelectedBlocks(startBlock, endBlock),
  }
}
```

### Intelligent Clipboard

```typescript
// clipboard.ts - Smart copy/paste detection
export function determineClipboardData(selection: CrossBlockSelection): ClipboardData {
  const isPartialText = selection.startBlockId === selection.endBlockId && selection.selectedBlocks.length === 0

  if (isPartialText) {
    return {
      type: 'text',
      plainText: selection.selectedText,
      markdownText: selection.selectedText,
    }
  }

  // Full blocks selected - convert to markdown
  return {
    type: 'blocks',
    plainText: selection.selectedText,
    markdownText: convertBlocksToMarkdown(selection.selectedBlocks),
  }
}
```

### Command Pattern

```typescript
// commands.ts - Command implementations
export class InsertTextCommand implements EditorCommand {
  constructor(
    private blockId: string,
    private text: string,
    private position: number
  ) {}

  execute() {
    // Insert text at position
  }

  undo() {
    // Remove inserted text
  }

  merge(other: EditorCommand): EditorCommand | null {
    // Merge consecutive typing commands
    if (other instanceof InsertTextCommand && other.blockId === this.blockId) {
      return new InsertTextCommand(this.blockId, this.text + other.text, this.position)
    }
    return null
  }
}
```

---

## 🚨 **UPDATED**: Edge Cases We Handle

### **Native API Advantages:**

1. ✅ **Cross-Block Text Selection** - Browser Selection API handles complex cases
2. ✅ **Copy/Paste Reliability** - Native clipboard integration
3. ✅ **Performance** - Browser-optimized selection algorithms
4. ✅ **Accessibility** - Screen reader support built into browser APIs

### **Custom Implementation Handles:**

1. **Block Boundary Detection** - Smart calculation of which blocks are selected
2. **State Coordination** - Integration with existing block selection system
3. **Visual Feedback** - Custom highlighting with our design tokens
4. **Undo/Redo Complexity** - Command pattern with intelligent merging

---

## 💡 **NEW**: Enhancement Benefits

### **What We Keep:**

- ✅ All our design tokens and SCSS architecture
- ✅ Our EditorContext pattern and state management
- ✅ Our component structure and layout
- ✅ Our drag & drop and multi-block selection
- ✅ Our understanding of editor requirements

### **What We Add:**

- 🚀 **Professional text selection** across multiple blocks
- 🚀 **Intelligent copy/paste** with automatic content detection
- 🚀 **Enhanced undo/redo** with command pattern
- 🚀 **Live markdown conversion** for seamless writing
- 🚀 **Custom UI components** (slash menu, formatting toolbar)
- 🚀 **Optimal performance** tailored to our needs

### **What We Avoid:**

- ❌ External library complexity and dependencies
- ❌ Styling conflicts and integration issues
- ❌ Version management and update complications
- ❌ Learning and debugging external code
- ❌ Performance overhead from unused features

---

## 🔄 **SIMPLIFIED**: Professional Features on Proven Foundation

Instead of replacing our working editor, we're enhancing it with:

```typescript
// Enhanced EditorContent keeps existing functionality and adds:
const EditorContent = () => {
  // EXISTING: All current functionality (preserved)
  const { blocks, dispatch, selectedBlockIds } = useEditorState()
  const { sensors, handleDragStart, handleDragEnd } = useDndKit() // ✅ Keep

  // NEW: Professional enhancements
  const crossBlockSelection = useCrossBlockSelection()
  const editorHistory = useEditorHistory(dispatch)
  const markdownDetection = useMarkdownDetection()

  // All features work together seamlessly
}
```

---

## 🚀 **NEW**: Future Enhancements

Our enhanced custom editor makes these features much easier to add:

- **Table blocks** - Custom block type with our component system
- **Code blocks** - Enhanced block with syntax highlighting
- **@-mentions** - Build on text selection and inline formatting
- **Real-time collaboration** - Extend command system for operational transforms
- **Custom block types** - Extensible architecture we fully control

---

## ⚡ **UPDATED**: Performance Strategy

### **We Control Performance:**

- ✅ **Selective Enhancement**: Only add features we need
- ✅ **Optimized Algorithms**: Efficient cross-block selection and operations
- ✅ **Memory Management**: Smart undo/redo history with size limits
- ✅ **Browser API Leverage**: Use highly optimized native APIs

### **Focus Areas:**

- 🎯 **Large Document Support**: Efficient selection across many blocks
- 🎯 **Smooth Interactions**: 60fps for all animations and selections
- 🎯 **Memory Efficiency**: Intelligent command history management

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

## 📋 **NEW**: Development Workflow

### **Enhancement Strategy:**

1. **Build on Proven Foundation** - Keep everything that works perfectly
2. **One Feature at a Time** - Implement and test incrementally
3. **Integration Focus** - Ensure new features work with existing systems
4. **Performance Monitoring** - Maintain smooth experience throughout

### **Quality Assurance:**

- **Unit Testing** for new utility functions and hooks
- **Integration Testing** for feature interactions
- **Performance Testing** with large documents
- **Accessibility Testing** for all new interactions

---

This enhanced plan builds professional editor capabilities on our solid foundation while maintaining complete control over performance, design, and functionality. The approach gives us all the sophistication of modern editors like Notion while preserving our clean, maintainable architecture.

By enhancing our proven custom editor rather than replacing it, we get the best of both worlds: complete control over every feature and interaction, perfect integration with our design system, and the ability to add exactly the professional features we need without external dependencies or complexity.
