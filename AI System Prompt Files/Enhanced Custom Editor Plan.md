# Enhanced Custom Editor Plan

> **Professional Editor Enhancement Strategy** - Implementation guide for Project Kairos's block-based editor enhancement with cross-block selection, vector database integration, intelligent copy/paste, and enhanced undo/redo.

---

## 🎯 Implementation Decision & Strategy

### Why Custom Enhancement vs BlockNote

**Decision Rationale:**

- Previous BlockNote integration had significant styling challenges that we couldn't resolve
- Design system integration was difficult with external library constraints
- Full control over editor behavior needed for creative writing use cases
- Current custom foundation is solid and working well with existing architecture
- Vector database integration is simpler with clean, controlled block structure

**Confirmed Requirements:**

- Notion-style cross-block text selection for seamless writing experience
- Vector database integration for semantic search of creative writing content
- Markdown import/export with live conversion capabilities
- Full design system integration with existing SCSS tokens and design patterns
- Professional editor features without external dependency complexity

### Strategic Advantages of Custom Approach

**For Vector Database Integration:**

- Clean `block.content` string perfect for embedding generation
- Clear block boundaries for optimal content chunking
- Direct control over indexing strategy and metadata
- Simple content extraction without complex parsing overhead

**For Creative Writing Use Cases:**

- Tailored UX for novelists, worldbuilders, and D&D campaign planners
- Custom AI integration points for lore consistency checking
- Specialized features for creative workflows (character tracking, world consistency, etc.)

---

## 🗄️ Core Requirements Summary

### Editor Features

- **Block Types**: H1, H2, H3, Paragraph, Bullet List
- **Block Creation**: Enter key creates new blocks, Shift+Enter for line breaks
- **Slash Commands**: Type `/` to open command menu with block types
- **Formatting Toolbar**: Bold, Italic, Underline on text selection
- **Drag & Drop**: Reorder blocks via drag handles ✅ **COMPLETE**
- **Cross-Block Text Selection**: Select text spanning multiple blocks using native browser APIs
- **Vector Database Integration**: Real-time semantic search of creative writing content
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
- Proven foundation that works with our existing patterns

### Technical Approach

- **Native Browser APIs**: Leverage Selection and Range APIs for robust functionality
- **Incremental Enhancement**: Build professional features on proven foundation
- **State Integration**: Work seamlessly with existing EditorContext
- **Performance Focus**: Optimize for large documents and smooth interactions
- **Vector Database Ready**: Architecture designed for real-time content indexing

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
├── SemanticSearch/              # Vector database search integration
└── hooks/                       # Professional feature hooks
    ├── useCrossBlockSelection.ts
    ├── useVectorSearch.ts
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

  // Vector database integration
  vectorSearchResults: VectorSearchResult[] | null
  isIndexing: boolean
  lastIndexed: Date | null
}

interface CrossBlockSelection {
  startBlockId: string
  startOffset: number
  endBlockId: string
  endOffset: number
  selectedText: string
  selectedBlocks: string[] // Fully selected block IDs
  isCollapsed: boolean
}

interface VectorSearchResult {
  blockId: string
  pageId: string
  content: string
  score: number
  metadata: {
    blockType: string
    pageTitle: string
    timestamp: Date
  }
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

### Vector Database Strategy

```typescript
interface VectorRecord {
  id: string // Format: ${pageId}-${blockId}
  embedding: number[]
  metadata: {
    pageId: string
    blockId: string
    blockType: BlockType
    content: string
    pageTitle: string
    timestamp: Date
    wordCount: number
  }
}
```

**Content Chunking Strategy:**

- Individual blocks as base chunks (optimal for creative writing)
- Metadata-rich records for precise navigation
- Real-time indexing on block content changes
- Incremental updates to avoid re-indexing entire documents

### Markdown Strategy

- Store blocks as structured data (type + content)
- Serialize to markdown on-demand (copy/export)
- Parse markdown on paste to create blocks

**Copy/Paste Behavior:**

- **Partial text selection** → Copy as plain text
- **Full block(s) selection** → Copy as markdown
- **Page export** → Always markdown format
- **Vector search results** → Navigate to source blocks with highlighting

---

## 🏗️ Updated Implementation Phases

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

#### **Technical Implementation Strategy**

**Browser API Approach (Confirmed Correct):**

- Use native `selectionchange` events for real-time tracking
- Calculate block involvement with `data-block-id` attributes
- Preserve existing multi-block selection system
- Handle copy/paste based on selection type

**Key Technical Decisions:**

- Leverage browser's native selection rather than reimplementing
- Use `Range` API for precise text boundary detection
- Maintain separation between text selection and block selection
- Ensure performance with `useMemo` and `useCallback` optimization

**Why This Approach:**

- Matches user expectations (works like every other text editor)
- Handles edge cases automatically (word boundaries, triple-click, etc.)
- Accessible by default (screen readers understand native selection)
- Mobile-friendly (browser handles touch selection)

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
- [ ] Ready for vector database search highlighting
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

### Phase 3: Vector Database Integration **📋 HIGH PRIORITY**

**Parallel to Phase 2 completion** - Critical for semantic search capabilities

#### **Core Infrastructure**

- [ ] Vector service architecture with block-level chunking
- [ ] Embedding generation API integration (OpenAI/Cohere)
- [ ] Vector database setup (Pinecone/Weaviate/Supabase)
- [ ] Metadata tracking (pageId, blockId, blockType, timestamp)
- [ ] Incremental indexing on block content changes

#### **Search Implementation**

- [ ] Semantic search API with similarity scoring
- [ ] Search result ranking and filtering
- [ ] Real-time search as user types
- [ ] Search result highlighting in editor
- [ ] Navigation from search results to source blocks

#### **UI Components**

- [ ] Search input in sidebar or floating search
- [ ] Search results panel with block previews
- [ ] Highlighting system for search matches
- [ ] "Related content" suggestions based on current block

#### **Performance & Efficiency**

- [ ] Debounced indexing to avoid excessive API calls
- [ ] Caching strategy for search results
- [ ] Efficient re-indexing on content changes
- [ ] Background indexing for large documents

**Benefits of Custom Editor for Vector DB:**

- Clean `block.content` string perfect for embeddings
- Clear block boundaries for optimal chunking
- Direct control over what gets indexed
- Simple content extraction without complex parsing
- Metadata-rich indexing for precise navigation

### Phase 4: Intelligent Copy/Paste **📋 PLANNED**

**Enhanced by vector database** - Smart suggestions and context-aware operations

- [ ] Detect selection type (partial text vs full blocks)
- [ ] Copy appropriate format (plain text vs markdown)
- [ ] Smart paste with markdown conversion to blocks
- [ ] Vector-enhanced paste suggestions (related content recommendations)
- [ ] Cross-document copy/paste with automatic linking

### Phase 5: Enhanced Undo/Redo **📋 PLANNED**

- [ ] Command pattern for all operations
- [ ] Intelligent command merging for typing
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- [ ] Vector database state included in undo operations

### Phase 6: Live Markdown & UI Polish **📋 PLANNED**

- [ ] Live markdown conversion while typing
- [ ] Custom slash command menu with vector search integration
- [ ] Floating formatting toolbar on text selection
- [ ] Advanced search filters and semantic queries

---

## 🔧 Technical Implementation

### Cross-Block Selection Core Hook

```typescript
// useCrossBlockSelection.ts
export function useCrossBlockSelection() {
  const [selection, setSelection] = useState<CrossBlockSelection | null>(null)

  const calculateSelection = useCallback((): CrossBlockSelection | null => {
    const browserSelection = window.getSelection()
    if (!browserSelection || browserSelection.rangeCount === 0) return null

    const range = browserSelection.getRangeAt(0)
    if (range.collapsed) return null

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
      isCollapsed: range.collapsed,
    }
  }, [])

  useEffect(() => {
    const handleSelectionChange = () => {
      const newSelection = calculateSelection()
      setSelection(newSelection)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mouseup', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleSelectionChange)
    }
  }, [calculateSelection])

  return { selection, clearSelection: () => setSelection(null) }
}
```

### Vector Database Service

```typescript
// services/vectorService.ts
class VectorService {
  async indexBlocks(pageId: string, pageTitle: string, blocks: EditorBlock[]) {
    for (const block of blocks) {
      if (block.content.trim().length === 0) continue // Skip empty blocks

      const embedding = await this.generateEmbedding(block.content)

      await this.vectorDB.upsert({
        id: `${pageId}-${block.id}`,
        embedding,
        metadata: {
          pageId,
          blockId: block.id,
          blockType: block.type,
          content: block.content,
          pageTitle,
          timestamp: new Date(),
          wordCount: block.content.split(' ').length,
        },
      })
    }
  }

  async semanticSearch(query: string, limit = 10): Promise<VectorSearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query)
    const results = await this.vectorDB.query(queryEmbedding, limit)

    return results.map((result) => ({
      blockId: result.metadata.blockId,
      pageId: result.metadata.pageId,
      content: result.metadata.content,
      score: result.score,
      metadata: {
        blockType: result.metadata.blockType,
        pageTitle: result.metadata.pageTitle,
        timestamp: result.metadata.timestamp,
      },
    }))
  }
}
```

---

## ⚡ Realistic Complexity Assessment

### Phase 2 Complexity: **Medium-High** (2-3 weeks)

- Cross-block selection is complex but well-established pattern
- Native browser APIs handle most edge cases automatically
- Main challenge is integration with existing block selection system
- Visual highlighting requires careful CSS coordination with existing design tokens

### Phase 3 Complexity: **Medium** (1-2 weeks)

- Vector database integration is straightforward with clean block structure
- Embedding generation is well-documented process
- Search UI builds on existing component patterns
- Performance optimization comes from established caching patterns

### Development Risk Mitigation:

- Start with basic cross-block selection (mouse drag only)
- Add keyboard selection as second iteration
- Implement vector database with simple search first
- Polish visual feedback and advanced features last
- Incremental testing with edge cases throughout

### Success Metrics:

- Selection works smoothly across 10+ blocks without performance issues
- Copy/paste extracts correct text with proper formatting
- No interference with existing drag & drop functionality
- Vector search returns relevant results within 500ms
- Performance remains smooth with 50+ blocks in document

---

## 🚀 Enhancement Benefits

### What We Keep

- ✅ All design tokens and SCSS architecture
- ✅ EditorContext pattern and state management
- ✅ Component structure and layout
- ✅ Drag & drop and multi-block selection
- ✅ Understanding of editor requirements
- ✅ Clean block structure perfect for vector database

### What We Add

- 🚀 Professional text selection across multiple blocks (Notion-style UX)
- 🚀 Semantic search capabilities for creative writing content
- 🚀 Intelligent copy/paste with automatic content detection
- 🚀 Vector-enhanced content discovery and navigation
- 🚀 Enhanced undo/redo with command pattern
- 🚀 Live markdown conversion for seamless writing
- 🚀 Custom UI components (slash menu, formatting toolbar)
- 🚀 Optimal performance tailored to our specific needs

### What We Avoid

- ❌ External library complexity and dependencies
- ❌ Styling conflicts and integration issues
- ❌ Version management and update complications
- ❌ Learning and debugging external library code
- ❌ Performance overhead from unused features
- ❌ Vector database integration complexity with external editor APIs

---

## 🔄 Development Workflow

### Enhancement Strategy

1. **Build on Proven Foundation** - Keep everything that works perfectly
2. **One Feature at a Time** - Implement and test incrementally
3. **Integration Focus** - Ensure new features work with existing systems
4. **Performance Monitoring** - Maintain smooth experience throughout
5. **Vector Database First** - Prioritize semantic search capabilities
6. **User Experience Focus** - Match Notion-level polish and functionality

### Quality Assurance

- **Unit Testing** for new utility functions and hooks
- **Integration Testing** for feature interactions
- **Performance Testing** with large documents (50+ blocks)
- **Accessibility Testing** for all new interactions
- **Vector Database Testing** with realistic creative writing content
- **Cross-browser Testing** for selection API compatibility

---

This enhanced plan builds professional editor capabilities on our solid foundation while maintaining complete control over performance, design, and functionality. By enhancing our proven custom editor rather than replacing it, we get the sophistication of modern editors like Notion plus powerful semantic search capabilities, while preserving our clean, maintainable architecture optimized for creative writing workflows.
