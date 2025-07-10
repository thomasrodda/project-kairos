# Backend API Guide

> This guide explains how the backend API is structured and how to add or modify serverless functions in the project.

---

## Overview

The backend is built using **serverless functions** deployed on **Vercel**. Each function is modular, fast, and isolated. Functions live under `apps/api/` and follow a one-file-per-route structure.

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
│       └── content.ts    # Auto-save endpoint
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

We use **PostgreSQL** via **Supabase** with **Prisma ORM**.

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
