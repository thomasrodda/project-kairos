# Documentation Index

> This index helps you navigate Project Kairos documentation efficiently. Each document serves a specific purpose - use this guide to find what you need quickly.

## 🚀 Start Here

1. **[CLAUDE.md](../CLAUDE.md)** - AI assistant instructions and quick reference
2. **[Current State.md](./Current State.md)** - What's built, what's in progress, known issues
3. **[FILE_TREE.md](../FILE_TREE.md)** - Complete project file structure

## 📋 Core Project Documents

### Vision & Planning

- **[Project Overview.md](./Project Overview.md)** - Product vision, target users, terminology
  - _Use when_: Understanding product goals, checking feature scope
- **[User Stories Guide.md](./User Stories Guide.md)** - How to write and navigate user stories
  - _Use when_: Learning the user story format, finding feature requirements
- **Feature User Stories** - Organized by feature in `../03-Features/[Feature]/`
  - Examples: `Editor/User Stories - Editor.md`, `PageManagement/User Stories - Page Management.md`
  - _Use when_: Implementing specific features, checking requirements
- **[MVP.md](./MVP.md)** - MVP scope summary and development phases
  - _Use when_: Checking what's in/out of MVP, understanding priorities

### Technical Architecture

- **[Architecture.md](../02-Architecture/Architecture.md)** - System design and technical decisions
  - _Use when_: Understanding system structure, making architectural decisions
- **[Data Model Guide.md](../02-Architecture/Data Model Guide.md)** - Database schema and relationships
  - _Use when_: Working with database, understanding data structure

### Development Workflow

- **[Development Plan.md](./Development Plan.md)** - Feature roadmap and implementation order
  - _Use when_: Planning next features, understanding development priorities
- **[Project Management & Development Guide.md](./Project Management & Development Guide.md)** - Team workflows and processes
  - _Use when_: Understanding development process, collaboration guidelines
- **[Documentation Improvement Checklist.md](./Documentation Improvement Checklist.md)** - Plan for improving documentation accuracy and structure
  - _Use when_: Updating documentation, ensuring docs match implementation

## 🆘 Quick References

- **[Quick Commands.md](../06-DevOps/Quick Commands.md)** - All commands in one place
  - _Use when_: Need to quickly run a command without searching docs
- **[Troubleshooting Guide.md](../06-DevOps/Troubleshooting Guide.md)** - Common issues and fixes
  - _Use when_: Something isn't working, build errors, test failures
- **[Environment Setup Guide.md](../06-DevOps/Environment Setup Guide.md)** - Complete setup instructions
  - _Use when_: First time setup, configuring environment, database setup

## 📂 Feature Documentation (NEW STRUCTURE)

### Documentation Workflow

1. **Start with Project Overview** - Understand the product vision
2. **Navigate to Feature Folder** - `../03-Features/[FeatureName]/`
3. **Read User Stories** - `User Stories - [Feature].md` for requirements
4. **Check Implementation Guides** - Feature-specific guides in the same folder

### Feature Folders

- **Editor/** - Block editor, text formatting, drag & drop
  - [User Stories - Editor.md](../03-Features/Editor/User Stories - Editor.md)
  - [Text Formatting Plan.md](../03-Features/Editor/Text Formatting Plan.md)
  - [Enhanced Custom Editor Plan.md](../03-Features/Editor/Enhanced Custom Editor Plan.md)
- **PageManagement/** - Page creation, deletion, organization
  - [User Stories - Page Management.md](../03-Features/PageManagement/User Stories - Page Management.md)
- **Workspace/** - Workspace management and navigation
  - [User Stories - Workspace.md](../03-Features/Workspace/User Stories - Workspace.md)
- **Authentication/** - User sign up, login, sessions
  - [User Stories - Authentication.md](../03-Features/Authentication/User Stories - Authentication.md)
- **DataManagement/** - Import/export, sync, backup
  - [User Stories - Data Management.md](../03-Features/DataManagement/User Stories - Data Management.md)

### Cross-Feature References

- **[Feature Dependencies.md](../03-Features/Feature Dependencies.md)** - Dependencies between features
  - _Use when_: Understanding feature relationships, planning implementation order
- **[Component-UserStory-Mapping.md](../03-Features/Component-UserStory-Mapping.md)** - Component usage across features
  - _Use when_: Finding which components implement which features

## 🛠️ Implementation Guides

### General Development

- **[Component Structure Guide.md](../03-Features/Component Structure Guide.md)** - React component patterns
  - _Use when_: Creating new components, understanding component architecture
- **[Scss Structure Guide.md](../05-Styling/Scss Structure Guide.md)** - Styling patterns and SCSS organization
  - _Use when_: Writing styles, understanding CSS architecture
- **[Inline SVG System Guide.md](../05-Styling/Inline SVG System Guide.md)** - Icon system implementation
  - _Use when_: Working with icons, adding new SVG assets

### Backend Development

- **[Backend Api Guide.md](../02-Architecture/Backend Api Guide.md)** - API design and endpoints
  - _Use when_: Creating API endpoints, understanding API structure

## 🧪 Quality & Testing

- **[Testing Guide.md](../04-Testing/Testing Guide.md)** - Comprehensive testing strategy, patterns, and best practices
  - _Use when_: Writing tests, understanding test philosophy, evaluating test quality
- **[Test Inventory.md](../04-Testing/Test Inventory.md)** - Current test status, quality metrics, and priorities
  - _Use when_: Checking test coverage, tracking improvements, finding testing priorities
- **[Error Handling Guide.md](../07-Operations/Error Handling Guide.md)** - Error handling patterns
  - _Use when_: Implementing error handling, debugging issues

## 🚀 DevOps & Deployment

- **[CI CD Guide.md](../06-DevOps/CI CD Guide.md)** - Continuous integration setup
  - _Use when_: Understanding build pipeline, fixing CI issues
- **[Production Deployment Guide.md](../06-DevOps/Production Deployment Guide.md)** - Deployment procedures
  - _Use when_: Deploying to production, understanding infrastructure
- **[Git & Github Guide.md](../06-DevOps/Git & Github Guide.md)** - Version control workflows
  - _Use when_: Understanding git workflow, branch strategy

## 🔧 Advanced Topics

- **[Performance Optimization Guide.md](../07-Operations/Performance Optimization Guide.md)** - Performance best practices
  - _Use when_: Optimizing performance, debugging slowness
- **[Security Guide.md](../07-Operations/Security Guide.md)** - Security considerations
  - _Use when_: Implementing auth, handling sensitive data
- **[Analytics Feature Flags Guide.md](../07-Operations/Analytics Feature Flags Guide.md)** - Feature flags and analytics
  - _Use when_: Implementing feature flags, adding analytics
- **[Extensibility & Plugin Architecture Guide.md](../02-Architecture/Extensibility & Plugin Architecture Guide.md)** - Plugin system design
  - _Use when_: Building extensible features, planning plugin architecture

## 📍 Quick Decision Tree

**"I need to..."**

- **Understand what to build** → Project Overview, then Feature Folder → User Stories
- **Know what's already built** → Current State, FILE_TREE
- **Implement a feature** → Navigate to `03-Features/[Feature]/` → Read User Stories → Check guides
- **Write tests** → Testing Guide, Test Inventory
- **Fix a bug** → Error Handling Guide, Current State (known issues)
- **Deploy code** → CI CD Guide, Production Deployment Guide
- **Understand the codebase** → Architecture, FILE_TREE, Component Structure Guide

## 🔄 Document Dependencies

```
Project Overview
    ↓
User Stories Guide → Feature Folders → Feature User Stories
    ↓                     ↓                    ↓
MVP ←→ Development Plan ←→ Current State ← Implementation Guides
    ↓                                           ↓
Architecture → Component/API/Data Guides    Feature Dependencies
    ↓                                           ↓
Testing/Error/Security Guides            Component-UserStory-Mapping
```

## 📝 Documentation Standards & Templates

### Templates Directory

- **[Templates README](../templates/README.md)** - How to use documentation templates
  - _Use when_: Creating new documentation, ensuring consistency
- **[Feature Template](../templates/FEATURE_TEMPLATE.md)** - Template for user stories
- **[Component Template](../templates/COMPONENT_TEMPLATE.md)** - Template for component docs
- **[API Endpoint Template](../templates/API_ENDPOINT_TEMPLATE.md)** - Template for API docs
- **[Documentation Standards](../templates/DOCUMENTATION_STANDARDS.md)** - Consistency guidelines

### General Standards

- **Numbered docs (#)**: Core planning documents, read in order
- **Guide docs**: Implementation references, use as needed
- **CLAUDE.md**: Always check for latest commands and setup
- **Current State**: Always check before starting work

---

_Pro tip: Use Ctrl+F to search this index for keywords related to your task._
