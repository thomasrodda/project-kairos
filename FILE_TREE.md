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
├── Performance Optimization Guide.md
├── Production Deployment Guide.md
├── Quick Commands.md
├── Scss Structure Guide.md
├── Security Guide.md
├── Slash Command Feature Development.md
├── Testing Guide.md
└── Troubleshooting Guide.md
apps
├── api
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
│   │   └── editor-selection.cy.ts
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
│   │   ├── Editor
│   │   │   ├── Block
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
│   │   ├── EditorContext.test.tsx
│   │   └── EditorContext.tsx
│   ├── hooks
│   │   ├── index.ts
│   │   ├── useCrossBlockSelection.test.tsx
│   │   ├── useCrossBlockSelection.ts
│   │   ├── useDismiss.test.ts
│   │   └── useDismiss.ts
│   ├── integration
│   │   └── Editor.integration.test.tsx
│   ├── pages
│   ├── styles
│   │   ├── base
│   │   │   └── reset.scss
│   │   └── index.scss
│   ├── test
│   │   ├── setup.ts
│   │   └── utils.tsx
│   ├── utils
│   │   ├── textSelection.test.ts
│   │   └── textSelection.ts
│   ├── App.test.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
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
│   │   ├── \_root-variables.scss
│   │   ├── \_root.scss
│   │   ├── animations.scss
│   │   ├── colors.scss
│   │   ├── index.scss
│   │   ├── layout.scss
│   │   ├── semantic.scss
│   │   ├── shadows.scss
│   │   ├── spacing.scss
│   │   └── typography.scss
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
└── schema.prisma
