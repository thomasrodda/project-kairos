.claude
└── settings.local.json
.github
└── workflows
└── ci.yml
.husky
├── \_
│   ├── .gitignore
│   ├── applypatch-msg
│   ├── commit-msg
│   ├── h
│   ├── husky.sh
│   ├── post-applypatch
│   ├── post-checkout
│   ├── post-commit
│   ├── post-merge
│   ├── post-rewrite
│   ├── pre-applypatch
│   ├── pre-auto-gc
│   ├── pre-commit
│   ├── pre-merge-commit
│   ├── pre-push
│   ├── pre-rebase
│   └── prepare-commit-msg
├── pre-commit
└── pre-push
.vscode
├── extensions.json
├── settings.json
└── tasks.json
AI System Prompt Files
├── 01-Core
│   ├── Current Issues.md
│   ├── Current State.md
│   ├── Development Plan.md
│   ├── Documentation Improvement Checklist.md
│   ├── INDEX.md
│   ├── MVP.md
│   ├── Project Management & Development Guide.md
│   ├── User Stories.md
│   └── Vision & Scope.md
├── 02-Architecture
│   ├── Architecture.md
│   ├── Backend Api Guide.md
│   ├── Backend Implementation Plan.md
│   ├── Data Model Guide.md
│   ├── Database Connection Notes.md
│   ├── Database Migration Strategy.md
│   ├── Extensibility & Plugin Architecture Guide.md
│   └── Prisma Supabase Connection Guide.md
├── 03-Features
│   ├── Component Structure Guide.md
│   ├── Enhanced Custom Editor Plan.md
│   ├── Markdown Export Import Guide.md
│   ├── Slash Command Feature Development.md
│   └── Text Formatting Plan.md
├── 04-Testing
│   ├── Test Inventory.md
│   └── Testing Guide.md
├── 05-Styling
│   ├── Inline SVG System Guide.md
│   ├── Scss Structure Guide.md
│   ├── Styling Consistency Review.md
│   └── Styling Guide.md
├── 06-DevOps
│   ├── CI CD Guide.md
│   ├── Environment Setup Guide.md
│   ├── Git & Github Guide.md
│   ├── Production Deployment Guide.md
│   ├── Quick Commands.md
│   └── Troubleshooting Guide.md
└── 07-Operations
├── Analytics Feature Flags Guide.md
├── Error Handling Guide.md
├── Performance Optimization Guide.md
└── Security Guide.md
apps
├── api
│   ├── **tests**
│   ├── lib
│   │   ├── validations
│   │   │   ├── block.ts
│   │   │   ├── page.ts
│   │   │   └── workspace.ts
│   │   ├── api-response.ts
│   │   ├── auth-helpers.ts
│   │   ├── firebase-admin.ts
│   │   └── prisma.ts
│   ├── middleware
│   │   └── auth.ts
│   ├── pages
│   │   └── [id]
│   │   ├── versions
│   │   │   ├── [versionId].test.ts
│   │   │   └── [versionId].ts
│   │   ├── content.test.ts
│   │   ├── content.ts
│   │   ├── versions.test.ts
│   │   └── versions.ts
│   ├── types
│   │   └── express.d.ts
│   ├── .env
│   ├── auth-mock.ts
│   ├── auth.test.ts
│   ├── auth.ts
│   ├── block-types.test.ts
│   ├── blocks-mock.ts
│   ├── blocks.ts
│   ├── dev-server.ts
│   ├── health.ts
│   ├── hello.test.ts
│   ├── hello.ts
│   ├── jest.config.js
│   ├── package.json
│   ├── pages-mock.ts
│   ├── pages.ts
│   ├── tsconfig.json
│   ├── workspaces.test.ts
│   └── workspaces.ts
└── web
├── cypress
│   ├── e2e
│   │   ├── app.cy.ts
│   │   ├── editor-advanced.cy.ts
│   │   ├── editor-basic.cy.ts
│   │   ├── editor-selection.cy.ts
│   │   ├── keyboard-shortcuts.cy.ts
│   │   ├── markdown-formatting-fixed.cy.ts
│   │   ├── markdown-formatting.cy.ts
│   │   └── markdown-simple.cy.ts
│   ├── support
│   │   ├── commands.ts
│   │   ├── components.ts
│   │   └── e2e.ts
│   └── tsconfig.json
├── public
│   └── packages
│   └── ui
│   └── src
│   └── assets
│   └── icons
│   ├── AI Icon.svg
│   ├── AIEnter.svg
│   ├── AISend-1.svg
│   ├── AISend.svg
│   ├── AddIcon.svg
│   ├── ArchiveIcon.svg
│   ├── BackIcon.svg
│   ├── BulletedListIcon.svg
│   ├── BurgerMenuIcon.svg
│   ├── CheckIcon.svg
│   ├── CloseIcon.svg
│   ├── ColourProfileIcon.svg
│   ├── CopyIcon.svg
│   ├── DoubleArrowIcon.svg
│   ├── Focus.svg
│   ├── FolderIcon.svg
│   ├── Grab Icon.svg
│   ├── HelpIcon.svg
│   ├── ImageIcon.svg
│   ├── LargeArrowIcon.svg
│   ├── MembersIcon.svg
│   ├── MoreIcon.svg
│   ├── OpenPage.svg
│   ├── PageIcon.svg
│   ├── ProfileIcon.svg
│   ├── SearchIcon.svg
│   ├── SettingsIcon.svg
│   ├── UpdatesIcon.svg
│   └── Workspace Selection.svg
├── scripts
│   └── copy-icons.mjs
├── src
│   ├── components
│   │   ├── Auth
│   │   │   ├── GoogleLogo
│   │   │   │   ├── GoogleLogo.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Login
│   │   │   │   ├── Login.scss
│   │   │   │   ├── Login.test.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ProtectedRoute
│   │   │   │   ├── ProtectedRoute.scss
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Register
│   │   │   │   ├── Register.scss
│   │   │   │   ├── Register.tsx
│   │   │   │   └── index.ts
│   │   │   └── WorkspaceCreation
│   │   │   ├── WorkspaceCreation.scss
│   │   │   ├── WorkspaceCreation.test.tsx
│   │   │   ├── WorkspaceCreation.tsx
│   │   │   └── index.ts
│   │   ├── BackendHealthCheck
│   │   │   ├── BackendHealthCheck.scss
│   │   │   ├── BackendHealthCheck.tsx
│   │   │   └── index.ts
│   │   ├── Editor
│   │   │   ├── Block
│   │   │   │   ├── Block.issues.md
│   │   │   │   ├── Block.scss
│   │   │   │   ├── Block.test.tsx
│   │   │   │   ├── Block.tsx
│   │   │   │   ├── BlockDragHandle.scss
│   │   │   │   ├── BlockDragHandle.test.tsx
│   │   │   │   ├── BlockDragHandle.tsx
│   │   │   │   ├── DraggableBlock.scss
│   │   │   │   ├── DraggableBlock.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ContentEditableContainer
│   │   │   │   ├── ContentEditableContainer.blockmarkdown.manual.test.tsx
│   │   │   │   ├── ContentEditableContainer.blockmarkdown.simple.test.tsx
│   │   │   │   ├── ContentEditableContainer.blockmarkdown.test.tsx
│   │   │   │   ├── ContentEditableContainer.markdown.test.tsx
│   │   │   │   ├── ContentEditableContainer.scss
│   │   │   │   ├── ContentEditableContainer.simple.test.tsx
│   │   │   │   ├── ContentEditableContainer.slashcommand.test.tsx
│   │   │   │   ├── ContentEditableContainer.test.tsx
│   │   │   │   ├── ContentEditableContainer.tsx
│   │   │   │   └── index.ts
│   │   │   ├── EditorContent
│   │   │   │   ├── EditorContent.scss
│   │   │   │   ├── EditorContent.test.tsx
│   │   │   │   ├── EditorContent.tsx
│   │   │   │   └── index.ts
│   │   │   ├── FormattingToolbar
│   │   │   │   ├── FormattingToolbar.scss
│   │   │   │   ├── FormattingToolbar.test.tsx
│   │   │   │   ├── FormattingToolbar.tsx
│   │   │   │   ├── debug.md
│   │   │   │   └── index.ts
│   │   │   ├── PageTitle
│   │   │   │   ├── PageTitle.scss
│   │   │   │   ├── PageTitle.test.tsx
│   │   │   │   ├── PageTitle.tsx
│   │   │   │   └── index.ts
│   │   │   ├── SlashCommandMenu
│   │   │   │   ├── SlashCommandMenu.scss
│   │   │   │   ├── SlashCommandMenu.test.tsx
│   │   │   │   ├── SlashCommandMenu.tsx
│   │   │   │   └── index.ts
│   │   │   ├── DebugFormatting.tsx
│   │   │   ├── Editor.integration.test.tsx
│   │   │   ├── Editor.performance.simple.test.tsx
│   │   │   ├── Editor.performance.test.tsx
│   │   │   ├── Editor.scss
│   │   │   ├── Editor.test.tsx
│   │   │   ├── Editor.tsx
│   │   │   └── index.ts
│   │   ├── PageTree
│   │   │   ├── PageTree.scss
│   │   │   ├── PageTree.test.tsx
│   │   │   ├── PageTree.tsx
│   │   │   ├── PageTreeItem.scss
│   │   │   ├── PageTreeItem.test.tsx
│   │   │   ├── PageTreeItem.tsx
│   │   │   └── index.ts
│   │   ├── SaveStatus
│   │   │   ├── SaveStatus.scss
│   │   │   ├── SaveStatus.tsx
│   │   │   └── index.ts
│   │   ├── SaveStatusIndicator
│   │   │   ├── SaveStatusIndicator.scss
│   │   │   ├── SaveStatusIndicator.tsx
│   │   │   └── index.ts
│   │   ├── Sidebar
│   │   │   ├── Sidebar.scss
│   │   │   ├── Sidebar.test.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   ├── SidebarButton
│   │   │   ├── SidebarButton.scss
│   │   │   ├── SidebarButton.test.tsx
│   │   │   ├── SidebarButton.tsx
│   │   │   └── index.ts
│   │   ├── Workspace
│   │   │   ├── Workspace.scss
│   │   │   ├── Workspace.test.tsx
│   │   │   ├── Workspace.tsx
│   │   │   └── index.ts
│   │   ├── WorkspaceSelector
│   │   │   ├── WorkspaceSelector.scss
│   │   │   ├── WorkspaceSelector.test.tsx
│   │   │   ├── WorkspaceSelector.tsx
│   │   │   └── index.ts
│   │   └── component-template.scss
│   ├── contexts
│   │   ├── AuthContext.tsx
│   │   ├── BackendHealthContext.tsx
│   │   ├── EditorContext.test.tsx
│   │   ├── EditorContext.tsx
│   │   ├── PageContext.tsx
│   │   ├── PagesContext.tsx
│   │   └── WorkspaceContext.tsx
│   ├── hooks
│   │   ├── index.ts
│   │   ├── useAutoSave.integration.test.tsx
│   │   ├── useAutoSave.ts
│   │   ├── useCrossBlockSelection.test.tsx
│   │   ├── useCrossBlockSelection.ts
│   │   ├── useDismiss.test.ts
│   │   ├── useDismiss.ts
│   │   └── useToast.tsx
│   ├── integration
│   │   ├── Editor.integration.test.tsx
│   │   └── markdown-detection.test.tsx
│   ├── lib
│   │   ├── **mocks**
│   │   │   └── firebase.ts
│   │   └── firebase.ts
│   ├── pages
│   │   └── StyleGuide
│   │   ├── StyleGuide.scss
│   │   ├── StyleGuide.tsx
│   │   └── index.ts
│   ├── services
│   │   ├── **mocks**
│   │   │   └── api.ts
│   │   └── api
│   │   ├── auth.ts
│   │   ├── blocks.ts
│   │   ├── client.ts
│   │   ├── index.ts
│   │   ├── pages.ts
│   │   └── workspaces.ts
│   ├── styles
│   │   ├── base
│   │   │   └── reset.scss
│   │   ├── index.scss
│   │   └── mixins.scss
│   ├── test
│   │   ├── mocks
│   │   │   └── dnd-kit.tsx
│   │   ├── setup.ts
│   │   └── utils.tsx
│   ├── utils
│   │   ├── blockMarkdownDetection.test.ts
│   │   ├── blockMarkdownDetection.ts
│   │   ├── clearCache.ts
│   │   ├── formattingRenderer.tsx
│   │   ├── markdownDetection.test.ts
│   │   ├── markdownDetection.ts
│   │   ├── textFormatting.test.ts
│   │   ├── textFormatting.ts
│   │   ├── textSelection.test.ts
│   │   └── textSelection.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env -> ../../.env
├── .env.local -> ../../.env.local
├── .eslintrc.json
├── index.html
├── jest.config.js
├── package.json
├── tsconfig.json
└── vite.config.ts
packages
├── database
│   ├── src
│   │   ├── index.ts
│   │   └── seed.ts
│   ├── package.json
│   └── tsconfig.json
├── design-tokens
│   ├── src
│   │   ├── \_animations.scss
│   │   ├── \_colors.scss
│   │   ├── \_helpers.scss
│   │   ├── \_layout.scss
│   │   ├── \_responsive.scss
│   │   ├── \_root.scss
│   │   ├── \_semantic-colors.scss
│   │   ├── \_semantic-typography.scss
│   │   ├── \_shadows.scss
│   │   ├── \_spacing.scss
│   │   ├── \_theme-overrides.scss
│   │   ├── \_typography.scss
│   │   ├── index.scss
│   │   └── root-declarations.scss
│   ├── README.md
│   └── package.json
├── types
│   ├── src
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── ui
│   ├── src
│   │   ├── assets
│   │   │   └── icons
│   │   │   ├── AI Icon.svg
│   │   │   ├── AIEnter.svg
│   │   │   ├── AISend-1.svg
│   │   │   ├── AISend.svg
│   │   │   ├── AddIcon.svg
│   │   │   ├── ArchiveIcon.svg
│   │   │   ├── BackIcon.svg
│   │   │   ├── BulletedListIcon.svg
│   │   │   ├── BurgerMenuIcon.svg
│   │   │   ├── CheckIcon.svg
│   │   │   ├── CloseIcon.svg
│   │   │   ├── ColourProfileIcon.svg
│   │   │   ├── CopyIcon.svg
│   │   │   ├── DoubleArrowIcon.svg
│   │   │   ├── Focus.svg
│   │   │   ├── FolderIcon.svg
│   │   │   ├── Grab Icon.svg
│   │   │   ├── HelpIcon.svg
│   │   │   ├── ImageIcon.svg
│   │   │   ├── LargeArrowIcon.svg
│   │   │   ├── MembersIcon.svg
│   │   │   ├── MoreIcon.svg
│   │   │   ├── OpenPage.svg
│   │   │   ├── PageIcon.svg
│   │   │   ├── ProfileIcon.svg
│   │   │   ├── SearchIcon.svg
│   │   │   ├── SettingsIcon.svg
│   │   │   ├── UpdatesIcon.svg
│   │   │   └── Workspace Selection.svg
│   │   ├── components
│   │   │   └── Icon
│   │   │   ├── Icon.scss
│   │   │   ├── Icon.test.tsx
│   │   │   ├── Icon.tsx
│   │   │   └── index.ts
│   │   ├── test
│   │   │   └── setup.ts
│   │   ├── utils
│   │   │   ├── iconLoader.ts
│   │   │   ├── iconPerformance.test.ts
│   │   │   ├── iconPerformance.ts
│   │   │   ├── svgContentLoader.test.ts
│   │   │   ├── svgContentLoader.ts
│   │   │   └── svgTestUtils.ts
│   │   ├── index.ts
│   │   └── vite-env.d.ts
│   ├── package.json
│   └── tsconfig.json
└── utils
├── src
│   ├── env.test.ts
│   ├── env.ts
│   ├── index.test.ts
│   └── index.ts
├── package.json
└── tsconfig.json
prisma
├── migrations
│   └── 20250111_init
│   └── migration.sql
└── schema.prisma
