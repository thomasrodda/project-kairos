# Testing Guide

> Testing strategy for Project Kairos using Jest (unit/component) and Cypress (e2e). Ensures app stability and catches bugs early.

---

## Test Organization Format

Use **clear headings with checkmarks** for readable terminal output:

```typescript
describe('Component Name', () => {
  describe('✅ Core Functionality', () => {
    it('should do specific thing correctly', () => {
      // Test implementation
    })
  })

  describe('✅ Error Handling', () => {
    it('should handle invalid input gracefully', () => {
      // Test implementation
    })
  })

  describe('✅ User Interactions', () => {
    it('should respond to clicks correctly', () => {
      // Test implementation
    })
  })

  describe('✅ Accessibility', () => {
    it('should have proper ARIA labels', () => {
      // Test implementation
    })
  })
})
```

**Terminal Output Example:**

```
✅ Core Functionality
  ✓ should render a valid icon with SVG content
✅ Error Handling
  ✓ should show fallback when icon loading fails
```

---

## Required Test Categories

Every component needs tests for:

1. **✅ Core Functionality** - Main features, props, rendering
2. **✅ Error Handling** - Invalid props, network failures, edge cases
3. **✅ User Interactions** - Clicks, keyboard navigation, hover states
4. **✅ Accessibility** - ARIA labels, screen readers, keyboard-only navigation

---

## What to Test

### Test Real Behavior (not implementation details)

```typescript
// ✅ Good - Tests actual behavior
it('should hide button text when sidebar is collapsed', () => {
  render(<SidebarButton text="Settings" isCollapsed={true} />)
  expect(screen.queryByText('Settings')).not.toBeInTheDocument()
})

// ❌ Bad - Tests implementation details
it('should have collapsed class when isCollapsed prop is true', () => {
  expect(container.firstChild).toHaveClass('sidebar-button--collapsed')
})
```

### Test User Interactions

```typescript
it('should call onClick when user clicks button', () => {
  const handleClick = jest.fn()
  render(<SidebarButton text="Settings" onClick={handleClick} />)

  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

---

## Technical Standards

### Mocking Strategy

- **Mock external dependencies** (APIs, complex utilities)
- **Don't mock** the component being tested or simple utilities
- Use `console.warn` and `console.error` mocks when needed

### Async Testing

- Use `waitFor` for async operations
- Test loading states before final states
- Use `await` for promises

### Accessibility Testing

- Use `screen.getByRole()` when possible
- Test ARIA labels with `{ name: 'expected label' }`
- Verify keyboard navigation works

---

## File Structure

**Test File Location:** Place next to component

```
components/Icon/
├── Icon.tsx
├── Icon.test.tsx  ← Test file here
└── index.ts
```

**Test File Naming:**

- Component tests: `ComponentName.test.tsx`
- Utility tests: `utilityName.test.ts`
- Integration tests: `featureName.test.tsx`

---

## Running Tests

```bash
# Test specific component
yarn workspace @kairos/ui test Icon.test.tsx

# Watch mode for development
yarn workspace @kairos/ui test --watch Icon.test.tsx

# All tests with coverage
yarn test:coverage

# E2E tests
yarn test:e2e
```

---

## Success Criteria

### Good Test Suite Has:

- ✅ Clear terminal output with checkmark headings
- ✅ Tests for all four main categories
- ✅ Real user scenarios, not implementation details
- ✅ Both success and error cases covered
- ✅ Fast execution (under 30 seconds total)

### Quality Checklist:

- [ ] All tests pass on first run
- [ ] No TypeScript/ESLint errors
- [ ] Tests cover main user workflows
- [ ] Error states are tested
- [ ] Accessibility is verified

---

## Example Test File Template

```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('Component Name', () => {
  describe('✅ Core Functionality', () => {
    it('should render basic content correctly', () => {
      render(<ComponentName />)
      expect(screen.getByText('Expected Text')).toBeInTheDocument()
    })
  })

  describe('✅ User Interactions', () => {
    it('should respond to clicks', () => {
      const handleClick = jest.fn()
      render(<ComponentName onClick={handleClick} />)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('✅ Error Handling', () => {
    it('should handle invalid props gracefully', () => {
      render(<ComponentName invalidProp="test" />)
      expect(screen.getByText('Fallback Content')).toBeInTheDocument()
    })
  })

  describe('✅ Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ComponentName aria-label="Custom Label" />)
      expect(screen.getByRole('button', { name: 'Custom Label' })).toBeInTheDocument()
    })
  })
})
```

This approach ensures reliable, user-friendly, and maintainable code with clear feedback about what's working.
