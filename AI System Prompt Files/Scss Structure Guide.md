# SCSS Structure Guide

> SCSS organization with design token system, semantic color assignments, and cross-platform compatibility using relative units.

---

## Overview

We use **SCSS with design tokens** instead of Tailwind for complete control and flexibility. Supports dark/light themes, cross-platform compatibility, and component-based architecture.

---

## Design Token Structure

Design tokens live in `packages/design-tokens/src/`:

```
packages/design-tokens/src/
├── colors.scss          # Color palette and semantic assignments
├── typography.scss      # Font families, sizes, weights, line heights
├── spacing.scss         # Margin, padding, sizing scales
├── layout.scss          # Breakpoints, grid systems, z-index
├── semantic.scss        # Semantic assignments for theming
├── animations.scss      # Timing, easing, keyframes
├── shadows.scss         # Shadow system
└── index.scss           # Unified export of all tokens
```

**App-Specific SCSS Structure** in `apps/web/src/styles/`:

```
styles/
├── tokens/              # Design token imports
├── base/                # Global resets, base styles
├── layout/              # Layout containers and grids
├── components/          # Optional shared component styles
├── utilities/           # Utility classes from tokens
├── themes/              # Theme switching logic
└── index.scss           # Global entry point
```

---

## Design Token Philosophy

### Raw Tokens vs Semantic Assignments

**Raw color palette** (never changes):

```scss
:root {
  --color-primary-500: #b373fc;
  --color-neutral-100: #f0f1f2;
  --color-neutral-900: #121314;
}
```

**Semantic assignments** (change between themes):

```scss
:root {
  // Dark theme (default)
  --color-background: var(--color-neutral-900);
  --color-surface: var(--color-neutral-800);
  --color-text-primary: var(--color-neutral-100);
}

[data-theme='light'] {
  // Light theme overrides
  --color-background: var(--color-neutral-100);
  --color-text-primary: var(--color-neutral-900);
}
```

### Modern Unit Strategy

- **Use `rem` for all spacing and typography** (accessibility/scalability)
- **Use `px` only for borders and precise details** (1px borders, icons)
- **Base font size: 16px = 1rem** (never change this assumption)

---

## Component Styling Approach

### Token-First Development

Always use design tokens, never arbitrary values:

```scss
// ✅ Good - using design tokens
.button {
  background-color: var(--color-primary-500);
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--text-size-sm);
  border-radius: var(--radius-md);
}

// ❌ Bad - arbitrary values
.button {
  background-color: #b373fc;
  padding: 12px 16px;
}
```

### Component Style Location

**Option A: Colocated** (recommended for specific components)

```
components/Editor/
├── Editor.tsx
├── Editor.scss
└── index.ts
```

**Option B: Central** (for shared UI components)

```
styles/components/
├── buttons.scss
├── forms.scss
└── modals.scss
```

### Naming Convention

Use **BEM methodology** with **design system prefixes**:

```scss
.editor-toolbar {
  // Element
  &__button {
    // Modifier
    &--active {
      background-color: var(--color-primary-500);
    }
  }
}
```

---

## Theme System Foundation

### Theme Switching Mechanism

Themes controlled via `data-theme` attribute:

```html
<html data-theme="dark">
  <!-- Default -->
  <html data-theme="light">
    <!-- Manual light mode -->
    <html data-theme="system">
      <!-- Follow system preference -->
    </html>
  </html>
</html>
```

### Theme Transition Effects

```scss
* {
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}
```

---

## Import Strategy

### Design Token Import

```scss
// Import design tokens first
@import '@kairos/design-tokens';

// Then import app styles
@import './base/reset';
@import './base/typography';
```

### Component-Level Imports

```scss
// Design tokens are globally available via CSS custom properties
.my-component {
  color: var(--color-text-primary);
  padding: var(--spacing-md);
}
```

---

## Best Practices

### Development

- **Start with tokens**: Check if a design token exists before creating custom values
- **Semantic naming**: Use semantic assignments (`--color-text-primary`) not raw colors
- **Component isolation**: Scope styles to avoid conflicts

### Performance

- **Minimize custom properties**: Don't create tokens for one-off values
- **Efficient selectors**: Keep specificity low, avoid deep nesting

### Maintenance

- **Token documentation**: Document semantic assignment purposes
- **Cross-platform testing**: Verify tokens work across target platforms
- **Accessibility**: Ensure sufficient contrast ratios in all themes

---

## Implementation Phases

### Phase 1: Foundation (Current)

- ✅ Color palette and semantic assignments
- 🔄 Typography, spacing, and layout tokens
- 🔄 Base styles and CSS reset

### Phase 2: Integration

- 🔄 Component styles using design tokens
- 🔄 Utility class generation
- 🔄 Cross-platform compatibility testing

### Phase 3: Advanced Features

- 🔄 Theme switching implementation
- 🔄 System preference detection
- 🔄 User preference persistence

This structure ensures scalability, maintainability, and consistency across all platforms while providing a solid foundation for future enhancements.
