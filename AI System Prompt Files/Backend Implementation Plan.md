# Backend Implementation Plan

## Overview

This document outlines the comprehensive plan for implementing the backend of Project Kairos, focusing on the MVP requirements while building a foundation for future features.

## Architecture Summary

- **API**: Express with Vercel Serverless Functions
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Authentication**: Firebase Auth (Google OAuth + Email)
- **Real-time**: Deferred to post-MVP (Supabase Realtime ready)
- **File Storage**: Deferred to post-MVP (Supabase Storage ready)

## Setup Progress ✅

### Completed Setup (as of 2025-01-09)

1. **Firebase Configuration**

   - ✅ Firebase project: `project-kairos-2885a`
   - ✅ Service account credentials configured
   - ✅ Web app configuration obtained
   - ✅ Authentication providers enabled (Email/Password, Google)

2. **Supabase Database**

   - ✅ Supabase project created
   - ✅ Connection string configured (Transaction pooler on port 6543)
   - ✅ All database tables created:
     - `users` table with Firebase UID integration
     - `workspaces` table for user workspaces
     - `pages` table with hierarchical structure
     - `blocks` table with content and metadata
     - `links` table for page relationships
   - ✅ Indexes and foreign keys established

3. **Development Environment**
   - ✅ Environment variables configured in `.env.local`
   - ✅ Prisma client generated
   - ✅ Database connection verified
   - ✅ API server tested and responding
   - ✅ Development scripts updated with `dotenv-cli` for env loading

## Phase 1: Authentication & User Management (Week 1)

### 1.1 Firebase Admin Setup

```typescript
// apps/api/lib/firebase-admin.ts
- Initialize Firebase Admin SDK
- Create token verification middleware
- Handle token refresh scenarios
```

### 1.2 Authentication Endpoints

```typescript
POST / api / auth / verify // Verify Firebase token, create/update user
POST / api / auth / logout // Optional: Clear any server-side session
GET / api / auth / me // Get current user profile
```

### 1.3 User Profile Management

```typescript
// After successful Firebase auth:
1. Verify Firebase ID token
2. Check if user exists in our DB
3. If not, create user record with Firebase UID
4. Return user profile + JWT for subsequent requests
```

### 1.4 Authentication Middleware

```typescript
// apps/api/middleware/auth.ts
- Extract Firebase token from Authorization header
- Verify token with Firebase Admin
- Attach user to request object
- Handle unauthorized scenarios
```

## Phase 2: Core CRUD Operations (Week 2)

### 2.1 Workspace Management

```typescript
GET    /api/workspaces              // List user's workspaces
POST   /api/workspaces              // Create new workspace
GET    /api/workspaces/:id          // Get workspace details
PUT    /api/workspaces/:id          // Update workspace (name, settings)
DELETE /api/workspaces/:id          // Delete workspace (soft delete)
```

### 2.2 Page Management

```typescript
GET    /api/workspaces/:workspaceId/pages     // List pages in workspace
POST   /api/workspaces/:workspaceId/pages     // Create new page
GET    /api/pages/:id                          // Get page with blocks
PUT    /api/pages/:id                          // Update page metadata
DELETE /api/pages/:id                          // Delete page (soft delete)
PUT    /api/pages/:id/reorder                  // Reorder pages
```

### 2.3 Block Operations

```typescript
GET    /api/pages/:pageId/blocks              // Get all blocks for a page
PUT    /api/pages/:pageId/blocks              // Bulk update blocks (main save)
POST   /api/pages/:pageId/blocks              // Add new block
PUT    /api/blocks/:id                        // Update single block
DELETE /api/blocks/:id                        // Delete block
PUT    /api/pages/:pageId/blocks/reorder      // Reorder blocks
```

## Phase 3: Auto-save & Content Sync (Week 3)

### 3.1 Auto-save Endpoint

```typescript
PUT /api/pages/:id/content
// Accepts partial updates
// Handles conflict detection
// Returns save status
```

### 3.2 Debounced Save Strategy

- Frontend debounces saves (2 seconds after last change)
- Maximum save interval (30 seconds during continuous typing)
- Retry queue for failed saves
- Optimistic UI updates with rollback on failure

### 3.3 Content Versioning (Simplified)

```typescript
// Store last 10 versions per page
- content_versions table
- Automatic cleanup of old versions
- Simple rollback capability
```

## Phase 4: Frontend Integration (Week 4)

### 4.1 API Client Service

```typescript
// apps/web/src/services/api/
├── client.ts          // Axios instance with auth interceptor
├── auth.ts           // Authentication methods
├── workspaces.ts     // Workspace CRUD
├── pages.ts          // Page operations
└── blocks.ts         // Block operations
```

### 4.2 React Query Integration

```typescript
// Data fetching hooks
useWorkspaces() // List workspaces
useWorkspace(id) // Single workspace
usePages(workspaceId)
usePage(id)
useAutoSave() // Debounced save hook
```

### 4.3 Context Updates

```typescript
// Extend existing contexts
- AuthContext: User state, login/logout
- WorkspaceContext: Current workspace
- EditorContext: Add save state, sync status
```

## Database Schema Updates

### Required Indexes

```sql
-- Performance optimization
CREATE INDEX idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX idx_pages_workspace_id ON pages(workspace_id);
CREATE INDEX idx_blocks_page_id_position ON blocks(page_id, position);
```

### Soft Delete Implementation

```prisma
model Workspace {
  deletedAt DateTime?
  // Add to all models for soft delete
}
```

## Security Considerations

### 1. Input Validation

- Use Zod schemas for all endpoints
- Validate Firebase tokens on every request
- Sanitize user-generated content
- Prevent XSS in block content

### 2. Authorization Rules

- Users can only access their own workspaces
- Workspace membership check before page access
- Rate limiting on all endpoints
- CORS configuration for production

### 3. Data Privacy

- No analytics tracking without consent
- Minimal user data collection
- Secure token storage (httpOnly cookies for future)
- GDPR-compliant data handling

## Error Handling Strategy

### Standard Error Response

```typescript
{
  error: {
    code: "WORKSPACE_NOT_FOUND",
    message: "The requested workspace does not exist",
    details: {} // Optional additional context
  }
}
```

### HTTP Status Codes

- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (no/invalid token)
- 403: Forbidden (no access to resource)
- 404: Not Found
- 429: Rate Limited
- 500: Internal Server Error

## Testing Strategy

### 1. Unit Tests

- Authentication middleware
- Validation schemas
- Business logic helpers

### 2. Integration Tests

- API endpoint testing with Supertest
- Database operations with test database
- Authentication flow testing

### 3. E2E Tests (Post-MVP)

- Full user flows from login to content editing
- Auto-save reliability testing
- Error scenario handling

## Performance Optimization

### 1. Database

- Indexed queries for common operations
- Pagination for large datasets
- Efficient block loading (limit to viewport)

### 2. API

- Response compression
- Edge caching for static data
- Connection pooling for database

### 3. Frontend

- Optimistic updates for better UX
- Request deduplication
- Progressive data loading

## Deployment Checklist

### Environment Variables

```env
# Required for production
DATABASE_URL=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_*=
```

### Vercel Configuration

- Environment variables set
- Database connection limits configured
- CORS origins updated for production
- Rate limiting enabled

## Development Timeline

### Week 1: Authentication

- [ ] Firebase Admin setup
- [ ] Auth endpoints
- [ ] User creation flow
- [ ] Frontend auth integration

### Week 2: CRUD Operations

- [ ] Workspace endpoints
- [ ] Page management
- [ ] Block operations
- [ ] Frontend workspace selector

### Week 3: Auto-save

- [ ] Save endpoint with conflict detection
- [ ] Debounced save implementation
- [ ] Save status indicators
- [ ] Error recovery

### Week 4: Polish & Testing

- [ ] Integration testing
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Deployment preparation

## Success Metrics

1. **Authentication**: < 500ms token verification
2. **Page Load**: < 1s for page with 100 blocks
3. **Auto-save**: < 200ms save time
4. **Reliability**: 99.9% uptime for API
5. **Data Loss**: Zero data loss from auto-save

## Future Considerations (Post-MVP)

1. **Real-time Collaboration**

   - WebSocket integration
   - Operational Transforms for conflict resolution
   - Presence indicators

2. **Advanced Features**

   - Full-text search with PostgreSQL
   - AI integration endpoints
   - File upload handling
   - Export functionality

3. **Performance**
   - Redis caching layer
   - CDN for static assets
   - Database read replicas

## Next Steps

1. Set up Supabase project and get connection string
2. Configure Firebase Admin SDK credentials
3. Implement authentication middleware
4. Create first workspace endpoint
5. Test with Postman/Thunder Client

This plan provides a solid foundation for the MVP while keeping future features in mind. The modular approach allows for incremental development and testing.
