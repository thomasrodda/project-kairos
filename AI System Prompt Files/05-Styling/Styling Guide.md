# Project Kairos Styling Guide

> A simple guide for styling the app effectively

## Quick Answers

**Q: How do I style a button?**  
A: Use the component class: `<button className="btn btn--primary">`

**Q: What spacing should I use?**  
A: Use numeric tokens like `--spacing-16` (means 16px). Common ones:

- `--spacing-8` (8px) - tight spacing
- `--spacing-16` (16px) - default spacing
- `--spacing-24` (24px) - comfortable spacing

**Q: Can I write custom styles?**  
A: Yes! Not everything needs to be a component. Use components for common patterns, custom styles for unique elements.

## Component Library Approach

### When to Use Components

Use preset component classes for:

- ✅ Buttons (`.btn`)
- ✅ Cards (`.card`)
- ✅ Form inputs (`.input`)
- ✅ Modals (`.modal`)
- ✅ Common patterns used 3+ times

### When to Use Custom Styles

Write custom SCSS for:

- ✅ Page-specific layouts
- ✅ Unique one-off elements
- ✅ Complex component internals
- ✅ Animations and transitions

### Example Component Usage

```html
<!-- Using component classes -->
<button className="btn btn--primary">Save</button>
<button className="btn btn--secondary btn--small">Cancel</button>

<div className="card">
  <h3 className="card__title">Chapter 1</h3>
  <p className="card__content">Content here...</p>
</div>

<!-- Custom styling for unique elements -->
<div className="my-special-widget">
  <!-- This is unique, so custom styles are fine -->
</div>
```

## Responsive Design

Yes! Components can be responsive. Here's how:

```scss
// Component with built-in responsive behavior
.card {
  padding: var(--spacing-16);

  @media (min-width: 768px) {
    padding: var(--spacing-24);
  }
}

// Usage - responsive is automatic
<div className="card">This adapts to screen size</div>
```

## Token Reference

### Spacing (Numeric - Clear & Obvious)

```scss
--spacing-2   // 2px  - hairline
--spacing-4   // 4px  - minimal
--spacing-8   // 8px  - tight
--spacing-12  // 12px - snug
--spacing-16  // 16px - default ⭐
--spacing-24  // 24px - comfortable
--spacing-32  // 32px - spacious
--spacing-48  // 48px - generous
```

### Colors (What to Use)

```scss
// Text
--color-text-primary      // Normal text
--color-text-secondary    // Muted text
--color-text-tertiary     // Very muted

// Backgrounds
--color-surface           // Card/component background
--color-surface-hover     // Hover state
--color-background        // Page background

// Borders
--color-border            // Default borders
--color-border-hover      // Hover borders

// Actions
--color-primary-500       // Primary buttons/links
--color-error-500         // Errors/destructive
--color-success-500       // Success states
```

### Other Useful Tokens

```scss
// Border Radius
--radius-4   // Subtle (4px)
--radius-8   // Default (8px)
--radius-12  // Rounded (12px)

// Font Sizes
--font-size-12  // Small text
--font-size-14  // Default
--font-size-16  // Comfortable
--font-size-18  // Large

// Shadows
--shadow-sm   // Subtle depth
--shadow-md   // Card shadow
--shadow-lg   // Modal shadow
```

## How to Style Something New

### Step 1: Check if a component exists

Look in `apps/web/src/styles/components/` for existing patterns

### Step 2: If no component, decide the approach

**Option A: Create a reusable component** (if used 3+ times)

```scss
// In _buttons.scss
.btn--warning {
  background: var(--color-warning-500);
  color: white;
}
```

**Option B: Write custom styles** (if unique)

```scss
// In YourComponent.scss
.my-special-feature {
  display: flex;
  gap: var(--spacing-16);
  padding: var(--spacing-24);
}
```

### Step 3: Use the styles

```tsx
// Component approach
<button className="btn btn--warning">Delete</button>

// Custom approach
<div className="my-special-feature">...</div>
```

## Common Patterns

### Flexbox Layout

```scss
.my-layout {
  display: flex;
  gap: var(--spacing-16); // Use gap instead of margins
  align-items: center;
  justify-content: space-between;
}
```

### Hover States

```scss
.my-element {
  transition: all var(--duration-fast);

  &:hover {
    background: var(--color-surface-hover);
    transform: translateY(-1px); // Subtle lift
  }
}
```

### Focus States (Accessibility)

```scss
.my-input {
  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
}
```

## Style Guide Page

✅ **Now Available!** Access the visual Style Guide at `/style-guide` during development. The page includes:

- Live examples of spacing, colors, and typography
- Interactive component demonstrations
- Copy-to-clipboard functionality for tokens
- Responsive design examples

## Quick Tips

1. **Start with existing components** - Check if `.btn`, `.card`, etc. already do what you need
2. **Use numeric spacing** - `--spacing-16` is clearer than `--spacing-md`
3. **Keep it simple** - Not everything needs to be a complex component
4. **Test responsively** - Chrome DevTools device mode is your friend
5. **Ask yourself** - "Will I use this style again?" If yes → component. If no → custom styles.

## Real-World Examples

### BEM Methodology in Action

```scss
// From Sidebar.scss - Perfect BEM implementation
.sidebar {
  &__header {
  } // Element
  &__toggle {
  } // Element
  &--collapsed {
  } // Modifier
  &__toggle-icon--flipped {
  } // Element modifier
}
```

### Design Token Usage

```scss
// Good - From Editor.scss
paddding: var(--spacing-64);
color: var(--color-text-primary);

// Avoid - Hardcoded values
transition: opacity 0.15s ease; // Use var(--animate-opacity)
opacity: 0.6; // Define opacity tokens
```

## Common Issues Found

### 1. **Missing Component Library Directory**

- Guide mentions `apps/web/src/styles/components/` but it doesn't exist
- Components use inline SCSS files instead (which is fine!)

### 2. **Inconsistent Token Usage**

Some files use hardcoded values instead of tokens:

- Transitions: Use `var(--animate-colors)` not `transition: all 0.15s`
- Opacity values: Consider defining `--opacity-60`, `--opacity-100`
- Letter spacing: Define tokens like `--letter-spacing-tight`

### 3. **Legacy Token Names**

Migrate from:

- `--transition-fast` → `--speed-fast`
- `--border-radius-sm` → `--radius-4`
- `--color-white` → `--color-neutral-100`

## Actual Implementation Patterns

### Mixins Available

Project includes useful mixins in `apps/web/src/styles/mixins.scss`:

```scss
@include spinner; // Loading spinner
@include input-base; // Form input styles
@include button-primary; // Primary button styles
@include error-message; // Error message styles
```

### Component Variants

```scss
// From SidebarButton.scss
.sidebar-button {
  &--standard {
  } // Variant modifier
  &--slim {
  } // Variant modifier
  &--collapsed {
  } // State modifier
}
```

## Need More Details?

- **Live examples**: Visit `/style-guide` in development
- **Component patterns**: Check individual component SCSS files
- **All tokens**: See `packages/design-tokens/src/`
- **Technical docs**: See `AI System Prompt Files/Component Structure Guide.md`
