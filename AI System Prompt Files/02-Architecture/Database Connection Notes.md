# Database Connection Notes

## Connection Issues

### Supabase Connection Limitations

- **Pooler connection (port 6543)**: Works for application queries but NOT for migrations
- **Direct connection (port 5432)**: Required for migrations but needs IPv6 support
- **IPv6 Issue**: Direct connections require IPv6 which doesn't work in this environment

### Workarounds for Migrations

1. **Use Supabase SQL Editor** (Recommended)
   - Go to Supabase Dashboard → SQL Editor
   - Paste migration SQL directly
   - Execute the query
2. **Manual Migration Tracking**
   - Keep migrations in `/prisma/migrations/` for version control
   - Apply them manually through Supabase dashboard
   - Document which migrations have been applied

### Current Setup

- **Application**: Uses pooler connection URL (port 6543) - works fine
- **Migrations**: Must be applied manually through Supabase dashboard
- **Development**: Can proceed normally, just remember to apply migrations manually

### Migration History

- **2025-01-10**: Applied `update_block_types` migration - Changed BlockType enum to match frontend values (h1, h2, h3, paragraph, bullet)
