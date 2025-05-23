# Development Plan

> This document outlines our feature implementation roadmap, development priorities, key considerations, and current focus area. It serves as a living guide to keep development organized and aligned with our MVP goals.

---

## 🎯 MVP Feature Implementation List

### Phase 1: Basic UI & Editor Foundation

- [ ] **App Layout Structure**

  - Sidebar and main editor layout
  - Responsive design foundation
  - Basic navigation structure

- [ ] **Custom Block-Based Text Editor**

  - Core block component architecture
  - Text input and editing within blocks
  - Block creation (Enter key splits blocks)
  - Block deletion (Backspace in empty blocks)
  - Block focus and cursor management

- [ ] **Basic Block Types**
  - Paragraph blocks (default)
  - Heading 1 and Heading 2 blocks
  - Visual distinction between block types
  - Block type switching foundation

### Phase 2: Advanced Editor Features

- [ ] **Slash Command Menu**

  - `/` trigger for block type selection
  - Floating menu with search/filter
  - Block type conversion system
  - Keyboard navigation (arrow keys + Enter)

- [ ] **Formatting Toolbar**

  - Text selection detection
  - Floating toolbar positioning
  - Bold, italic, underline formatting
  - Link creation functionality

- [ ] **Block Management**

  - Drag handles and reordering
  - Visual drop indicators
  - Multi-block selection
  - Copy/paste support

- [ ] **Markdown Support**
  - **Live markdown formatting** (typing `# ` auto-converts to H1, `## ` to H2, etc.)
  - Markdown paste detection and parsing
  - Block creation from markdown syntax
  - Markdown export functionality
  - Cross-app copy/paste compatibility

### Phase 3: Authentication & Data

- [ ] **Firebase Authentication Setup**

  - Google OAuth integration
  - User session management
  - Protected route structure

- [ ] **Database Schema & API Endpoints**
  - User, Workspace, Page, and Block models
  - CRUD operations for all entities
  - Real-time sync infrastructure

### Phase 4: Pages & Navigation

- [ ] **Page Management**

  - Create, rename, delete pages
  - Page title editing in editor
  - Page persistence and loading

- [ ] **File Tree Sidebar**
  - Hierarchical page display
  - Drag-and-drop reordering
  - Folder page creation and nesting
  - Collapsible sidebar functionality

### Phase 5: Internal Linking

- [ ] **@-Mention System**

  - `@` trigger for page search
  - Floating search menu
  - Link insertion and rendering
  - Clickable navigation

- [ ] **Backlinks Panel**
  - Real-time backlink detection
  - Right-side panel display
  - Clickable backlink navigation
  - Auto-updating as links change

### Phase 6: Workspace & Sync

- [ ] **Multi-Workspace Support**

  - Workspace creation and switching
  - Workspace-scoped content
  - User workspace management

- [ ] **Real-time Cloud Sync**
  - Auto-save functionality (debounced)
  - Conflict resolution system
  - Save status indicators
  - **Local-first option** (user preference)

### Phase 7: Polish & UX

- [ ] **Undo/Redo System**

  - Command history tracking
  - Keyboard shortcuts (Cmd/Ctrl+Z)
  - Action state management

- [ ] **Copy/Paste Support**
  - Block-level copy/paste
  - Text-level copy/paste
  - Cross-block operations

---

## 🧠 Key Development Considerations

### Architecture & Extensibility

- **Plugin-friendly block system**: Use central registry for easy addition of new block types
- **Event-driven architecture**: Implement event bus for decoupled feature communication
- **AI abstraction layer**: Keep AI features behind consistent interfaces for easy provider switching
- **Metadata support**: Design flexible metadata fields for future feature expansion

### Performance & Scalability

- **Debounced autosave**: Wait 2 seconds after user stops typing before saving
- **Lazy loading**: Load non-critical components only when needed
- **React optimization**: Use memo, useMemo, and useCallback for frequently re-rendering components
- **Bundle optimization**: Keep main bundle under 500KB, vendor bundle under 200KB

### Security & Data Protection

- **Input validation**: Sanitize all user input on both frontend and backend
- **Authentication**: Verify Firebase tokens on every API request
- **Authorization**: Check workspace ownership before allowing access
- **Content security**: Sanitize rich text to prevent XSS attacks

### User Experience

- **Consistent interactions**: Use Enter to approve actions, Escape to cancel across the app
- **Progressive enhancement**: Ensure core functionality works without JavaScript
- **Error handling**: Show user-friendly error messages with retry options
- **Loading states**: Provide immediate feedback for all user actions

### Code Quality

- **TypeScript strict mode**: Maintain type safety across all components
- **Component structure**: Follow established folder conventions and naming patterns
- **Testing coverage**: Write unit tests for components and integration tests for user flows
- **Documentation**: Keep component props documented and API endpoints specified

---

## 🚀 Current Focus: Next Feature to Implement

### **Basic UI Layout & Text Editor Foundation**

**Priority**: High - Visual foundation for development and user feedback

**Why this first**:

- Creates a tangible interface you can see and interact with immediately
- Allows for visual feedback and design iteration early
- Establishes the core editing experience without authentication complexity
- Easier to add Firebase protection to existing components later

**Implementation approach**:

1. **Basic app layout** with sidebar and main editor area
2. **Simple block component** that handles text input and editing
3. **Block creation** (Enter key to create new blocks)
4. **Block deletion** (Backspace in empty blocks)
5. **Basic block types** (paragraph, heading1, heading2)
6. **Simple styling** to make it look professional

**Custom Text Editor Notes**:

- We're building a **completely custom block-based editor** from scratch
- This gives us full control over block behavior, slash commands, and AI integration
- More complex than using existing editors, but necessary for our specific requirements
- Each block is a separate React component that can be independently styled and enhanced

**Live Markdown Formatting**:

- Typing `# ` automatically converts block to H1 and continues typing
- Typing `## ` converts to H2, `* ` or `- ` creates bullet points
- Feels natural for users already familiar with markdown syntax
- Provides immediate visual feedback and formatting

**Acceptance criteria**:

- Clean, professional-looking interface with sidebar and editor
- Users can type in text blocks and create new ones with Enter
- Empty blocks can be deleted with Backspace
- Different heading levels are visually distinct
- **Live markdown formatting works** (typing `# ` converts to H1)
- Basic responsive layout works on different screen sizes
- Blocks maintain focus and cursor position correctly

**Files to create**:

- Layout components (Sidebar, MainEditor, App layout)
- Block components (TextBlock, HeadingBlock base components)
- Basic SCSS styling for layout and typography
- Block management utilities and types

---

## 📋 Development Workflow Reminders

- **Feature branch creation**: Always branch from `dev` for new features
- **Testing**: Write tests during development, not after
- **Documentation**: Update relevant guides as we implement features
- **Code review**: Self-review changes before committing
- **Incremental commits**: Commit small, logical chunks of work
- **User feedback**: Test features from user perspective before marking complete

---

_This document will be updated as we progress through development phases._
