# Project Overview

This document serves as the single source of truth for Project Kairos - a modern creative writing and worldbuilding application. It defines the product vision, core features, target users, and technical approach.

---

## Product Vision & Core Value Proposition

Project Kairos is a modern web application designed specifically for creative writers, worldbuilders, and campaign planners. Unlike general productivity tools (Notion), traditional word processors (Scrivener), or outdated worldbuilding platforms (WorldAnvil), Kairos provides:

- **Purpose-Built for Creatives**: A writing environment tailored to the needs of novelists, screenwriters, and game masters
- **Modern User Experience**: Clean, responsive interface built with current web technologies
- **AI-Powered Consistency**: Future features will scan works for lore inconsistencies and narrative contradictions
- **Integrated Workflow**: Seamlessly combine planning, worldbuilding, and writing in one platform

---

## App Terminology

Below is a list of commonly used terminology used to describe certain app features and functionalities. These are to be used for consistency's sake.

### **Core Concepts**

- **Block**: A discrete unit of content in the editor (e.g. paragraph, heading, bullet point). Blocks can be rearranged via drag-and-drop and transformed with commands like `/`.
- **Page**: A document composed of one or more blocks. Pages live inside a **Workspace** and can be nested within folders in a file tree.
- **Workspace**: A top-level container for a group of related pages. Each user can create multiple workspaces (like projects or campaigns).
- **File Tree**: A file tree view showing all pages and folders in a workspace. Located in the Sidebar. Supports drag-and-drop for organization. Clicking a page in the file tree opens it in the Editor.
- **Editor**: The central writing and editing area where users compose content using blocks. Supports real-time formatting, linking, and drag-and-drop block reordering. The Editor displays one page at a time.
- **Sidebar**: A collapsible panel on the left side of the interface that displays the file tree, workspace options, new page button and other options like settings and account.
- **Links Panel**: A contextual panel that shows all incoming and outgoing links for the current page open in the Editor. Useful for exploring relationships and backlinks.

---

### 📝 **Editor Features**

- **Formatting Toolbar**: A small floating pop-up that appears when text is selected, allowing for quick formatting actions (bold, italic, link, etc.).
- **Slash Command Menu**: A command palette triggered by typing `/` in an empty block or after a space in any block. Allows you to insert or convert blocks (e.g., to headings, bullet lists, etc.).
- **@‑Mention**: A way to link to other pages or blocks by typing `@`, useful for building a network of related content.
- **Backlink**: An automatic reference shown on a page that indicates where it has been linked from.

---

### 🔐 **Accounts & Sync**

- **OAuth Login**: Sign in with a Google account (more providers can be added later).
- **Cloud Sync**: Automatic saving and syncing of your data to the cloud.
- **Local‑First Editing**: The ability to work offline, with local saves that sync when back online.

---

### 🤖 **AI Features**

- **AI Writing Assistant**: Suggests grammar and style improvements within the editor.
- **Lore Checker**: Scans your content using a vector database to flag worldbuilding inconsistencies or contradictions.

---

### 🧩 **Future Features**

- **Timeline View**: A visual layout for plotting story events over time.
- **Storyboard Canvas**: A drag-and-drop visual board for planning scenes, chapters, or episodes.
- **Metadata Tags**: (Planned) A way to assign custom attributes (e.g. genre, character arc) to blocks or pages for filtering and organization.

---

## Target Users & Audiences

### 1. **Primary: Worldbuilders & Dungeon Masters**

- **DM Dan**: Organizes NPCs, locations, items, and questlines. Needs both a structured wiki and visual campaign planner, plus lore‑consistency checks.

### 2. **Secondary: Creative Writers & Novelists**

- **Novelist Nora**: Tracks characters, settings, and story arcs for a 100k‑word epic. Requires deep reference linking, visual timeline tools, and AI to catch narrative inconsistencies.

### 3. **Tertiary: Film & TV Writers**

- **TV Tim**: Plans episodes, character beats, and series arcs. Benefits from episodic storyboard views, metadata tagging, and script‑style blocks.

---

## User Workflows & Journey Maps

### DM Dan's Typical Session

1. Opens app and logs in via Google OAuth
2. Selects his D&D campaign workspace from the workspace list
3. Views organized worldbuilding content in the file tree (NPCs, locations, quest lines)
4. Creates or edits content using the block editor
5. Uses AI features to check new content against existing lore for conflicts
6. References linked pages while planning sessions

### Novelist Nora's Typical Session

1. Opens app and logs in
2. Selects her novel workspace
3. Navigates file tree containing:
   - Character profiles
   - Chapter outlines
   - Written chapters
   - World-building notes
4. Writes new content or edits existing chapters
5. Uses AI to ensure consistency across her 100k+ word manuscript
6. Cross-references character details and plot points via backlinks

---

## Core MVP Features

1. **Block-Based Text Editor Architecture**

   - **Floating Formatting Toolbar**: No fixed toolbar—when users highlight text, a contextual popup appears offering formatting (bold, italics, links, etc.).
   - **Slash (`/`) Command Menu**: In an empty block, typing `/` opens a floating menu to insert or transform into different block types (H1, H2, Body, Bullets, etc.).
   - **Extensible Design**: Engineered with a modular architecture (e.g., plugin system or block-definition schema) to support future features like embedded media, tables, and custom blocks.

2. **Pages & File Tree**

   - Nested workspace structure with folders and pages.
   - Create, rename, delete, and reorder pages via drag‑and‑drop.

3. **Internal Linking & Backlinks**

   - `@`‑mention pages and blocks for quick navigation.
   - Automatic backlink generation for reverse lookup.

4. **Workspace Management & Sync**
   - Google OAuth for single sign‑on; multiple workspaces per user.
   - Real‑time cloud persistence with optional local‑first editing and conflict resolution.

---

## Unique Value Propositions (UVP)

- **AI‑Driven Lore Consistency**: Leverages vector databases and AI to scan the entire workspace, detect contradictions or gaps in lore, and suggest reconciliations in real time.
- **Visual Planning Canvas**: Drag‑and‑drop boards, timelines, and mind‑map views to map out campaigns, character arcs, and plot threads visually.

---

## High-Level Technical Architecture

- **Frontend**: React-based single page application
- **Backend**: Node.js with serverless functions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: OAuth providers (starting with Google)
- **Infrastructure**: Cloud-hosted with auto-scaling capabilities
- **AI Integration**: Vector databases for semantic search and consistency checking

_For detailed technical implementation, see [Architecture.md](../02-Architecture/Architecture.md)_

---

## Feature Integration & Relationships

### AI Integration Approach

AI features will be accessible through:

- **Option 1**: Floating AI toolbar that appears contextually
- **Option 2**: Right sidebar panel that slides out when needed
- Features include lore checking, writing suggestions, and consistency analysis

### Visual Planning Canvas (Experimental)

- Each canvas entry will be treated as a page in the system
- Allows visual organization of story elements, plot points, or campaign beats
- Seamlessly integrates with the text editor and file tree

---

## Quality Goals

These are important standards our product must meet:

- **Fast and Responsive**: Editor should open and react to typing and commands almost instantly.
- **Reliable**: Service stays up and saves work without unexpected downtime.
- **Secure**: User logins and data must be protected so only the right people can access their work.
- **Accessible**: The editor should work well for everyone, including people using keyboards only or screen readers.
- **Scalable**: We should be able to add more users without slowing down or breaking the app.

---

## Assumptions & Constraints

- **Platform**: Web-first MVP focusing on modern browsers (Chrome, Firefox, Safari).
- **Data Privacy**: User data stored in regionally compliant cloud services (e.g., GDPR-ready).
- **Performance**: Editor load time under 2 seconds for up to 100 blocks.

---

## Out of Scope

- Mobile-native apps (iOS/Android)
- Advanced collaboration (real-time multi-user cursors)
- Full-text search across workspaces (deferred to later releases)

---

## Success Criteria

> TBD: We'll refine these metrics when we're closer to launch or have stakeholder input.

- **Qualitative Feedback**: Gather user interviews and beta‑tester notes.
- **Beta Engagement**: Track feature usage depth (e.g., avg. number of blocks per session, menu‑command usage).
- **Technical Stability**: Zero critical bugs in core editor flows.

---

## Related Documentation

- **[User Stories.md](User Stories.md)**: Detailed feature requirements and acceptance criteria
- **[Development Plan.md](Development Plan.md)**: Phased implementation roadmap
- **[Architecture.md](../02-Architecture/Architecture.md)**: Technical implementation details
- **[Current State.md](Current State.md)**: Real-time project status and progress
