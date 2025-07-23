# Vitest Migration Plan

## Executive Summary

This document outlines the plan to migrate Project Kairos from Jest to Vitest. The migration will solve our current test coverage issues caused by Jest's inability to handle `import.meta.env` syntax and provide significant performance improvements.

**Status**: Planned for future sprint
**Estimated Effort**: 1-2 developer days
**Priority**: Medium (current workaround exists)

## Why Migrate?

### Current Problems with Jest

1. **Coverage Timeout**: Jest coverage fails when encountering `import.meta.env`
2. **Slow Test Runs**: Especially in watch mode
3. **Complex Configuration**: Requires multiple config files and workarounds
4. **Poor Vite Integration**: Different transformation pipelines

### Benefits of Vitest

1. **Native Vite Support**: Understands `import.meta.env` out of the box
2. **Faster Execution**: 2-3x faster, especially in watch mode
3. **Better DX**: HMR for tests, better error messages
4. **Unified Pipeline**: Same config/plugins as your Vite build

## Pre-Migration Checklist

- [ ] All tests passing with Jest
- [ ] Team agreement on migration timing
- [ ] 1-2 days available for migration
- [ ] CI/CD pipeline access for updates

## Migration Steps

### Phase 1: Setup & Proof of Concept (2-3 hours)

#### 1.1 Install Vitest Dependencies

```bash
yarn add -D vitest @vitest/ui @vitest/coverage-v8
yarn add -D jsdom @testing-library/jest-dom
```

#### 1.2 Create Vitest Configuration

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*', '**/mockData/**'],
    },
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@kairos/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@kairos/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@kairos/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
})
```

#### 1.3 Update Test Setup File

```typescript
// apps/web/src/test/setup.ts
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Keep existing polyfills and mocks, but update syntax:
// Replace jest.fn() with vi.fn()
// Remove the manual import.meta.env mock (Vitest handles it)
```

#### 1.4 Migrate One Test File

Convert a simple test file as proof of concept:

```typescript
// Before (Jest)
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

jest.mock('../hooks/useAuth')

describe('MyComponent', () => {
  it('renders', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})

// After (Vitest)
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

vi.mock('../hooks/useAuth')

describe('MyComponent', () => {
  it('renders', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Phase 2: Automated Migration (2-3 hours)

#### 2.1 Create Migration Script

```javascript
// scripts/migrate-to-vitest.js
const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Find all test files
const testFiles = glob.sync('**/*.test.{ts,tsx,js,jsx}', {
  ignore: ['node_modules/**', 'dist/**'],
})

testFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8')

  // Add vitest imports if jest is used
  if (content.includes('jest.')) {
    content = "import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'\n" + content
  }

  // Replace Jest APIs
  content = content
    .replace(/jest\.mock/g, 'vi.mock')
    .replace(/jest\.fn/g, 'vi.fn')
    .replace(/jest\.spyOn/g, 'vi.spyOn')
    .replace(/jest\.clearAllMocks/g, 'vi.clearAllMocks')
    .replace(/jest\.resetAllMocks/g, 'vi.resetAllMocks')
    .replace(/jest\.useFakeTimers/g, 'vi.useFakeTimers')
    .replace(/jest\.useRealTimers/g, 'vi.useRealTimers')
    .replace(/jest\.advanceTimersByTime/g, 'vi.advanceTimersByTime')

  fs.writeFileSync(file, content)
})
```

#### 2.2 Run Migration

```bash
node scripts/migrate-to-vitest.js
```

### Phase 3: Fix Issues & Edge Cases (4-6 hours)

#### Common Issues to Fix:

1. **Module Mocking Differences**

```typescript
// Jest
jest.mock('./config', () => ({
  default: { apiUrl: 'http://test' },
}))

// Vitest
vi.mock('./config', () => ({
  default: { apiUrl: 'http://test' },
}))
```

2. **Timer Mocks**

```typescript
// May need to add explicit timer type
vi.useFakeTimers({ shouldAdvanceTime: true })
```

3. **Snapshot Testing**

- Vitest uses different snapshot format
- May need to regenerate snapshots

4. **React Testing Library**

- Most patterns work identically
- Some async utilities might need adjustment

### Phase 4: Update Configuration (1 hour)

#### 4.1 Update package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

#### 4.2 Update CI/CD

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: yarn test:run

- name: Generate coverage
  run: yarn test:coverage
```

#### 4.3 Remove Jest

```bash
yarn remove jest ts-jest @types/jest jest-environment-jsdom babel-jest
rm jest.config.js
```

### Phase 5: Verification (1-2 hours)

- [ ] All tests pass locally
- [ ] Coverage reports generate correctly
- [ ] CI/CD pipeline passes
- [ ] Watch mode works properly
- [ ] Coverage includes all files (no more timeout!)

## Rollback Plan

If issues arise:

1. Git revert the migration commits
2. Restore Jest dependencies
3. Document specific blockers for future attempt

## Success Metrics

- ✅ 100% of tests passing
- ✅ Coverage runs on entire codebase without timeout
- ✅ Test execution time reduced by >40%
- ✅ Developers report improved experience

## FAQ

**Q: Will we lose any Jest features?**
A: No, Vitest has API compatibility with Jest. All features are available.

**Q: What about existing mocks?**
A: Most will work with simple syntax changes (jest → vi).

**Q: Can we migrate gradually?**
A: Not recommended. Vitest and Jest can't run together easily.

**Q: What if we find a blocker?**
A: The Jest workaround (limited coverage) continues to work.

## Post-Migration Benefits

1. **Full Coverage Reports**: No more timeouts or excluded files
2. **Faster Feedback**: Tests run 2-3x faster
3. **Better Debugging**: Improved stack traces and error messages
4. **Modern Tooling**: Better IDE integration and TypeScript support

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Migration from Jest Guide](https://vitest.dev/guide/migration.html)
- [Vitest Config Reference](https://vitest.dev/config/)

---

_Last Updated: January 2025_
_Status: Planned - Not Yet Started_
