# Quick Commands Reference

> All essential commands for Project Kairos development in one place.

## 🚀 Development

```bash
# Start development servers
yarn dev                    # Both web (3000) and API (3001)
yarn workspace @kairos/web dev    # Frontend only
yarn workspace @kairos/api dev    # Backend only

# Build for production
yarn build                  # All packages
yarn workspace @kairos/web build  # Frontend only
```

## 🧪 Testing

```bash
# Run tests
yarn test                   # All tests
yarn test:watch            # Watch mode
yarn test:coverage         # With coverage report

# Test specific files
yarn test apps/web/src/components/Editor/Editor.test.tsx
yarn test --testNamePattern="renders without crashing"

# E2E tests
yarn test:e2e              # Headless
yarn test:e2e:open         # Interactive
```

## 🔧 Code Quality

```bash
# Linting & formatting
yarn lint                  # Auto-fix issues
yarn lint:check           # Check only
yarn format               # Prettier formatting

# Type checking
yarn typecheck            # All workspaces
yarn workspace @kairos/web typecheck  # Specific workspace
```

## 💾 Database

```bash
# Prisma commands
yarn db:generate          # Generate client
yarn db:migrate           # Run migrations
yarn db:seed              # Seed data
yarn db:studio            # Visual browser
yarn db:reset             # Reset database (⚠️)
```

## 🛠️ Utilities

```bash
# Project maintenance
yarn kill-ports           # Kill 3000, 3001, 5173
yarn update-tree          # Update FILE_TREE.md
yarn setup                # Initial project setup
yarn clean                # Remove node_modules

# Git hooks
yarn husky                # Install git hooks
```

## 📦 Workspace Commands

```bash
# Run command in specific workspace
yarn workspace @kairos/web [command]
yarn workspace @kairos/api [command]
yarn workspace @kairos/ui [command]
yarn workspace @kairos/utils [command]
yarn workspace @kairos/types [command]
yarn workspace @kairos/database [command]
yarn workspace @kairos/design-tokens [command]

# Examples
yarn workspace @kairos/web add react-router-dom
yarn workspace @kairos/api test
```

## 🔍 Information Commands

```bash
# View documentation
cat "AI System Prompt Files/01-Core/Current State.md"  # Current status
cat "AI System Prompt Files/01-Core/INDEX.md"          # Doc index
cat FILE_TREE.md                                       # File structure
cat "AI System Prompt Files/04-Testing/Test Inventory.md" # Test status

# Check environment
node --version            # Should be 22+
yarn --version           # Should be 1.22+
git status               # Current branch
```

## ⚡ Quick Fixes

```bash
# Common issues
yarn kill-ports          # Port already in use
yarn format              # Fix formatting
yarn typecheck           # Check types
yarn db:generate         # Update Prisma types

# Fresh start
rm -rf node_modules yarn.lock && yarn install
```

## 🚦 Pre-commit Checklist

```bash
# Before committing, run:
yarn lint
yarn typecheck
yarn test
yarn format
```

## 📝 Environment Setup

```bash
# Copy environment file
cp .env.example .env.local

# Required variables
DATABASE_URL="postgresql://..."
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_PROJECT_ID="..."
```

---

_Pro tip: Create aliases in your shell config for frequently used commands:_

```bash
alias yd='yarn dev'
alias yt='yarn test'
alias yl='yarn lint'
```
