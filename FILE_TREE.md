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
├── # 1. Vision & Scope.md
├── # 2. User Stories.md
├── # 3. MVP.md
├── # 5. Architecture.md
├── # Assistant Guidelines.md
├── # Development Plan.md
├── # Project Framework.md
├── # Project Overview.md
├── # Project Plan.md
├── Analytics Feature Flags Guide.md
├── Backend Api Guide.md
├── CI CD Guide.md
├── Component Structure Guide.md
├── Data Model Guide.md
├── Error Handling Guide.md
├── Extensibility & Plugin Architecture Guide.md
├── Git & Github Guide.md
├── Performance Optimization Guide.md
├── Production Deployment Guide.md
├── Prompting Guide.md
├── Scss Structure Guide.md
├── Security Guide.md
└── Testing Guide.md
apps
├── api
│   ├── dev-server.ts
│   ├── hello.ts
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
└── web
├── cypress
│   ├── e2e
│   │   └── app.cy.ts
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
├── src
│   ├── components
│   │   ├── Editor
│   │   │   ├── Editor.scss
│   │   │   ├── Editor.tsx
│   │   │   └── index.ts
│   │   ├── Sidebar
│   │   │   ├── Sidebar.scss
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   ├── SidebarButton
│   │   │   ├── SidebarButton.scss
│   │   │   ├── SidebarButton.test.tsx
│   │   │   ├── SidebarButton.tsx
│   │   │   └── index.ts
│   │   └── Workspace
│   │   ├── Workspace.scss
│   │   ├── Workspace.tsx
│   │   └── index.ts
│   ├── hooks
│   ├── pages
│   ├── styles
│   │   ├── base
│   │   │   └── reset.scss
│   │   └── index.scss
│   ├── test
│   │   └── setup.ts
│   ├── utils
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
│   │   │   ├── Icon.tsx
│   │   │   └── index.ts
│   │   ├── utils
│   │   │   └── iconLoader.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── utils
├── src
│   ├── env.ts
│   └── index.ts
├── package.json
└── tsconfig.json
prisma
└── schema.prisma
