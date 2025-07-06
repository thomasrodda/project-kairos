# Redis Setup for Project Kairos API

## Overview

Redis is now integrated into the Project Kairos API to replace in-memory storage for better scalability. It's used by the `syncService` to manage:

- Active edit tracking (with 30-second TTL)
- Page user presence
- Workspace activity data

## Local Development Setup

### Using Docker Compose (Recommended)

1. Start Redis with Docker Compose:

   ```bash
   docker-compose up -d redis
   ```

2. Redis will be available at `localhost:6379`

### Manual Installation

If you prefer to install Redis locally:

- **macOS**: `brew install redis && brew services start redis`
- **Ubuntu/Debian**: `sudo apt-get install redis-server`
- **Windows**: Use WSL2 or Docker

## Configuration

Add these environment variables to your `.env.local`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Redis Key Structure

The syncService uses the following key patterns:

- `active_edits:{blockId}` - Tracks active edits with 30-second TTL
- `page_users:{pageId}` - Hash storing users currently viewing a page

## Health Check

The API health endpoint now includes Redis status:

```bash
curl http://localhost:3001/api/health
```

Response includes:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "environment": "development",
  "redis": {
    "connected": true
  }
}
```

## Error Handling

All Redis operations in `syncService` include error handling that:

- Logs errors to console
- Returns sensible fallback values
- Prevents service disruption if Redis is unavailable

## Testing

Redis is mocked in tests using `RedisMock` class that simulates:

- Key-value operations
- Hash operations
- TTL support
- Pipeline operations

Tests automatically use the mock without requiring a real Redis instance.

## Production Considerations

For production deployments:

1. Use a managed Redis service (AWS ElastiCache, Redis Cloud, etc.)
2. Configure authentication with `REDIS_PASSWORD`
3. Consider Redis Cluster for high availability
4. Monitor memory usage and set appropriate eviction policies
5. Enable persistence (RDB or AOF) for data durability

## Troubleshooting

### Connection Errors

If you see Redis connection errors:

1. Check Redis is running: `docker-compose ps` or `redis-cli ping`
2. Verify environment variables are set correctly
3. Check firewall/security group settings in production

### Memory Issues

Redis stores all data in memory. Monitor usage with:

```bash
redis-cli info memory
```

Consider setting `maxmemory` and `maxmemory-policy` in production.
