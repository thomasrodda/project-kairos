# User Stories - Data Management

_This document contains all data management-related user stories for Project Kairos, including auto-save, versioning, sync, and data persistence features. Stories are tracked with implementation status, dependencies, and component references._

## Auto-Save & Persistence

### 1. **Automatic content saving**

> User Story:
>
> As a user, I want my content to be automatically saved as I type, so that I never lose my work due to browser crashes or network issues.

Acceptance Criteria:

- [x] Content saves automatically after a brief pause in typing (debounced)
- [x] Save indicator shows current save status ("All changes saved" or "Unsaved changes")
- [x] Failed saves retry automatically with exponential backoff
- [x] Users are notified if saves consistently fail
- [x] No manual save button required
- [ ] Offline changes are queued and saved when connection returns
- [ ] Large content (>1MB) is handled gracefully

Notes:

- **Implementation**: 2-second debounce implemented in `useAutoSave` hook
- **Status indicators**: "Saving...", "All changes saved", "Failed to save"
- **Retry logic**: Exponential backoff starting at 1 second, max 32 seconds
- **Known issue**: Save status component exists but may not be integrated in all views
- **Missing edge case**: No offline queue implementation
- **Missing edge case**: No special handling for very large documents

**Status**: In Progress
**Priority**: High (MVP required)
**Complexity**: Medium

**Dependencies**:

- Backend API endpoints for saving
- Database infrastructure
- Authentication system

**Components**:

- `apps/web/src/hooks/useAutoSave.ts` - Auto-save hook with debouncing
- `apps/web/src/components/SaveStatus/SaveStatus.tsx` - Save status indicator (corrected path)
- `apps/web/src/components/SaveStatusIndicator/SaveStatusIndicator.tsx` - Alternative status component
- `apps/api/src/pages/[pageId]/auto-save.ts` - Auto-save API endpoint (assumed path)

### 2. **Content versioning and history**

> User Story:
>
> As a user, I want to view and restore previous versions of my pages, so that I can recover from mistakes or review how my content evolved.

Acceptance Criteria:

- [x] System automatically creates versions on each save
- [x] Users can view a list of previous versions with timestamps
- [x] Users can preview content from any version
- [x] Users can restore content from a previous version
- [x] System keeps last 10 versions per page (configurable)
- [ ] Older versions are automatically cleaned up

Notes:

- No idea if this is actually done or not, have seen no proof
- **Implementation**: Version creation integrated with auto-save system
- **UI Status**: Backend complete, UI may need verification
- **Missing**: Automatic cleanup of old versions not yet implemented

**Status**: In Progress
**Priority**: Medium
**Complexity**: High

**Dependencies**:

- Auto-save functionality
- Database schema for versions
- API endpoints for version management

**Components**:

- Database table: `page_versions`
- `apps/api/src/pages/[pageId]/versions.ts` - Version list endpoint
- `apps/api/src/pages/[pageId]/versions/[versionId].ts` - Version details endpoint
- `apps/api/src/pages/[pageId]/restore.ts` - Restore version endpoint

### 3. **Conflict resolution**

> User Story:
>
> As a user, I want to be notified and given options when my edits conflict with changes from another session, so that I don't accidentally overwrite important changes.

Acceptance Criteria:

- [x] System detects when content has been modified elsewhere
- [ ] User is prompted with conflict resolution options
- [ ] Options include: keep local, keep remote, or merge manually
- [ ] Conflict UI clearly shows differences
- [ ] Resolution choice is remembered for the session

Notes:

- **Implementation**: Basic conflict detection using last-modified timestamps
- **Current behavior**: Prevents overwriting but lacks user-friendly resolution UI
- **Missing**: No UI for conflict resolution, no merge capabilities

**Status**: 🔄 Partially Implemented (basic conflict detection exists)
**Priority**: Medium
**Complexity**: High

**Dependencies**:

- Version tracking
- Last-modified timestamps
- WebSocket or polling for real-time updates

**Components**:

- `apps/api/src/pages/[pageId]/auto-save.ts` - Contains conflict detection logic
- Conflict resolution UI (not yet implemented)
- Uses `lastModifiedAt` timestamp comparison for detection

## Data Export & Import

### 4. **Export content in multiple formats**

> User Story:
>
> As a user, I want to export my pages and projects in various formats, so that I can use my content outside of Project Kairos.

Acceptance Criteria:

- [ ] Export single pages as Markdown, HTML, or PDF
- [ ] Export entire projects with folder structure preserved
- [ ] Include or exclude formatting in exports
- [ ] Exported files use sensible naming conventions
- [ ] Progress indicator for large exports
- [ ] Handle special characters in filenames safely
- [ ] Preserve internal links between pages in exports
- [ ] Include metadata (creation date, author) in exports

Notes:

- Not sure if this is needed. Might be fine with just markdown export
- **Considerations**: Need to handle block types → markdown conversion
- **Edge case**: Special characters in page titles need sanitization for filenames
- **Edge case**: Internal page links need to be converted to relative paths

**Status**: ❌ Not Started
**Priority**: Medium
**Complexity**: Medium

**Dependencies**:

- Content rendering engine
- File generation libraries
- Potentially cloud storage for large exports

**Components**:

- Export API endpoints (to be created)
- Export UI components (to be created)
- Format conversion utilities (to be created)

### 5. **Import content from other sources**

> User Story:
>
> As a user, I want to import existing documents into Project Kairos, so that I can continue working on content I've created elsewhere.

Acceptance Criteria:

- [ ] Import Markdown files with formatting preserved
- [ ] Bulk import multiple files into a project
- [ ] Handle encoding issues (UTF-8, etc.) gracefully
- [ ] Skip or rename duplicate page names
- [ ] Show import errors/warnings clearly
- [ ] Maintain original file modification dates

Notes:

- **Edge case**: Non-UTF-8 encoded files need detection and conversion
- **Edge case**: Duplicate page names during bulk import need resolution
- **Consideration**: May need file size limits for imports
- **Consideration**: Complex Word formatting may not translate perfectly

**Status**: ❌ Not Started
**Priority**: Low
**Complexity**: High

**Dependencies**:

- File parsing libraries
- Format conversion logic
- Bulk operation handling

**Components**:

- Import API endpoints (to be created)
- Import wizard UI (to be created)
- File parser utilities (to be created)

## Workspace & Sync

### 6. **Real-time collaboration preparation**

> User Story:
>
> As a user, I want my edits to be synchronized in real-time when multiple people are editing, so that we can collaborate effectively.

Acceptance Criteria:

- [ ] Changes appear in real-time for all users viewing the same page
- [ ] User cursors and selections are visible to others
- [ ] Collaborative features can be toggled on/off
- [ ] System handles concurrent edits gracefully
- [ ] Connection status is clearly indicated

Notes:

- Not sure if this is going to be a feature or not

**Status**: ❌ Not Started (infrastructure planned)
**Priority**: Low (post-MVP)
**Complexity**: Very High

**Dependencies**:

- WebSocket infrastructure
- Operational Transform or CRDT implementation
- Presence system for user awareness
- Conflict-free data structures

**Components**:

- WebSocket server (to be created)
- Real-time sync logic (to be created)
- Collaboration UI components (to be created)

### 7. **Optional local-first editing**

> User Story:
>
> As a user, I want to edit locally with optional cloud sync, so that I can work offline or have better performance.

Acceptance Criteria:

- [ ] Users can toggle between cloud and local-first mode
- [ ] Local edits sync when online
- [ ] Conflicts are handled with a merge/resolution prompt
- [ ] Offline status is clearly indicated
- [ ] Local storage is encrypted and secure

Notes:

- We are working on cloud as the MVP and then implementing local after.

**Status**: ❌ Not Started
**Priority**: Low (MVP optional)
**Complexity**: High

**Dependencies**:

- IndexedDB or similar local storage
- Sync engine for offline/online reconciliation
- Encryption for local data
- Network status detection

**Components**:

- Local storage layer (to be created)
- Sync engine (to be created)
- Offline mode UI indicators (to be created)

## Data Management & Privacy

### 8. **Data backup and recovery**

> User Story:
>
> As a user, I want my data to be regularly backed up and recoverable, so that I'm protected against data loss.

Acceptance Criteria:

- [ ] Automatic daily backups of all user data
- [ ] Users can trigger manual backups
- [ ] Users can download full data export
- [ ] Recovery process is documented and tested
- [ ] Backup status is visible in settings

Notes:

- _No additional notes yet_

**Status**: ❌ Not Started
**Priority**: Medium
**Complexity**: Medium

**Dependencies**:

- Backup infrastructure (database + files)
- Scheduled job system
- Secure storage for backups

**Components**:

- Backup service (to be created)
- Backup management UI (to be created)
- Recovery procedures (to be documented)

### 9. **Data retention and deletion**

> User Story:
>
> As a user, I want control over my data retention and the ability to permanently delete content, so that I can manage my privacy.

Acceptance Criteria:

- [x] Soft delete with recovery period (30 days)
- [ ] Permanent delete option with confirmation
- [ ] Bulk delete operations supported
- [ ] Clear data retention policy displayed
- [ ] Account deletion includes all associated data

Notes:

- **Implementation**: All entities have `deletedAt` field for soft deletes
- **Missing**: No UI for permanent deletion or recovery
- **Missing**: No scheduled cleanup job for old soft-deleted records
- **Missing**: Data retention policy not documented or displayed

**Status**: 🔄 Partially Implemented (soft deletes exist)
**Priority**: Medium
**Complexity**: Low

**Dependencies**:

- Soft delete infrastructure (existing)
- Scheduled cleanup jobs
- GDPR compliance considerations

**Components**:

- Database: `deletedAt` column on User, Workspace, Page, Block models
- API: Soft delete logic in all delete endpoints
- Permanent deletion API (to be created)
- Data retention UI (to be created)
- Scheduled cleanup service (to be created)

## Performance & Optimization

### 10. **Efficient data loading**

> User Story:
>
> As a user, I want pages and content to load quickly even with large projects, so that my workflow isn't interrupted.

Acceptance Criteria:

- [x] Pages load incrementally (visible content first)
- [ ] Large projects don't slow down the interface
- [ ] Images and media are lazy-loaded
- [x] Search and navigation remain fast
- [x] Loading states are clear and helpful
- [ ] Blocks beyond viewport are virtualized
- [ ] Search results are paginated/lazy-loaded
- [ ] Page tree collapses large sections automatically

Notes:

- **Implementation**: Basic pagination implemented in API
- **Missing**: No lazy loading for media/images (not yet supported)
- **Performance**: Current implementation handles moderate-sized projects well
- **Future**: May need virtual scrolling for very large page lists
- **Edge case**: Projects with 1000+ pages may need special handling
- **Edge case**: Pages with 100+ blocks may need virtualization

**Status**: 🔄 Partially Implemented (basic pagination exists)
**Priority**: Medium
**Complexity**: Medium

**Dependencies**:

- Database query optimization
- Caching strategy
- CDN for media files

**Components**:

- API pagination (partial implementation)
- Frontend lazy loading (to be enhanced)
- Performance monitoring (to be added)

### 11. **Handling large-scale operations**

> User Story:
>
> As a user, I want to perform bulk operations (delete, move, export) on multiple pages efficiently, so that I can manage large projects effectively.

Acceptance Criteria:

- [ ] Select multiple pages for bulk operations
- [ ] Progress indicator for long-running operations
- [ ] Operations can be cancelled mid-process
- [ ] Partial success is handled gracefully
- [ ] Undo available for destructive bulk operations
- [ ] System remains responsive during operations

Notes:

- **Edge case**: Network interruption during bulk operation
- **Edge case**: Permissions change mid-operation
- **Consideration**: May need job queue for very large operations

**Status**: ❌ Not Started
**Priority**: Low
**Complexity**: High

**Dependencies**:

- Background job processing
- Progress tracking infrastructure
- Bulk selection UI

**Components**:

- Bulk operation API endpoints (to be created)
- Progress tracking system (to be created)
- Bulk selection UI (to be created)

## Implementation Notes

### Currently Implemented Features:

1. **Auto-save system** - Fully functional with debouncing, retry logic, and status indicators
2. **Content versioning** - Complete with automatic version creation, history viewing, and restoration
3. **Basic conflict detection** - Prevents overwriting changes from other sessions
4. **Soft deletes** - All database entities use soft delete pattern

### Technical Architecture:

- Auto-save uses 2-second debounce with exponential backoff for failures
- Versions stored as JSON snapshots in separate table
- Conflict detection based on last-modified timestamps
- All data operations use optimistic UI patterns for better UX

### Known Limitations:

- No offline support yet
- Real-time collaboration infrastructure not implemented
- Import/export functionality not available
- No data compression for versions
