# Project Kairos Styling Consistency Review & Implementation Plan

**Date**: January 11, 2025 (Phase 1), January 12, 2025 (Phase 2)  
**Status**: Phase 1 Complete ✅, Phase 2 Complete ✅

## Executive Summary

Project Kairos has a well-architected design token system using CSS custom properties, but implementation across components is inconsistent. The primary issue is mixed usage of hard-coded values versus design tokens, not a conflict between SCSS variables ($) and CSS custom properties (var(--)).

**Key Finding**: CSS custom properties are correctly established as the preferred method. SCSS variables are appropriately limited to mixin usage only.

**Update (January 12, 2025)**: Phase 2 has been completed successfully. All components now consistently use design tokens.

## Current Architecture Overview

### ✅ What's Working Well

1. **Design Token System**

   - Comprehensive CSS custom properties for all design values
   - Well-organized in `packages/design-tokens/`
   - Semantic naming convention: `--category-subcategory-variant`
   - Single import point prevents CSS duplication

2. **SCSS Configuration**

   - Clean separation between CSS output and Sass helpers
   - Auto-imports design tokens as Sass helpers in all SCSS files
   - Modern compiler API for performance

3. **Variable Strategy**
   - CSS custom properties for all component styling
   - SCSS variables only for mixins (breakpoints, helper functions)
   - No conflicting dual-system issues

### ❌ Key Issues Identified

#### 1. Hard-coded Values (High Priority)

**Spacing Values**

- Components using `0.5rem`, `0.75rem`, `1rem` instead of tokens
- Examples: WorkspaceSelector, PageTreeItem, Sidebar

**Dimensions**

- Magic numbers: `32px`, `200px`, `300px`, `220px`
- No semantic tokens for common sizes
- Icon sizes hard-coded: `16px`, `20px`, `24px`

**Colors**

- Google icon colors in Auth components: `#4285F4`, `#34A853`, etc.
- RGBA values: `rgba(0, 0, 0, 0.1)` in FormattingToolbar

#### 2. Z-index Management (High Priority)

**Current State:**

- SCSS variables defined but inaccessible to components
- Hard-coded values: 100, 500, 1000
- Undefined variable used: `var(--z-sidebar)`

**Examples:**

```scss
// Current (problematic)
z-index: 100; // WorkspaceSelector
z-index: 1000; // PageTreeItem, SlashCommandMenu
z-index: var(--z-sidebar); // Undefined in Sidebar.scss
```

#### 3. Unit Inconsistency (Medium Priority)

**Mixed Usage:**

- Some components use rem with tokens
- Others use px directly
- PerformanceTest.tsx has extensive inline px styles

**No Clear Guidelines:**

- When to use px vs rem
- How to handle responsive values
- Border vs spacing units

#### 4. Inline Styles (Low Priority)

**Acceptable Uses:**

- Dynamic positioning (tooltips, menus)
- Animation states
- Conditional styling

**Problematic Uses:**

- PerformanceTest.tsx: All styles should be in SCSS
- Debug styles in Workspace.tsx
- Static layout values

## Implementation Plan

### Phase 1: Critical Fixes (1-2 days) ✅ COMPLETED

**Completion Date**: January 11, 2025

#### 1.1 Create Z-index CSS Custom Properties ✅

Z-index tokens were already present in `_layout.scss`. Updated 6 components to use them:

- `WorkspaceSelector.scss`: 100 → `var(--z-index-dropdown)`
- `PageTreeItem.scss`: 1000 → `var(--z-index-popover)`
- `SlashCommandMenu.scss`: 1000 → `var(--z-slash-menu)`
- `FormattingToolbar.scss`: 1000 → `var(--z-editor-toolbar)`
- `BlockDragHandle.scss`: 10 → `var(--z-index-above)`
- `DraggableBlock.scss`: 100 → `var(--z-index-dropdown)`

#### 1.2 Fix Undefined Variables ✅

- All CSS variables are properly defined
- Also replaced hard-coded shadow in FormattingToolbar with `var(--shadow-md)`

#### 1.3 Create Missing Size Tokens ✅

Successfully added to `packages/design-tokens/src/_layout.scss`:

```scss
// Icon sizes
--size-icon-xs: 12px;
--size-icon-sm: 16px;
--size-icon-md: 20px;
--size-icon-lg: 24px;
--size-icon-xl: 32px;

// Component sizes
--size-button-sm: 28px;
--size-button-md: 32px;
--size-button-lg: 40px;

// Layout widths
--width-sidebar-collapsed: 56px;
--width-sidebar-expanded: 280px;
--width-dropdown-min: 200px;
--width-dropdown-max: 300px;
--width-modal-sm: 400px;
--width-modal-md: 600px;
--width-modal-lg: 800px;
```

### Phase 2: Systematic Refactor (3-5 days) ✅ COMPLETED

**Completion Date**: January 12, 2025

#### 2.1 Component Refactoring Completed ✅

All components have been successfully refactored to use design tokens consistently:

**High Priority (Most Used)** ✅

1. **Block.scss** - Replaced font weights, font families, and spacing with tokens
2. **EditorContent.scss** - Updated max-width and padding-left to use tokens
3. **Sidebar.scss** - Replaced hard-coded dimensions (32px → var(--size-button-md))
4. **WorkspaceSelector.scss** - Full tokenization of spacing, dimensions, animations

**Medium Priority** ✅

1. **PageTreeItem.scss** - Replaced all dimensions and spacing with tokens
2. **SlashCommandMenu.scss** - Tokenized spacing, dimensions, and animations
3. **FormattingToolbar.scss** - Replaced spacing, border radius, and dimensions
4. **SaveStatus.scss** - Updated icon dimensions and animation easing

**Low Priority** ✅

1. **PerformanceTest.tsx** - Complete refactor: moved all inline styles to new SCSS file
2. **BackendHealthCheck.scss** - Replaced all spacing and dimensions with tokens
3. **Auth components** - Created GoogleLogo component for brand colors, tokenized all other values

#### 2.2 Refactoring Checklist per Component ✅

- [x] Replace hard-coded spacing with tokens
- [x] Replace hard-coded colors with tokens
- [x] Replace z-index values with tokens
- [x] Replace dimensions with semantic tokens
- [x] Ensure consistent unit usage
- [x] Move inline styles to SCSS (where appropriate)
- [x] Remove !important declarations (if possible)

#### 2.3 Common Replacements ✅

All common replacements have been applied across components:

```scss
// Spacing replacements
0.25rem → var(--spacing-xs)   // 4px ✅
0.5rem  → var(--spacing-sm)   // 8px ✅
0.75rem → var(--spacing-12)   // 12px ✅
1rem    → var(--spacing-md)   // 16px ✅
1.5rem  → var(--spacing-lg)   // 24px ✅
2rem    → var(--spacing-xl)   // 32px ✅

// Common patterns
padding: 0.75rem 1rem → padding: var(--spacing-12) var(--spacing-md) ✅
gap: 0.5rem → gap: var(--spacing-sm) ✅
margin-bottom: 1rem → margin-bottom: var(--spacing-md) ✅
```

### Phase 3: Governance & Prevention (Ongoing)

#### 3.1 Linting Rules

Add stylelint configuration:

```json
{
  "rules": {
    "scale-unlimited/declaration-strict-value": [
      ["/color/", "z-index", "font-size", "spacing"],
      {
        "ignoreFunctions": false,
        "ignoreValues": ["inherit", "initial", "unset", "none"]
      }
    ]
  }
}
```

#### 3.2 Documentation Updates

**Add to CLAUDE.md:**

```markdown
## Styling Guidelines

### Required Token Usage

- ALWAYS use CSS custom properties for:
  - Colors: `var(--color-*)`
  - Spacing: `var(--spacing-*)`
  - Typography: `var(--font-*)`
  - Z-index: `var(--z-index-*)`
  - Shadows: `var(--shadow-*)`
  - Radii: `var(--radius-*)`

### Unit Guidelines

- Use rem for typography and spacing
- Use px for borders and precise dimensions
- Use % for responsive widths
- Use em for media queries

### Never Use

- Hard-coded color values
- Magic numbers for spacing
- Arbitrary z-index values
- !important (except for critical overrides)
```

#### 3.3 Component Template

Create `component-template.scss`:

```scss
// Component: [ComponentName]
// Description: [Brief description]

.component-name {
  // Layout
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);

  // Sizing
  width: 100%;
  min-height: var(--size-button-md);

  // Visual
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  // Typography
  font-size: var(--font-size-md);
  color: var(--color-text-primary);

  // States
  &:hover {
    background: var(--color-surface-hover);
  }

  &:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
```

## Quick Reference

### Do's ✅

- Use CSS custom properties for all design values
- Follow semantic token names
- Use spacing tokens for all padding/margin/gap
- Reference existing components for patterns
- Test in both light and dark themes

### Don'ts ❌

- Hard-code colors, spacing, or sizes
- Use arbitrary z-index values
- Mix units within same property
- Create component-specific design tokens
- Use !important without documentation

## Success Metrics

- [x] Zero hard-coded color values (except documented Google brand colors)
- [x] All spacing uses design tokens
- [x] Z-index values are semantic
- [x] Consistent unit usage across components
- [x] No undefined CSS variables
- [ ] Linting rules prevent regressions (Phase 3)

## Timeline

- **Week 1**: Phase 1 implementation (critical fixes) ✅ COMPLETED January 11, 2025
- **Week 2**: Phase 2 implementation (component refactoring) ✅ COMPLETED January 12, 2025
- **Week 3+**: Phase 3 (governance and ongoing maintenance) - PENDING

## Resources

- Design Tokens: `/packages/design-tokens/src/`
- Current Issues: See `# Current Issues.md`
- Testing Guide: `Testing Guide.md`
- Component Examples: `/apps/web/src/components/`

---

**Phase 2 Complete!** All components have been systematically refactored to use design tokens consistently. The codebase now has:

- Consistent spacing using `var(--spacing-*)` tokens
- Semantic dimensions using `var(--size-*)` and `var(--width-*)` tokens
- Proper z-index management with `var(--z-index-*)` tokens
- Google brand colors isolated in a dedicated component with documentation
- All inline styles moved to SCSS files (PerformanceTest.tsx)

**Next Steps**: Begin Phase 3 - Implement linting rules and governance to prevent regression.
