### 🧪 Testing Guide

> This guide defines how we write, run, and automate tests to ensure the app is stable, reliable, and bug-free. It serves as a working agreement for when and how tests should be written—by the Assistant—and understood by the User.

---

## Overview

Testing helps catch bugs early and verify that new features don’t break existing functionality. We’ll use:

* **Jest** for unit and integration tests
* **Cypress** for end-to-end (e2e) tests
* **GitHub Actions** for running tests on every pull request

---

## 🔍 Types of Tests

| Type        | Tool    | Purpose                                                       |
| ----------- | ------- | ------------------------------------------------------------- |
| Unit        | Jest    | Test a single function/component in isolation                 |
| Integration | Jest    | Test multiple pieces working together (e.g. component + hook) |
| End-to-End  | Cypress | Simulate real user behavior in the browser                    |

---

## When to Write Tests

The Assistant will write tests as part of feature implementation. Every new feature should be accompanied by:

* Unit tests for key logic and utilities
* Integration tests for interactive components
* End-to-end tests for core user flows (if user-visible)

Tests will be written **during development**, not after.

---

## Unit & Integration Tests (Jest)

### What to test:

* Functions with logic (e.g. text formatting utils)
* React components (props, rendering, interaction)
* Custom hooks

### How to run tests:

```bash
npm run test
```

### Tips:

* Keep tests close to code: `MyComponent.test.tsx`
* Use `describe()` to group related tests
* Use `mock` functions to isolate dependencies
* Write small, focused tests (1 behavior per test)

---

## End-to-End Tests (Cypress)

### What to test:

* Creating and editing a page
* Formatting blocks
* Reordering with drag-and-drop
* Linking pages

### How to run Cypress:

```bash
npm run cypress
```

Or open the test runner UI:

```bash
npx cypress open
```

### Test file location:

* Place in: `apps/web/cypress/e2e/`
* Example: `editor-blocks.cy.ts`

---

## Continuous Integration (CI)

We’ll configure **GitHub Actions** to run all tests automatically when you push or open a pull request.

### CI Features:

* Linting
* Type checking
* Unit tests (Jest)
* End-to-end tests (Cypress)

### Benefits:

* Catch bugs before they reach `main`
* Prevent broken features from being merged
* Fast feedback loop

---

## Best Practices

* The Assistant writes tests during feature implementation
* Tests reflect real use cases, not just internal logic
* Avoid overly fragile or overly broad tests
* Fix broken or flaky tests before merging
* Don’t skip tests without documenting the reason