# Project Novus - Lessons Learned & Best Practices

> A comprehensive overview of project structure, development practices, and lessons learned from building a modern creative writing application with AI-assisted development.

---

## 🎯 Project Vision & Philosophy

### Core Product Vision

Project Novus is a creative writing and worldbuilding application designed specifically for:

- **Novelists** - Managing complex narratives with 100k+ words
- **Dungeon Masters** - Organizing campaigns, NPCs, and lore
- **Screenwriters** - Structured script writing with proper formatting

### Key Differentiators

- **Purpose-Built for Creatives** - Not another general productivity tool
- **Modern Editor Experience** - Block-based with drag-and-drop, not traditional word processing
- **AI-Powered Consistency** - Future features for lore checking and narrative analysis
- **Integrated Workflow** - Seamlessly combine planning, worldbuilding, and writing

### Target User Priority

1. **Primary**: Dungeon Masters - Campaign organization and worldbuilding
2. **Secondary**: Novelists - Long-form narrative writing
3. **Tertiary**: Screenwriters - Formatted script writing

---

## 📚 Documentation-First Development

### The Documentation Hierarchy

One of the most valuable lessons learned was establishing a clear documentation hierarchy:

```
1. CLAUDE.md                 → AI's entry point (auto-read first)
2. User Stories              → CRITICAL: Defines how the app should work
3. Project Overview.md       → Product vision (updated from user stories)
4. Implementation Guides     → AI-written plans based on user stories
5. Current State.md          → Progress tracking (needs better methodology)
```

**Key Principle**: User Stories drive everything - they are written first and all other docs follow from them.

### Documentation Best Practices

#### 1. **User Stories as Source of Truth**

- Write user stories BEFORE implementation
- Use acceptance criteria with checkboxes to track progress
- Include implementation notes and known issues
- Map completed features to specific component files

Example structure:

```markdown
### 1. **Feature Name**

> User Story:
> As a [user type], I want to [action], so that [benefit].

Acceptance Criteria:

- [x] Completed criterion
- [ ] Pending criterion

Notes:

- Implementation discoveries
- Known edge cases
- Future considerations

**Components**:

- `apps/web/src/components/Feature.tsx` - Main implementation
- `apps/web/src/hooks/useFeature.ts` - Business logic
```

#### 2. **Living Documentation**

- Update documentation BEFORE committing code changes
- Keep "Current State.md" as single source of truth for progress
- Document known issues immediately when discovered
- Use dated entries for significant changes

#### 3. **Templates for Consistency**

Create templates for:

- Feature documentation
- Component documentation
- API endpoint documentation
- Testing documentation

#### 4. **Enhanced Documentation Practices**

**Bug Tracking Format**:

```markdown
### #001 - Editor loses focus on paste

**Severity**: High | **Status**: Open | **Opened**: 2025-01-28
**Description**: When pasting, the editor loses focus
**Reproduction**: 1. Copy text 2. Click outside 3. Paste
**Attempted fixes**: [what you tried]
```

**Progress Tracking Tables**:

```markdown
## Feature: Editor

**Overall**: 35% complete

| Component    | Status  | Notes        |
| ------------ | ------- | ------------ |
| Basic typing | ✅ 100% | Working      |
| Copy/paste   | ⚠️ 80%  | Focus issues |
| Drag & drop  | ✅ 100% | Complete     |
```

**File Header Standards**:

```typescript
/**
 * Editor.tsx
 * Main editor component for block-based editing
 *
 * Features:
 * - Block management
 * - Drag and drop
 * - Markdown shortcuts
 */
```

**Code Comment Standards**:

```typescript
// Section: State Management
const [blocks, setBlocks] = useState([])

// TODO: Implement undo/redo (Issue #123)
// FIXME: Focus lost on paste (Bug #001)
// NOTE: Using HTML contentEditable for flexibility
```

---

## 🏗️ Project Structure Best Practices

### Monorepo Architecture

The monorepo structure proved invaluable for code organization:

```
project-root/
├── apps/
│   ├── web/          # Frontend React application
│   └── api/          # Backend serverless functions
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # TypeScript type definitions
│   ├── database/     # Prisma schema and migrations
│   └── design-tokens/# SCSS design system
└── AI System Prompt Files/  # All documentation
```

### Feature-Based Organization

Within the web app, organize by features rather than file types:

```
apps/web/src/components/
├── Editor/           # All editor-related components
│   ├── Block/
│   ├── SlashMenu/
│   └── Editor.tsx
├── Sidebar/          # Sidebar feature
└── Workspace/        # Workspace management
```

### Key Insights:

- **Colocate related files** - Keep tests, styles, and components together
- **Share through packages** - Use monorepo packages for cross-app sharing
- **Feature folders** - Group by feature, not by file type

---

## 🚀 Development Workflow

### Simplified Development Framework

For a 1 human + 1 AI team, a streamlined approach:

1. **Define** - Write user stories together
2. **Design** - Discuss architecture and approach
3. **Build** - Implement incrementally with continuous testing
4. **Review** - Regular progress check-ins and refinements

This maintains the rigor of planning while being more agile and appropriate for a small team.

### Command-Line Focused Development

Essential commands organized by purpose:

```bash
# Development
yarn dev                  # Start all services
yarn workspace @kairos/web dev  # Frontend only

# Quality Checks (run before committing)
yarn lint                 # Fix linting issues
yarn typecheck           # Check TypeScript
yarn test                # Run tests
yarn format              # Format code

# Database
yarn db:generate         # Update Prisma types
yarn db:migrate          # Run migrations
```

### Git Workflow

- **Branch Strategy**: `main` → `dev` → `feature/*`
- **Commit Messages**: `type: description` (feat, fix, docs, chore)
- **Documentation First**: Update docs before committing code
- **Self-Review**: Review your own PRs before merging

---

## 🤖 AI Collaboration Best Practices

### Effective Communication Patterns

#### 1. **Streamlined CLAUDE.md Structure**

Keep CLAUDE.md focused and navigational:

```markdown
# CLAUDE.md

Current Date: [Auto-updated daily]

## 🚨 Critical Instructions

- Think step by step
- Use Task tool for complex searches or multi-file operations
- Send notifications: scripts/notify.sh complete/question
- Update docs BEFORE committing code

## 📍 Documentation Navigation

### Common Requests → Actions:

- "What are we working on?" → Read Current State.md THEN User Stories
- "Write a test" → Testing Guide.md then write alongside implementation
- "How does X work?" → 03-Features/[X]/User Stories - [X].md
- "X is broken!" → Check User Stories (Notes section), then Troubleshooting

### Quick Decision Guide:

- User Stories → AI System Prompt Files/03-Features/\*/
- Commands → Quick Commands.md
- Project structure → FILE_TREE.md
- Known issues → Current State.md

## 📂 Key Documents

- Project Overview.md - Product vision
- Current State.md - Progress & issues
- User Stories Guide.md - How to read/write stories
- INDEX.md - Complete doc directory
```

#### 2. **Clear Request Structure**

```
Feature Request: [What you want]
Location: [Where it belongs]
Behavior: [How it should work]
Reference: [Similar examples]
```

#### 3. **Documentation Navigation Workflow**

The key insight: **Always check User Stories FIRST** because they contain:

- ✅ Detailed acceptance criteria with completion status
- ✅ Known bugs and edge cases in Notes sections
- ✅ Exact component locations and implementations
- ✅ More detail than Current State.md

Navigation flow:

```
1. Start → Project Overview.md (understand product)
2. Find Feature → AI System Prompt Files/03-Features/[Feature]/
3. Read Requirements → User Stories - [Feature].md
4. Check Implementation → Guides in same folder
```

### AI Enhancement Features

#### Notification System

```bash
# Task completed - plays sound/notification
"/path/to/scripts/notify.sh" complete

# User input needed - different alert
"/path/to/scripts/notify.sh" question
```

#### Date Automation

- Script updates Current Date in CLAUDE.md daily
- Prevents AI from using training data dates
- Critical for accurate documentation timestamps

#### Task Tool Usage

- Use for complex searches across multiple files
- Use for reducing context window usage
- Use when implementing features that touch many components

---

## 🎨 Technical Architecture Decisions

### Frontend Architecture

#### HTML-First Editor Architecture

- **Philosophy**: HTML as the native language, not a translation target
- **Goal**: Achieve Notion-like seamless copy/paste and export experience
- **Why**: True web-native editor that speaks the web's lingua franca
- **Benefits**:
  - Natural interoperability with all web platforms
  - No "translation tax" between formats
  - Mobile-ready without special handling
  - Future-proof (HTML will outlive proprietary formats)
  - Templates, sharing, and collaboration all HTML-based
  - **Markdown support**: Clean export to Markdown for Obsidian/other tools
  - **Markdown shortcuts**: Type `# Heading` to create formatted blocks
- **Key Insight**: HTML preserves structure better than JSON, making Markdown export more reliable

#### Multiple Editor Modes (Future Consideration)

- **Block Mode**: Current Notion-like experience for worldbuilding and structured documents
- **Prose Mode**: Traditional writing experience with paragraph indents for novelists
- **Script Mode**: Specialized formatting for screenwriters
- **Note**: This is a significant architectural consideration that needs further discussion

#### SCSS over Tailwind

- **Why**: Better component encapsulation, powerful mixins
- **How**: Design tokens + BEM methodology
- **Benefits**: Maintainable, themeable, clear structure

### Design System

#### Numeric Spacing Tokens

```scss
--spacing-8   // 8px - More intuitive than "sm"
--spacing-16  // 16px - Clear pixel values
--spacing-24  // 24px - No ambiguity
```

#### Component vs Custom Styles

- **Components**: For reusable patterns (buttons, cards)
- **Custom**: For unique, one-off implementations
- **Rule**: If used 3+ times, make it a component

### Backend Architecture

- **Serverless Functions**: Simple deployment, automatic scaling
- **PostgreSQL + Prisma**: Type-safe database access
- **Firebase Auth**: Mature authentication solution

---

## 🧪 Testing Philosophy

### Modern Testing Approach (2025)

Key principles:

1. **Test user behavior, not implementation**
2. **Write tests alongside code, not strictly before (TDD optional)**
3. **Every test must prevent a real bug**
4. **Tests should match user stories**
5. **Never change tests to make them pass - fix the code**

### User Story Driven Testing

````markdown
User Story: As a writer, I want to type # Heading to create a heading block

Test:

```typescript
test('user can create heading with markdown shortcut', async () => {
  // User types in editor
  await user.type(editor, '# My Title')
  await user.keyboard(' ') // space triggers conversion

  // User sees heading - this is what matters!
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Title')
})
```
````

### Test Structure Pattern

```typescript
describe('Component', () => {
  describe('✅ Core Functionality', () => {})
  describe('✅ User Interactions', () => {})
  describe('✅ Error Handling', () => {})
  describe('✅ Accessibility', () => {})
})
```

### What NOT to Test

- Component renders without crashing
- Props are passed correctly
- State updates correctly
- CSS classes
- Over-mocked implementations
- React's built-in functionality

### CI/CD Integration

Set up GitHub Actions to automatically:

- Run tests on every push
- Check TypeScript types
- Run linter
- Block merging if any check fails

This catches problems early and maintains code quality.

---

## 📋 Project Management Insights

### Status Tracking

Use clear status indicators throughout documentation:

- **Status**: Not Started | In Progress | Complete
- **Priority**: High | Medium | Low
- **Complexity**: Low | Medium | High | Very High

### Feature Completion Tracking

Track completion honestly, accounting for bugs:

- Editor: ~35% (many features have bugs)
- Page Management: ~50% (basic features work)
- Workspace: ~25% (minimal functionality)
- Authentication: ~70% (mostly complete)

### Known Issues Documentation

Always document issues immediately:

```markdown
**Known Issues**:

- 🐛 Issue description
- 🐛 Another issue
- ✅ FIXED (Date): Previously broken feature
```

---

## 🔧 Development Environment

### Essential Setup

1. **Node.js 22+** - Latest LTS for modern features
2. **Yarn 4.x** - Modern package manager with PnP support
3. **PostgreSQL** - Local or cloud database
4. **WSL2** (Windows) - Better development experience

### Environment Variables

Organize clearly:

```bash
# Database
DATABASE_URL="postgresql://..."

# Firebase (prefix with VITE_ for frontend)
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_PROJECT_ID="..."
```

### Troubleshooting Patterns

Common issues and solutions documented:

- Port conflicts → `yarn kill-ports`
- Type errors → `yarn db:generate`
- Module not found → `yarn build`
- Complete reset → Remove node_modules and reinstall

---

## 🚦 Quality Standards

### Code Quality Checklist

Before committing:

- [ ] Lint passes (`yarn lint`)
- [ ] Types check (`yarn typecheck`)
- [ ] Tests pass (`yarn test`)
- [ ] Documentation updated
- [ ] Known issues documented

### Performance Considerations

- React.memo for expensive components
- Debounced autosave
- Virtualization for long lists
- Code splitting for features

### Accessibility Standards

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus management

---

## 💡 Key Lessons for Future Projects

### 1. **Documentation as Development Tool**

- Write user stories first
- Document as you go, not after
- Keep a living "Current State" document
- Use templates for consistency

### 2. **Structure for Scale**

- Start with monorepo
- Organize by features
- Share through packages
- Colocate related files

### 3. **AI Collaboration Optimization**

- Clear command structure in CLAUDE.md
- Consistent file paths and naming
- Documentation navigation patterns
- Status tracking in documentation

### 4. **Testing for Confidence**

- Test behaviors users care about
- Prefer integration over unit tests
- Document what each test prevents
- Quality over coverage metrics

### 5. **Design System First**

- Numeric tokens over abstract names
- Component library for common patterns
- Custom styles for unique features
- BEM methodology for maintainability

### 6. **Workflow Automation**

- Pre-commit hooks for quality
- Scripts for common tasks
- Clear command documentation
- Notification system for long tasks

---

## 🎯 Starting Fresh Checklist

If starting this project again, follow these phases:

### Phase 1: Foundation

1. [ ] Write initial Project Overview for AI context
2. [ ] Set up CLAUDE.md with core navigation patterns
3. [ ] Create monorepo structure
4. [ ] Write User Stories for core features
5. [ ] Refine Project Overview based on User Stories
6. [ ] Discuss and implement design token system

### Phase 2: Technical Setup

- [ ] Confirm technology choices (React, PostgreSQL, Firebase, Vercel)
- [ ] Set up testing framework with user story focus
- [ ] Configure linting, formatting, and TypeScript
- [ ] Set up Git workflows and branch strategy
- [ ] Implement CI/CD pipeline with automated checks

### Phase 3: Core Development

- [ ] Create Current State.md for progress tracking
- [ ] Implement features following User Stories
- [ ] Write tests alongside implementation
- [ ] Update documentation before committing
- [ ] Track bugs with structured format

### Ongoing Best Practices

- [ ] User Stories drive all development
- [ ] Documentation updated before code commits
- [ ] Tests match user story acceptance criteria
- [ ] Regular architecture discussions
- [ ] Continuous refinement of CLAUDE.md

---

## 📚 Resource Organization

### Documentation Structure

```
AI System Prompt Files/
├── 01-Core/           # Vision, status, guides
├── 02-Architecture/   # Technical decisions
├── 03-Features/       # User stories by feature
├── 04-Testing/        # Testing strategy
├── 05-Styling/        # Design system
├── 06-DevOps/         # Development operations
├── 07-Operations/     # Production concerns
└── templates/         # Documentation templates
```

### Quick References

- **Development**: Quick Commands.md
- **Troubleshooting**: Troubleshooting Guide.md
- **Project Status**: Current State.md
- **Documentation Index**: INDEX.md

---

## 🏁 Conclusion

The key to successful AI-assisted development is:

1. **Clear documentation** that serves as the source of truth
2. **Structured organization** that scales with the project
3. **Consistent patterns** that both humans and AI can follow
4. **Living documentation** that evolves with the code
5. **Quality over speed** in both code and testing

This project demonstrated that with proper structure and documentation, AI can be an incredibly effective development partner, handling implementation while humans focus on vision and user experience.

---

_This document represents the culmination of lessons learned from the original project. Use it as a foundation for Project Novus to start with best practices from day one._
