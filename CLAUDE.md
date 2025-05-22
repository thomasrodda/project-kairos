# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Kairos is a creative writing and worldbuilding web application designed for novelists, writers, and D&D campaign planners. It combines block-based editing with AI-driven tools for consistency checking and writing assistance.

**Current Status**: Planning/Documentation phase - no source code exists yet.

## Technology Stack

- **Frontend**: React with TypeScript, Custom SCSS styling
- **Backend**: Vercel Serverless Functions (Node.js)
- **Authentication**: Firebase Authentication (Google OAuth)
- **Database**: PostgreSQL or MongoDB (TBD)
- **AI/Vector Search**: Pinecone or Weaviate for lore consistency checking
- **Hosting**: Vercel (full-stack)
- **Package Management**: Monorepo structure with Yarn Workspaces

## Planned Architecture

```
project-root/
├── apps/
│   ├── web/ (React frontend)
│   └── api/ (Vercel serverless functions)
├── packages/
│   ├── ui/ (shared components)
│   ├── utils/ (shared utilities)
│   └── types/ (TypeScript definitions)
```

## Development Setup (To Be Implemented)

The following commands will be available once the project is scaffolded:

- `yarn install` - Install dependencies
- `yarn dev` - Start development servers
- `yarn build` - Build all packages
- `yarn lint` - Run ESLint
- `yarn typecheck` - Run TypeScript checks
- `yarn test` - Run tests

## Core Features (MVP)

1. **Block-Based Editor**: Drag-and-drop text blocks with slash commands
2. **Pages & File Tree**: Nested workspace organization with internal linking
3. **Workspaces**: Multiple project containers per user
4. **AI Writing Assistant**: Grammar/style improvements and lore consistency checking
5. **Cloud Sync**: Real-time autosave with Firebase

## AI System Prompts

The `AI System Prompt Files/` directory contains comprehensive development guidance including:
- Project vision, user stories, and MVP requirements
- Architecture patterns and component structure guidelines
- Testing, styling (SCSS), and backend API conventions
- CI/CD and extensibility frameworks

When implementing features, reference these files for consistent development patterns and architectural decisions.

## Next Development Steps

1. Initialize monorepo with Yarn Workspaces
2. Set up React frontend with TypeScript and Vite
3. Configure Vercel serverless functions
4. Implement Firebase authentication
5. Create core block editor components