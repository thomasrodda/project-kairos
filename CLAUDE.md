# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Kairos is a creative writing and worldbuilding web application designed for novelists, writers, and D&D campaign planners. It combines block-based editing with AI-driven tools for consistency checking and writing assistance.

**Current Status**: Development phase - block-based editor with drag-and-drop functionality implemented, working on cross-block text selection and preparing for Firebase integration.

## Technology Stack

- **Frontend**: React 18.3 with TypeScript 5.8, Vite, Custom SCSS styling
- **Backend**: Express 5 with Vercel Serverless Functions
- **State Management**: React Context + useReducer pattern
- **Drag & Drop**: @dnd-kit library
- **Testing**: Jest + React Testing Library + Cypress
- **Monorepo**: Yarn Workspaces with 5 packages
- **Styling**: SCSS with design tokens system

## Development Commands

### Core Development

```bash
yarn dev          # Start both web (port 3000) and API (port 3001) servers
yarn build        # Build all packages for production
yarn test         # Run all tests
yarn test:watch   # Run tests in watch mode
yarn test:coverage # Generate coverage report
```

### Code Quality

```bash
yarn lint         # Run ESLint with auto-fix
yarn typecheck    # Run TypeScript type checking across all workspaces
yarn format       # Format code with Prettier
```

### E2E Testing

```bash
yarn test:e2e      # Run Cypress tests headlessly
yarn test:e2e:open # Open Cypress interactive test runner
```

### Utilities

```bash
yarn kill-ports    # Kill processes on ports 3000, 3001, 5173
yarn update-tree   # Update FILE_TREE.md
```

### Testing Individual Files

```bash
# Run specific test file
yarn test apps/web/src/components/Sidebar/Sidebar.test.tsx

# Run tests matching pattern
yarn test --testNamePattern="renders without crashing"
```

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

### Monorepo Package Structure

```
packages/
├── @kairos/ui         # Shared React components and icons
├── @kairos/utils      # Utilities (ID generation, validation with Zod)
├── @kairos/types      # TypeScript type definitions
├── @kairos/design-tokens # SCSS variables and design system
└── @kairos/database   # Prisma database layer (planned)
```

### Testing Architecture

- **Unit Tests**: Component-level testing with React Testing Library
- **Integration Tests**: API endpoint testing with Supertest
- **E2E Tests**: User flow testing with Cypress
- **Mocking**: CSS modules, SVG imports, and @kairos/ui icons

## AI System Prompts

The `AI System Prompt Files/` directory contains comprehensive development guidance. Key files:

- `# 1. Vision & Scope.md` - Project goals and target users
- `# 2. User Stories.md` - Feature requirements from user perspective
- `# 3. MVP.md` - Core features for initial release
- `# 5. Architecture.md` - Technical architecture decisions
- `Component Structure Guide.md` - React component patterns
- `Scss Structure Guide.md` - SCSS organization and BEM methodology

## Current Development Focus

1. **Bug Fixes**: Resolve cross-block text selection issues
2. **Slash Commands**: Implement "/" command menu for block types
3. **Firebase Integration**: Set up authentication and cloud sync
4. **Database**: Configure PostgreSQL with Prisma
5. **AI Features**: Integrate writing assistant and consistency checking

## Development Notes

- **WSL Users**: Vite is configured with polling for file watching
- **Port Conflicts**: Use `yarn kill-ports` if dev servers fail to start
- **SCSS Imports**: Design tokens are auto-imported globally
- **Type Safety**: Strict TypeScript mode is enabled
- **Pre-commit**: Husky runs linting and formatting on staged files
