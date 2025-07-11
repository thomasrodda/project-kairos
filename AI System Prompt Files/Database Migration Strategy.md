# Database Migration Strategy

## Overview

This document outlines our database strategy for Project Kairos, addressing the current Prisma/Supabase IPv4 connection issues and providing a clear path forward.

## Current Situation

- **Problem**: Supabase requires IPv6 for direct connections (port 5432), which isn't available in many development environments
- **Workaround**: Using connection pooler (port 6543) causes "prepared statement already exists" errors with Prisma
- **Impact**: Currently using mock endpoints, preventing real data persistence
- **Solution**: Use local PostgreSQL for development, migrate to Supabase for production

## Development Strategy

### Phase 1: Local PostgreSQL (Immediate)

**Why**:

- Eliminates all connection issues
- Full Prisma functionality
- Free for development
- No IPv4/IPv6 problems

**Timeline**: Implement immediately to unblock development

### Phase 2: Supabase Production (When Ready to Launch)

**Why**:

- Managed PostgreSQL service
- Built-in authentication integration
- Real-time capabilities for future features
- Automatic backups and scaling

**Timeline**: When ready to pay for IPv6 support or when Supabase adds IPv4 support

## Migration Plan: Mock → Local PostgreSQL

### 1. Install PostgreSQL Locally

**Windows (WSL2):**

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'localdev123';"
```

**macOS:**

```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

### 2. Create Local Database

```bash
# Connect as postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE kairos_dev;

# Exit
\q
```

### 3. Update Environment Variables

Update `.env.local`:

```env
# Local PostgreSQL connection
DATABASE_URL="postgresql://postgres:localdev123@localhost:5432/kairos_dev"

# Keep Firebase and other settings unchanged
FIREBASE_PROJECT_ID=project-kairos-2885a
# ... (rest of Firebase config)
```

### 4. Run Prisma Migrations

```bash
# Generate Prisma Client
yarn db:generate

# Run existing migrations
yarn db:migrate

# Verify connection
yarn db:studio
```

### 5. Switch from Mock to Real Endpoints

Edit `apps/api/dev-server.ts`:

```typescript
// Change these imports:
// import authRouter from './auth-mock'
// import pagesRouter from './pages-mock'
// import blocksRouter from './blocks-mock'

// To:
import authRouter from './auth'
import pagesRouter from './pages'
import blocksRouter from './blocks'
```

### 6. Mount Auto-Save Endpoint

Add to `apps/api/dev-server.ts`:

```typescript
// Import the content endpoint
import contentRouter from './pages/[id]/content'

// Mount it in the appropriate place
app.use('/api/pages/:id/content', contentRouter)
```

### 7. Test the Setup

```bash
# Start the development servers
yarn dev

# Test that you can:
# 1. Create an account
# 2. Create workspaces and pages
# 3. Edit content and see it persist
# 4. Reload and see saved content
```

## Migration Plan: Local → Supabase Production

### 1. Prepare Supabase Project

1. Ensure Supabase project is created
2. Get connection strings from Supabase dashboard
3. Decide on connection method:
   - **Option A**: Pay for IPv6 support (use direct connection)
   - **Option B**: Use connection pooler with workarounds

### 2. Export Local Data (If Needed)

```bash
# Dump local data
pg_dump kairos_dev > kairos_backup.sql

# Or use Prisma seed file for test data
```

### 3. Update Production Environment Variables

For **Option A** (IPv6 Direct Connection):

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].supabase.co:5432/postgres"
```

For **Option B** (Connection Pooler):

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

### 4. Apply Schema to Supabase

**For Option A (Direct Connection):**

```bash
# Run migrations directly
DATABASE_URL="your-supabase-url" yarn db:migrate
```

**For Option B (Connection Pooler):**

```bash
# Generate migration SQL
yarn prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script > migration.sql

# Apply via Supabase Dashboard → SQL Editor
```

### 5. Deploy Application

1. Set environment variables in Vercel/deployment platform
2. Ensure `DATABASE_URL` points to Supabase
3. Deploy application
4. Test all functionality

## Environment Configuration

### Development (.env.local)

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:localdev123@localhost:5432/kairos_dev"

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Firebase (unchanged)
FIREBASE_PROJECT_ID=project-kairos-2885a
# ... rest of Firebase config
```

### Production (.env.production)

```env
# Supabase PostgreSQL
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].supabase.co:5432/postgres"
# Or with pooler:
# DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].pooler.supabase.com:6543/postgres?pgbouncer=true"

# API Configuration
VITE_API_URL=https://your-domain.com/api

# Firebase (same as dev)
FIREBASE_PROJECT_ID=project-kairos-2885a
# ... rest of Firebase config
```

## Troubleshooting

### Local PostgreSQL Issues

**PostgreSQL won't start:**

```bash
# Check if already running
sudo service postgresql status

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Restart service
sudo service postgresql restart
```

**Permission denied errors:**

```bash
# Ensure postgres user owns data directory
sudo chown -R postgres:postgres /var/lib/postgresql/
```

### Migration Issues

**Prisma migrate fails:**

```bash
# Reset database (CAUTION: destroys data)
yarn db:reset

# Or manually drop and recreate
sudo -u postgres psql -c "DROP DATABASE kairos_dev;"
sudo -u postgres psql -c "CREATE DATABASE kairos_dev;"
```

### Connection Issues

**Can't connect to local PostgreSQL:**

1. Check PostgreSQL is running: `sudo service postgresql status`
2. Verify connection string format
3. Check firewall/antivirus not blocking port 5432
4. Try connecting with psql: `psql -U postgres -h localhost -d kairos_dev`

## Best Practices

1. **Keep schemas in sync**: Always commit Prisma schema changes
2. **Test migrations locally first**: Run migrations on local PostgreSQL before Supabase
3. **Backup before migrations**: Export data before major schema changes
4. **Use transactions**: Wrap complex operations in database transactions
5. **Monitor connections**: Watch for connection pool exhaustion in production

## Future Considerations

1. **When Supabase adds IPv4 support**: Can simplify to direct connections
2. **If switching to Prisma Data Proxy**: Another option for connection pooling
3. **Consider read replicas**: For scaling read-heavy operations
4. **Implement caching layer**: Redis for frequently accessed data

## Summary

- **Now**: Local PostgreSQL for unblocked development
- **Later**: Supabase for managed production database
- **Key files to update**: `.env.local`, `dev-server.ts`
- **No code changes needed**: Same Prisma schema and queries work on both
