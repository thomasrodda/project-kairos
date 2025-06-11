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

## 🚀 Quick Start

### Current Focus

**Testing**: Completing component tests for ContentEditableContainer, EditorContent, and Editor integration

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

**Current Status**: Block editor with drag-and-drop implemented, cross-block selection working, component testing in progress.

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
- **[Testing Guide.md](AI System Prompt Files/Testing Guide.md)** - Test patterns
- **[Editor Testing Plan.md](AI System Prompt Files/Editor Testing Plan.md)** - Editor test coverage
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
  - `Editor/` - Block editor components (Block, PageTitle, EditorContent, ContentEditableContainer)
  - `Sidebar/` - Navigation sidebar
  - `Workspace/` - Main layout wrapper
- **State Management**: `src/contexts/EditorContext.tsx` - Central editor state
- **Hooks**: `src/hooks/` - Custom React hooks (useCrossBlockSelection, useDismiss)
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
   - Manages blocks, selection, focus, and cross-block text selection
   - Actions: ADD_BLOCK, UPDATE_BLOCK, DELETE_BLOCK, MOVE_BLOCK, etc.

2. **Component Hierarchy**:

   ```
   Editor
   ├── PageTitle
   └── EditorContent (single contentEditable div)
       └── DraggableBlock[] (drag wrapper)
           └── Block (renders content based on type)
               └── BlockDragHandle (selection/drag UI)
   ```

3. **Block Types**: `h1`, `h2`, `h3`, `paragraph`, `bullet`

4. **Key Features**:
   - Drag-and-drop block reordering
   - Multi-block selection (Shift+click, Ctrl/Cmd+click)
   - Cross-block text selection (custom implementation)
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

- ✅ Editor foundation complete (drag/drop, selection, copy/paste)
- ✅ Test coverage: PageTitle (17), Block (25), BlockDragHandle (25)
- 🔄 In Progress: Component tests for ContentEditableContainer, EditorContent
- 📋 Next: Slash commands, formatting toolbar, Firebase auth

## Development Best Practices

### When Making Changes

1. **Check FILE_TREE.md** to understand file locations
2. **Read relevant guides** in `AI System Prompt Files/`
3. **Follow existing patterns** - check similar components/files
4. **Write tests** - colocate with components, use Testing Guide format
5. **Update documentation** - keep CLAUDE.md and Testing Plan current

### Testing Guidelines

- Use checkmark headings format (✅ Core Functionality)
- Test user behavior, not implementation details
- Include edge cases and error scenarios
- Mock external dependencies appropriately
- Run `yarn test` before committing

### Code Style

- TypeScript strict mode enforced
- SCSS with BEM methodology
- Design tokens for consistency
- No inline styles unless dynamic
- Meaningful component and variable names

## Development Notes

- **WSL Users**: Vite is configured with polling for file watching
- **Port Conflicts**: Use `yarn kill-ports` if dev servers fail to start
- **SCSS Imports**: Design tokens are auto-imported globally
- **Type Safety**: Strict TypeScript mode is enabled
- **Pre-commit**: Husky runs linting and formatting on staged files
- **Git Workflow**: Work on feature branches, create PRs to main

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
cat "AI System Prompt Files/Editor Testing Plan.md"
```
