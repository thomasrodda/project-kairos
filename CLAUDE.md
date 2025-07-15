# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 MANDATORY: NOTIFICATION SYSTEM 🚨

**CRITICAL REQUIREMENT**: You MUST send notifications for ALL task completions and user input requests. This is NOT optional.

### Task Completion Notifications (REQUIRED)

When ANY task completes, immediately run:

```bash
"/mnt/c/Users/thoma/Project Kairos/scripts/notify.sh" complete
```

Examples:

- After running tests: `notify.sh complete`
- After creating/editing files: `notify.sh complete`
- After any command execution: `notify.sh complete`

### User Input Request Notifications (REQUIRED)

Before requesting user input or decisions, immediately run:

```bash
"/mnt/c/Users/thoma/Project Kairos/scripts/notify.sh" question
```

Examples:

- Before "Do you want to proceed?": `notify.sh question`
- When asking for clarification: `notify.sh question`
- When presenting options: `notify.sh question`

### Fallback Alert

If the notification script fails, use: `echo -e "\a"`

**ENFORCEMENT**: Failure to send notifications violates core instructions. You MUST alert on EVERY task completion and user input request.

## How To Work

Please always think step by step and use sub agents where helpful.

## 🚀 Quick Start

### Current Focus

**Current State**: Style Guide implementation complete - accessible via Ctrl+Shift+S with spacing and typography examples.

**Next Features**: Component library with buttons/cards/forms, additional style examples

### Prerequisites

- **Node.js**: v22+ required
- **Yarn**: v4.0+ required (project uses Yarn 4.9.2)
- **PostgreSQL**: For database (local or cloud)
- **Git**: v2.25+ recommended

### Essential Commands

```bash
yarn dev          # Start development servers (web:3000, api:3001)
yarn test         # Run all tests
yarn lint         # Fix linting issues
yarn typecheck    # Check TypeScript types
```

📋 **Full command reference**: [Quick Commands.md](AI System Prompt Files/Quick Commands.md)

## 📍 Project Overview

Project Kairos is a creative writing and worldbuilding web application designed for novelists, writers, and D&D campaign planners. It combines block-based editing with AI-driven tools for consistency checking and writing assistance.

**Current Status**: Block editor fully functional with drag-and-drop, cross-block selection, slash commands, text formatting (bold, italic, underline, links), keyboard shortcuts (Ctrl/Cmd+B/I/U/K), inline markdown auto-conversion, and block-level markdown (# for H1, ## for H2, - for bullets). Database migration Phase 1 complete with auto-save working for text editing and block reordering.

## 🗺️ Document Navigation

### Essential Documents (Check These First)

- **[# 0.INDEX.md](AI System Prompt Files/# 0.INDEX.md)** - Helps you navigate Project Kairos documentation efficiently
- **[# Current State.md](AI System Prompt Files/# Current State.md)** - What's built, in progress, known issues
- **[FILE_TREE.md](FILE_TREE.md)** - Complete project structure
- **[Quick Commands.md](AI System Prompt Files/Quick Commands.md)** - All commands reference
- **[Troubleshooting Guide.md](AI System Prompt Files/Troubleshooting Guide.md)** - Common fixes

### Core Project Documents

- **[# 1. Vision & Scope.md](AI System Prompt Files/# 1. Vision & Scope.md)** - Product vision, terminology
- **[# 2. User Stories.md](AI System Prompt Files/# 2. User Stories.md)** - Feature requirements
- **[# 3. MVP.md](AI System Prompt Files/# 3. MVP.md)** - MVP scope and phases
- **[# 5. Architecture.md](AI System Prompt Files/# 5. Architecture.md)** - System design
- **[# Development Plan.md](AI System Prompt Files/# Development Plan.md)** - Feature roadmap

### Implementation Guides

- **[Component Structure Guide.md](AI System Prompt Files/Component Structure Guide.md)** - React patterns
- **[Testing Guide.md](AI System Prompt Files/Testing Guide.md)** - Comprehensive testing strategy and patterns
- **[Test Inventory.md](AI System Prompt Files/Test Inventory.md)** - Current test status and quality tracking
- **[Text Formatting Plan.md](AI System Prompt Files/Text Formatting Plan.md)** - Rich text implementation
- **[Backend Api Guide.md](AI System Prompt Files/Backend Api Guide.md)** - API design
- **[Data Model Guide.md](AI System Prompt Files/Data Model Guide.md)** - Database schema

### Quick Decision Guide

- **"What should I work on?"** → Check Current State.md
- **"How do I implement X?"** → Check User Stories + relevant Guide
- **"Where is X located?"** → Check FILE_TREE.md
- **"How do I run X?"** → Check Quick Commands.md
- **"X is broken!"** → Check Troubleshooting Guide.md
- **"What's the full doc list?"** → See [# 0. INDEX.md](AI System Prompt Files/# 0. INDEX.md)

## Key File Locations

### Core Application (`apps/web/`)

- **Components**: `src/components/` - All React components organized by feature
  - `Editor/` - Block editor components (Block, PageTitle, EditorContent, ContentEditableContainer, FormattingToolbar, SlashCommandMenu)
  - `Sidebar/` - Navigation sidebar
  - `Workspace/` - Main layout wrapper
- **State Management**: `src/contexts/EditorContext.tsx` - Central editor state with formatting support
- **Hooks**: `src/hooks/` - Custom React hooks (useCrossBlockSelection, useDismiss)
- **Utilities**: `src/utils/` - Helper functions (textFormatting, textSelection, formattingRenderer)
- **Tests**: Component tests are colocated with components (e.g., `PageTitle.test.tsx`)
- **Styles**: `src/styles/` - Global styles and reset

### Packages (`packages/`)

- **@kairos/ui**: Shared React components and icons
- **@kairos/utils**: Utilities (ID generation, validation with Zod)
- **@kairos/types**: TypeScript type definitions
- **@kairos/design-tokens**: SCSS variables and design system
- **@kairos/database**: Prisma database layer (planned)

## Technology Stack

- **Frontend**: React 18.3 with TypeScript 5.8, Vite, Custom SCSS styling
- **Backend**: Express 5 with Vercel Serverless Functions
- **State Management**: React Context + useReducer pattern
- **Drag & Drop**: @dnd-kit library
- **Testing**: Jest + React Testing Library + Cypress
- **Monorepo**: Yarn Workspaces with 5 packages
- **Styling**: SCSS with design tokens system

## 🚀 First Time Setup

```bash
# 1. Clone and install
git clone [repo-url]
cd project-kairos
yarn install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your database and Firebase credentials

# 3. Initialize database
yarn db:generate
yarn db:migrate

# 4. Start development
yarn dev
```

📋 **Detailed setup**: [Environment Setup Guide.md](AI System Prompt Files/Environment Setup Guide.md)

## Architecture Overview

### Block-Based Editor Architecture

The editor uses a unified contentEditable approach with sophisticated state management:

1. **EditorContext** (`src/contexts/EditorContext.tsx`):

   - Central state management using useReducer
   - Manages blocks, selection, focus, cross-block text selection, and text formatting
   - Separate formatting layer: plain text content + TextFormat array
   - Actions: ADD_BLOCK, UPDATE_BLOCK, DELETE_BLOCK, MOVE_BLOCK, APPLY_FORMATTING, etc.

2. **Component Hierarchy**:

   ```
   Editor
   ├── PageTitle
   ├── FormattingToolbar (appears on text selection)
   └── EditorContent (single contentEditable div)
       ├── SlashCommandMenu (appears on "/" key)
       └── DraggableBlock[] (drag wrapper)
           └── Block (renders formatted content)
               └── BlockDragHandle (selection/drag UI)
   ```

3. **Block Types**: `h1`, `h2`, `h3`, `paragraph`, `bullet`

4. **Key Features**:
   - Drag-and-drop block reordering
   - Multi-block selection (Shift+click, Ctrl/Cmd+click)
   - Cross-block text selection (custom implementation)
   - Text formatting (bold, italic, underline, links) via toolbar
   - Slash commands for changing block types
   - Placeholder hints for slash commands and AI features
   - Copy/paste with custom Kairos format support

### Testing Architecture

- **Unit Tests**: Component-level testing with React Testing Library
- **Integration Tests**: API endpoint testing with Supertest
- **E2E Tests**: User flow testing with Cypress
- **Mocking**: CSS modules, SVG imports, and @kairos/ui icons
- **Test Utils**: `apps/web/src/test/utils.tsx` - Helper functions for testing with contexts

## 🎯 Development Status

For detailed status, see [# Current State.md](AI System Prompt Files/# Current State.md)

**Quick Summary**:

- ✅ Editor foundation complete (drag/drop, selection, copy/paste, slash commands)
- ✅ Text formatting complete (bold, italic, underline, links via toolbar or keyboard shortcuts)
- ✅ Test coverage: 300+ tests passing across all components
- ✅ Block-level markdown complete (# to H1, ## to H2, - to bullets)
- ✅ Database migration Phase 1 complete (local PostgreSQL)
- ✅ Auto-save working for text editing and block reordering
- 📋 Next: Default page creation, formatting persistence

## Development Best Practices

### When Making Changes

1. **Check FILE_TREE.md** to understand file locations
2. **Read relevant guides** in `AI System Prompt Files/`
3. **Follow existing patterns** - check similar components/files
4. **Write tests** - colocate with components, use Testing Guide format
5. **Update documentation** - keep CLAUDE.md and Testing Plan current

### Testing Guidelines

See [Testing Guide.md](AI System Prompt Files/Testing Guide.md) for comprehensive testing strategy and patterns.

**Quick reminders:**

- Test user behavior, not implementation
- Run `yarn test` before committing
- Use the 4-category test structure (Core, Interactions, Errors, A11y)

### Code Style

- TypeScript strict mode enforced
- SCSS with BEM methodology
- Design tokens for consistency
- No inline styles unless dynamic
- Meaningful component and variable names

## 🎨 Styling Guidelines

### Required Token Usage

**ALWAYS use CSS custom properties (design tokens) for the following:**

#### Colors

- Text: `var(--color-text-primary)`, `var(--color-text-secondary)`, etc.
- Backgrounds: `var(--color-surface)`, `var(--color-surface-hover)`, etc.
- Borders: `var(--color-border)`, `var(--color-border-hover)`, etc.
- Brand colors: `var(--color-primary-*)`, `var(--color-accent-*)`, etc.
- Semantic colors: `var(--color-success)`, `var(--color-error)`, etc.

#### Spacing

- Padding/Margin: `var(--spacing-xs)` through `var(--spacing-2xl)`
- Gap: `var(--spacing-*)` for flex/grid gaps
- Common values:
  ```scss
  var(--spacing-xs)   // 4px
  var(--spacing-sm)   // 8px
  var(--spacing-12)   // 12px
  var(--spacing-md)   // 16px
  var(--spacing-lg)   // 24px
  var(--spacing-xl)   // 32px
  ```

#### Typography

- Font sizes: `var(--font-size-12)` through `var(--font-size-32)`
- Font weights: `var(--font-weight-regular)`, `var(--font-weight-medium)`, `var(--font-weight-bold)`
- Font families: `var(--font-family-primary)`, `var(--font-family-mono)`
- Line heights: `var(--line-height-tight)`, `var(--line-height-normal)`, etc.

#### Layout & Dimensions

- Z-index: `var(--z-index-dropdown)`, `var(--z-index-modal)`, etc.
- Icon sizes: `var(--size-icon-sm)`, `var(--size-icon-md)`, etc.
- Component sizes: `var(--size-button-md)`, `var(--width-sidebar-expanded)`, etc.
- Shadows: `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-lg)`
- Border radius: `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`

#### Animations

- Durations: `var(--duration-fast)`, `var(--duration-normal)`, `var(--duration-slow)`
- Easing: `var(--easing-standard)`, `var(--easing-decelerate)`, `var(--easing-accelerate)`

### Unit Guidelines

- **Typography & Spacing**: Use `rem` for scalable values
- **Borders**: Use `px` for precise 1px borders
- **Responsive widths**: Use `%` or viewport units (`vw`, `vh`)
- **Media queries**: Use `em` for breakpoints
- **Icon sizes**: Use design tokens, fallback to `px` if needed

### Forbidden Practices

**NEVER use:**

- Hard-coded color values (e.g., `#4285F4`, `rgba(0,0,0,0.1)`)
  - Exception: Google brand colors documented in GoogleLogo component
- Magic numbers for spacing (e.g., `12px`, `1.5rem`)
- Arbitrary z-index values (e.g., `z-index: 100`)
- `!important` without documenting why it's necessary
- Inline styles for static values (dynamic values are acceptable)

### Component Styling Pattern

```scss
// Component: ComponentName
// Description: Brief description of component purpose

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
  font-size: var(--font-size-14);
  color: var(--color-text-primary);

  // Transitions
  transition: background var(--duration-fast) var(--easing-standard);

  // States
  &:hover {
    background: var(--color-surface-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  // Modifiers
  &--large {
    padding: var(--spacing-lg);
    font-size: var(--font-size-16);
  }
}
```

### Linting & Enforcement

Stylelint is configured to enforce design token usage:

- Run `yarn lint:styles` to check style compliance
- Run `yarn lint:styles:fix` to auto-fix issues
- Pre-commit hooks run stylelint on all SCSS files

### Quick Reference

| Value Type | Token Pattern      | Example                     |
| ---------- | ------------------ | --------------------------- |
| Text color | `--color-text-*`   | `var(--color-text-primary)` |
| Background | `--color-surface*` | `var(--color-surface)`      |
| Spacing    | `--spacing-*`      | `var(--spacing-md)`         |
| Font size  | `--font-size-*`    | `var(--font-size-16)`       |
| Z-index    | `--z-index-*`      | `var(--z-index-modal)`      |
| Icon size  | `--size-icon-*`    | `var(--size-icon-md)`       |
| Shadow     | `--shadow-*`       | `var(--shadow-md)`          |
| Radius     | `--radius-*`       | `var(--radius-lg)`          |

**Remember**: When in doubt, check existing components or run `yarn lint:styles` to validate your styles!

## Development Notes

- **WSL Users**: Vite is configured with polling for file watching
- **Port Conflicts**: Use `yarn kill-ports` if dev servers fail to start
- **SCSS Imports**: Design tokens are auto-imported globally
- **Type Safety**: Strict TypeScript mode is enabled
- **Pre-commit**: Husky runs linting and formatting on staged files
- **Git Workflow**: Work on feature branches, create PRs to main

### Text Formatting Architecture

- **Separate Layer**: Formatting is stored separately from content (plain text + TextFormat array)
- **Position-based**: TextFormat uses start/end positions in the plain text
- **Toggle Logic**: Use `toggleFormat()` to apply/remove formatting
- **Selection Restoration**: Complex logic to restore selection after DOM changes from formatting
- **No Cross-Block**: Formatting currently only works within single blocks

Key files for formatting:

- `src/utils/textFormatting.ts` - Core formatting utilities
- `src/utils/formattingRenderer.tsx` - Renders formatted text
- `src/components/Editor/FormattingToolbar/` - Toolbar component
- `src/contexts/EditorContext.tsx` - TextFormat types and actions

## 🛠️ Troubleshooting

### Common Issues

- **Port already in use**: Run `yarn kill-ports`
- **Tests failing on format**: Run `yarn format`
- **TypeScript errors**: Run `yarn typecheck` then `yarn db:generate` if needed
- **Can't find a file**: Check `FILE_TREE.md`
- **Unsure what to work on**: Check `AI System Prompt Files/# Current State.md`

### Important Paths to Remember

```bash
# Current project state
cat "AI System Prompt Files/# Current State.md"

# Documentation index
cat "AI System Prompt Files/# 0. INDEX.md"

# File structure
cat FILE_TREE.md

# Test coverage status
cat "AI System Prompt Files/Test Inventory.md"
```
