# SCSS Structure Guide

> SCSS organization with design token system, semantic color assignments, and cross-platform compatibility using relative units.

---

## Overview

We use **SCSS with design tokens** for complete control and flexibility. The system supports dark/light themes through CSS custom properties and provides a clear separation between Sass helpers (mixins, functions) and CSS declarations.

---

## Design Token Structure

Design tokens live in `packages/design-tokens/src/`:

```
packages/design-tokens/src/
├── _colors.scss              # Core color palette
├── _typography.scss          # Font families, sizes, weights, line heights
├── _spacing.scss             # Margin, padding, sizing scales
├── _layout.scss              # Breakpoints, containers, z-index
├── _shadows.scss             # Shadow definitions
├── _animations.scss          # Timing and easing functions
├── _semantic-colors.scss     # Semantic color assignments
├── _semantic-typography.scss # Typography style combinations
├── _theme-overrides.scss     # Dark/light theme overrides
├── _responsive.scss          # Responsive breakpoint overrides
├── _helpers.scss             # Sass mixins and functions
├── _root.scss                # Consolidates all token files
├── index.scss                # Exports Sass helpers only
└── root-declarations.scss    # Exports CSS custom properties
```

**Key Files:**

- `index.scss` - Import for Sass helpers (mixins, functions, variables) - NO CSS output
- `root-declarations.scss` - Import ONCE globally for all CSS custom properties

**App-Specific SCSS Structure** in `apps/web/src/styles/`:

```
styles/
├── base/                # Global resets, base styles
│   └── reset.scss       # CSS reset
└── index.scss           # Global entry point (imports root-declarations)
```

---

## Key Architecture Decision: Separation of Concerns

The design token system maintains a **strict separation** between:

1. **CSS Custom Properties** (runtime values)

   - Defined in `_*.scss` files
   - Consolidated in `_root.scss`
   - Exported via `root-declarations.scss`
   - Imported ONCE globally in the app

2. **Sass Helpers** (compile-time utilities)
   - Mixins, functions, and Sass variables
   - Defined in `_helpers.scss`
   - Exported via `index.scss`
   - Imported only where needed

This separation prevents:

- Duplicate CSS output from multiple imports
- Confusion between runtime vs compile-time values
- Performance issues from redundant declarations

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

**Colocated Pattern** (current implementation):

```
components/Editor/
├── Editor.tsx
├── Editor.scss
└── index.ts
```

All component styles are colocated with their components for better maintainability and clear ownership.

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

### Two-Part System

The design token system uses a **two-part import strategy**:

1. **CSS Custom Properties** (imported ONCE globally):

```scss
// In apps/web/src/styles/index.scss
@use '../../../../packages/design-tokens/src/root-declarations';
```

2. **Sass Helpers** (imported as needed in components):

```scss
// In component files that need mixins/functions
@use '@kairos/design-tokens' as tokens;

.my-component {
  @include tokens.breakpoint('md') {
    padding: var(--spacing-lg);
  }
}
```

### Component-Level Usage

```scss
// CSS custom properties are globally available (no import needed)
.my-component {
  color: var(--color-text-primary);
  padding: var(--spacing-md);
  font: var(--text-body-md);
}

// For Sass helpers, import the design-tokens package
@use '@kairos/design-tokens' as tokens;

.responsive-component {
  @include tokens.breakpoint('lg') {
    max-width: 1200px;
  }
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

## Current Implementation Status

### Completed ✅

- **Design Token System**: Full token library with colors, typography, spacing, layout, shadows, and animations
- **Semantic Assignments**: Separate semantic color and typography files for themeable values
- **Theme Support**: Dark/light theme overrides via `data-theme` attribute
- **Responsive System**: Breakpoint mixins and responsive overrides
- **Sass Helpers**: Comprehensive mixins and functions for common patterns
- **CSS Reset**: Modern reset stylesheet in place
- **Component Integration**: All components use CSS custom properties

### Architecture Highlights

- **Clear Separation**: Sass helpers (`index.scss`) vs CSS declarations (`root-declarations.scss`)
- **Global Availability**: CSS custom properties available everywhere after single import
- **Component Isolation**: Each component has its own SCSS file colocated with the component
- **Performance Optimized**: Single global import prevents duplication
- **Type Safety**: Using CSS custom properties with consistent naming conventions

This structure provides a scalable, maintainable foundation that supports theming, responsive design, and component-based architecture while maintaining excellent developer experience.
