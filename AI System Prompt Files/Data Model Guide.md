# Data Model Guide

> This guide outlines how data is structured in the app, including workspaces, pages, and blocks. It helps ensure consistency across frontend, backend, and storage.

---

## Overview

The app uses a structured, hierarchical data model:

* Users have **Workspaces**
* Each Workspace has **Pages** (organized in a file tree)
* Pages are made of **Blocks** (basic editing units)

Data is stored in a cloud database and accessed via serverless API endpoints.

---

## User

* Identified via Firebase Auth (Google login)
* Can own multiple workspaces
* User data is minimal; mostly used for access control

---

## Workspace

A workspace is a top-level project folder. It contains:

* `id`: Unique identifier
* `userId`: Owner's user ID
* `name`: Workspace name
* `createdAt`, `updatedAt`
* `pages`: Root-level pages or folders

Workspaces support nested content and switching between different creative projects.

---

## Page

A page is a document made up of blocks. It includes:

* `id`: Unique identifier
* `workspaceId`: Parent workspace
* `parentId`: (optional) ID of parent folder page
* `title`: Page name
* `order`: Sort index within the file tree
* `isFolder`: Boolean flag
* `blocks`: Array of block IDs or embedded blocks
* `metadata` (optional): A key-value object for storing custom attributes like tags, filters, or AI annotations. Reserved for future extensibility.

Pages support nesting, drag-and-drop, and linking.

---

## Block

A block is a unit of content. It includes:

* `id`: Unique identifier
* `pageId`: Parent page
* `type`: e.g. heading, paragraph, bullet
* `content`: Text or data payload
* `order`: Position in page
* `createdAt`, `updatedAt`
* `metadata` (optional): A flexible object to store extra information, such as user-defined tags, AI suggestions, formatting state, or other block-level attributes.

Blocks can be reordered, formatted, and transformed via commands.

---

## Linking & Backlinks

Links are created by referencing other page IDs using @mentions. Each page tracks:

* `incomingLinks`: Pages that link to this one
* `outgoingLinks`: Pages this one links to

Used for backlink panel and workspace graph.

---

## Sync & Storage

* Cloud-first model with optional local-first editing
* Real-time cloud sync for all data
* Conflict resolution handled on merge

---

## Best Practices

* Use UUIDs for IDs
* Keep data schemas flat but well-referenced
* Normalize nested entities (pages, blocks)
* Always include timestamps for tracking edits
* Design for scalability: large workspaces, many pages