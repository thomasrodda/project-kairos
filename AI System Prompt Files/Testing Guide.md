# Testing Guide

> Testing strategy for Project Kairos using Jest (unit/component) and Cypress (e2e). Ensures app stability and catches bugs early.

## Core Philosophy

**Write tests to find bugs, not to reach coverage targets.**

We follow the 80/20 rule: 80% of bugs come from 20% of the code. Focus testing effort on high-risk, high-value areas rather than trying to test everything.

### Testing Pyramid

```
       /\      E2E Tests (10%)
      /  \     - Complete user journeys
     /    \    - Expensive, use sparingly
    /------\
   /        \  Integration Tests (20%)
  /          \ - Component interactions
 /            \- API endpoint testing
/--------------\
Unit Tests (70%)
- Fast, isolated, focused
- Individual components/functions
```

### What NOT to Test

- ❌ React framework internals
- ❌ Third-party libraries (@dnd-kit, Prisma client)
- ❌ Simple prop passing or getters/setters
- ❌ Pure CSS/styling (unless it affects functionality)
- ❌ Configuration files
- ❌ Code you didn't write

### Risk-Based Testing Priority

#### 🔴 High Priority (Test Thoroughly)

- Editor core: typing, formatting, block operations
- Data persistence and state management
- Cross-block selection and multi-block operations
- Keyboard shortcuts and accessibility
- Any feature that could cause data loss

#### 🟡 Medium Priority (Standard Coverage)

- UI components with complex logic
- Navigation and routing
- Form validations
- Utility functions with business logic

#### 🟢 Low Priority (Basic Coverage)

- Static components
- Simple display components
- Helper functions with straightforward logic

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

## When to Write Tests

### Progressive Testing Strategy

1. **Start Small**: Write tests for the happy path first
2. **Bug-Driven**: When a bug is found, write a test that reproduces it
3. **Feature-Driven**: Write tests alongside new features
4. **User-Driven**: Convert user-reported issues into test cases

### Test-Writing Triggers

✅ **Always write a test when:**

- You fix a bug (regression test)
- You add a new feature
- You refactor complex logic
- Users report an issue
- You find yourself manually testing the same thing repeatedly

⚠️ **Consider skipping a test when:**

- The code is trivial (single line, no logic)
- It's a pure UI component with no behavior
- The effort greatly exceeds the risk

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

### Performance Standards

- **Unit tests**: < 50ms each
- **Integration tests**: < 500ms each
- **E2E tests**: < 5s each
- **Full suite**: < 2 minutes

💡 **Tip**: Use `test.skip` for slow tests during development, but don't forget to re-enable them!

---

## Success Criteria

### Good Test Suite Has:

- ✅ Clear terminal output with checkmark headings
- ✅ Tests for high-risk areas first
- ✅ Real user scenarios, not implementation details
- ✅ Both success and error cases covered
- ✅ Fast execution (under 2 minutes total)
- ✅ Follows 70/20/10 testing pyramid

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

---

## Integration Testing Patterns

### When to Use Integration Tests

- Testing data flow between parent/child components
- Testing state management with multiple components
- Testing API endpoints with database
- Testing complex user workflows

### Example: Editor Integration Test

```typescript
describe('Editor Integration', () => {
  it('should maintain formatting when moving blocks', async () => {
    const { user } = render(<Editor />)

    // Type and format text
    await user.type(screen.getByRole('textbox'), 'Hello world')
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('{Control>}b{/Control}')

    // Move block
    const dragHandle = screen.getByLabelText('Drag handle')
    await user.drag(dragHandle, screen.getByTestId('drop-zone-2'))

    // Verify formatting preserved
    expect(screen.getByText('Hello world')).toHaveStyle('font-weight: bold')
  })
})
```

---

## Common Testing Scenarios

### Testing Async Operations

```typescript
// ✅ Good - Properly waits for async operations
it('should save data after debounce', async () => {
  render(<AutoSaveEditor />)
  await user.type(screen.getByRole('textbox'), 'New content')

  // Wait for debounce
  await waitFor(() => {
    expect(mockSave).toHaveBeenCalledWith('New content')
  }, { timeout: 1000 })
})
```

### Testing Error States

```typescript
// ✅ Good - Tests actual user impact of errors
it('should show retry button when save fails', async () => {
  mockSave.mockRejectedValue(new Error('Network error'))
  render(<AutoSaveEditor />)

  await user.type(screen.getByRole('textbox'), 'Content')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Retry save' })).toBeInTheDocument()
  })
})
```

---

## Related Documentation

- **[Test Evaluation Guide.md](./Test Evaluation Guide.md)** - Detailed guidelines for evaluating test quality
- **[Test Review Checklist.md](./Test Review Checklist.md)** - Complete inventory of all tests in the project
- **[Editor Testing Plan.md](./Editor Testing Plan.md)** - Comprehensive test coverage for the editor
