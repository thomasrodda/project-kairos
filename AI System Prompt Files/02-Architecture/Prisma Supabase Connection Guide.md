# Prisma + Supabase Connection Guide (IPv4 Users)

## Problem Summary

When using Prisma with Supabase's connection pooler (PgBouncer), you may encounter the error:

```
prepared statement "s0" already exists
```

This happens because:

1. Prisma uses prepared statements by default for better performance
2. Supabase's transaction pooler (Supavisor on port 6543) doesn't support prepared statements
3. The direct connection (port 5432) requires IPv6, which many users don't have

## Solution for IPv4 Users

### 1. Update Prisma Schema

Use only the pooled connection URL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Configure Environment Variables

```env
# Transaction pooler for ALL operations including migrations (port 6543)
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

#### Key Parameters:

- `pgbouncer=true` - Disables prepared statements (REQUIRED for transaction pooler)
- `connection_limit=1` - Limits connections in serverless environments (recommended)
- Port `6543` - Transaction pooler (use for everything on IPv4)

### 3. Finding Your Connection String

In Supabase dashboard:

1. Go to Settings → Database
2. Under "Connection string", select "Transaction" mode
3. Copy the connection string and add `?pgbouncer=true&connection_limit=1`

## Why This Works

**Transaction Pooler (port 6543)**:

- Handles many short-lived connections efficiently
- Perfect for serverless environments
- Requires `pgbouncer=true` to disable prepared statements
- Works with IPv4 connections

## Handling Migrations on IPv4

Since you can't use the direct connection on IPv4, you have these options:

### Option 1: Manual Migrations via Supabase Dashboard (Recommended)

1. Generate migration SQL: `prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script`
2. Copy the generated SQL
3. Go to Supabase Dashboard → SQL Editor
4. Paste and run the SQL

### Option 2: Use `prisma db push` with Pooler

```bash
yarn db:push
```

Note: This might work for simple schema changes but may fail for complex migrations.

### Option 3: Development Workaround

For development, consider using the mock auth system (as configured in `auth-mock.ts`) to avoid database connections during rapid iteration.

## Alternative Solutions

If you still have issues:

1. **Local PostgreSQL for Development** (Highly Recommended):

   ```bash
   # Install PostgreSQL locally
   # Update DATABASE_URL to:
   DATABASE_URL="postgresql://localhost:5432/kairos_dev"
   ```

   - Most reliable for development
   - No pooling complications
   - Full migration support
   - No IPv4/IPv6 issues

2. **Consider Alternative Providers**:

   - **Neon**: Works well with Prisma, has IPv4 support
   - **PlanetScale**: MySQL-based, excellent Prisma support
   - **Railway**: PostgreSQL with simpler connection model

3. **Use Supabase Client Library**:
   - Switch from Prisma to Supabase's JavaScript client
   - Better integration with Supabase features
   - No connection pooling issues

## Testing the Connection

After updating your configuration:

```bash
# Regenerate Prisma client
yarn db:generate

# Test the connection (may fail for complex schemas)
yarn db:push

# Run your development server
yarn dev
```

**Note**: If `db:push` fails, use the manual migration method via Supabase Dashboard.

## Troubleshooting

1. **Still getting "prepared statement" errors?**

   - Ensure you're using port 6543 (not 5432) in DATABASE_URL
   - Verify `pgbouncer=true` is in the connection string
   - Try restarting your development server
   - Clear any cached Prisma clients: `rm -rf node_modules/.prisma`

2. **Migrations failing?**

   - Use manual migration via Supabase Dashboard (see above)
   - Consider setting up local PostgreSQL for development
   - For simple changes, try `prisma db push`

3. **Connection timeouts?**

   - Add `connect_timeout=30` to your connection string
   - Check Supabase dashboard for any service issues
   - Verify your internet connection

4. **IPv4 vs IPv6 Issues?**
   - Test IPv6 availability: `curl -6 https://ipv6.google.com`
   - If IPv6 works, you can use the direct connection
   - Otherwise, stick with the transaction pooler solution

## References

- [Prisma PgBouncer Documentation](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer)
- [Supabase Connection Pooling Guide](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma GitHub Issue #11643](https://github.com/prisma/prisma/issues/11643)
