# Development Plan

> This document outlines our feature implementation roadmap, development priorities, key considerations, and current focus area. It serves as a living guide to keep development organized and aligned with our MVP goals.

---

## 🎯 MVP Feature Implementation List

### Phase 1: Basic UI & Editor Foundation ✅

- [x] **App Layout Structure**

  - Sidebar and main editor layout
  - Responsive design foundation
  - Basic navigation structure

- [x] **Custom Block-Based Text Editor**

  - Core block component architecture
  - Text input and editing within blocks
  - Block creation (Enter key splits blocks)
  - Block deletion (Backspace in empty blocks)
  - Block focus and cursor management

- [x] **Basic Block Types**
  - Paragraph blocks (default)
  - Heading 1, 2, 3 blocks
  - Bullet list blocks
  - Visual distinction between block types
  - Block type switching via slash commands

### Phase 2: Advanced Editor Features

- [x] **Slash Command Menu** ✅

  - `/` trigger for block type selection
  - Floating menu with search/filter
  - Block type conversion system
  - Keyboard navigation (arrow keys + Enter)
  - ESC to cancel with cursor restoration

- [x] **Formatting Toolbar** ✅

  - Text selection detection
  - Floating toolbar positioning
  - Bold, italic, underline formatting
  - Link creation functionality
  - Keyboard shortcuts (Ctrl/Cmd+B/I/U/K)

- [x] **Block Management** ✅

  - Drag handles and reordering
  - Visual drop indicators
  - Multi-block selection
  - Copy/paste support (custom Kairos format)
  - Click empty space to focus last block

- [x] **Block-Level Markdown Support** ✅ (Completed Jan 17, 2025)
  - **Live markdown formatting** (typing `# ` auto-converts to H1, `## ` to H2, etc.)
  - Block creation from markdown syntax (# for H1, ## for H2, ### for H3, - for bullets)
  - Inline markdown auto-conversion (**bold**, _italic_, etc.)
  - Triggers on space after markdown prefix at block start
  - Automatic cursor repositioning after conversion
  
- [ ] **Advanced Markdown Features**
  - Markdown paste detection and parsing
  - Markdown export functionality
  - Cross-app copy/paste compatibility

### Phase 3: Authentication & Data

- [x] **Firebase Authentication Setup** ✅ (Backend Complete, Frontend Jan 17, 2025)

  - Google OAuth integration (Firebase client SDK)
  - User session management (AuthContext with Firebase listeners)
  - Protected route structure (React Router with auth guards)
  - Login/Register pages with error handling
  - API client with automatic auth token injection

- [x] **Database Schema & API Endpoints** ✅
  - User, Workspace, Page, and Block models
  - CRUD operations for all entities (workspaces, pages, blocks)
  - Real-time sync infrastructure (ready for implementation)
  - Comprehensive test coverage for all endpoints

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

### **Frontend-Backend Integration**

**Priority**: Critical - Connects all the pieces together

**Why this next**:

- Authentication system is complete on both frontend and backend
- CRUD operations are ready and tested on the backend
- Need to connect the editor to persist data
- Enables testing of the full user flow

**Implementation approach**:

1. **Connect API client** to backend endpoints
2. **Test authentication flow** end-to-end
3. **Implement workspace selector** in sidebar
4. **Connect editor** to save blocks to database
5. **Add page management** UI (create, rename, delete)
6. **Implement auto-save** with debouncing

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

- Users can log in with Google OAuth or email/password
- Workspace selector shows user's workspaces
- Editor saves blocks to the database
- Page management works (create, rename, delete pages)
- Auto-save triggers after 2 seconds of inactivity
- Save status indicator shows when saving/saved
- Data persists across page refreshes

**Files to update**:

- API client service files (connect to real endpoints)
- WorkspaceContext (add current workspace state)
- EditorContext (add save functionality)
- Sidebar component (add workspace selector)
- Editor component (integrate auto-save)

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
