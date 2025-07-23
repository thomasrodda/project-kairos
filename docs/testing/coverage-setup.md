# Test Coverage Setup

## Current Status (January 2025)

Test coverage is working but with limitations due to Jest not understanding Vite's `import.meta.env` syntax.

## How to Run Coverage

### Working Commands

```bash
# Web app coverage (utils and hooks only)
yarn test:coverage:web

# API coverage (works fully)
yarn test:coverage:api

# Both together
yarn test:coverage:report
```

### What Doesn't Work

```bash
# This will timeout due to import.meta.env issues
yarn test:coverage
```

## The Problem

Jest's coverage instrumentation tries to parse all source files before any mocks or transforms are applied. When it encounters `import.meta.env` (Vite-specific syntax), it fails during parsing.

Files containing `import.meta.env`:

- `/apps/web/src/lib/firebase.ts`
- `/apps/web/src/services/api/config.ts`
- Any component that imports these

## Current Workaround

We run coverage only on directories that don't import problematic files:

- `src/utils/` - ✅ Works (77.5% coverage)
- `src/hooks/` - ✅ Works
- `src/components/` - ❌ Times out (imports firebase)
- `src/services/` - ❌ Times out (contains config.ts)

## Future Solutions

### Option 1: Migrate to Vitest (Recommended)

Vitest natively understands Vite syntax and would solve this completely.

### Option 2: Refactor Environment Variables

Move all `import.meta.env` usage to a single file that can be easily mocked.

### Option 3: Use NYC for Coverage

Use a different coverage tool that can handle modern JavaScript syntax.

## Coverage Goals

- Utils: 80%+ ✅
- Hooks: 80%+
- Components: 70%+
- API: 60%+
