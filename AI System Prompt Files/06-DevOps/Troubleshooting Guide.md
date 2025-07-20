# Troubleshooting Guide

> Common issues and solutions for Project Kairos development.

## 🚫 Build & Development Issues

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:

```bash
yarn kill-ports  # Kills processes on 3000, 3001, 5173
# OR manually:
lsof -ti:3000 | xargs kill -9
```

### Module Not Found

**Error**: `Cannot find module '@kairos/ui'` or similar

**Solution**:

```bash
# Rebuild packages
yarn build

# Or reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
```

### Vite HMR Not Working (WSL)

**Issue**: File changes not detected in WSL2

**Solution**: Already configured in `vite.config.ts` with polling. If still issues:

```bash
# Check WSL2 is properly set up
wsl --status

# Ensure you're running from WSL terminal, not Windows
```

## 🧪 Test Issues

### Tests Failing on Formatting

**Error**: Tests fail with formatting differences

**Solution**:

```bash
yarn format       # Auto-fix formatting
yarn test        # Re-run tests
```

### Mock Import Errors

**Error**: `Cannot find module '.scss'` or SVG import errors

**Solution**: Mocks are already configured. Check:

- `apps/web/src/test/setup.ts` exists
- `jest.config.js` includes setupFilesAfterEnv

### Test Timeout Issues

**Error**: `Timeout - Async callback was not invoked`

**Solution**:

```javascript
// Increase timeout for slow tests
test('slow test', async () => {
  // test code
}, 10000) // 10 second timeout
```

## 📦 TypeScript Issues

### Type Errors After Database Changes

**Error**: Prisma types out of sync

**Solution**:

```bash
yarn db:generate  # Regenerate Prisma client
yarn typecheck    # Verify types
```

### Strict Mode Errors

**Error**: `Object is possibly 'undefined'`

**Solution**: Add proper type guards:

```typescript
// Bad
block.content.trim()

// Good
block.content?.trim() ?? ''
```

## 🔧 Environment Issues

### Missing Environment Variables

**Error**: `Firebase API key not found`

**Solution**:

```bash
# Check .env.local exists
ls -la .env.local

# Copy from example if missing
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### Database Connection Failed

**Error**: `P1001: Can't reach database server`

**Solution**:

1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env.local`
3. Test connection:

```bash
psql $DATABASE_URL
```

## 🎨 CSS/SCSS Issues

### Design Tokens Not Found

**Error**: `Undefined variable: $color-primary`

**Solution**: Design tokens are auto-imported. Check:

- `vite.config.ts` has scss additionalData
- Token files exist in `packages/design-tokens/src/`

### Styles Not Applying

**Issue**: Component styles missing

**Solution**:

- Ensure `.scss` file is imported in component
- Check for CSS module naming: `styles.className`
- Verify BEM naming conventions

## 🔄 Git Issues

### Pre-commit Hook Failing

**Error**: Husky pre-commit fails

**Solution**:

```bash
# Fix issues locally first
yarn lint
yarn format
yarn typecheck
yarn test

# If hooks broken, reinstall
yarn husky
```

### Large File Warnings

**Warning**: File too large for git

**Solution**:

- Add to `.gitignore` if appropriate
- Use Git LFS for large assets
- Consider external storage for media

## 🚀 Performance Issues

### Slow Development Server

**Issue**: Vite dev server sluggish

**Solution**:

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
yarn dev
```

### Slow Tests

**Issue**: Test suite takes too long

**Solution**:

```bash
# Run tests in parallel
yarn test --maxWorkers=4

# Run only changed tests
yarn test --onlyChanged
```

## 💻 Editor/IDE Issues

### TypeScript Not Working in VS Code

**Issue**: No IntelliSense or type checking

**Solution**:

1. Open VS Code in project root
2. Select TypeScript version: Cmd+Shift+P → "TypeScript: Select TypeScript Version" → Use Workspace Version
3. Restart TS server: Cmd+Shift+P → "TypeScript: Restart TS Server"

### ESLint Not Running

**Issue**: No linting errors shown

**Solution**:

- Install ESLint extension
- Check `.vscode/settings.json` exists
- Reload window: Cmd+Shift+P → "Developer: Reload Window"

## 🆘 Emergency Fixes

### Complete Reset

When nothing else works:

```bash
# Clean everything
rm -rf node_modules
rm -rf coverage
rm -rf dist
rm -rf apps/*/dist
rm -rf packages/*/dist
rm yarn.lock

# Fresh install
yarn install
yarn build
yarn db:generate
```

### Check System Requirements

```bash
node --version  # Should be 22+
yarn --version  # Should be 1.22+
git --version   # Should be 2.25+
```

---

_If your issue isn't listed here, check:_

1. `AI System Prompt Files/01-Core/Current State.md` for known issues
2. GitHub issues for similar problems
3. Component-specific documentation in `AI System Prompt Files/`
