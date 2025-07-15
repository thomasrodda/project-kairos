# Testing Guide

## ⚠️ CRITICAL: Test Quality Over Quantity

**STOP! Before writing any test, ask yourself:**

1. What real user bug will this test prevent?
2. If this test fails, what would break for users?
3. Am I testing user behavior or implementation details?

If you can't answer these questions, don't write the test. **Writing tests just to make CI pass is harmful** - it creates false confidence and maintenance burden.

## 🎯 Core Testing Philosophy

### The Golden Rule

**Write tests to prevent real bugs that could affect users, not to reach coverage targets.**

Every test you write should have a clear purpose: preventing a specific bug that could impact user experience. If a test doesn't prevent a real bug, it's worse than no test at all.

### Why Tests Fail in CI

Tests often fail in CI (GitHub Actions) but pass locally because:

- **Incomplete mocks** - The mock doesn't match what the real code needs
- **Environment differences** - CI has no .env files or external services
- **Timing issues** - CI runners are slower than local machines
- **Missing dependencies** - Setup files or configurations not properly included

See "Debugging CI Failures" section for solutions.

### Testing Trophy Approach (2025 Best Practice)

We follow Kent C. Dodds' Testing Trophy model: **"Write tests. Not too many. Mostly integration."**

```
      🏆 E2E Tests (10%)
    /    \  Critical user journeys
   /  🔗  \
  / Integ. \ Integration Tests (60%)
 /  Tests   \ Component interactions
/____________\
  Unit Tests   Unit Tests (30%)
    (30%)      Isolated logic & utilities
```

### Key Principles

1. **Test user behavior, not implementation** - The more your tests resemble how users interact with your app, the more confidence they provide
2. **Quality over quantity** - One good integration test is worth ten implementation-detail unit tests
3. **Fix the code, not the tests** - When tests fail, the code is wrong. Never change tests to match broken behavior
4. **80/20 rule** - 80% of bugs come from 20% of code. Focus testing on high-risk areas
5. **Business outcomes matter** - Connect test coverage to real metrics (e.g., "This test suite prevents 90% of login issues")

## 🛠️ Testing Stack

### Current Tools (What we use now)

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing with user-centric queries
- **Cypress** - End-to-end testing
- **Supertest** - API endpoint testing

### Modern Alternatives (Consider for future)

- **Vitest** - Faster alternative to Jest for Vite projects, with better TypeScript/ESM support
- **Playwright** - More powerful E2E testing with better performance and debugging
- **MSW (Mock Service Worker)** - Network-level API mocking for more realistic tests

## 📝 How to Write Tests

### Test Structure Pattern

Every component test file MUST include these four categories:

```typescript
describe('ComponentName', () => {
  // ✅ Core Functionality
  describe('✅ Core Functionality', () => {
    test('renders with required props', () => {})
    test('displays correct initial state', () => {})
  })

  // ✅ User Interactions
  describe('✅ User Interactions', () => {
    test('handles click events correctly', async () => {})
    test('supports keyboard navigation', async () => {})
  })

  // ✅ Error Handling
  describe('✅ Error Handling', () => {
    test('handles invalid props gracefully', () => {})
    test('shows error state on API failure', async () => {})
  })

  // ✅ Accessibility
  describe('✅ Accessibility', () => {
    test('has proper ARIA labels', () => {})
    test('is keyboard navigable', async () => {})
  })
})
```

### Writing Good Tests

#### ✅ DO Test Like a User

```typescript
// GOOD: Tests what users see and do
test('user can add item to cart', async () => {
  render(<ProductCard product={mockProduct} />)

  const addButton = screen.getByRole('button', { name: /add to cart/i })
  await userEvent.click(addButton)

  expect(screen.getByText(/added to cart/i)).toBeInTheDocument()
})
```

#### ❌ DON'T Test Implementation Details

```typescript
// BAD: Tests internal state and methods
test('clicking button calls handleClick', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick} />)

  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1) // Testing the mock, not the behavior!
})
```

### Common Unnecessary Tests to AVOID

**CRITICAL**: These tests add no value and should never be written:

#### ❌ Component Renders Without Crashing

```typescript
// UNNECESSARY: Too basic, provides no value
test('renders without crashing', () => {
  render(<MyComponent />)
  // This test is pointless - if it crashes, other tests will fail anyway
})
```

#### ❌ Props Are Passed Correctly

```typescript
// UNNECESSARY: Testing React, not your code
test('passes props to child component', () => {
  const { container } = render(<Parent text="hello" />)
  expect(container.querySelector('.child')).toHaveTextContent('hello')
  // Just test the end result users see, not prop passing
})
```

#### ❌ State Updates Correctly

```typescript
// UNNECESSARY: Testing React's useState, not your app
test('updates state when button clicked', () => {
  // Don't test that setState was called
  // Test what the user sees after the state change
})
```

#### ❌ CSS Classes or Styles

```typescript
// UNNECESSARY: Implementation detail that changes often
test('has correct CSS class', () => {
  render(<Button variant="primary" />)
  expect(screen.getByRole('button')).toHaveClass('btn-primary')
  // Test behavior, not styling implementation
})
```

#### ❌ Mocking Everything

```typescript
// UNNECESSARY: Over-mocked test that tests nothing real
test('calls API when form submitted', () => {
  const mockApi = jest.fn()
  render(<Form onSubmit={mockApi} />)
  fireEvent.submit(screen.getByRole('form'))
  expect(mockApi).toHaveBeenCalled()
  // You're testing your mock, not the actual behavior!
})
```

### Tests That MUST Be Written

#### ✅ User Workflows

```typescript
// NECESSARY: Tests actual user journey
test('user can complete checkout process', async () => {
  // Add item to cart
  // Go to checkout
  // Fill in details
  // Verify order confirmation appears
})
```

#### ✅ Error Handling

```typescript
// NECESSARY: Users need to see errors
test('shows error message when payment fails', async () => {
  mockPaymentAPI.mockRejectedValue(new Error('Card declined'))

  await userEvent.click(screen.getByRole('button', { name: /pay now/i }))

  expect(screen.getByText(/payment failed/i)).toBeInTheDocument()
})
```

#### ✅ Data Integrity

```typescript
// NECESSARY: Ensures user data isn't lost
test('auto-saves draft when user types', async () => {
  await userEvent.type(screen.getByRole('textbox'), 'Important notes')

  // Wait for debounce
  await waitFor(() => {
    expect(mockSaveAPI).toHaveBeenCalledWith({ content: 'Important notes' })
  })
})
```

### Query Priority (Use in this order)

1. **getByRole** - How screen readers see your app
2. **getByLabelText** - For form elements
3. **getByPlaceholderText** - When label isn't visible
4. **getByText** - For non-interactive elements
5. **getByDisplayValue** - Current value of form elements
6. **getByAltText** - For images
7. **getByTitle** - Last resort
8. **getByTestId** - Only when nothing else works

### Async Testing Pattern

```typescript
// Always use userEvent over fireEvent for realistic interactions
import userEvent from '@testing-library/user-event'

test('async form submission', async () => {
  const user = userEvent.setup()
  render(<ContactForm />)

  await user.type(screen.getByLabelText(/email/i), 'user@example.com')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  // Wait for async operations
  await waitFor(() => {
    expect(screen.getByText(/thank you/i)).toBeInTheDocument()
  })
})
```

### Mocking Strategy

#### When to Mock

- External services (APIs, databases)
- Browser APIs not available in tests
- Modules with side effects
- Time-dependent operations

#### When NOT to Mock

- The component you're testing
- Child components (test integration)
- Utility functions
- State management

#### Mock Example

```typescript
// Mock only external dependencies
jest.mock('@/services/api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({ id: 1, name: 'Test User' })),
}))

// Or use MSW for more realistic API mocking (recommended)
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/user/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, name: 'Test User' }))
  })
)
```

### Common Mock Pitfalls (That Break CI)

#### ❌ Incomplete Transaction Mocks

```typescript
// BAD: Incomplete mock that will fail in CI
mockPrisma.$transaction.mockImplementation(async (callback) => {
  const tx = {
    page: { findFirst: jest.fn() },
    block: { findMany: jest.fn() },
    // Missing contentVersion! Will cause "Cannot read properties of undefined"
  }
  return callback(tx)
})
```

#### ✅ Complete Transaction Mocks

```typescript
// GOOD: Complete mock that matches actual Prisma structure
mockPrisma.$transaction.mockImplementation(async (callback) => {
  const tx = {
    page: mockPrisma.page,
    block: mockPrisma.block,
    contentVersion: mockPrisma.contentVersion, // Include ALL models used
    // Or spread all models: ...mockPrisma
  }
  return callback(tx)
})
```

**Key Rule**: If your test fails with "Cannot read properties of undefined" in CI but works locally, you probably have an incomplete mock. Always mock the full structure that the real code expects.

## 🎯 What to Test (Risk-Based Approach)

### High Priority (Test Extensively)

- **Authentication & Authorization** - Security is critical
- **Payment Processing** - Financial data must be correct
- **Data Persistence** - User work must not be lost
- **Core User Flows** - Primary app functionality

### Medium Priority (Good Coverage)

- **Form Validation** - Prevent bad data
- **Error States** - Users need feedback
- **Edge Cases** - Boundary conditions
- **Performance-Critical Paths** - Slow = unusable

### Low Priority (Basic Tests)

- **Static Content** - Rarely changes
- **Style-Only Components** - Visual regression tests better
- **Third-Party Integrations** - Test the integration, not the library

## 📊 Coverage Guidelines

### Meaningful Metrics

Instead of chasing percentage targets, measure:

- **Bug Prevention Rate**: How many production bugs do tests catch?
- **Test Stability**: How often do tests fail for non-bug reasons?
- **Maintenance Cost**: Time spent fixing tests vs preventing bugs
- **User Journey Coverage**: Are all critical paths tested?

### Coverage Targets (Guidelines, not rules)

- **Critical Paths**: 70%+ coverage (auth, payments, data)
- **Core Features**: 60%+ coverage
- **UI Components**: 50%+ coverage
- **Utilities**: 80%+ coverage (pure functions are easy to test)

Remember: 100% coverage with bad tests is worse than 60% coverage with good tests.

## 🚀 Running Tests

### Commands

```bash
# Run all tests
yarn test

# Watch mode for development
yarn test:watch

# Coverage report
yarn test:coverage

# Run specific test file
yarn test ComponentName.test.tsx

# Run tests matching pattern
yarn test --testNamePattern="should handle errors"

# Run only changed files
yarn test --onlyChanged
```

### Performance Tips

- Run tests in parallel: `yarn test --maxWorkers=4`
- Use `test.only` when debugging specific tests
- Skip slow E2E tests locally: `yarn test --testPathIgnorePatterns=e2e`

### Debugging CI Failures

When tests fail in GitHub Actions but pass locally:

1. **Check the CI logs carefully**

   ```bash
   # Look for specific error messages
   # "Cannot read properties of undefined" = incomplete mock
   # "Connection refused" = service not started
   # "Timeout" = async operation took too long
   ```

2. **Run tests exactly like CI**

   ```bash
   # CI runs with specific flags
   yarn test --coverage --passWithNoTests
   ```

3. **Common CI-specific issues**

   - **Environment variables**: CI may not have .env files
   - **Timing issues**: CI runners are slower, increase timeouts
   - **Mock completeness**: Ensure all dependencies are mocked
   - **Database/service connections**: CI has no external services

4. **Fix strategies**
   - Add `--passWithNoTests` flag if some test suites are empty
   - Increase timeouts for async operations in CI environment
   - Ensure all mocks match the real implementation structure
   - Check that setup files are properly configured in jest.config.js

## 🤖 AI-Friendly Test Patterns

When writing tests that AI assistants will work with:

1. **Clear Test Names**: Describe the scenario and expected outcome

   ```typescript
   test('displays error message when API returns 404', async () => {})
   ```

2. **Self-Documenting Structure**: Use consistent patterns

   ```typescript
   // Arrange - Set up test conditions
   const mockData = { id: 1, name: 'Test' }

   // Act - Perform the action
   render(<Component data={mockData} />)

   // Assert - Check the outcome
   expect(screen.getByText('Test')).toBeInTheDocument()
   ```

3. **Business Context**: Include comments about why this test matters
   ```typescript
   // This test prevents issue #123 where users lost data on network errors
   test('auto-saves draft when network fails', async () => {})
   ```

## 🔍 Test Quality Checklist

Before submitting tests, verify:

- [ ] **Tests fail when code is broken** - Break the code and ensure test catches it
- [ ] **Tests pass consistently** - Run 10 times, should pass 10 times
- [ ] **Tests run fast** - Under 100ms for unit, under 1s for integration
- [ ] **Tests are readable** - Another developer can understand without explanation
- [ ] **Tests prevent real bugs** - Each test stops a specific user-facing issue
- [ ] **Tests use semantic queries** - getByRole > getByTestId
- [ ] **Tests handle async properly** - waitFor, userEvent, async/await used correctly
- [ ] **Tests include accessibility** - Keyboard navigation and ARIA tested

## 📚 Additional Resources

### Internal Docs

- [Test Inventory.md](Test Inventory.md) - Current test status and quality metrics
- [Quick Commands.md](Quick Commands.md) - All testing commands reference

### External Resources

- [Testing Library Docs](https://testing-library.com/) - Query best practices
- [Jest Documentation](https://jestjs.io/) - Assertion matchers
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices) - E2E patterns
- [MSW Documentation](https://mswjs.io/) - Modern API mocking

## 🎓 Key Takeaways for AI Assistants

When writing or reviewing tests:

1. **Always test from the user's perspective** - If a user can't do it, don't test it
2. **Integration > Unit** - One good integration test beats many unit tests
3. **Mock sparingly** - Only mock what you must (external services)
4. **Make tests fail first** - Ensure they catch real bugs before making them pass
5. **Keep tests maintainable** - Clear, simple tests are better than clever ones
6. **Connect to business value** - Every test should prevent a real user issue

Remember: The goal is not to have tests, but to have confidence that the application works correctly for users.
