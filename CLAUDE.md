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

## 📝 MANDATORY: Documentation Updates Before Commits

**CRITICAL**: When the user asks you to commit and push changes, you MUST FIRST:

1. **Review all changes made** - List what files were modified/created
2. **Update relevant documentation**:
   - Update `Current State.md` if features were added/completed
   - Update `Test Inventory.md` if tests were added/modified
   - Update relevant guides if implementation patterns changed
   - Update `CLAUDE.md` if new patterns or practices were established
   - Update component-specific documentation if components were modified
3. **Verify documentation accuracy**:
   - Ensure file paths in docs match actual structure
   - Update any code examples to reflect current implementation
   - Check that all cross-references between docs are valid
4. **Only then proceed with commit and push**

Example workflow:

```bash
# User: "Please commit and push these changes"
# You: "Let me first update the documentation to reflect these changes..."
# [Update relevant docs]
# [Then commit with descriptive message]
# [Then push]
```

This ensures documentation stays synchronized with code changes and prevents drift between implementation and documentation.

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

📋 **Full command reference**: [Quick Commands.md](AI System Prompt Files/06-DevOps/Quick Commands.md)

## 📍 Project Overview

Project Kairos is a creative writing and worldbuilding web application designed for novelists, writers, and D&D campaign planners. It combines block-based editing with AI-driven tools for consistency checking and writing assistance.

**Current Status**: Block editor fully functional with drag-and-drop, cross-block selection, slash commands, text formatting (bold, italic, underline, links), keyboard shortcuts (Ctrl/Cmd+B/I/U/K), inline markdown auto-conversion, and block-level markdown (# for H1, ## for H2, - for bullets). Database migration Phase 1 complete with auto-save working for text editing, block reordering, and block deletion (fixed January 17, 2025).

## 🗺️ Document Navigation

### Essential Documents (Check These First)

- **[INDEX.md](AI System Prompt Files/01-Core/INDEX.md)** - Helps you navigate Project Kairos documentation efficiently
- **[Current State.md](AI System Prompt Files/01-Core/Current State.md)** - What's built, in progress, known issues
- **[FILE_TREE.md](FILE_TREE.md)** - Complete project structure
- **[Quick Commands.md](AI System Prompt Files/06-DevOps/Quick Commands.md)** - All commands reference
- **[Troubleshooting Guide.md](AI System Prompt Files/06-DevOps/Troubleshooting Guide.md)** - Common fixes

### Core Project Documents

- **[Vision & Scope.md](AI System Prompt Files/01-Core/Vision & Scope.md)** - Product vision, terminology
- **[User Stories.md](AI System Prompt Files/01-Core/User Stories.md)** - Feature requirements
- **[MVP.md](AI System Prompt Files/01-Core/MVP.md)** - MVP scope and phases
- **[Architecture.md](AI System Prompt Files/02-Architecture/Architecture.md)** - System design
- **[Development Plan.md](AI System Prompt Files/01-Core/Development Plan.md)** - Feature roadmap

### Implementation Guides

- **[Component Structure Guide.md](AI System Prompt Files/03-Features/Component Structure Guide.md)** - React patterns
- **[Testing Guide.md](AI System Prompt Files/04-Testing/Testing Guide.md)** - Comprehensive testing strategy and patterns
- **[Test Inventory.md](AI System Prompt Files/04-Testing/Test Inventory.md)** - Current test status and quality tracking
- **[Text Formatting Plan.md](AI System Prompt Files/03-Features/Text Formatting Plan.md)** - Rich text implementation
- **[Backend Api Guide.md](AI System Prompt Files/02-Architecture/Backend Api Guide.md)** - API design
- **[Data Model Guide.md](AI System Prompt Files/02-Architecture/Data Model Guide.md)** - Database schema

### Quick Decision Guide

- **"What should I work on?"** → Check Current State.md
- **"How do I implement X?"** → Check User Stories + relevant Guide
- **"Where is X located?"** → Check FILE_TREE.md
- **"How do I run X?"** → Check Quick Commands.md
- **"X is broken!"** → Check Troubleshooting Guide.md
- **"What's the full doc list?"** → See [INDEX.md](AI System Prompt Files/01-Core/INDEX.md)

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

📋 **Detailed setup**: [Environment Setup Guide.md](AI System Prompt Files/06-DevOps/Environment Setup Guide.md)

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

For detailed status, see [Current State.md](AI System Prompt Files/01-Core/Current State.md)

**Quick Summary**:

- ✅ Editor foundation complete (drag/drop, selection, copy/paste, slash commands)
- ✅ Text formatting complete (bold, italic, underline, links via toolbar or keyboard shortcuts)
- ✅ Test coverage: 300+ tests passing across all components
- ✅ Block-level markdown complete (# to H1, ## to H2, - to bullets)
- ✅ Database migration Phase 1 complete (local PostgreSQL)
- ✅ Auto-save working for text editing, block reordering, and block deletion
- ✅ Block deletion persistence fixed (January 17, 2025)
- 📋 Next: Page creation bugs, component library, style guide enhancements

## Development Best Practices

### When Making Changes

1. **Check FILE_TREE.md** to understand file locations
2. **Read relevant guides** in `AI System Prompt Files/`
3. **Follow existing patterns** - check similar components/files
4. **Write tests** - colocate with components, use Testing Guide format
5. **Update documentation** - keep CLAUDE.md and Testing Plan current

### Testing Guidelines

See [Testing Guide.md](AI System Prompt Files/04-Testing/Testing Guide.md) for comprehensive testing strategy and patterns.

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

**For all styling questions, refer to the [Styling Guide.md](AI System Prompt Files/05-Styling/Styling Guide.md)**

Key points:

- Use **numeric spacing tokens** (e.g., `var(--spacing-16)`) - they're clearer than semantic names
- Use design tokens for colors, shadows, radii, z-indexes, etc.
- Check the Styling Guide for component patterns and when to create reusable components vs custom styles
- Run `yarn lint:styles` to validate your styles

Quick reference for spacing:

```scss
--spacing-4   // 4px  - minimal
--spacing-8   // 8px  - tight
--spacing-16  // 16px - default ⭐
--spacing-24  // 24px - comfortable
--spacing-32  // 32px - spacious
```

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
- **Unsure what to work on**: Check `AI System Prompt Files/01-Core/Current State.md`

### Important Paths to Remember

```bash
# Current project state
cat "AI System Prompt Files/01-Core/Current State.md"

# Documentation index
cat "AI System Prompt Files/01-Core/INDEX.md"

# File structure
cat FILE_TREE.md

# Test coverage status
cat "AI System Prompt Files/04-Testing/Test Inventory.md"
```
