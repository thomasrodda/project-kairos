# Workspace Management Implementation Plan

## Overview

This plan outlines the implementation of workspace management functionality for Project Kairos. The backend is fully implemented with complete CRUD operations, authentication, and proper data isolation. The frontend needs to implement authentication UI, workspace state management, and workspace selection/switching functionality.

## Current State

### ✅ Completed (Backend)

- Full workspace CRUD API (`/api/workspaces/*`)
- Database schema with user ownership
- Authentication middleware using Firebase
- Cascade deletion for workspace → pages → blocks
- Pagination and error handling
- Firebase Admin SDK integration
- User sync endpoint (`/api/auth/sync-user`)
- CORS configuration for frontend

### ✅ Completed (Frontend - Phase 0)

- Authentication UI (login/signup/forgot password)
- AuthContext for centralized auth state
- Protected routes with automatic redirects
- Logout functionality in sidebar
- Auth persistence across sessions
- Error handling with user-friendly messages
- Comprehensive test coverage (45+ tests)

### ✅ Completed (Frontend - Phase 1)

- WorkspaceContext for centralized workspace state
- useWorkspace hook with all CRUD operations
- Auto-creation of default workspace for new users
- Workspace persistence in localStorage
- Last workspace selection restored on app load
- Prevention of last workspace deletion
- Loading and error state management
- Integration with App.tsx via WorkspaceProvider
- **Page selection state management (NEW)**
- **Page persistence per workspace (NEW)**
- **WorkspaceWrapper component for integration (NEW)**
- **Error boundaries for workspace operations (NEW)**
- **Comprehensive test coverage (27 tests total)**

### ✅ Completed (Frontend - Phase 2)

- Workspace selection/switching UI
- WorkspaceSelector dropdown component
- WorkspaceCreationDialog modal component
- Integration with Sidebar
- Comprehensive test coverage (49+ tests)

### 🔲 Not Implemented (Frontend)

- Welcome page creation for new workspaces
- ~~Integration with existing components (PageTree, Editor)~~ ✅ Partially complete

### 📋 Key Findings

1. Workspaces start empty (no automatic page creation)
2. Single-user workspaces only in MVP (no sharing)
3. Component props exist but aren't wired up
4. ~~Firebase is configured but no auth UI exists~~ ✅ Auth UI now implemented

## Implementation Phases

### Phase 0: Authentication UI ✅ COMPLETED

**Goal**: Enable user authentication to access workspace features

**Completed Tasks**:

1. ✅ Created Login/Signup/ForgotPassword components with Firebase Auth
2. ✅ Implemented protected routes with ProtectedRoute component
3. ✅ Added AuthContext for centralized state management
4. ✅ Handled auth persistence and logout functionality
5. ✅ Fixed CORS configuration for API communication
6. ✅ Resolved Firebase Admin SDK authentication issues
7. ✅ Added comprehensive test coverage

**Actual Time**: ~3 hours

**Key Files Created/Modified**:

- `/src/contexts/AuthContext.tsx` - Auth state management
- `/src/components/Auth/*` - All auth UI components
- `/src/App.tsx` - Added routing and auth provider
- `/src/components/Sidebar/Sidebar.tsx` - Added logout button
- `/apps/api/src/app.ts` - Fixed CORS configuration
- `/apps/api/src/routes/auth.routes.ts` - Fixed sync-user endpoint

### Phase 1: Workspace State Management ✅ COMPLETED (with Priority Fixes)

**Goal**: Create centralized workspace state that all components can access

**Completed Tasks**:

1. ✅ Created `WorkspaceContext` with:
   - Current workspace state
   - Workspace list
   - **Current page state (NEW)**
   - Loading/error states
   - Selection handlers
2. ✅ Created `useWorkspace` hook for:
   - Fetching user's workspaces
   - Creating workspaces
   - Switching workspaces
   - **Selecting pages (NEW)**
   - Persisting selection to localStorage
   - **Persisting page selection per workspace (NEW)**
3. ✅ Wrapped app with WorkspaceProvider
4. ✅ Auto-creation of "My Workspace" for new users
5. ✅ Prevention of last workspace deletion
6. ✅ Comprehensive test suite created
7. ✅ **App.tsx integration with WorkspaceWrapper (NEW)**
8. ✅ **Error boundaries for workspace operations (NEW)**
9. ✅ **Integration tests for complete flow (NEW)**

**Actual Time**: ~4 hours (including priority fixes)

**Key Files Created/Modified**:

- `/src/contexts/WorkspaceContext.tsx` - Complete workspace state management with page selection
- `/src/contexts/WorkspaceContext.test.tsx` - Test coverage for workspace context (18 tests)
- `/src/App.tsx` - Added WorkspaceProvider integration, WorkspaceWrapper, and error boundaries
- `/src/integration/workspace-flow.test.tsx` - Integration tests for workspace flow (5 tests)
- `/src/App.test.tsx` - App-level integration tests
- `/src/App.error-boundary.test.tsx` - Error boundary tests (4 tests)

### Phase 2: Workspace Selection UI ✅ COMPLETED

**Goal**: Enable users to view and switch between workspaces

**Completed Tasks**:

1. ✅ Created WorkspaceSelector component:

   - Dropdown in sidebar header
   - Shows current workspace name
   - Lists all workspaces on click
   - "Create New Workspace" option
   - Active workspace indicator (checkmark)
   - Collapsed/expanded states
   - Loading state support

2. ✅ Created WorkspaceCreationDialog:

   - Modal for new workspace creation
   - Name input with validation (required, max 50 chars)
   - Description field (optional, max 200 chars)
   - Create and auto-select new workspace
   - Loading state with spinner
   - Error handling and display
   - Form reset on close

3. ✅ Integrated with existing Sidebar component
4. ✅ Added comprehensive test coverage (49 tests)
5. ✅ Fixed TypeScript and icon compatibility issues

**Actual Time**: ~3 hours

### Phase 3: Default Workspace Logic

**Goal**: Ensure users always have a workspace with content

**Tasks**:

1. On app initialization:

   - Check if user has workspaces
   - If none, create "My Workspace"
   - Auto-select first/last used workspace

2. On workspace creation:

   - Create default "Welcome" page
   - Add helpful starter content

3. Handle workspace deletion:
   - Confirmation dialog
   - Switch to another workspace
   - Create default if last workspace deleted

**Estimated Time**: 2-3 hours

### Phase 4: Component Integration ✅ PARTIALLY COMPLETED

**Goal**: Wire up all existing components with workspace context

**Completed Tasks**:

1. ✅ Update App.tsx:

   - Added WorkspaceProvider
   - Pass workspace props to Workspace component
   - Created WorkspaceWrapper for integration
   - Added error boundaries

2. ✅ Update Workspace component:
   - Receives workspace props from App.tsx
   - Passes to Sidebar and Editor components

**Remaining Tasks**:

3. ⏳ Fix PageTree rendering:

   - Already receives workspaceId from props
   - Need to integrate with page selection from context
   - Handle page creation/deletion

4. ⏳ Update Editor to use workspace context:
   - Currently receives pageId via props
   - May need direct context access for some operations

**Estimated Time**: ~1 hour remaining (most integration work completed in Phase 1)

### Phase 5: Testing & Polish

**Goal**: Ensure robust workspace functionality

**Tasks**:

1. Write tests for:

   - WorkspaceContext and hooks
   - Workspace selection/switching
   - Default workspace creation
   - Error handling

2. Add loading states and error handling

3. Polish UI/UX:
   - Smooth transitions
   - Clear feedback
   - Keyboard shortcuts

**Estimated Time**: 3-4 hours

## Technical Implementation Details

### 1. WorkspaceContext Structure

```typescript
interface WorkspaceContextValue {
  // State
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  currentPageId: string | null // NEW
  loading: boolean
  error: Error | null

  // Actions
  createWorkspace: (name: string) => Promise<Workspace>
  selectWorkspace: (id: string) => Promise<void>
  selectPage: (pageId: string) => void // NEW
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>
  deleteWorkspace: (id: string) => Promise<void>
  refreshWorkspaces: () => Promise<void>
}
```

### 2. LocalStorage Schema

```typescript
interface WorkspaceStorage {
  lastWorkspaceId: string | null
  workspacePreferences: {
    [workspaceId: string]: {
      lastPageId?: string
      // Future: other preferences
    }
  }
}
```

### 3. Component Hierarchy

```
App
├── AuthProvider
│   └── WorkspaceProvider
│       └── ProtectedRoute
│           └── WorkspaceErrorBoundary  // NEW
│               └── WorkspaceWrapper    // NEW
│                   └── EnhancedEditorProvider (key prop for re-init)
│                       └── Workspace
│                           ├── Sidebar
│                           │   ├── WorkspaceSelector (planned)
│                           │   └── PageTree
│                           └── EditorWithSync
```

### 4. API Integration Points

- Use existing `api.workspaces.*` methods
- Handle auth errors → redirect to login
- Implement optimistic updates for better UX
- Cache workspace list for performance

### 5. Error Handling Strategy

- Network errors: Show retry button
- Auth errors: Redirect to login
- No workspaces: Auto-create default
- Deleted workspace: Switch to another

## User Experience Flow

### First-Time User

1. Sign up → Auto-create "My Workspace"
2. Create welcome page with instructions
3. Show workspace in selector
4. Begin using editor immediately

### Returning User

1. Login → Load workspaces
2. Auto-select last used workspace
3. Show pages in sidebar
4. Resume where they left off

### Multi-Workspace User

1. Click workspace selector
2. See list of workspaces
3. Click to switch → Update entire UI
4. Or create new workspace

## Success Criteria

### Phase 0 ✅ COMPLETED

- [x] Users can sign up and log in
- [x] Auth state persists across sessions
- [x] Protected routes redirect to login
- [x] Firebase Admin SDK configured
- [x] User sync with database working
- [x] Logout functionality implemented
- [x] CORS issues resolved
- [x] All authentication tests passing

### Phase 1 ✅ COMPLETED

- [x] WorkspaceContext provides workspace state
- [x] Workspace selection persists in localStorage
- [x] Loading/error states handled properly
- [x] Auto-creation of default workspace for new users
- [x] Prevention of last workspace deletion
- [x] Integration with authentication state
- [x] **Page selection state management**
- [x] **Page selection persistence per workspace**
- [x] **App.tsx properly wired with workspace/page props**
- [x] **EditorProvider re-initializes on page change**
- [x] **Error boundaries for graceful failures**
- [x] **Retry functionality for failed operations**
- [x] **27 tests covering all functionality**

### Phase 2 ✅ COMPLETED

- [x] Workspace selector shows in sidebar
- [x] Users can switch workspaces smoothly
- [x] New workspaces can be created
- [x] Modal dialog for workspace creation
- [x] Input validation and error handling
- [x] 49 tests covering all functionality

### Phase 3

- [ ] New users get default workspace
- [ ] New workspaces get welcome page
- [ ] Can't delete last workspace

### Phase 4 ✅ PARTIALLY COMPLETED

- [x] PageTree shows pages for current workspace (via props)
- [x] Workspace component uses workspace context
- [x] App.tsx passes workspace/page data to components
- [ ] PageTree integration with page selection context
- [ ] Direct context usage in Editor (if needed)

### Phase 5

- [ ] 90%+ test coverage for workspace features
- [ ] Smooth UX with proper feedback
- [ ] No console errors or warnings

## Future Enhancements (Post-MVP)

1. **Workspace Settings**

   - Rename workspace
   - Workspace description
   - Custom preferences

2. **Workspace Templates**

   - Novel template
   - D&D Campaign template
   - Custom templates

3. **Collaboration** (Major feature)

   - Invite members
   - Role management
   - Shared workspaces

4. **Advanced Features**
   - Workspace archiving
   - Workspace duplication
   - Import/Export
   - Activity tracking

## Dependencies

### Required Before Starting ✅ ALL COMPLETE

- ✅ Firebase project configured
- ✅ Backend running locally
- ✅ Database with user table
- ✅ Firebase Admin SDK credentials configured
- ✅ CORS properly configured

### External Libraries Needed

- None (use existing Firebase SDK)

### Existing Code to Modify

- App.tsx (add providers)
- Workspace.tsx (use context)
- Sidebar.tsx (add selector)
- Editor components (workspace awareness)

## Risks & Mitigations

### Risk: Complex State Management

**Mitigation**: Start simple with context, consider Zustand if needed

### Risk: Auth Complexity

**Mitigation**: Use Firebase UI components initially

### Risk: Breaking Existing Features

**Mitigation**: Implement incrementally, test each phase

### Risk: Performance with Many Workspaces

**Mitigation**: Implement pagination, lazy loading

## Total Estimated Time

- Phase 0: ~~3-4 hours~~ ✅ COMPLETED (Actual: ~3 hours)
- Phase 1: ~~2-3 hours~~ ✅ COMPLETED (Actual: ~4 hours including priority fixes)
- Phase 2: ~~3-4 hours~~ ✅ COMPLETED (Actual: ~3 hours)
- Phase 3: 2-3 hours
- Phase 4: ~~2-3 hours~~ ✅ PARTIALLY COMPLETED (~1 hour remaining)
- Phase 5: 3-4 hours

**Total: 15-22 hours** (10 hours completed, 5-8 hours remaining)

## Next Steps

1. ~~Review and approve this plan~~ ✅
2. ~~Complete Phase 0 (Authentication UI)~~ ✅
3. ~~Complete Phase 1 (Workspace State Management)~~ ✅
4. ~~Complete Phase 2 (Workspace Selection UI)~~ ✅
5. **START PHASE 3: Default Workspace Logic** ← NEXT
6. Complete Phase 4 (remaining ~1 hour of work)
7. Complete Phase 5 (Testing & Polish)

## Phase 0 Completion Summary

**Date Completed**: January 7, 2025

**What Was Built**:

- Full authentication system with Firebase Auth
- Login, Signup, and Password Reset UI
- Protected routes that redirect to login
- User sync between Firebase and PostgreSQL
- Logout functionality in sidebar
- Comprehensive error handling
- 45+ tests with full coverage

**Issues Resolved**:

- CORS configuration (frontend was blocked by backend)
- Firebase Admin SDK credentials setup
- User sync endpoint using wrong ID (database ID vs Firebase UID)
- SCSS import issues with design tokens

**Ready for Phase 1**: The authentication foundation is solid and ready for workspace management features.

## Phase 1 Completion Summary (Including Priority Fixes)

**Date Completed**: January 8, 2025

**What Was Built**:

- WorkspaceContext with full state management including page selection
- useWorkspace hook for all workspace and page operations
- Auto-creation of "My Workspace" for new users
- Workspace and page persistence using localStorage
- Prevention of last workspace deletion
- Loading and error state handling with retry functionality
- Integration with existing auth system
- WorkspaceWrapper component connecting context to UI
- Error boundaries for unexpected errors
- Comprehensive test suite (27 tests total)

**Key Features**:

- Workspaces load automatically when user is authenticated
- Last selected workspace is restored on app reload
- Last selected page per workspace is restored
- Workspace selection persists across sessions
- Page selection persists per workspace
- Graceful handling of API errors with retry options
- EditorProvider re-initializes when switching pages
- Error boundaries catch and display unexpected errors

**Priority Fixes Completed**:

1. ✅ Wire up App.tsx with WorkspaceContext data
2. ✅ Add page selection state management to WorkspaceContext
3. ✅ Fix EditorProvider placement for proper re-initialization
4. ✅ Add integration tests for complete workspace flow
5. ✅ Implement error boundaries for workspace operations

**Ready for Phase 2**: The workspace state management is complete with all integrations working and ready for UI components to be built on top.

## Phase 2 Completion Summary

**Date Completed**: January 8, 2025

**What Was Built**:

- WorkspaceSelector dropdown component with:
  - Current workspace display
  - Dropdown list of all workspaces
  - Active workspace indicator (checkmark)
  - "Create New Workspace" option
  - Collapsed/expanded states
  - Loading state support
  - Keyboard navigation (Enter/Escape)
- WorkspaceCreationDialog modal component with:
  - Workspace name input (required, max 50 chars)
  - Description textarea (optional, max 200 chars)
  - Form validation and error display
  - Loading state during creation
  - Form reset on close/reopen
  - Overlay click and Escape key to close
- Sidebar integration:
  - Replaced static "Workspace Name" button
  - State management for dialog visibility
  - Proper event handling and prop passing

**Technical Details**:

- Fixed TypeScript errors with icon names
- Updated useDismiss hook usage for correct signature
- Implemented proper CSS animations (slideDown, fadeIn, slideUp)
- Created comprehensive test suites (49 tests total)
- Added proper React Router mocking for Sidebar tests
- Used existing design tokens and SCSS patterns

**Key Files Created/Modified**:

- `/src/components/WorkspaceSelector/WorkspaceSelector.tsx` - Dropdown component
- `/src/components/WorkspaceSelector/WorkspaceSelector.scss` - Dropdown styles
- `/src/components/WorkspaceSelector/WorkspaceSelector.test.tsx` - 27 tests
- `/src/components/WorkspaceCreationDialog/WorkspaceCreationDialog.tsx` - Modal component
- `/src/components/WorkspaceCreationDialog/WorkspaceCreationDialog.scss` - Modal styles
- `/src/components/WorkspaceCreationDialog/WorkspaceCreationDialog.test.tsx` - 22 tests
- `/src/components/Sidebar/Sidebar.tsx` - Updated to integrate new components
- `/src/components/Sidebar/Sidebar.test.tsx` - Updated tests with proper mocking

**Ready for Phase 3**: The workspace UI is complete and users can now create and switch between workspaces. Next phase will implement default workspace logic and welcome pages.
