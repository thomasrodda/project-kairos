# Component to User Story Mapping

This document maps components to their related user stories across Editor, Page Management, and Authentication features in Project Kairos.

## Component → User Stories Mapping

### Editor Components

#### `EditorContent.tsx`

- **User Story 1**: Typing and creating blocks - Handles Enter key events
- **User Story 2**: Changing block type via slash command - Triggers menu
- **User Story 2b**: Markdown compatibility - Markdown detection
- **User Story 6**: Deleting a block - Backspace handling
- **User Story 7**: Copy/Paste support - Copy/paste handlers

#### `EditorContext.tsx`

- **User Story 1**: Typing and creating blocks - ADD_BLOCK action
- **User Story 2b**: Markdown compatibility - Block type changes
- **User Story 4**: Reordering blocks - MOVE_BLOCK action
- **User Story 6**: Deleting a block - DELETE_BLOCK action
- **User Story 8**: Basic formatting with toolbar - TextFormat types and actions

#### `Block.tsx`

- **User Story 4**: Reordering blocks - Block component with drag handle
- **User Story 6**: Deleting a block - Selection UI

#### `DraggableBlock.tsx`

- **User Story 4**: Reordering blocks - Drag wrapper

#### `SlashCommandMenu/`

- **User Story 2**: Changing block type via slash command - Menu component

#### `FormattingToolbar/`

- **User Story 8**: Basic formatting with toolbar - Floating toolbar component

#### `PageTitle`

- **User Story 2** (Page Management): Naming & Renaming pages - Editable page title in editor

#### `ContentEditableContainer`

- **User Story 9**: @-mention to link - Hook for "@" key detection

#### `MentionMenu/` (To be created)

- **User Story 9**: @-mention to link to another page

### Page Management Components

#### `PageTree`

- **User Story 1**: Creating and deleting pages - Displays hierarchical page structure
- **User Story 3**: Reordering pages - Needs drag and drop support
- **User Story 5**: Sidebar navigation - Hierarchical page display

#### `PageTreeItem`

- **User Story 1**: Creating and deleting pages - Individual page item with context menu
- **User Story 2**: Naming & Renaming pages - Inline editing functionality
- **User Story 3**: Reordering pages - Draggable wrapper needed
- **User Story 4**: Creating folder pages - Add hover state and plus button
- **User Story 5**: Sidebar navigation - Clickable page items

#### `PagesContext`

- **User Story 1**: Creating and deleting pages - State management for pages
- **User Story 2**: Naming & Renaming pages - Page state management
- **User Story 3**: Reordering pages - Hierarchical page management
- **User Story 4**: Creating folder pages - Already supports folder creation
- **User Story 5**: Sidebar navigation - Page state
- **User Story 9** (Editor): @-mention to link - Page list provider

#### `Sidebar`

- **User Story 5**: Sidebar navigation - Main container with collapsible functionality

#### `WorkspaceContext`

- **User Story 1**: Creating and deleting pages - Workspace management
- **User Story 5**: Sidebar navigation - Workspace selection

### Authentication Components

#### `AuthContext.tsx`

- **User Story 1**: Google OAuth Login - Main authentication state management
- **User Story 2**: Email/Password Authentication - Handles email/password auth methods
- **User Story 3**: Workspace Creation - Handles post-login workspace check
- **User Story 4**: Session Management - Token refresh logic
- **User Story 5**: Protected Route Navigation - Provides authentication state
- **User Story 6**: User Profile Management - User state management

#### `auth.ts`

- **User Story 1**: Google OAuth Login - Firebase authentication service

#### `api/client.ts`

- **User Story 4**: Session Management - Request interceptors for token injection

### Utility/Service Components

#### `blockUtils.ts`

- **User Story 1**: Typing and creating blocks - createBlock() function

#### `markdownUtils.ts`

- **User Story 2b**: Markdown compatibility - Markdown parsing logic

#### `textFormatting.ts`

- **User Story 8**: Basic formatting with toolbar - Core formatting logic
- **User Story 9**: @-mention to link - Integration with link formatting

#### `formattingRenderer.tsx`

- **User Story 8**: Basic formatting with toolbar - Renders formatted text

#### `clipboardUtils.ts`

- **User Story 7**: Copy/Paste support - Clipboard formatting logic

#### `useSlashCommands.ts`

- **User Story 2**: Changing block type via slash command - Menu logic

#### `useCrossBlockSelection.ts`

- **User Story 6**: Deleting a block - Multi-block selection

### Backend Components

#### Backend auth middleware

- **User Story 1**: Google OAuth Login - Token validation

#### Backend auth endpoints (`/api/auth/login`)

- **User Story 1**: Google OAuth Login - User authentication

#### Backend workspace service

- **User Story 3**: Workspace Creation - Workspace creation logic

#### Backend API endpoints

- **User Story 1** (Page Management): Creating and deleting pages - Page CRUD operations
- **User Story 3** (Page Management): Reordering pages - Updating page order and nesting
- **User Story 4** (Page Management): Creating folder pages - Folder support exists

## User Story → Components Mapping

### Editor User Stories

#### 1. Typing and creating blocks

**Components needed:**

- `EditorContent.tsx`
- `EditorContext.tsx`
- `blockUtils.ts`

#### 2. Changing block type via slash command

**Components needed:**

- `SlashCommandMenu/`
- `EditorContent.tsx`
- `useSlashCommands.ts`

#### 2b. Markdown compatibility

**Components needed:**

- `EditorContent.tsx`
- `markdownUtils.ts`
- `EditorContext.tsx`

#### 4. Reordering blocks

**Components needed:**

- `DraggableBlock.tsx`
- `Block.tsx`
- `EditorContext.tsx`
- @dnd-kit library

#### 5. Undo/redo support

**Status:** Not Started
**Proposed Components:**

- UndoManager service
- Integration with EditorContext

#### 6. Deleting a block

**Components needed:**

- `EditorContent.tsx`
- `Block.tsx`
- `EditorContext.tsx`
- `useCrossBlockSelection.ts`

#### 7. Copy/Paste support

**Components needed:**

- `EditorContent.tsx`
- `clipboardUtils.ts`

#### 8. Basic formatting with toolbar

**Components needed:**

- `FormattingToolbar/`
- `textFormatting.ts`
- `formattingRenderer.tsx`
- `EditorContext.tsx`

#### 9. @-mention to link to another page

**Status:** Not Started
**Components needed:**

- `MentionMenu/` (to be created)
- `textFormatting.ts`
- `PagesContext`
- `ContentEditableContainer`
- Page search utilities (to be created)

### Page Management User Stories

#### 1. Creating and deleting pages

**Components needed:**

- `PageTree`
- `PageTreeItem`
- `PagesContext`
- `WorkspaceContext`
- Backend API endpoints

#### 2. Naming & Renaming pages

**Components needed:**

- `PageTreeItem`
- `PageTitle`
- `EditorContext`
- `PagesContext`
- Real-time sync system

#### 3. Reordering pages and folder pages

**Status:** Not Started
**Components needed:**

- `PageTree`
- `PageTreeItem`
- @dnd-kit library
- `PagesContext`
- Backend API

#### 4. Creating folder pages

**Components needed:**

- `PageTreeItem`
- `PagesContext`
- Backend API

#### 5. Sidebar navigation

**Components needed:**

- `Sidebar`
- `PageTree`
- `PageTreeItem`
- `PagesContext`
- `WorkspaceContext`
- React Router

### Authentication User Stories

#### 1. Google OAuth Login

**Components needed:**

- `AuthContext.tsx`
- `auth.ts`
- Backend auth middleware
- Backend auth endpoints
- Firebase project setup

#### 2. Email/Password Authentication

**Components needed:**

- `AuthContext.tsx`
- Login/Signup forms
- Firebase Auth templates

#### 3. Workspace Creation for New Users

**Components needed:**

- `AuthContext.tsx`
- Backend workspace service
- Database migrations

#### 4. Session Management & Token Refresh

**Components needed:**

- `AuthContext.tsx`
- `api/client.ts`
- Firebase Auth SDK

#### 5. Protected Route Navigation

**Components needed:**

- `AuthContext.tsx`
- Protected route components
- React Router

#### 6. User Profile Management

**Status:** Planned
**Components needed:**

- User profile page/modal (to be implemented)
- `AuthContext.tsx`
- Backend user service

#### 7. Multi-Factor Authentication

**Status:** Backlog
**Components needed:**

- 2FA settings page
- Login flow modifications
- Backend MFA configuration

## Critical Components Summary

### Most Referenced Components

1. **`EditorContext.tsx`** - Central to 5 editor user stories
2. **`EditorContent.tsx`** - Central to 5 editor user stories
3. **`PagesContext`** - Central to 6 user stories (5 page management + 1 editor)
4. **`AuthContext.tsx`** - Central to 6 authentication user stories
5. **`PageTreeItem`** - Central to 5 page management user stories

### Cross-Feature Dependencies

- **`PagesContext`** - Used by both Editor (for @-mentions) and Page Management features
- **`PageTitle`** - Bridges Editor and Page Management for real-time title sync
- **`WorkspaceContext`** - Used by Page Management and referenced in Authentication

### Components Needed But Not Yet Implemented

1. **`MentionMenu/`** - For @-mention functionality
2. **Page search utilities** - For @-mention search
3. **UndoManager service** - For undo/redo support
4. **User profile page/modal** - For profile management
5. **2FA settings components** - For multi-factor authentication

### External Dependencies

- **@dnd-kit** - Required for both block reordering and page reordering
- **Firebase Auth SDK** - Central to all authentication features
- **React Router** - For navigation and protected routes
