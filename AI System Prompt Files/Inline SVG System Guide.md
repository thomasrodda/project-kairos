# Inline SVG System Guide

> How the inline SVG icon system works in Project Kairos. Provides optimal performance, accessibility, and developer experience.

---

## Overview

Icons are embedded directly as SVG content instead of separate image files. This gives better performance, styling control, and accessibility.

**Benefits:**

- All SVGs bundled at build time (no network requests)
- Full CSS styling control with design tokens
- Perfect accessibility with ARIA attributes
- TypeScript autocompletion for icon names
- Performance monitoring and intelligent preloading

---

## How It Works

### 1. Build Time

- Vite imports all SVG files as raw strings using `?raw` suffix
- SVGs are bundled into the JavaScript build
- Tree-shaking removes unused icons

### 2. Runtime

- Icon component requests SVG content by name
- SVG is parsed, cleaned, and cached
- Rendered inline with React props

### 3. File Structure

```
packages/ui/src/
├── components/Icon/          # Main Icon component
├── utils/
│   ├── iconLoader.ts        # Icon name mapping
│   ├── svgContentLoader.ts  # SVG processing
│   └── iconPerformance.ts   # Performance optimization
└── assets/icons/            # SVG source files
```

---

## Usage

### Basic Usage

```typescript
import { Icon } from '@kairos/ui'

// Simple icon
<Icon name="search" />

// Sized and colored
<Icon name="add" size={24} color="var(--color-primary-500)" />

// With accessibility
<Icon name="close" aria-label="Close dialog" />
```

### Available Props

- `name` - Icon name (TypeScript autocomplete available)
- `size` - Number (pixels) or string (CSS value)
- `color` - CSS color value
- `fill` - SVG fill color override
- `stroke` - SVG stroke color override
- `opacity` - Opacity value
- `className` - Additional CSS classes
- `aria-label` - Accessibility label

---

## Adding New Icons

### Step 1: Add SVG File

Place your SVG in `packages/ui/src/assets/icons/MyIcon.svg`

### Step 2: Update Icon Map

Edit `packages/ui/src/utils/iconLoader.ts`:

```typescript
export const iconMap = {
  // existing icons...
  'my-icon': 'MyIcon.svg',
} as const
```

### Step 3: Add Static Import

Edit `packages/ui/src/utils/svgContentLoader.ts`:

```typescript
// Add import
import myIcon from '../assets/icons/MyIcon.svg?raw'

// Add to map
const svgContentMap: Record<IconName, string> = {
  // existing mappings...
  'my-icon': myIcon,
}
```

### Step 4: Use It

```typescript
<Icon name="my-icon" size={20} />
```

TypeScript will now autocomplete your new icon name!

---

## Performance Features

### Smart Preloading

- **Critical icons** (search, add, close): Loaded immediately
- **Important icons** (archive, back, check): Loaded on app init
- **Other icons**: Loaded when first used

### Performance Monitoring

Development mode shows real-time metrics:

- Average load times
- Cache hit rates
- Usage analytics

---

## Styling Integration

Works seamlessly with design tokens:

```scss
.my-button-icon {
  color: var(--color-interactive);
  transition: var(--animate-colors);

  &:hover {
    color: var(--color-interactive-hover);
  }
}
```

Icons automatically adapt to theme changes (light/dark mode).

---

## Best Practices

### Icon Organization

- Use descriptive names: `user-profile` not `icon1`
- Optimize SVGs: Remove unnecessary attributes
- Design for 20x20 or 24x24 base sizes

### Performance

- Let the system handle preloading automatically
- Use performance monitoring in development
- Provide `aria-label` for meaningful icons

### Accessibility

- Icons in buttons need labels
- Decorative icons can omit labels
- Test with screen readers

---

## Troubleshooting

**Icon not showing:**

1. Check icon name exists in `iconMap`
2. Verify SVG file is in assets folder
3. Ensure static import is added
4. Check browser console for errors

**TypeScript errors:**

1. Run `yarn typecheck`
2. Verify icon name is typed correctly
3. Check import statements

**Performance issues:**

1. Use performance monitoring tools
2. Check critical icons are preloaded
3. Monitor cache hit rates

---

This system provides production-ready icon management with excellent performance and developer experience.
