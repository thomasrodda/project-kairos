# Component Structure Guide

> This guide defines how we organize, name, and write components in a scalable and maintainable way. It ensures consistency and modularity across the frontend codebase.

---

## Overview

Components are written in **React + TypeScript**, using a feature-based folder structure. Each component is modular, self-contained, and easy to test, update, or reuse.

---

## Folder Structure

Each feature or component lives in its own folder within `apps/web/src/components/`:

```
components/
├── EditorToolbar/
│   ├── EditorToolbar.tsx
│   ├── EditorToolbar.scss   # Optional: local SCSS for this component
│   ├── EditorToolbar.test.tsx
│   └── index.ts             # Re-exports component
```

This structure makes it easy to locate all related files.

---

## File Naming

Use PascalCase for file and folder names:

* `EditorToolbar.tsx`
* `PageList.scss`
* `BlockMenu.test.tsx`

Avoid suffixes like `.component.tsx` — keep names simple and consistent.

---

## Component Exports

Use an `index.ts` file inside each component folder to re-export the main component. This allows clean imports:

```tsx
import { EditorToolbar } from '@/components/EditorToolbar';
```

---

## Component Types

We use the following types of components:

* **UI components**: Buttons, inputs, toolbars, icons
* **Layout components**: Grids, containers, sidebars
* **Feature components**: Editor, FileTree, BlockList
* **Page-level components**: Wrapped route content (if applicable)

---

## Props & Typing

All components are written in TypeScript with strongly typed props. Define props using interfaces:

```ts
interface EditorToolbarProps {
  onSave: () => void;
  isSaving: boolean;
}
```

Use destructuring in the function signature and document props with clear names.

---

## Styling Components

If the component has more than a few lines of styling, include a `.scss` file alongside it. Keep class names scoped to the component using BEM naming. Import the SCSS at the top of the `.tsx` file.

---

## Testing Components

Write a test file alongside the component to cover key logic, rendering, and user interactions. Use Jest + React Testing Library. Keep test coverage focused and meaningful.

---

## Best Practices

* Keep components small and focused (single responsibility)
* Co-locate tests and styles with components
* Use clear, consistent naming
* Avoid props drilling—lift state where appropriate
* Prefer composition over inheritance
* Document expected props in code
* Use dynamic rendering and registry patterns for pluggable UI components (e.g., editor blocks)

The block-based editor uses a plugin-friendly architecture.

- A central `blockRegistry.ts` defines block types and how to render them.
- Each block type includes:
  - A React component
  - Optional slash-menu options
  - Optional formatting toolbar config

This allows new block types (like media embeds, tables, etc.) to be added without modifying the core editor logic.
