# Project Overview

## Vision & Scope

**App Concept**: A hybrid Notion/Obsidian‐style workspace tailored for creative writers—novelists, worldbuilders, D\&D campaign planners—that combines block‐based editing with powerful AI‐driven tools.

**Core MVP Features**:

* **Text Editor**: Write, edit, format, and save content with drag‐and‐drop reordering of text blocks; block styles include H1, H2, Body, Bullets, etc.
* **Pages & File Tree**: Create, rename, delete pages; organize pages in a nested, drag‐and‐drop file tree structure.
* **Linking**: @‐mention to link to other pages within the workspace, supporting quick navigation.
* **Accounts & Workspaces**: Google OAuth login; users can create multiple workspaces (each a root project folder), and switch between them.
* **Cloud Saving**: Primary storage in the cloud; optional local saves with sync.

**Unique Selling Points**:

* **AI Writing Assistant**: Basic grammar and style improvements.
* **Lore Checker**: Using a vector database to search workspace content and detect worldbuilding inconsistencies.
* **Future Add‑Ons**: Interactive timeline view; storyboard planning canvas.

## Target Platforms

* **Primary**: Web application (responsive).
* **Secondary**: Desktop (Electron or Tauri) and mobile (React Native or Progressive Web App) in later phases.

## Technology Stack (Preliminary)

* **Frontend**: React (with TypeScript), Tailwind CSS, shadcn/ui components.
* **Backend**: Node.js with Express (or serverless functions); PostgreSQL or MongoDB; vector search via Pinecone/Weaviate.
* **Storage**: Cloud database + optional local file storage and sync.
* **Auth**: OAuth with Google (expandable to other providers).
* **Testing & CI**: Jest (unit), Cypress (e2e), GitHub Actions for CI/CD.

## Code Organization & Best Practices

* **Monorepo** (Yarn Workspaces) separating frontend, backend, shared utilities.
* **Folder Structure**: `src/components`, `src/pages`, `src/hooks`, `src/utils`.
* **Linting & Formatting**: ESLint, Prettier, Pre‐commit hooks.
* **Types**: TypeScript everywhere.

## Development Roadmap

1. Set up project scaffolding (monorepo, CI/CD).
2. Build core editor with block system and page navigation.
3. Implement cloud storage and account/workspace management.
4. Add linking (@‐mentions) and local storage option.
5. Integrate AI writing assistant.
6. Develop vector search/lore checker feature.
7. Prototype timeline and storyboard views.

## Maintenance & Deployment

* **Hosting**: Vercel (frontend), Heroku/AWS Lambda (backend).
* **Monitoring**: Sentry for error tracking; automated backups.
* **Roadmap Updates**: Biweekly planning cycles; user feedback integration.
