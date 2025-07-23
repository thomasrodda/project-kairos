# Data Model Guide

> This guide outlines how data is structured in the app, including workspaces, pages, and blocks. It helps ensure consistency across frontend, backend, and storage.

---

## Overview

The app uses a structured, hierarchical data model:

- Users have **Workspaces**
- Each Workspace has **Pages** (organized in a file tree)
- Pages are made of **Blocks** (basic editing units)

Data is stored in a local PostgreSQL database and accessed via API endpoints running on localhost:3001.

> **Migration History**:
>
> - **Before January 11, 2025**: Used mock API endpoints with in-memory data (no persistence)
> - **January 11, 2025 - Present**: Migrated to local PostgreSQL for development
> - **Future**: Will migrate to Supabase cloud PostgreSQL for production
>
> **Note**: The app has never used localStorage for data persistence. It transitioned from mock endpoints directly to PostgreSQL. Local-first editing with localStorage/IndexedDB is a planned future feature for offline capabilities.

---

## App Flow & Hierarchy

### User Journey

```
User → Login (Google OAuth) → Account → Workspace Selection → Main Workspace View
```

### Data Hierarchy

```
User (authenticated via Firebase)
└── Account
    └── Workspaces (multiple projects)
        └── Workspace (e.g., "My Fantasy Novel" or "D&D Campaign")
            └── Pages (documents within the project)
                └── Page
                    ├── Title (editable, always visible)
                    └── Blocks (content units)
```

### Main Workspace View Layout

```
┌─────────────────────────────────────────────────────────┐
│ Navigation Bar (recent pages, future features)          │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│   Sidebar   │              Editor                       │
│             │                                           │
│ ┌─────────┐ │  ┌─────────────────────────────────┐      │
│ │Workspace│ │  │ Page Title (editable)           │      │
│ │ Pages:  │ │  ├─────────────────────────────────┤      │
│ │         │ │  │ Block 1 (paragraph)             │      │
│ │ Page 1  │ │  │ Block 2 (heading)               │      │
│ │ Page 2 ←│ │  │ Block 3 (bullet list)           │      │
│ │ Page 3  │ │  │ ...                             │      │
│ └─────────┘ │  └─────────────────────────────────┘      │
│             │                                           │
└─────────────┴───────────────────────────────────────────┘
                                              Future AI Panel →
```

### Key Concepts

- **Workspace**: The main working environment, contains all pages for a single project
- **Editor**: Displays ONE page at a time, selected from the sidebar
- **Page**: An individual document with its own title and blocks
- **Blocks**: The atomic units of content (paragraphs, headings, lists, etc.)

---

## Database Schema

The application uses Prisma ORM with PostgreSQL. Here's the complete schema:

### User Model

```prisma
model User {
  id          String   @id @default(cuid())
  firebaseUid String   @unique
  email       String   @unique
  displayName String?
  photoURL    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  // Relations
  workspaces      Workspace[]
  contentVersions ContentVersion[]
}
```

- **firebaseUid**: Links to Firebase Authentication
- **Soft delete**: Via `deletedAt` timestamp
- **Relations**: Owns workspaces and creates content versions

### Workspace Model

```prisma
model Workspace {
  id        String   @id @default(cuid())
  name      String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  // Relations
  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  pages Page[]
}
```

- **Ownership**: Each workspace belongs to one user
- **Cascading delete**: Deleting user deletes all workspaces
- **Contains**: Multiple pages organized hierarchically

### Page Model

```prisma
model Page {
  id          String  @id @default(cuid())
  title       String  @default("Untitled")
  workspaceId String
  parentId    String?
  order       Int     @default(0)
  isFolder    Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  // Relations
  workspace       Workspace        @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  parent          Page?            @relation("PageHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children        Page[]           @relation("PageHierarchy")
  blocks          Block[]
  incomingLinks   Link[]           @relation("LinkTarget")
  outgoingLinks   Link[]           @relation("LinkSource")
  contentVersions ContentVersion[]
}
```

- **Hierarchical**: Pages can have parent/child relationships
- **Folders**: `isFolder` flag for organizational containers
- **Ordering**: `order` field for sibling arrangement
- **Links**: Tracks internal page references (future feature)
- **Versioning**: Maintains content history

### Block Model

```prisma
model Block {
  id        String   @id @default(cuid())
  pageId    String
  type      BlockType
  content   String   @default("")
  order     Int      @default(0)
  metadata  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  // Relations
  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)
}
```

- **Block Types**: paragraph, h1, h2, h3, bullet
- **Content**: Text content stored as string
- **Metadata**: Flexible JSON field for future features
- **Ordering**: Blocks ordered within a page

### Link Model (Future Feature)

```prisma
model Link {
  id         String   @id @default(cuid())
  sourceId   String
  targetId   String
  createdAt  DateTime @default(now())

  // Relations
  source Page @relation("LinkSource", fields: [sourceId], references: [id], onDelete: Cascade)
  target Page @relation("LinkTarget", fields: [targetId], references: [id], onDelete: Cascade)

  @@unique([sourceId, targetId])
}
```

- **Internal References**: Tracks page-to-page links
- **Unique Constraint**: One link per source-target pair
- **Bidirectional**: Can query incoming or outgoing links

### ContentVersion Model

```prisma
model ContentVersion {
  id            String   @id @default(cuid())
  pageId        String
  versionNumber Int
  title         String
  blocks        Json     // Snapshot of all blocks at this version
  userId        String
  createdAt     DateTime @default(now())

  // Relations
  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([pageId, versionNumber])
}
```

- **Version History**: Snapshots of page content
- **Block Snapshot**: Complete JSON of all blocks
- **User Attribution**: Tracks who made changes
- **Version Limit**: System maintains last 10 versions per page

### Block Types Enum

```prisma
enum BlockType {
  paragraph
  h1
  h2
  h3
  bullet
}
```

---

## Data Flow Examples

### Creating a New Page

1. User clicks "New Page" in sidebar
2. Frontend calls `POST /api/pages?workspaceId=xxx`
3. Backend creates page with default title "Untitled"
4. Page appears in sidebar file tree
5. User can immediately start editing

### Auto-save Flow

1. User types in editor
2. Frontend debounces changes (500ms)
3. Calls `PUT /api/pages/:id/content` with changed blocks
4. Backend updates blocks in transaction
5. Creates new ContentVersion snapshot
6. Returns updated timestamp for conflict detection

### Version Restore Flow

1. User opens version history
2. Frontend calls `GET /api/pages/:id/versions`
3. User selects version to restore
4. Frontend calls `POST /api/pages/:id/versions/:versionId`
5. Backend replaces current blocks with version snapshot
6. Creates new version to record the restore

---

## TypeScript Types

The frontend uses these types (from `@kairos/types`):

```typescript
interface User {
  id: string
  email: string
  displayName?: string | null
  photoURL?: string | null
  createdAt: Date
  updatedAt: Date
}

interface Workspace {
  id: string
  name: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface Page {
  id: string
  title: string
  workspaceId: string
  parentId?: string | null
  order: number
  isFolder: boolean
  createdAt: Date
  updatedAt: Date
  blocks?: Block[]
  children?: Page[]
}

interface Block {
  id: string
  pageId: string
  type: BlockType
  content: string
  order: number
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'bullet'
```

---

## Database Migrations

### Initial Migration (20250111_init)

The database was initialized with a single migration that creates all tables and relationships:

1. **Tables Created**:

   - `users` - User accounts linked to Firebase
   - `workspaces` - Project containers
   - `pages` - Hierarchical document structure
   - `blocks` - Content units within pages
   - `links` - Page-to-page references (future feature)
   - `content_versions` - Version history snapshots

2. **Indexes**:

   - Unique constraints on `firebaseUid` and `email`
   - Performance indexes on foreign keys
   - Composite unique index on `(pageId, versionNumber)`
   - Descending index on `createdAt` for version queries

3. **Foreign Key Constraints**:
   - All use `ON DELETE CASCADE` for data integrity
   - Ensures orphaned records are automatically cleaned up

### Running Migrations

```bash
# Apply migrations to database
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name <migration_name>

# Reset database (development only)
npx prisma migrate reset
```

---

## Best Practices

1. **Soft Deletes**: All models use `deletedAt` for recovery
2. **Cascading**: Deleting parent deletes children
3. **Ordering**: Use `order` field for user-controlled sequences
4. **Timestamps**: Track `createdAt` and `updatedAt` everywhere
5. **IDs**: Use CUID for globally unique identifiers
6. **Transactions**: Multi-record updates in single transaction
7. **Validation**: Zod schemas validate API inputs
8. **Type Safety**: Share types between frontend and backend
