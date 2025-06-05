# Component Structure Guide

> React + TypeScript component organization with feature-based folders, consistent naming, and self-contained modules.

---

## Code Documentation Format

### File Header Comments

Every component starts with a standardized header:

```typescript
// path/to/ComponentName.tsx
// Brief description of what this component does and its key features.
// Mention any important integrations, performance considerations, or accessibility features.

import React from 'react'
// ... other imports
```

**Example:**

```typescript
// packages/ui/src/components/Icon/Icon.tsx
// A React component that renders SVG icons inline with full performance optimization and accessibility support.
// It loads SVG content dynamically, handles loading/error states gracefully, and provides TypeScript autocompletion for all available icon names.
```

### Inline Comments

Focus on **why** something is done, not obvious **what**:

```typescript
// ✅ Good - explains purpose
// Memoized styles to prevent unnecessary re-renders
const iconStyle = useMemo(() => ({ ... }), [dependencies])

// Cleanup function to prevent state updates after unmount
return () => { isMounted = false }

// ❌ Bad - states the obvious
const [isLoading, setIsLoading] = useState(true) // Set loading to true
```

---

## Folder Structure

Each component lives in its own folder:

```
components/
├── EditorToolbar/
│   ├── EditorToolbar.tsx
│   ├── EditorToolbar.scss   # Optional: local SCSS
│   ├── EditorToolbar.test.tsx
│   └── index.ts             # Re-exports component
```

---

## File Naming & Exports

- Use **PascalCase** for files: `EditorToolbar.tsx`, `PageList.scss`
- Use `index.ts` for clean imports:

```tsx
// index.ts
export { EditorToolbar } from './EditorToolbar'

// Enables clean imports
import { EditorToolbar } from '@/components/EditorToolbar'
```

---

## Component Types

- **UI components**: Buttons, inputs, toolbars, icons
- **Layout components**: Grids, containers, sidebars
- **Feature components**: Editor, FileTree, BlockList
- **Page-level components**: Route content wrappers

---

## Props & Typing

Always use TypeScript interfaces with destructuring:

```typescript
interface EditorToolbarProps {
  onSave: () => void
  isSaving: boolean
}

export function EditorToolbar({ onSave, isSaving }: EditorToolbarProps) {
  // Component implementation
}
```

---

## Styling Components

For components with significant styling, include a `.scss` file alongside. Use BEM naming scoped to the component:

```scss
.editor-toolbar {
  // Component styles

  &__button {
    // Element styles

    &--active {
      // Modifier styles
    }
  }
}
```

Import SCSS at the top of the `.tsx` file.

---

## Best Practices

### Component Design

- Keep components small and focused (single responsibility)
- Co-locate tests and styles with components
- Use clear, consistent naming
- Prefer composition over inheritance

### Architecture

- Avoid props drilling—lift state where appropriate
- Use dynamic rendering for pluggable components (e.g., editor blocks)
- **Follow standardized file header comments** for consistency
- **Comment complex logic and business rules**, not obvious code

### Block-Based Editor Architecture

The editor uses a plugin-friendly pattern:

- Central `blockRegistry.ts` defines block types and rendering
- Each block type includes:
  - React component
  - Optional slash-menu options
  - Optional formatting toolbar config

This allows new block types (media, tables, etc.) to be added without modifying core editor logic.

---

## Performance Considerations

- Use `React.memo` for components that re-render frequently
- Implement `useMemo` and `useCallback` for expensive operations
- Consider lazy loading for non-critical components

---

## Development Standards

- **Complete TypeScript typing** with no `any` types
- **Accessibility considerations** with proper ARIA labels
- **Error boundaries** for robust user experience
- **Performance optimizations** documented in comments
