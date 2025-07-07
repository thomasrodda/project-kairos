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
└── settings.json
AI System Prompt Files
├── # 0. INDEX.md
├── # 1. Vision & Scope.md
├── # 2. User Stories.md
├── # 3. MVP.md
├── # 5. Architecture.md
├── # Current State.md
├── # Development Plan.md
├── # Project Management & Development Guide.md
├── Analytics Feature Flags Guide.md
├── Backend Api Guide.md
├── Backend Implementation Plan.md
├── CI CD Guide.md
├── Component Structure Guide.md
├── Data Model Guide.md
├── Editor Testing Plan.md
├── Enhanced Custom Editor Plan.md
├── Environment Setup Guide.md
├── Error Handling Guide.md
├── Extensibility & Plugin Architecture Guide.md
├── Git & Github Guide.md
├── Inline SVG System Guide.md
├── Markdown Export Import Guide.md
├── Page Management Implementation Plan.md
├── Performance Optimization Guide.md
├── Production Deployment Guide.md
├── Quick Commands.md
├── Scss Structure Guide.md
├── Security Guide.md
├── Slash Command Feature Development.md
├── Test Evaluation Guide.md
├── Test Review Checklist.md
├── Testing Guide.md
├── Testing Todo List.md
├── Text Formatting Plan.md
├── Troubleshooting Guide.md
└── Workspace Management Implementation Plan.md
apps
├── api
│   ├── docs
│   │   ├── phase3-configuration.md
│   │   └── redis-setup.md
│   ├── src
│   │   ├── **tests**
│   │   │   └── app.integration.test.ts
│   │   ├── config
│   │   │   ├── phase3.config.ts
│   │   │   ├── redis.ts
│   │   │   └── security.config.ts
│   │   ├── examples
│   │   │   └── usage-example.ts
│   │   ├── middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── index.ts
│   │   │   ├── requestLogger.ts
│   │   │   ├── security.ts
│   │   │   └── socketAuth.ts
│   │   ├── routes
│   │   │   ├── **tests**
│   │   │   │   ├── auth.test.ts
│   │   │   │   ├── export.routes.test.ts
│   │   │   │   ├── health.test.ts
│   │   │   │   ├── history.routes.test.ts
│   │   │   │   ├── search.routes.test.ts
│   │   │   │   ├── sync.routes.test.ts
│   │   │   │   └── workspace.test.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── blocks.ts
│   │   │   ├── export.routes.ts
│   │   │   ├── history.routes.ts
│   │   │   ├── pages.ts
│   │   │   ├── search.routes.ts
│   │   │   ├── sync.routes.ts
│   │   │   └── workspace.routes.ts
│   │   ├── services
│   │   │   ├── **tests**
│   │   │   │   ├── blockService.test.ts
│   │   │   │   ├── exportService.test.ts
│   │   │   │   ├── historyService.test.ts
│   │   │   │   ├── searchService.test.ts
│   │   │   │   └── syncService.test.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── blockService.ts
│   │   │   ├── exportService.ts
│   │   │   ├── firebase-admin.ts
│   │   │   ├── historyService.ts
│   │   │   ├── pageService.ts
│   │   │   ├── searchService.ts
│   │   │   └── syncService.ts
│   │   ├── test
│   │   │   ├── factories.ts
│   │   │   ├── helpers.ts
│   │   │   ├── redisMock.ts
│   │   │   ├── setup.ts
│   │   │   └── test-app.ts
│   │   ├── types
│   │   │   └── express.d.ts
│   │   ├── utils
│   │   │   ├── README.md
│   │   │   ├── apiResponse.ts
│   │   │   ├── errors.ts
│   │   │   └── index.ts
│   │   ├── websocket
│   │   │   ├── **tests**
│   │   │   │   └── socketServer.test.ts
│   │   │   └── socketServer.ts
│   │   └── app.ts
│   ├── SECURITY.md
│   ├── dev-server.ts
│   ├── hello.test.ts
│   ├── hello.ts
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
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
│   │   │   ├── Auth.module.scss
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── Login.test.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── ProtectedRoute.test.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Signup.test.tsx
│   │   │   ├── Signup.tsx
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
│   │   │   ├── EditorError
│   │   │   │   ├── EditorError.module.scss
│   │   │   │   ├── EditorError.tsx
│   │   │   │   └── index.ts
│   │   │   ├── EditorLoading
│   │   │   │   ├── EditorLoading.module.scss
│   │   │   │   ├── EditorLoading.tsx
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
│   │   │   ├── SyncStatus
│   │   │   │   ├── SyncStatus.module.scss
│   │   │   │   ├── SyncStatus.tsx
│   │   │   │   └── index.ts
│   │   │   ├── DebugFormatting.tsx
│   │   │   ├── Editor.integration.test.tsx
│   │   │   ├── Editor.performance.simple.test.tsx
│   │   │   ├── Editor.performance.test.tsx
│   │   │   ├── Editor.scss
│   │   │   ├── Editor.test.tsx
│   │   │   ├── Editor.tsx
│   │   │   ├── EditorWithSync.tsx
│   │   │   └── index.ts
│   │   ├── PerformanceTest
│   │   │   └── PerformanceTest.tsx
│   │   ├── Sidebar
│   │   │   ├── PageTree
│   │   │   │   ├── PageTree.module.scss
│   │   │   │   ├── PageTree.test.tsx
│   │   │   │   ├── PageTree.tsx
│   │   │   │   ├── PageTreeItem.module.scss
│   │   │   │   ├── PageTreeItem.test.tsx
│   │   │   │   ├── PageTreeItem.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── usePageTree.test.ts
│   │   │   │   └── usePageTree.ts
│   │   │   ├── Sidebar.scss
│   │   │   ├── Sidebar.test.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   ├── SidebarButton
│   │   │   ├── SidebarButton.scss
│   │   │   ├── SidebarButton.test.tsx
│   │   │   ├── SidebarButton.tsx
│   │   │   └── index.ts
│   │   └── Workspace
│   │   ├── Workspace.scss
│   │   ├── Workspace.test.tsx
│   │   ├── Workspace.tsx
│   │   └── index.ts
│   ├── contexts
│   │   ├── AuthContext.test.tsx
│   │   ├── AuthContext.tsx
│   │   ├── EditorContext.test.tsx
│   │   ├── EditorContext.tsx
│   │   └── EditorProvider.tsx
│   ├── hooks
│   │   ├── index.ts
│   │   ├── useAuth.ts
│   │   ├── useAutoSave.ts
│   │   ├── useCrossBlockSelection.test.tsx
│   │   ├── useCrossBlockSelection.ts
│   │   ├── useDebounce.ts
│   │   ├── useDismiss.test.ts
│   │   └── useDismiss.ts
│   ├── integration
│   │   ├── Editor.integration.test.tsx
│   │   └── markdown-detection.test.tsx
│   ├── pages
│   ├── styles
│   │   ├── base
│   │   │   └── reset.scss
│   │   └── index.scss
│   ├── test
│   │   ├── mocks
│   │   │   └── dnd-kit.tsx
│   │   ├── setup.ts
│   │   └── utils.tsx
│   ├── utils
│   │   ├── api
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   ├── firebase.ts
│   │   ├── formattingRenderer.tsx
│   │   ├── markdownDetection.test.ts
│   │   ├── markdownDetection.ts
│   │   ├── textFormatting.test.ts
│   │   ├── textFormatting.ts
│   │   ├── textSelection.test.ts
│   │   └── textSelection.ts
│   ├── App.dev.tsx
│   ├── App.tsx
│   ├── main.tsx
│   ├── test-api-connection.ts
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
│   ├── 20250705162218_init
│   │   └── migration.sql
│   ├── 20250706112958_add_version_tracking
│   │   └── migration.sql
│   └── migration_lock.toml
└── schema.prisma
