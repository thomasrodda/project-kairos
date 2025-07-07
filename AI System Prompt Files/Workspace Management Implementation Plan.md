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

### 🔲 Not Implemented (Frontend)

- Authentication UI (login/signup)
- Workspace state management
- Workspace selection/switching UI
- Default workspace creation
- Integration with existing components

### 📋 Key Findings

1. Workspaces start empty (no automatic page creation)
2. Single-user workspaces only in MVP (no sharing)
3. Component props exist but aren't wired up
4. Firebase is configured but no auth UI exists

## Implementation Phases

### Phase 0: Authentication UI (Prerequisite)

**Goal**: Enable user authentication to access workspace features

**Tasks**:

1. Create Login/Signup components with Firebase Auth
2. Implement protected routes
3. Add user context/state management
4. Handle auth persistence and logout

**Estimated Time**: 3-4 hours

### Phase 1: Workspace State Management

**Goal**: Create centralized workspace state that all components can access

**Tasks**:

1. Create `WorkspaceContext` with:
   - Current workspace state
   - Workspace list
   - Loading/error states
   - Selection handlers
2. Create `useWorkspace` hook for:

   - Fetching user's workspaces
   - Creating workspaces
   - Switching workspaces
   - Persisting selection to localStorage

3. Wrap app with WorkspaceProvider

**Estimated Time**: 2-3 hours

### Phase 2: Workspace Selection UI

**Goal**: Enable users to view and switch between workspaces

**Tasks**:

1. Create WorkspaceSelector component:

   - Dropdown in sidebar header
   - Shows current workspace name
   - Lists all workspaces on click
   - "Create New Workspace" option

2. Create WorkspaceCreationDialog:

   - Modal for new workspace creation
   - Name input with validation
   - Create and auto-select new workspace

3. Integrate with existing Sidebar component

**Estimated Time**: 3-4 hours

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

### Phase 4: Component Integration

**Goal**: Wire up all existing components with workspace context

**Tasks**:

1. Update App.tsx:

   - Add WorkspaceProvider
   - Pass workspace props to Workspace component

2. Update Workspace component:

   - Get workspace from context
   - Pass to Sidebar and Editor

3. Fix PageTree rendering:

   - Receive workspaceId from props
   - Show pages for current workspace
   - Handle page selection

4. Update Editor to use workspace context

**Estimated Time**: 2-3 hours

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
  loading: boolean
  error: Error | null

  // Actions
  createWorkspace: (name: string) => Promise<Workspace>
  selectWorkspace: (id: string) => Promise<void>
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
├── AuthProvider (new)
│   └── WorkspaceProvider (new)
│       └── Workspace
│           ├── Sidebar
│           │   ├── WorkspaceSelector (new)
│           │   └── PageTree
│           └── EditorWithSync
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

### Phase 0

- [ ] Users can sign up and log in
- [ ] Auth state persists across sessions
- [ ] Protected routes redirect to login

### Phase 1

- [ ] WorkspaceContext provides workspace state
- [ ] Workspace selection persists in localStorage
- [ ] Loading/error states handled properly

### Phase 2

- [ ] Workspace selector shows in sidebar
- [ ] Users can switch workspaces smoothly
- [ ] New workspaces can be created

### Phase 3

- [ ] New users get default workspace
- [ ] New workspaces get welcome page
- [ ] Can't delete last workspace

### Phase 4

- [ ] PageTree shows pages for current workspace
- [ ] All components use workspace context
- [ ] No prop drilling for workspace data

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

### Required Before Starting

- Firebase project configured
- Backend running locally
- Database with user table

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

- Phase 0: 3-4 hours
- Phase 1: 2-3 hours
- Phase 2: 3-4 hours
- Phase 3: 2-3 hours
- Phase 4: 2-3 hours
- Phase 5: 3-4 hours

**Total: 15-22 hours**

## Next Steps

1. Review and approve this plan
2. Complete Phase 0 (Authentication UI)
3. Proceed with phases sequentially
4. Test thoroughly between phases
5. Update documentation as we go
