# @kairos/design-tokens

Design tokens package for Project Kairos, providing CSS custom properties and Sass helpers.

## Structure

This package is structured to prevent CSS duplication:

- **`_root.scss`** - Contains all `:root` CSS custom property declarations
- **`_helpers.scss`** - Contains ONLY Sass helpers (mixins, functions, variables) with NO CSS output
- **`index.scss`** - Exports only the Sass helpers for use in components
- **`root-declarations.scss`** - Wrapper that imports `_root.scss` for global app import

## Usage

### 1. Import CSS Root Declarations (Once in your app)

In your main stylesheet (e.g., `src/styles/index.scss`):

```scss
// Import CSS custom properties ONCE for the entire app
@use '../../../../packages/design-tokens/src/root-declarations';
```

### 2. Use Sass Helpers in Components

The Sass helpers are automatically available in all `.scss` files via Vite's `additionalData`:

```scss
// In any component .scss file
.my-component {
  color: var(--color-primary-500); // Use CSS custom properties

  @include breakpoint('md') {
    // Use Sass mixins
    padding: var(--spacing-4);
  }
}
```

## Available Helpers

### Mixins

- `breakpoint($size)` - Responsive media queries (xs, sm, md, lg, xl, 2xl)
- `container($max-width)` - Container with consistent padding
- `text-style($size, $weight, $line-height)` - Apply text styles
- `heading($level)` - Apply heading styles (xs, sm, md, lg, xl, 2xl)

### Variables

- `$breakpoint-*` - Breakpoint values for custom media queries
- `$z-index-*` - Z-index scale values

## Why This Structure?

Previously, the entire design tokens file (including `:root` declarations) was being imported into every component via Vite's `additionalData`, causing massive CSS duplication. This new structure:

1. Imports `:root` declarations only once globally
2. Makes only Sass helpers available to components (no CSS output)
3. Reduces bundle size significantly
4. Improves build performance
