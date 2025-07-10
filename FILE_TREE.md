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
├── Database Connection Notes.md
├── Editor Testing Plan.md
├── Enhanced Custom Editor Plan.md
├── Environment Setup Guide.md
├── Error Handling Guide.md
├── Extensibility & Plugin Architecture Guide.md
├── Git & Github Guide.md
├── Inline SVG System Guide.md
├── Markdown Export Import Guide.md
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
└── Troubleshooting Guide.md
apps
├── api
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
│   ├── types
│   │   └── express.d.ts
│   ├── .env
│   ├── auth.test.ts
│   ├── auth.ts
│   ├── block-types.test.ts
│   ├── blocks.ts
│   ├── dev-server.ts
│   ├── hello.test.ts
│   ├── hello.ts
│   ├── jest.config.js
│   ├── package.json
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
│   │   │   ├── Login
│   │   │   │   ├── Login.scss
│   │   │   │   ├── Login.test.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ProtectedRoute
│   │   │   │   ├── ProtectedRoute.scss
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── index.ts
│   │   │   └── Register
│   │   │   ├── Register.scss
│   │   │   ├── Register.tsx
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
│   │   ├── PerformanceTest
│   │   │   └── PerformanceTest.tsx
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
│   │   └── Workspace
│   │   ├── Workspace.scss
│   │   ├── Workspace.test.tsx
│   │   ├── Workspace.tsx
│   │   └── index.ts
│   ├── contexts
│   │   ├── AuthContext.tsx
│   │   ├── EditorContext.test.tsx
│   │   └── EditorContext.tsx
│   ├── hooks
│   │   ├── index.ts
│   │   ├── useCrossBlockSelection.test.tsx
│   │   ├── useCrossBlockSelection.ts
│   │   ├── useDismiss.test.ts
│   │   └── useDismiss.ts
│   ├── integration
│   │   ├── Editor.integration.test.tsx
│   │   └── markdown-detection.test.tsx
│   ├── lib
│   │   ├── api-client.ts
│   │   └── firebase.ts
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
│   │   ├── blockMarkdownDetection.test.ts
│   │   ├── blockMarkdownDetection.ts
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
│   └── 20250110_update_block_types
│   └── migration.sql
└── schema.prisma
