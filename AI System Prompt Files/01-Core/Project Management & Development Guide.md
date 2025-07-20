# Project Management & Development Guide

> **Unified guide for Project Kairos development workflow, roles, and communication standards.**

---

## 🎯 Project Vision & Scope

> **For complete project vision, features, and technical details, see [Project Overview.md](Project Overview.md)**

This guide focuses on development workflow, roles, and processes.

---

## 👥 Roles & Responsibilities

### Human (Designer/Product Owner)

- **Product Vision**: Define features, user experience, and design direction
- **Feedback & Direction**: Review implementations and provide guidance
- **SCSS Contribution**: Provide styling input when needed
- **No Coding Required**: Focus on vision while assistant handles all implementation

### AI Assistant (Engineering Partner)

- **Full Development**: Write all code (frontend, backend, infrastructure)
- **Best Practices**: Establish and enforce modern coding standards
- **Quality Assurance**: Set up testing, CI/CD, and deployment pipelines
- **Documentation**: Maintain guides and explain technical decisions
- **Structured Process**: Follow the 7-phase development framework

---

## 🛠️ Development Framework (7 Phases)

### Phase 1: Vision & Scope ✅ **COMPLETE**

- Define app concept, core features, and target users
- Establish terminology and MVP boundaries
- Document success criteria and quality goals

### Phase 2: User Stories ✅ **COMPLETE**

- Translate features into detailed user stories with acceptance criteria
- Organize by feature category with complexity estimates
- Align stories with MVP scope and development phases

### Phase 3: MVP Definition ✅ **COMPLETE**

- Finalize essential features and deliverables checklist
- Define development phase order and rough timeline
- Establish success criteria for launch readiness

### Phase 4: Architecture & Setup ✅ **COMPLETE**

- Finalize tech stack and monorepo structure
- Set up development environment, tooling, and CI/CD
- Create foundational components and design system

### Phase 5: Development 🔄 **IN PROGRESS**

- Implement MVP features incrementally with testing
- Conduct code reviews and maintain documentation
- Follow component structure and performance guidelines

### Phase 6: Testing & Deployment 📋 **PLANNED**

- Write end-to-end tests and integrate into CI pipeline
- Configure staging and production deployments
- Set up monitoring, error tracking, and backups

### Phase 7: Maintenance & Iteration 📋 **PLANNED**

- Establish bug triage and feature request processes
- Plan recurring roadmap reviews and user feedback cycles
- Iterate based on usage data and user needs

---

## 💬 Communication & Prompting Guide

### How to Request Features

**Structure your requests clearly:**

```
Feature Request: [Brief description]
Location: [Where it belongs in the app]
Behavior: [How it should work]
Reference: [Similar to existing app, if helpful]
```

**Example:**

```
Feature Request: Add formatting toolbar
Location: When text is highlighted in the editor
Behavior: Show floating toolbar with bold/italic/link options
Reference: Similar to Notion's floating toolbar
```

### How to Request Changes or Fixes

**Be specific about issues:**

- Point out the **specific problem**
- Mention the **file or component** (if known)
- Suggest a **preferred outcome**

**Example:**

```
The floating toolbar appears too far from selected text.
Can we adjust its position to sit directly above the selection?
```

### How to Request New Components

**Describe purpose and context:**

- Component purpose and where it lives
- How it's triggered or used
- Expected props or configuration options

**Example:**

```
Component Request: SlashMenu
Use: Change block type via slash command
Trigger: Typing '/' in an empty block
Options: Heading 1, Heading 2, Paragraph, Bullet List
```

### Describing Styles

**Use everyday language:**

- "Make this sidebar look more modern"
- "Use a light theme with dark text"
- "Can this button be more compact and centered?"

### Communication Best Practices

- **Be clear** about the purpose of requests
- **Include context** if it relates to specific workflows
- **Ask questions** anytime—assistant will guide you through options
- **Reference visuals** or link examples when helpful

---

## 📋 Quality Standards & Best Practices

### Code Quality

- **TypeScript strict mode** across all packages
- **ESLint + Prettier** for consistent formatting
- **Component structure** following established conventions
- **Performance optimization** with React best practices

### Testing Strategy

- **Unit tests** for components and utilities (Jest)
- **Integration tests** for user workflows (Cypress)
- **Accessibility testing** with screen readers
- **Performance monitoring** for Core Web Vitals

### Documentation Requirements

- **Component props** documented with TypeScript interfaces
- **API endpoints** with clear specifications
- **Architecture decisions** explained in code comments
- **User guides** updated with each major feature

### Git Workflow

- **Feature branches** off `dev` for all changes
- **Pull requests** to `dev` with self-review
- **Main branch** for production-ready code only
- **Conventional commits** with clear, descriptive messages

---

## 🔧 Implementation Guidelines

### Development Priorities

1. **User Experience First**: Features should feel intuitive and responsive
2. **Performance by Default**: Optimize for fast loading and smooth interactions
3. **Accessibility Built-In**: Support keyboard navigation and screen readers
4. **Mobile Consideration**: Responsive design for all screen sizes

### Technology Decisions

- **Custom Editor**: Full control over block behavior and AI integration
- **SCSS over Tailwind**: Better component encapsulation and design system control
- **Serverless Architecture**: Simple deployment and automatic scaling
- **Firebase Auth**: Mature, secure authentication with minimal setup

### File Organization

- **Feature-based folders** in `apps/web/src/components/`
- **Colocated tests** and styles with components
- **Shared utilities** in `packages/` for cross-platform reuse
- **Design tokens** centralized in `packages/design-tokens/`

---

## 🚀 Current Status & Next Steps

### Recently Completed

- ✅ Basic UI layout with sidebar and editor
- ✅ Block-based editor with drag & drop reordering
- ✅ Multi-block selection via drag handles
- ✅ Design system with SCSS tokens
- ✅ Icon system with performance optimization

### Current Focus: Cross-Block Text Selection

**Goal**: Enable text selection spanning multiple blocks using native browser APIs

**Success Criteria**:

- Text selection works seamlessly across blocks
- Visual highlighting with design tokens
- Copy/paste operations work correctly
- No interference with existing block selection

### Next Milestones

1. **Cross-Block Text Selection** - Native Selection API integration
2. **Intelligent Copy/Paste** - Smart content detection and markdown support
3. **Enhanced Undo/Redo** - Command pattern with intelligent merging
4. **Live Markdown & UI** - Slash menu and formatting toolbar

---

## 📞 Getting Help

**When in doubt:**

- Describe what you want to achieve in plain language
- Reference existing functionality when helpful
- Ask for options if you're unsure about the best approach
- Request explanations of technical decisions when needed

**The assistant will:**

- Translate requirements into technical implementations
- Explain trade-offs and recommend best approaches
- Provide code with clear documentation and comments
- Update this guide as the project evolves

---

_This guide serves as the central reference for all project management, development workflow, and communication standards for Project Kairos._
