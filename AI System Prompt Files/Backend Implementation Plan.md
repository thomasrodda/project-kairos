# Backend Implementation Plan

> A comprehensive plan for implementing the Project Kairos backend API, authentication, and data persistence layer.

---

## Overview

This document outlines the step-by-step plan for building out the backend infrastructure for Project Kairos. The backend will handle user authentication, data persistence, and business logic for the creative writing application.

## Architecture Summary

- **API Framework**: Express + Vercel Serverless Functions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Auth with JWT tokens
- **Deployment**: Vercel (serverless)
- **Real-time**: WebSockets or Server-Sent Events (Phase 2)

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

#### 1.1 Firebase Authentication Setup

- [ ] Initialize Firebase Admin SDK in `apps/api/lib/firebase-admin.ts`
- [ ] Create auth middleware for token verification
- [ ] Add user creation/sync endpoint
- [ ] Test auth flow with Postman

**Key Files:**

```
apps/api/
├── lib/
│   ├── firebase-admin.ts    # Admin SDK initialization
│   └── auth-middleware.ts   # JWT verification
└── auth/
    ├── verify.ts           # Token verification endpoint
    └── sync-user.ts        # Create/update user in DB
```

#### 1.2 Database Connection

- [ ] Set up Prisma client singleton in `apps/api/lib/prisma.ts`
- [ ] Create database utilities (error handling, common queries)
- [ ] Test connection with health check endpoint
- [ ] Set up migration workflow

**Key Files:**

```
apps/api/
├── lib/
│   ├── prisma.ts          # Prisma client instance
│   └── db-utils.ts        # Common DB utilities
└── health.ts              # Health check endpoint
```

#### 1.3 Error Handling & Logging

- [ ] Create centralized error handler
- [ ] Set up logging service (console for now, structured later)
- [ ] Add request validation utilities
- [ ] Create standard API response format

### Phase 2: CRUD Endpoints (Week 2-3)

#### 2.1 Workspace Management

- [ ] POST `/api/workspaces` - Create workspace
- [ ] GET `/api/workspaces` - List user workspaces
- [ ] GET `/api/workspaces/:id` - Get workspace details
- [ ] PUT `/api/workspaces/:id` - Update workspace
- [ ] DELETE `/api/workspaces/:id` - Delete workspace

#### 2.2 Page Management

- [ ] POST `/api/pages` - Create page
- [ ] GET `/api/pages/:id` - Get page with blocks
- [ ] PUT `/api/pages/:id` - Update page metadata
- [ ] DELETE `/api/pages/:id` - Delete page
- [ ] PUT `/api/pages/:id/move` - Move page in hierarchy
- [ ] GET `/api/workspaces/:id/pages` - Get page tree

#### 2.3 Block Operations

- [ ] GET `/api/pages/:pageId/blocks` - Get all blocks
- [ ] POST `/api/blocks` - Create block
- [ ] PUT `/api/blocks/:id` - Update block content
- [ ] DELETE `/api/blocks/:id` - Delete block
- [ ] PUT `/api/blocks/reorder` - Bulk reorder blocks
- [ ] PUT `/api/blocks/bulk-update` - Bulk update (for paste)

### Phase 3: Advanced Features (Week 4)

#### 3.1 Real-time Sync

- [ ] Add WebSocket support or SSE
- [ ] Implement autosave endpoint with debouncing
- [ ] Add conflict resolution for concurrent edits
- [ ] Create presence indicators (who's editing)

#### 3.2 Search & Export

- [ ] GET `/api/search` - Full-text search across workspace
- [ ] GET `/api/export/:pageId` - Export page as markdown
- [ ] POST `/api/import` - Import markdown to blocks

### Phase 4: Performance & Security (Week 5)

#### 4.1 Performance

- [ ] Add Redis caching layer
- [ ] Implement pagination for large datasets
- [ ] Add database indexing
- [ ] Optimize N+1 queries

#### 4.2 Security

- [ ] Rate limiting per user
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles most)
- [ ] CORS configuration for production

## API Endpoint Structure

### Authentication Required Headers

```
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

### Standard Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Example Endpoint Implementation

```typescript
// apps/api/pages/[id].ts
import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../lib/prisma'
import { verifyAuth } from '../lib/auth-middleware'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Verify authentication
    const userId = await verifyAuth(req)
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
      })
    }

    const { id } = req.query

    // Route based on method
    switch (req.method) {
      case 'GET':
        const page = await prisma.page.findFirst({
          where: { id: String(id), workspace: { userId } },
          include: { blocks: { orderBy: { order: 'asc' } } },
        })

        if (!page) {
          return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Page not found' },
          })
        }

        return res.json({ success: true, data: page })

      case 'PUT':
        // Update logic
        break

      case 'DELETE':
        // Delete logic
        break

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Page endpoint error:', error)
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
    })
  }
}
```

## Testing Strategy

### Unit Tests

- Test auth middleware with mock tokens
- Test database utilities with test database
- Test individual endpoint logic

### Integration Tests

- Full API flow tests with real database
- Authentication flow testing
- Error handling scenarios

### E2E Tests

- Frontend to backend data flow
- Real-time sync testing
- Performance under load

## Development Workflow

1. **Start with Auth**: Get Firebase working first
2. **Build One Complete Flow**: e.g., create workspace → create page → add blocks
3. **Test as You Go**: Write tests for each endpoint
4. **Document APIs**: Update this plan with actual implementations
5. **Frontend Integration**: Connect one feature at a time

## Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://..."

# Firebase Admin
FIREBASE_PROJECT_ID="..."
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."

# API
API_URL="http://localhost:3001"

# Optional
REDIS_URL="..."
LOG_LEVEL="debug"
```

## Success Criteria

- [ ] User can sign in with Google
- [ ] User can create/read/update/delete workspaces
- [ ] User can manage pages with full CRUD
- [ ] Blocks save and load correctly
- [ ] Changes persist across sessions
- [ ] API responds within 200ms for most operations
- [ ] All endpoints have error handling
- [ ] Frontend seamlessly integrates with backend

## Notes

- Start simple, iterate based on frontend needs
- Prioritize data integrity over performance initially
- Keep endpoints focused and RESTful
- Document any deviations from this plan
