# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Kairos is a creative writing and worldbuilding web application designed for novelists, writers, and D&D campaign planners. It combines block-based editing with AI-driven tools for consistency checking and writing assistance.

**Current Status**: Development phase - block-based editor with drag-and-drop functionality implemented, cross-block text selection working, comprehensive testing underway.

## Quick Navigation

- **File Structure**: See `FILE_TREE.md` for complete project file organization
- **Development Guides**: `AI System Prompt Files/` directory contains all architectural and development guides
- **Testing Progress**: `AI System Prompt Files/Testing Plan.md` tracks test implementation status

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

### Documentation (`AI System Prompt Files/`)
- **Core Docs**: Vision & Scope, User Stories, MVP, Architecture
- **Implementation Guides**: Component Structure, SCSS Structure, Testing Guide
- **Feature Guides**: Analytics, Security, Performance Optimization
- **Testing Plan**: Comprehensive test coverage tracking

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
   - Copy/paste with custom Kairos format support

### Testing Architecture

- **Unit Tests**: Component-level testing with React Testing Library
- **Integration Tests**: API endpoint testing with Supertest
- **E2E Tests**: User flow testing with Cypress
- **Mocking**: CSS modules, SVG imports, and @kairos/ui icons
- **Test Utils**: `apps/web/src/test/utils.tsx` - Helper functions for testing with contexts

### Recent Development Progress

1. **Completed Features**:
   - ✅ Block-based editor with contentEditable
   - ✅ Drag and drop reordering
   - ✅ Multi-block selection
   - ✅ Cross-block text selection
   - ✅ Copy/paste with custom format
   - ✅ PageTitle component tests (17 tests)
   - ✅ Block component tests (25 tests)

2. **In Progress**:
   - 🔄 Comprehensive test coverage for all components
   - 🔄 Bug fixes for edge cases

3. **Upcoming**:
   - 📋 BlockDragHandle component tests
   - 📋 ContentEditableContainer tests
   - 📋 EditorContent tests
   - 📋 Slash command implementation
   - 📋 Firebase integration

## Current Development Focus

1. **Testing**: Implementing comprehensive tests following Testing Plan
2. **Bug Fixes**: Resolve any remaining cross-block selection issues
3. **Slash Commands**: Implement "/" command menu for block types
4. **Firebase Integration**: Set up authentication and cloud sync
5. **Database**: Configure PostgreSQL with Prisma
6. **AI Features**: Integrate writing assistant and consistency checking

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

## Important Commands to Remember

```bash
# When you need to find files
cat FILE_TREE.md

# When tests fail due to formatting
yarn format

# When TypeScript errors occur
yarn typecheck

# To see what's been done
cat "AI System Prompt Files/Testing Plan.md"

# To understand a feature
ls "AI System Prompt Files/"
```