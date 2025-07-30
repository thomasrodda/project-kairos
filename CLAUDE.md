Current Date: 30/07/2025

# CLAUDE.md

This file provides essential guidance to Claude Code when working with Project Kairos. For detailed information, follow the documentation workflow below.

## 📅 CRITICAL: USE CORRECT DATE IN DOCUMENTATION

- ❌ DO NOT use "January 2025" or other training data dates
- ✅ ALWAYS use the "Current Date" shown at the top of this file (line 1)
- ✅ CHECK line 1 of this file before any documentation updates
- 📝 The date is automatically updated by a script

## 🚨 CRITICAL: ALWAYS READ USER STORIES FIRST 🚨

**BEFORE answering questions about features, progress, or "what are we working on":**

1. ✅ ALWAYS read the relevant `User Stories - [Feature].md` file
2. ✅ Check the Current State.md and recent git commits

## 🚨 MANDATORY: NOTIFICATION SYSTEM 🚨

**CRITICAL**: You MUST send notifications for ALL task completions and user input requests.

### Task Completion: `"/mnt/c/Users/thoma/Project Kairos/scripts/notify.sh" complete`

### User Input Request: `"/mnt/c/Users/thoma/Project Kairos/scripts/notify.sh" question`

Examples:

- After any task: `notify.sh complete`
- Before asking questions: `notify.sh question`
- Fallback if script fails: `echo -e "\a"`

## 📝 MANDATORY: Documentation Updates Before Commits

When committing, you MUST FIRST:

1. Review all changes made
2. Update relevant documentation:
   - **Current State.md** - Update feature status, known issues, and priorities
   - **User Stories - [Feature].md** - Update acceptance criteria checkboxes and implementation notes
   - **Test Inventory.md** - Update if new tests were added
   - Other relevant guides and documentation
3. Verify documentation accuracy
4. Only then commit and push

### When Implementing Features:

- Find the relevant User Story in `AI System Prompt Files/03-Features/[Feature]/User Stories - [Feature].md`
- Update acceptance criteria checkboxes to reflect what's completed
- Add implementation notes with dates and any known issues
- Update component references with specific line numbers when helpful

### Documentation Templates

When creating new documentation, use these templates for consistency:

- **Feature Documentation**: `AI System Prompt Files/templates/FEATURE_TEMPLATE.md`
- **Component Documentation**: `AI System Prompt Files/templates/COMPONENT_TEMPLATE.md`
- **API Documentation**: `AI System Prompt Files/templates/API_ENDPOINT_TEMPLATE.md`
- **Standards Guide**: `AI System Prompt Files/templates/DOCUMENTATION_STANDARDS.md`

## 📍 Project Overview

Project Kairos is a creative writing and worldbuilding web application for novelists and D&D campaign planners. It features a block-based editor with drag-and-drop, text formatting, and AI-driven writing assistance.

**Current Focus**: Documentation Review.

## 🗺️ Documentation Navigation Workflow

### 🛑 STOP: ALWAYS CHECK USER STORIES FIRST 🛑

**BEFORE answering ANY of these questions, you MUST read User Stories:**

- "What are we working on?" → Read Current State.md THEN the relevant User Stories
- "What's the status of [feature]?" → Read User Stories - [Feature].md
- "How's [feature] going?" → Read User Stories - [Feature].md
- "What should I work on?" → Read Current State.md THEN the relevant User Stories
- ANY question about features, progress, or implementation → Check User Stories FIRST

**Why? User Stories contain:**

- ✅ Detailed acceptance criteria with checkboxes showing what's done
- ✅ Known issues and bugs in the Notes sections
- ✅ Exact component locations and line numbers
- ✅ Implementation status that's more detailed than Current State.md

**Example: "How's the copy/paste work going?"**

- ❌ DON'T: Look at git commits or guess based on branch name
- ❌ DON'T: Only read Current State.md
- ✅ DO: Read `Editor/User Stories - Editor.md` and find the "Copy/Paste support" section

### How to Navigate Documentation:

```
1. Start Here → Project Overview.md (understand the product)
2. Find Feature → AI System Prompt Files/03-Features/[FeatureCategory]/
3. Read Requirements → User Stories - [Feature].md
4. Check Implementation → Relevant implementation guides in the folder
```

### Examples:

- **Working on editor?** → `03-Features/Editor/User Stories - Editor.md`
- **Need page management?** → `03-Features/PageManagement/User Stories - Page Management.md`
- **Authentication work?** → `03-Features/Authentication/User Stories - Authentication.md`

### Quick Decision Guide:

- **"What are we working on?"** → Check Current State.md AND User Stories - [Feature].md
- **"What should I work on?"** → Check Current State.md THEN relevant User Stories
- **"How does X feature work?"** → Check feature folder → User Stories
- **"Where is X located?"** → Check FILE_TREE.md
- **"How do I run X?"** → Check Quick Commands.md
- **"X is broken!"** → Check User Stories first (Notes section), then Troubleshooting Guide.md

## 🚀 Essential Commands

```bash
yarn dev          # Start development (web:3000, api:3001)
yarn test         # Run all tests
yarn lint         # Fix linting issues
yarn typecheck    # Check TypeScript types
```

📋 **Full reference**: [Quick Commands.md](AI System Prompt Files/06-DevOps/Quick Commands.md)

## 📂 Key Documents

- **[Project Overview.md](AI System Prompt Files/01-Core/Project Overview.md)** - Product vision and scope
- **[Current State.md](AI System Prompt Files/01-Core/Current State.md)** - What's built, issues, next steps
- **[User Stories Guide.md](AI System Prompt Files/01-Core/User Stories Guide.md)** - How to read/write user stories
- **[INDEX.md](AI System Prompt Files/01-Core/INDEX.md)** - Complete documentation directory
- **[FILE_TREE.md](FILE_TREE.md)** - Project structure

## 🔧 Key Locations

### Application Code: `apps/web/src/`

- `components/` - React components by feature (Editor/, Sidebar/, Workspace/)
- `contexts/EditorContext.tsx` - Central editor state
- `hooks/` - Custom React hooks
- `utils/` - Helper functions

### Packages: `packages/`

- `@kairos/ui` - Shared components
- `@kairos/types` - TypeScript types
- `@kairos/design-tokens` - SCSS variables

## ⚡ Development Workflow

1. **Before implementing**: Check feature's User Stories document
2. **Follow patterns**: Look at similar existing code
3. **Write tests**: Colocate with components
4. **Update docs**: Keep documentation current
5. **Run checks**: `yarn test` and `yarn lint` before committing

## 🎨 Quick Style Reference

Use numeric spacing tokens:

```scss
--spacing-4   // 4px
--spacing-8   // 8px
--spacing-16  // 16px (default)
--spacing-24  // 24px
--spacing-32  // 32px
```

📋 **Full guide**: [Styling Guide.md](AI System Prompt Files/05-Styling/Styling Guide.md)

## 🔗 Detailed Guides

- **Setup**: [Environment Setup Guide.md](AI System Prompt Files/06-DevOps/Environment Setup Guide.md)
- **Architecture**: [Architecture.md](AI System Prompt Files/02-Architecture/Architecture.md)
- **Testing**: [Testing Guide.md](AI System Prompt Files/04-Testing/Testing Guide.md)
- **Components**: [Component Structure Guide.md](AI System Prompt Files/03-Features/Component Structure Guide.md)

## 💡 Important Notes

- **WSL Users**: Vite uses polling for file watching
- **Port Conflicts**: Run `yarn kill-ports`
- **TypeScript Strict**: Always enabled
- **Feature Folders**: All feature docs in `AI System Prompt Files/03-Features/[Feature]/`

## 🛠️ Common Tasks

```bash
# Check current state
cat "AI System Prompt Files/01-Core/Current State.md"

# Find feature docs
ls "AI System Prompt Files/03-Features/"

# View file structure
cat FILE_TREE.md
```
