# Phase 3 Services Configuration Guide

This document describes all configuration options for Phase 3 services in the Kairos API.

## Overview

Phase 3 services (History, Search, Export, Sync, and WebSocket) are configured through environment variables with sensible defaults. All configuration is centralized in `/src/config/phase3.config.ts`.

## Configuration Options

### History Service

Controls versioning, snapshots, and history retention.

| Environment Variable              | Default | Description                                             |
| --------------------------------- | ------- | ------------------------------------------------------- |
| `HISTORY_SNAPSHOT_THRESHOLD`      | 100     | Number of changes before creating an automatic snapshot |
| `HISTORY_SNAPSHOT_INTERVAL_HOURS` | 24      | Hours between automatic snapshots                       |
| `HISTORY_RETENTION_DAYS`          | 30      | Days to retain history (free tier default)              |
| `HISTORY_QUERY_LIMIT_MAX`         | 100     | Maximum number of history items per query               |
| `HISTORY_QUERY_LIMIT_DEFAULT`     | 50      | Default number of history items per query               |

### Search Service

Controls full-text search behavior and result presentation.

| Environment Variable          | Default | Description                              |
| ----------------------------- | ------- | ---------------------------------------- |
| `SEARCH_QUERY_MAX_LENGTH`     | 200     | Maximum length of search query string    |
| `SEARCH_RESULT_LIMIT_MAX`     | 100     | Maximum number of search results         |
| `SEARCH_RESULT_LIMIT_DEFAULT` | 20      | Default number of search results         |
| `SEARCH_SUGGESTION_LIMIT`     | 5       | Number of search suggestions to return   |
| `SEARCH_CONTEXT_LENGTH`       | 200     | Length of search result context snippet  |
| `SEARCH_CONTEXT_PREVIEW`      | 50      | Characters before first match in preview |

### Export Service

Controls import/export functionality and limits.

| Environment Variable         | Default | Description                                 |
| ---------------------------- | ------- | ------------------------------------------- |
| `EXPORT_MAX_SIZE_MB`         | 50      | Maximum export/import size in megabytes     |
| `EXPORT_MAX_RECURSION_DEPTH` | 10      | Maximum depth for recursive subpage exports |
| `EXPORT_INCLUDE_METADATA`    | false   | Include metadata in exports by default      |
| `EXPORT_INCLUDE_SUBPAGES`    | true    | Include subpages in exports by default      |

### Sync Service

Controls real-time collaboration and conflict resolution.

| Environment Variable            | Default | Description                                        |
| ------------------------------- | ------- | -------------------------------------------------- |
| `SYNC_ACTIVE_EDIT_TTL`          | 30      | TTL for active edits in Redis (seconds)            |
| `SYNC_STALE_EDIT_THRESHOLD`     | 60      | Threshold for considering edits as stale (seconds) |
| `SYNC_CLEANUP_INTERVAL_MINUTES` | 5       | Interval for cleaning up stale data (minutes)      |

### WebSocket Configuration

Controls real-time communication settings.

| Environment Variable              | Default               | Description                              |
| --------------------------------- | --------------------- | ---------------------------------------- |
| `WEBSOCKET_CORS_ORIGINS`          | http://localhost:3000 | Comma-separated list of allowed origins  |
| `WEBSOCKET_PING_TIMEOUT`          | 60000                 | Ping timeout in milliseconds             |
| `WEBSOCKET_PING_INTERVAL`         | 25000                 | Ping interval in milliseconds            |
| `WEBSOCKET_EVENTS_PER_MINUTE`     | 120                   | Maximum events per minute per socket     |
| `WEBSOCKET_BROADCASTS_PER_MINUTE` | 60                    | Maximum broadcasts per minute per socket |

## Usage Examples

### Development Configuration

```env
# Faster snapshots for testing
HISTORY_SNAPSHOT_THRESHOLD=10
HISTORY_SNAPSHOT_INTERVAL_HOURS=1

# More search results during development
SEARCH_RESULT_LIMIT_DEFAULT=50

# Smaller limits for local testing
EXPORT_MAX_SIZE_MB=10

# Faster sync for development
SYNC_ACTIVE_EDIT_TTL=10
```

### Production Configuration

```env
# Conservative snapshots to reduce storage
HISTORY_SNAPSHOT_THRESHOLD=500
HISTORY_SNAPSHOT_INTERVAL_HOURS=48
HISTORY_RETENTION_DAYS=90

# Optimized search for performance
SEARCH_RESULT_LIMIT_MAX=50
SEARCH_CONTEXT_LENGTH=150

# Large exports for enterprise users
EXPORT_MAX_SIZE_MB=200
EXPORT_MAX_RECURSION_DEPTH=20

# Stable sync settings
SYNC_ACTIVE_EDIT_TTL=60
SYNC_CLEANUP_INTERVAL_MINUTES=15

# Production WebSocket settings
WEBSOCKET_CORS_ORIGINS=https://app.kairos.com,https://www.kairos.com
WEBSOCKET_PING_TIMEOUT=120000
WEBSOCKET_EVENTS_PER_MINUTE=60
```

## Validation

The configuration is validated on startup. If any values are invalid, the server will log an error and exit. Common validation rules:

- All numeric values must be positive integers
- Limits must have max >= min
- TTL and timeout values must be reasonable (e.g., >= 1 second)
- CORS origins must be valid URLs

## Accessing Configuration in Code

Import the configuration object:

```typescript
import { phase3Config } from '../config/phase3.config'

// Use in your service
const threshold = phase3Config.history.snapshotThreshold
```

## Adding New Configuration

1. Add the environment variable to `.env.example`
2. Add the typed property to the `Phase3Config` interface
3. Add the parsed value to the `phase3Config` object with a sensible default
4. Add validation if needed
5. Update this documentation
6. Use the configuration value in your service

## Testing with Different Configurations

Tests automatically use the default configuration values. To test with different values:

```typescript
// In your test file
import { phase3Config } from '../../config/phase3.config'

beforeEach(() => {
  // Override for this test
  phase3Config.history.snapshotThreshold = 5
})
```

## Performance Considerations

- **History**: Lower thresholds create more snapshots (more storage, better granularity)
- **Search**: Higher limits impact database query performance
- **Export**: Larger limits can cause memory issues with big workspaces
- **Sync**: Lower TTLs increase Redis operations but improve real-time accuracy
- **WebSocket**: Rate limits prevent abuse but may impact legitimate heavy users

## Monitoring

Monitor these metrics in production:

- Snapshot creation frequency
- Search query response times
- Export sizes and durations
- Active edit conflicts
- WebSocket connection counts and event rates
