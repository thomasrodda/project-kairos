# Backend Implementation Plan

## Overview

This plan implements a Notion-inspired backend architecture for Project Kairos, prioritizing performance, scalability, and future extensibility while keeping initial complexity manageable.

## Core Architecture Decisions

### 1. Block Storage Strategy

- **Individual block records** (not JSON documents)
- Each block is a separate database row
- Enables granular updates, lazy loading, and future collaboration
- Trade-off: More complex queries for better performance

### 2. Multi-Tenancy

- Build with user isolation from the start
- All tables include user_id for data separation
- Collaboration features can be added later via workspace_members table
- No additional complexity for single-user experience

### 3. Auto-Save Strategy

- **Debounced saves**: 1 second after user stops typing
- **Immediate saves**: On block blur or navigation
- **Optimistic updates**: Update UI immediately, sync in background
- **Conflict detection**: Version numbers on each block

### 4. Version History

- **Hybrid approach**: Snapshots + individual changes
- Full page snapshots every 100 edits or 24 hours
- Individual block changes stored between snapshots
- 30-day retention for free users (configurable)

## Database Schema

```sql
-- Users (synced from Firebase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages (hierarchical structure)
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(50), -- emoji icon
  position DECIMAL(10, 5) NOT NULL, -- for ordering
  is_folder BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocks (individual content units)
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- paragraph, h1, h2, h3, bullet
  content TEXT, -- plain text content
  formatting JSONB DEFAULT '[]', -- array of {start, end, type, data}
  position DECIMAL(10, 5) NOT NULL, -- for ordering
  version INTEGER DEFAULT 1, -- for optimistic locking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workspaces_user ON workspaces(user_id);
CREATE INDEX idx_pages_workspace ON pages(workspace_id);
CREATE INDEX idx_pages_parent ON pages(parent_id);
CREATE INDEX idx_blocks_page_position ON blocks(page_id, position);
CREATE INDEX idx_blocks_updated ON blocks(updated_at);

-- Version History Tables
CREATE TABLE page_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL, -- compressed blocks data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE block_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
  operation VARCHAR(20) NOT NULL, -- create, update, delete
  old_content TEXT,
  new_content TEXT,
  old_formatting JSONB,
  new_formatting JSONB,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Future: Collaboration
-- CREATE TABLE workspace_members (
--   workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   role VARCHAR(20) NOT NULL, -- owner, editor, viewer
--   PRIMARY KEY (workspace_id, user_id)
-- );
```

## API Endpoints

### Authentication

```typescript
POST / api / auth / verify // Verify Firebase token
POST / api / auth / sync - user // Create/update user from Firebase
```

### Workspaces

```typescript
GET    /api/workspaces           // List user's workspaces
POST   /api/workspaces           // Create workspace
GET    /api/workspaces/:id       // Get workspace details
PUT    /api/workspaces/:id       // Update workspace
DELETE /api/workspaces/:id       // Delete workspace
```

### Pages

```typescript
GET    /api/workspaces/:id/pages // Get page tree for workspace
POST   /api/pages                // Create page
GET    /api/pages/:id            // Get page with metadata
PUT    /api/pages/:id            // Update page metadata
DELETE /api/pages/:id            // Delete page and blocks
PUT    /api/pages/:id/move       // Move page in hierarchy
```

### Blocks

```typescript
GET    /api/pages/:id/blocks     // Get blocks (with pagination)
POST   /api/blocks                // Create single block
PUT    /api/blocks/:id            // Update single block
DELETE /api/blocks/:id            // Delete single block
POST   /api/blocks/batch          // Batch operations
PUT    /api/blocks/reorder        // Reorder blocks
```

### Version History

```typescript
GET    /api/pages/:id/history     // Get version history
GET    /api/pages/:id/snapshot/:version // Get specific version
POST   /api/pages/:id/restore/:version  // Restore version
```

## Implementation Phases

### Phase 1: Core Foundation (Weeks 1-3) ✅ COMPLETED

1. **Database Setup** ✅

   - ✅ Set up PostgreSQL with Prisma ORM (using Docker)
   - ✅ Create all tables and indexes (users, workspaces, pages, blocks)
   - ✅ Initial migration applied (20250705162218_init)
   - ✅ Added Link model for page relationships
   - ⏳ Seed with test data (pending)

2. **Authentication** ✅

   - ✅ Firebase Admin SDK integration (`firebase-admin.ts`)
   - ✅ Token verification middleware (`auth.middleware.ts`)
   - ✅ User sync endpoint (`/api/auth/sync-user`)
   - ✅ Additional endpoints: `/api/auth/verify`, `/api/auth/me`
   - ✅ Proper user authentication flow with database sync

3. **Basic CRUD** ✅ COMPLETE
   - ✅ Workspace operations (all CRUD endpoints implemented with pagination)
   - ✅ Page operations (all endpoints with hierarchy support)
   - ✅ Block operations (all endpoints with batch support)
4. **API Standards & Security** ✅ NEW - COMPLETE

   - ✅ Standardized API response format (ApiResponse<T>)
   - ✅ Custom error classes (ValidationError, NotFoundError, etc.)
   - ✅ Request/response logging with correlation IDs
   - ✅ Rate limiting (100 req/15min general, 20 req/min auth)
   - ✅ Security headers with helmet.js
   - ✅ Request size limits (10MB JSON, 50MB files)
   - ✅ NoSQL injection protection
   - ✅ Comprehensive error handling middleware

5. **Testing Infrastructure** ✅ NEW - COMPLETE
   - ✅ Comprehensive test suite (116 tests)
   - ✅ Test factories and helpers
   - ✅ API integration tests
   - ✅ Proper mocking strategy (Firebase, Prisma)

### Phase 2: Real-time Sync (Weeks 4-5)

1. **Auto-save Implementation**

   - Debounced save logic
   - Optimistic locking
   - Conflict detection

2. **Batch Operations**

   - Bulk block updates
   - Efficient reordering
   - Paste operation support

3. **Performance Optimization**
   - Query optimization
   - Connection pooling
   - Response caching

### Phase 3: Advanced Features (Weeks 6-7)

1. **Version History**

   - Snapshot system
   - Change tracking
   - History UI endpoints

2. **Search & Export**

   - Full-text search
   - Markdown export
   - Import functionality

3. **Real-time Updates**
   - WebSocket setup
   - Change notifications
   - Multi-tab sync

### Phase 4: Scale & Polish (Week 8+)

1. **Performance**

   - Redis caching
   - Database read replicas
   - CDN for static assets

2. **Monitoring**

   - Error tracking (Sentry)
   - Performance monitoring
   - Usage analytics

3. **Security**
   - Rate limiting
   - Input validation
   - Security headers

## Technical Implementation Details

### Block Formatting Structure

```typescript
interface TextFormat {
  start: number
  end: number
  type: 'bold' | 'italic' | 'underline' | 'link'
  data?: { url: string } // for links
}

interface Block {
  id: string
  type: BlockType
  content: string
  formatting: TextFormat[]
  position: number
  version: number
}
```

### Auto-save Implementation

```typescript
// Frontend
const saveBlock = debounce(async (blockId: string, content: string, formatting: TextFormat[]) => {
  try {
    const response = await api.updateBlock(blockId, {
      content,
      formatting,
      version: currentVersion,
    })

    if (response.version !== currentVersion + 1) {
      // Handle conflict
      await resolveConflict(blockId)
    }
  } catch (error) {
    // Queue for retry
    offlineQueue.add({ blockId, content, formatting })
  }
}, 1000)

// Backend
app.put('/api/blocks/:id', async (req, res) => {
  const { content, formatting, version } = req.body

  // Optimistic locking
  const updated = await prisma.block.updateMany({
    where: {
      id: req.params.id,
      version: version,
    },
    data: {
      content,
      formatting,
      version: { increment: 1 },
      updatedAt: new Date(),
    },
  })

  if (updated.count === 0) {
    return res.status(409).json({
      success: false,
      error: { code: 'VERSION_CONFLICT' },
    })
  }

  // Track change for version history
  await trackBlockChange(req.params.id, 'update', oldContent, content)

  res.json({ success: true, version: version + 1 })
})
```

### Position Management for Ordering

```typescript
// Generate position between two blocks
function generatePosition(before: number | null, after: number | null): number {
  if (!before) return after ? after / 2 : 1
  if (!after) return before + 1
  return (before + after) / 2
}

// Rebalance positions if they get too close
async function rebalancePositions(pageId: string) {
  const blocks = await prisma.block.findMany({
    where: { pageId },
    orderBy: { position: 'asc' },
  })

  const updates = blocks.map((block, index) => ({
    where: { id: block.id },
    data: { position: (index + 1) * 1000 },
  }))

  await prisma.$transaction(updates.map((update) => prisma.block.update(update)))
}
```

## Monitoring & Observability

### Key Metrics

- API response times (p50, p95, p99)
- Block save success rate
- Active users per hour
- Storage usage per user
- Error rates by endpoint

### Logging Strategy

```typescript
// Structured logging
logger.info('Block updated', {
  blockId,
  userId,
  pageId,
  duration: Date.now() - startTime,
  version,
})
```

## Security Considerations

1. **Authentication**: All endpoints require valid Firebase token
2. **Authorization**: Users can only access their own data
3. **Rate Limiting**: 100 requests per minute per user
4. **Input Validation**: Zod schemas for all inputs
5. **SQL Injection**: Prevented by Prisma parameterized queries
6. **XSS Prevention**: Content sanitization on output

## Cost Optimization

1. **Database**: Use connection pooling, optimize queries
2. **Storage**: Compress old snapshots, purge old history
3. **Compute**: Cache frequently accessed data
4. **Bandwidth**: Paginate large responses

## Future Considerations

1. **Collaboration**: Workspace sharing, real-time cursors
2. **AI Features**: Vector embeddings for content
3. **Mobile Sync**: Offline-first architecture
4. **Enterprise**: SSO, audit logs, compliance

This implementation plan provides a solid foundation that matches Notion's architecture while being practical to implement for a single developer.

## Current Implementation Status (January 2025)

### ✅ Completed Infrastructure

1. **Environment Setup**

   - PostgreSQL 17 running in Docker container (port 5432)
   - Environment variables configured (.env.local)
   - Firebase project connected (project-kairos-2885a)
   - Security configuration with environment variables

2. **Database Schema**

   - Prisma schema implementation notes:
     - Uses `cuid()` instead of `UUID` for IDs (better for distributed systems)
     - Uses `order` field (integer) instead of `position` (decimal)
     - Added `Link` model for page relationships
     - Block `metadata` field stores formatting as JSONB
     - `BlockType` enum: PARAGRAPH, HEADING1, HEADING2, HEADING3, BULLET
     - Version history tables pending (Phase 3)

3. **API Structure**

   ```
   apps/api/
   ├── src/
   │   ├── app.ts                    # Express app with security middleware
   │   ├── config/
   │   │   └── security.config.ts    # Security configuration
   │   ├── middleware/
   │   │   ├── auth.middleware.ts    # Firebase auth verification
   │   │   ├── errorHandler.ts       # Global error handling
   │   │   ├── requestLogger.ts      # Request/response logging
   │   │   └── security.ts           # Rate limiting, helmet, etc.
   │   ├── routes/
   │   │   ├── auth.routes.ts        # Authentication endpoints
   │   │   ├── workspace.routes.ts   # Workspace CRUD
   │   │   ├── pages.ts              # Page CRUD with hierarchy
   │   │   └── blocks.ts             # Block CRUD with batch ops
   │   ├── services/
   │   │   ├── firebase-admin.ts     # Firebase Admin SDK
   │   │   ├── auth.service.ts       # User sync and auth
   │   │   ├── workspaceService.ts   # Workspace business logic
   │   │   ├── pageService.ts        # Page operations
   │   │   └── blockService.ts       # Block operations
   │   ├── utils/
   │   │   ├── apiResponse.ts        # Standardized responses
   │   │   └── errors.ts             # Custom error classes
   │   └── test/
   │       ├── setup.ts              # Test configuration
   │       ├── factories.ts          # Test data factories
   │       └── helpers.ts            # Test utilities
   └── dev-server.ts                 # Development server entry
   ```

4. **Key Implementation Features**
   - Express 5 with TypeScript
   - Standardized API response format (ApiResponse<T>)
   - Custom error classes with proper HTTP mapping
   - Comprehensive security middleware (rate limiting, helmet, sanitization)
   - Request ID tracking for debugging
   - Zod validation for all inputs
   - Database singleton pattern for connection management
   - Full test coverage (116 tests)
   - Modern 2025 best practices throughout

### 🚀 Next Immediate Steps

1. **Phase 2: Real-time Sync**

   - Implement auto-save with debouncing
   - Add optimistic locking for blocks
   - Create batch update endpoints
   - Add WebSocket support for real-time updates

2. **Frontend Integration**

   - Update frontend to use new API response format
   - Connect editor to block endpoints
   - Implement workspace/page navigation UI
   - Add loading states and error handling

3. **Production Readiness**
   - Add OpenAPI/Swagger documentation
   - Set up monitoring (APM)
   - Configure production deployment
   - Add database seeding scripts
   - Implement caching layer
