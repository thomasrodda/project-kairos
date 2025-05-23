# SCSS Structure Guide

> This guide explains how we organize, write, and maintain SCSS for styling the frontend of the app. It supports a clean, scalable, and component-based CSS architecture with theming and design system support.

---

## Overview

We use **SCSS** instead of Tailwind or external UI libraries. SCSS gives us control and flexibility while keeping styles modular, future-proof, and consistent with a defined design system.

This guide supports:

- Modular component styles
- Light/dark theme support
- Design tokens (colors, fonts, spacing, etc.)
- Global resets for consistent cross-browser styling

---

## Folder Structure

We maintain a central SCSS folder, while also allowing for component-level styles to live alongside their components if preferred for better modularity.

Located in: `apps/web/src/styles/`

```
styles/
├── base/         # Global resets, variables, mixins, fonts
├── layout/       # Layout containers (grid, wrappers)
├── components/   # Optional shared component styles
├── pages/        # Page-specific styles (if needed)
├── utils/        # Utility classes (e.g., visually-hidden)
├── themes/       # Light and dark theme definitions
└── index.scss    # Global entry point
```

In addition, individual components may include their own `ComponentName.scss` files within their folders to keep structure modular and clear.

---

## Global Resets

Create a file for global resets (e.g. removing default margins, setting box-sizing, etc.) and import it early in the global SCSS index. Avoid including these styles in individual components.

---

## Design Tokens & Variables

Define your design tokens (color palette, font families, spacing units, etc.) in the variables file. Use descriptive variable names and access them via CSS variables in your styles. This supports theming and consistent design.

---

## Theming: Light & Dark Mode

Use theme-specific SCSS files to define overrides for tokens such as colors. Themes are activated using a `data-theme` attribute on a root element. Stick to variable overrides instead of redefining styles to reduce duplication.

---

## Naming Convention

Follow a clear naming system, such as BEM (Block\_\_Element--Modifier), and scope class names to avoid naming conflicts. This improves readability and maintainability.

---

## Component Styling

Component-specific SCSS can be placed either:

- In the central `styles/components/` folder for shared UI elements
- Or inside the component folder alongside its logic and markup

Choose based on how reusable and isolated the component is. Import the SCSS file at the top of the React component when applicable.

---

## Mixins & Utilities

Define reusable mixins for things like media queries or flexbox shortcuts. Use utility classes for accessibility helpers or non-semantic layout tweaks.

---

## Best Practices

- Keep global styles minimal and in one place
- Use SCSS variables for color, spacing, font, etc.
- Keep specificity low
- Group and comment related rules
- Avoid !important unless absolutely necessary
- Theme using CSS variables and attribute selectors
- Keep component styles close to the logic they support when possible
