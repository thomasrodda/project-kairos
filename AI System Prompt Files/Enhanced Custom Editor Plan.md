# Enhanced Custom Editor Plan

> **Professional Editor Enhancement Strategy** - Implementation guide for Project Kairos's block-based editor enhancement with cross-block selection, intelligent copy/paste, and enhanced undo/redo.

---

## 🎯 Core Requirements Summary

### Editor Features

- **Block Types**: H1, H2, H3, Paragraph, Bullet List
- **Block Creation**: Enter key creates new blocks, Shift+Enter for line breaks
- **Slash Commands**: Type `/` to open command menu with block types
- **Formatting Toolbar**: Bold, Italic, Underline on text selection
- **Drag & Drop**: Reorder blocks via drag handles ✅ **COMPLETE**
- **Cross-Block Text Selection**: Select text spanning multiple blocks using native browser APIs
- **Markdown Support**: Live conversion + export/copy as markdown
- **Intelligent Copy/Paste**: Partial selection = text, full blocks = markdown
- **Multi-block Selection**: Select across blocks, copy as markdown ✅ **COMPLETE**
- **Enhanced Undo/Redo**: Command pattern with intelligent merging
- **Autosave**: Every 5 minutes + 1 second after inactivity

---

## 🏗️ Architecture Strategy

### Enhanced Custom Editor Approach

**Why enhance our custom editor?**

- Complete control over every feature and interaction
- Perfect integration with design system and SCSS
- No external dependencies or version conflicts
- Optimal performance tailored to specific needs
- Easy to understand, debug, and extend

### Technical Approach

- **Native Browser APIs**: Leverage Selection and Range APIs for robust functionality
- **Incremental Enhancement**: Build professional features on proven foundation
- **State Integration**: Work seamlessly with existing EditorContext
- **Performance Focus**: Optimize for large documents and smooth interactions

### Component Hierarchy

```
Editor/
├── Editor.tsx                    # Main container
├── EditorContent/
│   ├── EditorContent.tsx        # Enhanced with cross-block selection
│   └── EditorContent.scss       # Content area styles
├── EditorContext.tsx            # Enhanced state management
├── PageTitle.tsx                # Editable page title
├── Block/                       # Enhanced block components
│   ├── Block.tsx               # Enhanced with text selection support
│   ├── BlockDragHandle.tsx     # Existing drag & drop ✅
│   └── DraggableBlock.tsx      # Existing @dnd-kit integration ✅
├── SlashMenu/                   # Custom slash command menu
├── FormattingToolbar/           # Text formatting toolbar
└── hooks/                       # Professional feature hooks
    ├── useCrossBlockSelection.ts
    ├── useEditorHistory.ts
    ├── useMarkdownDetection.ts
    ├── useClipboard.ts
    └── useSlashMenu.ts
```

---

## 🗃️ Data Structures

### Enhanced EditorState

```typescript
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

  // Professional features
  crossBlockSelection: CrossBlockSelection | null
  editorHistory: EditorHistory
  slashMenuState: SlashMenuState | null
  formattingToolbarState: FormattingToolbarState | null
}

interface CrossBlockSelection {
  startBlockId: string
  startOffset: number
  endBlockId: string
  endOffset: number
  selectedText: string
  selectedBlocks: string[] // Fully selected block IDs
}

interface EditorHistory {
  commands: EditorCommand[]
  currentIndex: number
  maxSize: number
}

interface EditorCommand {
  type: string
  execute: () => void
  undo: () => void
  merge?: (other: EditorCommand) => EditorCommand | null
  timestamp: number
}
```

### Markdown Strategy

- Store blocks as structured data (type + content)
- Serialize to markdown on-demand (copy/export)
- Parse markdown on paste to create blocks

**Copy/Paste Behavior:**

- **Partial text selection** → Copy as plain text
- **Full block(s) selection** → Copy as markdown
- **Page export** → Always markdown format

---

## 🏗️ Implementation Phases

### Phase 1: Foundation Complete ✅ **DONE**

- [x] Block-based editor with all block types
- [x] Drag & drop reordering with @dnd-kit
- [x] Multi-block selection via drag handles
- [x] Clean component architecture and state management
- [x] Design system integration with SCSS

### Phase 2: Cross-Block Text Selection **🔄 CURRENT FOCUS**

#### **Core Functionality**

- [ ] Text selection works across multiple blocks seamlessly
- [ ] Visual highlighting spans blocks with design tokens
- [ ] Copy operation extracts cross-block text correctly
- [ ] No interference with existing block selection system
- [ ] Performance is smooth with 50+ blocks

#### **User Interaction Goals**

- [ ] Mouse selection works (click and drag across blocks)
- [ ] Keyboard selection works (Shift+Arrow keys across blocks)
- [ ] Ctrl+A selects all content in editor
- [ ] Touch selection works on mobile devices
- [ ] Selection persists during scrolling
- [ ] Double-click extends selection across word boundaries in multiple blocks
- [ ] Triple-click selects entire blocks

#### **Edge Case Handling**

- [ ] Selection across empty blocks works correctly
- [ ] Selection boundaries at block edges work properly
- [ ] Selection cleared appropriately (click elsewhere, Escape key)
- [ ] Selection works with different block types (headings, bullets, paragraphs)
- [ ] Selection handles mixed content (text + block boundaries)
- [ ] Selection works when blocks are added/deleted during selection
- [ ] Selection survives block reordering via drag & drop

#### **Visual & UX Polish**

- [ ] Selection highlighting uses consistent design tokens
- [ ] Selection appears instantly without lag
- [ ] Selection handles overlap with existing hover states
- [ ] Selection styling doesn't interfere with drag handle visibility
- [ ] Clear visual distinction between text selection and block selection

#### **Accessibility Goals**

- [ ] Screen readers announce cross-block selections properly
- [ ] Keyboard-only navigation supports cross-block selection
- [ ] Selection has proper ARIA attributes and roles
- [ ] Focus management works correctly with text selection
- [ ] High contrast mode supports selection visibility

#### **Integration Goals**

- [ ] Works seamlessly with existing focus management
- [ ] Doesn't break existing drag & drop functionality
- [ ] Compatible with existing multi-block selection system
- [ ] State management integrates cleanly with EditorContext
- [ ] Ready for future slash menu integration
- [ ] Ready for future formatting toolbar integration

#### **Technical Implementation**

- [ ] `useCrossBlockSelection.ts` hook created and tested
- [ ] `textSelection.ts` utility functions implemented
- [ ] Enhanced `EditorContent.tsx` with selection handling
- [ ] Enhanced `Block.tsx` with selection support
- [ ] Enhanced `EditorContext.tsx` with selection state
- [ ] Performance optimized for large documents

**Files to Create:**

- `apps/web/src/hooks/useCrossBlockSelection.ts`
- `apps/web/src/utils/textSelection.ts`

**Files to Enhance:**

- `apps/web/src/components/Editor/EditorContent/EditorContent.tsx`
- `apps/web/src/components/Editor/Block/Block.tsx`
- `apps/web/src/contexts/EditorContext.tsx`

### Phase 3: Intelligent Copy/Paste **📋 PLANNED**

- [ ] Detect selection type (partial text vs full blocks)
- [ ] Copy appropriate format (plain text vs markdown)
- [ ] Smart paste with markdown conversion

### Phase 4: Enhanced Undo/Redo **📋 PLANNED**

- [ ] Command pattern for all operations
- [ ] Intelligent command merging for typing
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)

### Phase 5: Live Markdown & UI Enhancements **📋 PLANNED**

- [ ] Live markdown conversion while typing
- [ ] Custom slash command menu
- [ ] Floating formatting toolbar on text selection

---

## 🔧 Technical Implementation

### Cross-Block Selection Core Hook

```typescript
// useCrossBlockSelection.ts
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

### Selection Calculation Utilities

```typescript
// textSelection.ts
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

---

## ⚡ Performance Strategy

### Optimization Approach

**Start simple, optimize when needed.** Build without virtualization first and add it if performance issues arise.

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
   - Batch state updates

### Focus Areas

- **Large Document Support**: Efficient selection across many blocks
- **Smooth Interactions**: 60fps for all animations and selections
- **Memory Efficiency**: Intelligent command history management

---

## 🚀 Enhancement Benefits

### What We Keep

- ✅ All design tokens and SCSS architecture
- ✅ EditorContext pattern and state management
- ✅ Component structure and layout
- ✅ Drag & drop and multi-block selection
- ✅ Understanding of editor requirements

### What We Add

- 🚀 Professional text selection across multiple blocks
- 🚀 Intelligent copy/paste with automatic content detection
- 🚀 Enhanced undo/redo with command pattern
- 🚀 Live markdown conversion for seamless writing
- 🚀 Custom UI components (slash menu, formatting toolbar)
- 🚀 Optimal performance tailored to our needs

### What We Avoid

- ❌ External library complexity and dependencies
- ❌ Styling conflicts and integration issues
- ❌ Version management and update complications
- ❌ Learning and debugging external code
- ❌ Performance overhead from unused features

---

## 🔄 Development Workflow

### Enhancement Strategy

1. **Build on Proven Foundation** - Keep everything that works perfectly
2. **One Feature at a Time** - Implement and test incrementally
3. **Integration Focus** - Ensure new features work with existing systems
4. **Performance Monitoring** - Maintain smooth experience throughout

### Quality Assurance

- **Unit Testing** for new utility functions and hooks
- **Integration Testing** for feature interactions
- **Performance Testing** with large documents
- **Accessibility Testing** for all new interactions

---

This enhanced plan builds professional editor capabilities on our solid foundation while maintaining complete control over performance, design, and functionality. By enhancing our proven custom editor rather than replacing it, we get the sophistication of modern editors like Notion while preserving our clean, maintainable architecture.
