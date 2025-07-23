# Feature Dependencies Map

This document maps the dependencies between different features in Project Kairos, showing which features rely on others and identifying shared components.

**Last Updated**: January 23, 2025

## Core Feature Dependencies

### 🔵 Authentication

**Depends on:** None (foundational feature)
**Required by:** All other features
**Shared Components:**

- `AuthContext.tsx` - Used by all protected features
- `api/client.ts` - Token injection for all API calls

### 🟢 Workspace Management

**Depends on:**

- ✅ Authentication (user must be logged in)

**Required by:**

- Pages & File Tree
- Editor
- Data Management

**Shared Components:**

- `WorkspaceContext.tsx` - Provides current workspace to all features

### 🟡 Pages & File Tree

**Depends on:**

- ✅ Authentication
- ✅ Workspace Management (pages belong to workspaces)

**Required by:**

- Editor (needs page to edit)
- Internal Linking (needs page list)

**Shared Components:**

- `PagesContext.tsx` - Provides page list and state
- `PageContext.tsx` - Provides current page state

### 🟠 Editor

**Depends on:**

- ✅ Authentication
- ✅ Workspace Management
- ✅ Pages & File Tree (must have a page to edit)
- ⚠️ Data Management (for auto-save)

**Required by:**

- Internal Linking (editor hosts the @-mention feature)

**Shared Components:**

- `EditorContext.tsx` - Central editor state
- Block components used by editor features

### 🔴 Internal Linking (@-mentions)

**Depends on:**

- ✅ Authentication
- ✅ Workspace Management
- ✅ Pages & File Tree (needs page list)
- ✅ Editor (lives within editor)

**Required by:** None (leaf feature)

**Shared Components:**

- Will use `PagesContext.tsx` for page search
- Will extend `textFormatting.ts` for link formatting

### 🟣 Data Management

**Depends on:**

- ✅ Authentication
- ✅ Workspace Management

**Required by:**

- Editor (auto-save functionality)
- Pages & File Tree (CRUD operations)

**Shared Components:**

- API client services
- Database models

### 🟤 AI Features (Future)

**Depends on:**

- ✅ Authentication
- ✅ Workspace Management
- ✅ Editor (AI operates on content)
- ✅ Pages & File Tree (AI needs context)

**Required by:** None (enhancement feature)

### ⚫ Collaboration (Future)

**Depends on:**

- ✅ Authentication
- ✅ Workspace Management
- ✅ Editor (collaborative editing)
- ✅ Pages & File Tree
- ✅ Data Management (real-time sync)

**Required by:** None (enhancement feature)

## Dependency Graph

```
Authentication
    ↓
Workspace Management
    ↓
Pages & File Tree ←→ Data Management
    ↓                    ↓
Editor ←─────────────────┘
    ↓
Internal Linking

Future Features:
- AI Features (depends on Editor + Pages)
- Collaboration (depends on all core features)
```

## Critical Shared Components

### Context Providers (State Management)

1. **AuthContext** → Used by all features
2. **WorkspaceContext** → Used by all features except Auth
3. **PagesContext** → Used by Pages, Editor, and Internal Linking
4. **PageContext** → Used by Editor and Pages
5. **EditorContext** → Used by Editor and Internal Linking

### Service Layers

1. **API Client** → Used by all features for backend communication
2. **Database Models** → Shared data structures
3. **Utility Functions** → Shared across features

## Implementation Order

Based on dependencies, features should be implemented/fixed in this order:

1. **Authentication** (foundational)
2. **Workspace Management** (required by all)
3. **Data Management** (enables persistence)
4. **Pages & File Tree** (core navigation)
5. **Editor** (core functionality)
6. **Internal Linking** (enhancement)
7. **AI Features** (future enhancement)
8. **Collaboration** (future enhancement)

## Cross-Feature Integration Points

### Editor ↔ Pages

- Page title editing in editor
- Auto-save triggers from editor
- Page selection from sidebar

### Editor ↔ Data Management

- Auto-save functionality
- Content versioning
- Conflict resolution

### Pages ↔ Workspace

- Pages belong to workspaces
- Workspace switching changes page tree

### Authentication ↔ Everything

- All API calls need auth tokens
- All routes need auth protection
- User context needed everywhere

## Testing Considerations

When testing features, consider these dependencies:

1. **Isolated Testing**: Mock dependent features
2. **Integration Testing**: Test feature interactions
3. **End-to-End Testing**: Test complete workflows

## Notes for AI Assistants

When implementing or fixing features:

1. Check all dependencies are working first
2. Consider impact on dependent features
3. Update shared components carefully
4. Test integration points thoroughly
5. Document any new dependencies created

## Related Documentation

- [Component-UserStory-Mapping.md](Component-UserStory-Mapping.md) - Component usage across features
- [Current State.md](../01-Core/Current State.md) - Feature completion status
- Individual User Stories documents in each feature folder
