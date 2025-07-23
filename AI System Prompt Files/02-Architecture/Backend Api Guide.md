# Backend API Guide

> This guide explains how the backend API is structured and how to add or modify serverless functions in the project.

---

## Overview

The backend is built using **serverless functions** deployed on **Vercel**. Each function is modular, fast, and isolated. Functions live under `apps/api/` and follow a one-file-per-route structure.

> **Current State**: As of January 11, 2025, the application migrated from mock endpoints to real PostgreSQL database. Data is now persisted in a local PostgreSQL database for development, with plans to migrate to Supabase for production. See [Database Migration Strategy](./Database Migration Strategy.md) for details.
>
> **Note**: The project never used localStorage for data persistence. It transitioned from in-memory mock endpoints directly to PostgreSQL. Local storage and offline capabilities remain planned future features (see [User Stories - Data Management](../03-Features/DataManagement/User Stories - Data Management.md)).

---

## Folder Structure

```
apps/api/
├── hello.ts              # Example endpoint
├── auth.ts               # Authentication endpoints
├── workspaces.ts         # Workspace management
├── pages.ts              # Page management
├── pages/
│   └── [id]/
│       ├── content.ts    # Auto-save endpoint
│       ├── versions.ts   # Get page versions
│       └── versions/
│           └── [versionId].ts  # Get/restore specific version
├── blocks.ts             # Block operations
├── lib/
│   ├── firebase-admin.ts # Firebase Admin SDK setup
│   ├── prisma.ts         # Prisma client
│   ├── api-utils.ts      # Response helpers
│   ├── api-response.ts   # Response types
│   ├── middleware/
│   │   └── auth.ts       # Authentication middleware
│   └── validations/      # Zod schemas
│       ├── workspace.ts
│       ├── page.ts
│       └── block.ts
└── vercel.json           # Route configuration
```

---

## Authentication

We use **Firebase Authentication** on the frontend. After logging in, the client sends the Firebase ID token to the backend.

### Authentication Flow

1. Frontend logs in via Firebase (Google OAuth or Email/Password)
2. Frontend gets Firebase ID token
3. Frontend sends token in `Authorization: Bearer <token>` header
4. Backend verifies token using Firebase Admin SDK
5. Backend creates/updates user in database if needed
6. Backend returns user data with workspace info

### Protected Routes

All routes except `/api/health` require authentication via the `requireAuth` middleware.

---

## API Endpoints

### Health Check

```
GET /api/health
```

Returns server status. No authentication required.

### Hello (Example)

```
GET /api/hello
```

Example endpoint that returns a simple message. No authentication required.

### Authentication

```
POST /api/auth/verify
Body: { idToken: string }
```

Verifies Firebase token and creates/updates user in database.

```
GET /api/auth/me
```

Returns current user profile with workspaces.

```
POST /api/auth/logout
```

Optional logout endpoint. Since authentication is stateless (Firebase JWT), logout is mainly handled client-side.

### Workspaces

```
GET /api/workspaces
```

List all workspaces for authenticated user.

```
POST /api/workspaces
Body: { name: string }
```

Create a new workspace.

```
GET /api/workspaces?id=xxx
```

Get single workspace details.

```
PUT /api/workspaces?id=xxx
Body: { name: string }
```

Update workspace name.

```
DELETE /api/workspaces?id=xxx
```

Soft delete a workspace.

### Pages

```
GET /api/pages?workspaceId=xxx
```

List all pages in a workspace.

```
POST /api/pages?workspaceId=xxx
Body: { title: string, parentId?: string, isFolder?: boolean }
```

Create a new page.

```
GET /api/pages?id=xxx
```

Get page with all its blocks.

```
PUT /api/pages?id=xxx
Body: { title?: string, parentId?: string, order?: number }
```

Update page metadata.

```
DELETE /api/pages?id=xxx
```

Soft delete a page.

```
PUT /api/pages/reorder
Body: { pageIds: string[] }
```

Reorder pages within their parent.

### Auto-save (NEW)

```
PUT /api/pages/:id/content
Body: {
  title?: string,
  blocks?: Array<{
    id: string,
    type: BlockType,
    content: string,
    order: number,
    metadata?: object
  }>,
  deletedBlockIds?: string[],
  lastUpdatedAt?: string  // For conflict detection
}
```

Auto-save endpoint for page content. Features:

- Partial updates (only send changed data)
- Conflict detection using `lastUpdatedAt` timestamp
- Atomic updates in a transaction
- Returns updated page data with new `updatedAt` timestamp

**Conflict Detection**: If `lastUpdatedAt` is provided and doesn't match the current page's `updatedAt`, returns 409 Conflict.

**Content Versioning**: Each successful save automatically creates a content version snapshot. The system keeps the last 10 versions for rollback capability.

### Content Versioning (NEW)

#### Get Page Versions

```
GET /api/pages/:id/versions
```

Retrieves the version history for a page.

**Response**:

```json
{
  "page": {
    "id": "page-id",
    "title": "Current Page Title"
  },
  "versions": [
    {
      "id": "version-id",
      "versionNumber": 3,
      "title": "Version Title",
      "createdAt": "2025-01-10T10:00:00.000Z",
      "createdBy": {
        "displayName": "User Name",
        "email": "user@example.com"
      }
    }
  ]
}
```

#### Get Version Details

```
GET /api/pages/:id/versions/:versionId
```

Retrieves the full content of a specific version.

**Response**:

```json
{
  "version": {
    "id": "version-id",
    "versionNumber": 3,
    "title": "Version Title",
    "blocks": [
      {
        "id": "block-id",
        "type": "paragraph",
        "content": "Block content",
        "order": 0,
        "metadata": {}
      }
    ],
    "createdAt": "2025-01-10T10:00:00.000Z",
    "createdBy": {
      "displayName": "User Name",
      "email": "user@example.com"
    }
  }
}
```

#### Restore Version

```
POST /api/pages/:id/versions/:versionId
```

Restores a page to a previous version. This operation:

- Updates the page title to the version's title
- Soft deletes all current blocks
- Creates new blocks from the version snapshot
- Creates a new version to record the restore action

**Response**:

```json
{
  "page": {
    "id": "page-id",
    "title": "Restored Title",
    "updatedAt": "2025-01-10T11:00:00.000Z",
    "blocks": [...]
  },
  "message": "Page restored successfully from version"
}
```

**Version Cleanup**: The system automatically maintains only the last 10 versions per page to manage storage.

### Blocks

```
GET /api/blocks?pageId=xxx
```

Get all blocks for a page.

```
GET /api/blocks?id=xxx
```

Get single block details.

```
POST /api/blocks?pageId=xxx
Body: { type: BlockType, content: string, order?: number, metadata?: object }
```

Create a new block.

```
PUT /api/blocks?id=xxx
Body: { type?: BlockType, content?: string, order?: number, metadata?: object }
```

Update a single block.

```
PUT /api/blocks/bulk
Body: {
  blocks: Array<{
    id: string,
    type: BlockType,
    content: string,
    order: number,
    metadata?: object
  }>
}
```

Bulk update multiple blocks.

```
DELETE /api/blocks?id=xxx
```

Soft delete a block.

```
PUT /api/blocks/reorder
Body: { blockIds: string[] }
```

Reorder blocks within a page.

---

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional context
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - User doesn't have access to resource
- `NOT_FOUND` - Resource doesn't exist
- `VALIDATION_ERROR` - Invalid request data
- `CONFLICT_DETECTED` - Resource was modified (auto-save)
- `INTERNAL_ERROR` - Server error

---

## Database

We use **PostgreSQL** with **Prisma ORM**. Currently running locally for development, with plans to migrate to Supabase for production.

### Key Models

- `User` - Firebase UID integration
- `Workspace` - User workspaces
- `Page` - Hierarchical page structure
- `Block` - Page content blocks

### Soft Deletes

All models support soft delete via `deletedAt` timestamp.

---

## Testing API Routes

### Unit Tests

Each endpoint has a corresponding `.test.ts` file with comprehensive tests covering:

- Authentication requirements
- Input validation
- Success scenarios
- Error handling
- Edge cases

### Manual Testing

```bash
# Get auth token from browser DevTools after login
export TOKEN="your-firebase-token"

# Test endpoints
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/workspaces
```

---

## Frontend API Usage Examples

### Base API Client Pattern

The frontend uses a centralized `BaseApiClient` that handles authentication and error handling:

```typescript
// apps/web/src/services/api/client.ts
class BaseApiClient {
  async request<T>(path: string, options?: RequestInit): Promise<T> {
    // Automatically includes Firebase auth token
    // Handles token refresh on 401 errors
    // Provides consistent error handling
  }
}
```

### Service Layer Pattern

Each API domain has its own service class:

```typescript
// apps/web/src/services/api/workspaces.ts
class WorkspaceService extends BaseApiClient {
  async getWorkspaces() {
    return this.request<WorkspacesResponse>('/workspaces')
  }

  async createWorkspace(data: { name: string }) {
    return this.request<CreateWorkspaceResponse>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const workspaceService = new WorkspaceService()
```

### Context Usage Pattern

API calls are wrapped in React contexts for state management:

```typescript
// apps/web/src/contexts/WorkspaceContext.tsx
const loadWorkspaces = useCallback(async () => {
  setIsLoading(true)
  try {
    const response = await workspaceService.getWorkspaces()
    setWorkspaces(response.workspaces)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsLoading(false)
  }
}, [])
```

### Auto-save Example

```typescript
// apps/web/src/services/api/pages.ts
async savePageContent(pageId: string, data: SaveContentData) {
  return this.request<SaveContentResponse>(`/pages/${pageId}/content`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
```

### Error Handling with User Feedback

```typescript
// apps/web/src/contexts/PagesContext.tsx
const createPage = async (title: string) => {
  try {
    const newPage = await pageService.createPage(workspaceId, { title })
    showToast({
      message: 'Page created successfully',
      type: 'success',
    })
    return newPage
  } catch (err) {
    showToast({
      message: err.response?.data?.error?.message || 'Failed to create page',
      type: 'error',
    })
    return null
  }
}
```

---

## Best Practices

- Use `requireAuth` middleware for protected routes
- Validate inputs with Zod schemas
- Use transactions for multi-record updates
- Return consistent error responses
- Include proper TypeScript types
- Write comprehensive tests
- Handle edge cases gracefully
- Use soft deletes instead of hard deletes
- Implement proper authorization checks
