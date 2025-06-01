### 🧪 Testing Guide

> This guide defines how we write, run, and organize tests to ensure the app is stable, reliable, and bug-free. It includes our standard format for clear, organized test output.

---

## Overview

Testing helps catch bugs early and verify that new features don't break existing functionality. We'll use:

- **Jest** for component tests
- **Cypress** for end-to-end (e2e) tests
- **GitHub Actions** for running tests on every pull request

---

## 🔍 Test Organization Format

We organize tests using **clear headings with checkmarks** that show up nicely in terminal output. This makes it easy to see what's working and what's not.

### **Standard Test Structure**

```typescript
describe('Component Name', () => {
  describe('✅ Main Feature Group', () => {
    it('should do specific thing correctly', () => {
      // Test implementation
    })

    it('should handle another scenario', () => {
      // Test implementation
    })
  })

  describe('✅ Error Handling', () => {
    it('should show fallback when something fails', () => {
      // Test implementation
    })

    it('should handle invalid input gracefully', () => {
      // Test implementation
    })
  })

  describe('✅ User Interactions', () => {
    it('should respond to clicks correctly', () => {
      // Test implementation
    })

    it('should work with keyboard navigation', () => {
      // Test implementation
    })
  })

  describe('✅ Accessibility', () => {
    it('should have proper ARIA labels', () => {
      // Test implementation
    })

    it('should work with screen readers', () => {
      // Test implementation
    })
  })
})
```

### **Terminal Output Example**

This structure produces clean, readable terminal output:

```
 PASS  src/components/Icon/Icon.test.tsx
  Icon Component
    ✅ Renders known icons successfully
      ✓ should render a valid icon with SVG content
      ✓ should render multiple different icons
    ✅ Shows fallback for invalid icons
      ✓ should show fallback when icon is not in iconMap
      ✓ should show fallback when SVG loading fails
      ✓ should show fallback when SVG content is empty
    ✅ Applies size and color props correctly
      ✓ should apply numeric size correctly
      ✓ should apply string size correctly
      ✓ should apply default size when not specified
    ✅ Handles aria-label for accessibility
      ✓ should use custom aria-label when provided
      ✓ should use icon name as aria-label when not provided
```

---

## 📋 Required Test Categories

Every component should have tests for these four main areas:

### **1. ✅ Core Functionality**

- Does the main feature work?
- Do props get applied correctly?
- Does it render the right content?

### **2. ✅ Error Handling**

- What happens with invalid props?
- How does it handle network failures?
- Does it show helpful error messages?

### **3. ✅ User Interactions**

- Do clicks work properly?
- Does keyboard navigation work?
- Are hover states working?

### **4. ✅ Accessibility**

- Are ARIA labels present and correct?
- Does it work with screen readers?
- Can users navigate with keyboard only?

---

## 🎯 Test Naming Conventions

### **Describe Blocks (Test Groups)**

- Use checkmark emoji: `✅ Main Feature Name`
- Be descriptive: `✅ Renders known icons successfully`
- Focus on what the group tests: `✅ Handles aria-label for accessibility`

### **Individual Tests (it statements)**

- Start with "should": `should render a valid icon with SVG content`
- Be specific: `should show fallback when icon is not in iconMap`
- Describe the expected behavior: `should apply numeric size correctly`

---

## 🧪 What to Test

### **Test Real Behavior**

```typescript
// ✅ Good - Tests actual behavior
it('should hide button text when sidebar is collapsed', () => {
  render(<SidebarButton text="Settings" isCollapsed={true} />)
  expect(screen.queryByText('Settings')).not.toBeInTheDocument()
})

// ❌ Bad - Tests implementation details
it('should have collapsed class when isCollapsed prop is true', () => {
  render(<SidebarButton text="Settings" isCollapsed={true} />)
  expect(container.firstChild).toHaveClass('sidebar-button--collapsed')
})
```

### **Test User Interactions**

```typescript
// ✅ Good - Tests user behavior
it('should call onClick when user clicks button', () => {
  const handleClick = jest.fn()
  render(<SidebarButton text="Settings" onClick={handleClick} />)

  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### **Test Error Cases**

```typescript
// ✅ Good - Tests error handling
it('should show fallback when icon loading fails', async () => {
  mockLoadIcon.mockRejectedValue(new Error('Network error'))

  render(<Icon name="search" />)

  await waitFor(() => {
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
```

---

## 🔧 Technical Standards

### **Mocking Strategy**

- **Mock external dependencies** (APIs, complex utilities)
- **Don't mock** the component being tested
- **Don't mock** simple utilities (generateId, formatDate)

### **Async Testing**

- Use `waitFor` for async operations
- Use `await` for promises
- Test loading states before final states

### **Accessibility Testing**

- Use `screen.getByRole()` when possible
- Test ARIA labels with `{ name: 'expected label' }`
- Verify keyboard navigation works

### **Error Handling**

- Test both success and failure paths
- Use `console.warn` and `console.error` mocks when needed
- Test graceful degradation

---

## 📁 File Structure

### **Test File Location**

Place test files next to the component:

```
components/
├── Icon/
│   ├── Icon.tsx
│   ├── Icon.scss
│   ├── Icon.test.tsx  ← Test file here
│   └── index.ts
```

### **Test File Naming**

- Component tests: `ComponentName.test.tsx`
- Utility tests: `utilityName.test.ts`
- Integration tests: `featureName.test.tsx`

---

## 🚀 Running Tests

### **Individual Component**

```bash
# Test specific component
yarn workspace @kairos/ui test Icon.test.tsx

# Watch mode for development
yarn workspace @kairos/ui test --watch Icon.test.tsx
```

### **All Tests**

```bash
# Run all tests
yarn test

# Run with coverage
yarn test:coverage

# Run E2E tests
yarn test:e2e
```

---

## 🎯 Success Criteria

### **Good Test Suite Has:**

- ✅ Clear terminal output with checkmark headings
- ✅ Tests for all four main categories
- ✅ Descriptive test names that explain expected behavior
- ✅ Real user scenarios, not implementation details
- ✅ Both success and error cases covered
- ✅ Fast execution (under 30 seconds total)

### **Quality Checklist:**

- [ ] All tests pass on first run
- [ ] No TypeScript/ESLint errors
- [ ] Tests cover main user workflows
- [ ] Error states are tested
- [ ] Accessibility is verified
- [ ] Tests are easy to understand

---

## 📝 Example Test File Template

```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

---

This testing approach ensures our code is reliable, user-friendly, and maintainable while providing clear feedback about what's working and what needs attention.
