# Data Model Guide

> This guide outlines how data is structured in the app, including workspaces, pages, and blocks. It helps ensure consistency across frontend, backend, and storage.

---

## Overview

The app uses a structured, hierarchical data model:

- Users have **Workspaces**
- Each Workspace has **Pages** (organized in a file tree)
- Pages are made of **Blocks** (basic editing units)

Data is stored in a cloud database and accessed via serverless API endpoints.

---

## App Flow & Hierarchy

### User Journey

```
User → Login (Google OAuth) → Account → Workspace Selection → Main Workspace View
```

### Data Hierarchy

```
User (authenticated via Firebase)
└── Account
    └── Workspaces (multiple projects)
        └── Workspace (e.g., "My Fantasy Novel" or "D&D Campaign")
            └── Pages (documents within the project)
                └── Page
                    ├── Title (editable, always visible)
                    └── Blocks (content units)
```

### Main Workspace View Layout

```
┌─────────────────────────────────────────────────────────┐
│ Navigation Bar (recent pages, future features)          │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│   Sidebar   │              Editor                      │
│             │                                           │
│ ┌─────────┐ │  ┌─────────────────────────────────┐   │
│ │Workspace│ │  │ Page Title (editable)           │   │
│ │ Pages:  │ │  ├─────────────────────────────────┤   │
│ │         │ │  │ Block 1 (paragraph)             │   │
│ │ Page 1  │ │  │ Block 2 (heading)               │   │
│ │ Page 2 ←│ │  │ Block 3 (bullet list)           │   │
│ │ Page 3  │ │  │ ...                             │   │
│ └─────────┘ │  └─────────────────────────────────┘   │
│             │                                           │
└─────────────┴───────────────────────────────────────────┘
                                              Future AI Panel →
```

### Key Concepts

- **Workspace**: The main working environment, contains all pages for a single project
- **Editor**: Displays ONE page at a time, selected from the sidebar
- **Page**: An individual document with its own title and blocks
- **Blocks**: The atomic units of content (paragraphs, headings, lists, etc.)
