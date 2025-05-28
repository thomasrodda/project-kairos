# SCSS Structure Guide

> This guide explains how we organize, write, and maintain SCSS for styling across all platforms of the app. It supports a clean, scalable, and component-based CSS architecture with a comprehensive design system and theming support.

---

## Overview

We use **SCSS** with a **design token system** instead of Tailwind or external UI libraries. This approach gives us complete control and flexibility while maintaining consistency across web, mobile, and desktop versions through a unified design system.

This guide supports:

- **Design token system** with CSS custom properties
- **Semantic color assignments** for easy theming
- **Dark/light/system theme support** (dark as default)
- **Cross-platform compatibility** using relative units
- **Modular component styles** with design system integration
- **Future-proof architecture** for theme switching and customization

---

## Design Token Structure

Design tokens live in `packages/design-tokens/src/` and provide the foundation for all styling:

```
packages/design-tokens/src/
├── colors.scss          # Color palette and semantic assignments
├── typography.scss      # Font families, sizes, weights, line heights
├── spacing.scss         # Margin, padding, and sizing scales
├── layout.scss          # Breakpoints, grid systems, z-index
├── semantic.scss        # Semantic assignments for theming
├── themes/              # Theme-specific overrides (future)
│   ├── dark.scss        # Dark theme variables
│   ├── light.scss       # Light theme variables
│   └── system.scss      # System preference detection
└── index.scss           # Unified export of all tokens
```

---

## App-Specific SCSS Structure

Located in: `apps/web/src/styles/`

```
styles/
├── tokens/              # Design token imports
│   └── index.scss       # Import from @kairos/design-tokens
├── base/                # Global resets, base styles
│   ├── reset.scss       # CSS reset and normalize
│   ├── typography.scss  # Global typography rules using tokens
│   └── accessibility.scss # Focus states, screen reader styles
├── layout/              # Layout containers and grids
│   ├── grid.scss        # Grid system using layout tokens
│   └── containers.scss  # Layout containers and wrappers
├── components/          # Optional shared component styles
│   └── buttons.scss     # Example: global button variants
├── utilities/           # Utility classes generated from tokens
│   ├── spacing.scss     # Margin/padding utilities
│   ├── colors.scss      # Background/text color utilities
│   └── typography.scss  # Font size/weight utilities
├── themes/              # Theme switching logic
│   └── theme-switch.scss # CSS for theme transition effects
└── index.scss           # Global entry point
```

---

## Design Token Philosophy

### 1. Raw Tokens vs Semantic Assignments

**Raw color palette** (never changes between themes):

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
  --color-border: var(--color-neutral-700);
}

[data-theme='light'] {
  // Light theme overrides
  --color-background: var(--color-neutral-100);
  --color-surface: var(--color-white);
  --color-text-primary: var(--color-neutral-900);
  --color-border: var(--color-neutral-300);
}
```

### 2. Modern Unit Strategy

- **Use `rem` for all spacing and typography** (accessibility and scalability)
- **Use `px` only for borders and precise details** (1px borders, icons)
- **Use `%` and `vw/vh` for responsive layouts**
- **Base font size: 16px = 1rem** (never change this assumption)

### 3. Cross-Platform Consistency

Design tokens work across all platforms:

- **Web**: Direct CSS custom property usage
- **Mobile**: Token values converted to platform-specific units
- **Desktop**: Same tokens, potentially different base sizes

---

## Component Styling Approach

### 1. Token-First Development

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
  font-size: 14px;
  border-radius: 8px;
}
```

### 2. Component Style Location

Choose based on component scope:

**Option A: Colocated with component** (recommended for specific components)

```
components/
├── Editor/
│   ├── Editor.tsx
│   ├── Editor.scss
│   └── index.ts
```

**Option B: Central component styles** (for shared UI components)

```
styles/components/
├── buttons.scss
├── forms.scss
└── modals.scss
```

### 3. Naming Convention

Use **BEM methodology** with **design system prefixes**:

```scss
// Component block
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

### 1. Theme Switching Mechanism (Future Implementation)

Themes will be controlled via a `data-theme` attribute on the root element:

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

### 2. Theme Transition Effects

Smooth transitions between themes:

```scss
* {
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}
```

### 3. System Preference Detection (Future)

```scss
@media (prefers-color-scheme: light) {
  [data-theme='system'] {
    // Apply light theme variables
  }
}
```

---

## Import Strategy

### 1. Design Token Import

In your main SCSS file:

```scss
// Import design tokens first
@import '@kairos/design-tokens';

// Then import your app styles
@import './base/reset';
@import './base/typography';
@import './layout/grid';
```

### 2. Component-Level Imports

In component SCSS files:

```scss
// Design tokens are globally available via CSS custom properties
// No need to import - just use var(--token-name)

.my-component {
  color: var(--color-text-primary);
  padding: var(--spacing-md);
}
```

---

## Utility Class Generation (Future)

Generate utility classes from design tokens:

```scss
// Auto-generated from spacing tokens
.m-sm {
  margin: var(--spacing-sm);
}
.p-lg {
  padding: var(--spacing-lg);
}

// Auto-generated from color tokens
.text-primary {
  color: var(--color-text-primary);
}
.bg-surface {
  background-color: var(--color-surface);
}
```

---

## Best Practices

### Development

- **Start with tokens**: Always check if a design token exists before creating custom values
- **Semantic naming**: Use semantic color assignments (`--color-text-primary`) not raw colors (`--color-neutral-100`) in components
- **Component isolation**: Scope styles to avoid global conflicts
- **Design system compliance**: Follow token scales instead of arbitrary values

### Performance

- **Minimize custom properties**: Don't create tokens for one-off values
- **Efficient selectors**: Keep specificity low, avoid deep nesting
- **Critical CSS**: Inline design tokens and base styles for first paint

### Maintenance

- **Token documentation**: Document the purpose of semantic assignments
- **Version control**: Track design token changes carefully
- **Cross-platform testing**: Verify tokens work across all target platforms
- **Accessibility**: Ensure sufficient contrast ratios in all themes

### Future Considerations

- **Component variants**: Plan for multiple button styles, form variations
- **Animation tokens**: Motion duration and easing curves
- **Platform adaptations**: Different spacing scales for touch vs. desktop
- **User customization**: Allow users to adjust font sizes, contrast levels

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
- 🔄 Advanced animation and motion tokens

This structure ensures scalability, maintainability, and consistency across all platforms while providing a solid foundation for future enhancements.
