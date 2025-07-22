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

**Real Examples from Codebase:**

```typescript
// packages/ui/src/components/Icon/Icon.tsx
// A React component that renders SVG icons inline with full performance optimization and accessibility support.
// It loads SVG content dynamically, handles loading/error states gracefully, and provides TypeScript autocompletion for all available icon names.

// apps/web/src/components/Editor/Editor.tsx
// Main editor container component that houses the block-based editing experience.
// Provides the layout wrapper for the EditorContent where all blocks are rendered.
// In the future, this may also contain toolbars or other editor UI elements.
```

⚠️ **Note:** File header comments are inconsistently applied. Some components (Editor, Sidebar, Icon) have excellent headers while others lack them entirely.

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
// From SaveStatusIndicator component:
interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved: Date | null
  isDirty: boolean
  onRetry?: () => void
}

export function SaveStatusIndicator({ status, isDirty, onRetry }: SaveStatusIndicatorProps) {
  // Component implementation
}

// From Icon component with detailed typing:
export interface IconProps {
  name: IconName // TypeScript autocompletion for valid icon names
  size?: number | string
  className?: string
  color?: string
  fill?: string
  stroke?: string
  opacity?: number | string
  'aria-label'?: string
}
```

⚠️ **Note:** Some components use `React.FC` without explicit prop interfaces, which should be avoided.

---

## Styling Components

For components with significant styling, include a `.scss` file alongside. Use BEM naming scoped to the component:

```scss
// From Block.scss - excellent BEM implementation:
.block {
  position: relative;
  transition: var(--animate-colors);
  cursor: text;

  // Show drag handle on hover
  &:hover .block-drag-handle {
    opacity: 1;
  }

  // Selected state for blocks
  &--selected {
    .block__content {
      background-color: color-mix(in srgb, var(--color-primary-400) 20%, transparent);
      border-radius: var(--radius-4);
    }
  }

  &__content {
    outline: none;
    min-height: calc(var(--line-height-relaxed) * 1em);
    white-space: pre-wrap;
  }

  // Block type specific styles
  &--h1 .block__content {
    font-size: var(--font-size-30);
    font-weight: var(--font-weight-bold);
  }
}
```

✅ **Note:** BEM methodology is consistently followed across all component styles.

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

### Block-Based Editor Architecture (Current Implementation)

⚠️ **Important:** The documented plugin architecture is NOT yet implemented. Current architecture:

**What exists:**

- Block types are a simple TypeScript union: `'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet'`
- Single `Block.tsx` component handles all block types via CSS classes
- Slash menu options are hardcoded in `SlashCommandMenu.tsx`
- No plugin system or registry pattern

**Actual implementation:**

```typescript
// From EditorContext.tsx
export type BlockType = 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet'

// From Block.tsx - CSS-based differentiation
const typeClass = `block--${block.type}`
```

**Future architecture** could include:

- Central block registry for extensibility
- Per-block-type components
- Dynamic slash menu registration
- Plugin system for custom blocks

---

## Performance Considerations

- Use `React.memo` for components that re-render frequently
- Implement `useMemo` and `useCallback` for expensive operations
- Consider lazy loading for non-critical components

---

## Development Standards

- **Complete TypeScript typing** with no `any` types
- **Accessibility considerations** with proper ARIA labels
- **Error boundaries** for robust user experience ⚠️ _(Not yet implemented)_
- **Performance optimizations** documented in comments ⚠️ _(Limited implementation)_

## Additional Patterns Found in Codebase

### Context-Heavy Architecture

Components extensively use React Context for state management:

```typescript
// From Editor.tsx using multiple contexts:
import { usePageContext } from '../../contexts/PageContext'
import { useEditorState } from '../../contexts/EditorContext'

export const Editor = forwardRef<HTMLElement>((props, ref) => {
  const { saveStatus, lastSaved, forceSave } = usePageContext()
  const { isDirty } = useEditorState()
  // ...
})
```

Key contexts:

- `EditorContext` - Central editor state
- `PageContext` - Page management
- `AuthContext` - Authentication
- `WorkspaceContext` - Workspace data

### ForwardRef Pattern

Used for components that need ref forwarding:

```typescript
export const Editor = forwardRef<HTMLElement>((props, ref) => {
  return <main ref={ref} className="editor" tabIndex={-1}>
    {/* content */}
  </main>
})

Editor.displayName = 'Editor'
```

### Robust Validation & Error Handling

```typescript
// From WorkspaceCreation component:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!workspaceName.trim()) {
    setError('Please enter a workspace name')
    return
  }

  try {
    const workspace = await createWorkspace({ name: workspaceName.trim() })
    if (!workspace?.id) {
      throw new Error('Invalid workspace response')
    }
    // Success path
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create workspace')
  } finally {
    setLoading(false)
  }
}
```

### Test File Organization

Components often have multiple test files:

```
Editor/
├── Editor.tsx
├── Editor.test.tsx              # Unit tests
├── Editor.integration.test.tsx  # Integration tests
└── Editor.performance.test.tsx  # Performance tests
```

## Component Usage Cross-Reference

For detailed component-to-user-story mapping, see: [Component-UserStory-Mapping.md](./Component-UserStory-Mapping.md)

**Most Critical Components:**

1. `EditorContext.tsx` - Central to 5 editor user stories
2. `PagesContext` - Used by 6 user stories across features
3. `AuthContext.tsx` - Central to 6 authentication user stories
4. `PageTreeItem` - Central to 5 page management user stories
