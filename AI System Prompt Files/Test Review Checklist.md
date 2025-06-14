# Test Review Checklist

> Comprehensive list of all tests in Project Kairos for systematic quality review. Use the Test Evaluation Guide.md alongside this checklist.

---

## Review Status Legend

- [ ] Not reviewed
- [🔍] In review
- [✅] Reviewed - Good quality (Score: 13-20)
- [⚠️] Reviewed - Needs improvement (Score: 9-12)
- [❌] Reviewed - Poor quality (Score: 4-8)

---

## Apps/Web Tests (Main Application)

### Editor Core Components

- [ ] **Editor.test.tsx** - Main editor component

  - Location: `apps/web/src/components/Editor/Editor.test.tsx`
  - Score: _/20 (Behavior: _/5, Bugs: _/5, Coverage: _/5, Maintainability: \_/5)
  - Notes:

- [ ] **Editor.integration.test.tsx** - Editor integration tests

  - Location: `apps/web/src/components/Editor/Editor.integration.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **Editor.performance.test.tsx** - Editor performance tests

  - Location: `apps/web/src/components/Editor/Editor.performance.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **Editor.performance.simple.test.tsx** - Simple performance tests
  - Location: `apps/web/src/components/Editor/Editor.performance.simple.test.tsx`
  - Score: \_/20
  - Notes:

### Editor Sub-Components

- [ ] **Block.test.tsx** - Individual block component

  - Location: `apps/web/src/components/Editor/Block/Block.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **BlockDragHandle.test.tsx** - Block drag functionality

  - Location: `apps/web/src/components/Editor/Block/BlockDragHandle.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **EditorContent.test.tsx** - Editor content container

  - Location: `apps/web/src/components/Editor/EditorContent/EditorContent.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **PageTitle.test.tsx** - Page title component
  - Location: `apps/web/src/components/Editor/PageTitle/PageTitle.test.tsx`
  - Score: \_/20
  - Notes:

### ContentEditable Tests

- [ ] **ContentEditableContainer.test.tsx** - Main content editable

  - Location: `apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **ContentEditableContainer.simple.test.tsx** - Simple content editable tests

  - Location: `apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.simple.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **ContentEditableContainer.slashcommand.test.tsx** - Slash command tests

  - Location: `apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.slashcommand.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **ContentEditableContainer.markdown.test.tsx** - Markdown tests
  - Location: `apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.markdown.test.tsx`
  - Score: \_/20
  - Notes:

### UI Features

- [ ] **SlashCommandMenu.test.tsx** - Slash command menu

  - Location: `apps/web/src/components/Editor/SlashCommandMenu/SlashCommandMenu.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **FormattingToolbar.test.tsx** - Text formatting toolbar
  - Location: `apps/web/src/components/Editor/FormattingToolbar/FormattingToolbar.test.tsx`
  - Score: \_/20
  - Notes:

### Layout Components

- [ ] **Sidebar.test.tsx** - Sidebar navigation

  - Location: `apps/web/src/components/Sidebar/Sidebar.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **SidebarButton.test.tsx** - Sidebar button component

  - Location: `apps/web/src/components/SidebarButton/SidebarButton.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **Workspace.test.tsx** - Main workspace layout
  - Location: `apps/web/src/components/Workspace/Workspace.test.tsx`
  - Score: \_/20
  - Notes:

### Context & State

- [ ] **EditorContext.test.tsx** - Editor state management
  - Location: `apps/web/src/contexts/EditorContext.test.tsx`
  - Score: \_/20
  - Notes:

### Hooks

- [ ] **useCrossBlockSelection.test.tsx** - Cross-block selection hook

  - Location: `apps/web/src/hooks/useCrossBlockSelection.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **useDismiss.test.ts** - Dismiss behavior hook
  - Location: `apps/web/src/hooks/useDismiss.test.ts`
  - Score: \_/20
  - Notes:

### Utilities

- [ ] **textSelection.test.ts** - Text selection utilities

  - Location: `apps/web/src/utils/textSelection.test.ts`
  - Score: \_/20
  - Notes:

- [ ] **textFormatting.test.ts** - Text formatting utilities

  - Location: `apps/web/src/utils/textFormatting.test.ts`
  - Score: \_/20
  - Notes:

- [ ] **markdownDetection.test.ts** - Markdown detection utilities
  - Location: `apps/web/src/utils/markdownDetection.test.ts`
  - Score: \_/20
  - Notes:

### Integration Tests

- [ ] **Editor.integration.test.tsx** - Full editor integration

  - Location: `apps/web/src/integration/Editor.integration.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **markdown-detection.test.tsx** - Markdown detection integration
  - Location: `apps/web/src/integration/markdown-detection.test.tsx`
  - Score: \_/20
  - Notes:

### App Level

- [ ] **App.test.tsx** - Main app component
  - Location: `apps/web/src/App.test.tsx`
  - Score: \_/20
  - Notes:

---

## Packages Tests

### @kairos/ui Package

- [ ] **Icon.test.tsx** - Icon component

  - Location: `packages/ui/src/components/Icon/Icon.test.tsx`
  - Score: \_/20
  - Notes:

- [ ] **svgContentLoader.test.ts** - SVG content loading

  - Location: `packages/ui/src/utils/svgContentLoader.test.ts`
  - Score: \_/20
  - Notes:

- [ ] **iconPerformance.test.ts** - Icon performance
  - Location: `packages/ui/src/utils/iconPerformance.test.ts`
  - Score: \_/20
  - Notes:

### @kairos/utils Package

- [ ] **index.test.ts** - Utils main exports

  - Location: `packages/utils/src/index.test.ts`
  - Score: \_/20
  - Notes:

- [ ] **env.test.ts** - Environment utilities
  - Location: `packages/utils/src/env.test.ts`
  - Score: \_/20
  - Notes:

### API Tests

- [ ] **hello.test.ts** - API hello endpoint
  - Location: `apps/api/hello.test.ts`
  - Score: \_/20
  - Notes:

---

## Summary Statistics

**Total Test Files**: 32

**Review Progress**:

- Not reviewed: 32
- In review: 0
- Good quality (✅): 0
- Needs improvement (⚠️): 0
- Poor quality (❌): 0

**Average Quality Score**: \_/20

---

## Priority Review Order

Based on component criticality, review in this order:

### High Priority (Core Editor Functionality)

1. EditorContext.test.tsx - Central state management
2. ContentEditableContainer.test.tsx - Core editing functionality
3. Block.test.tsx - Basic building block
4. Editor.test.tsx - Main component
5. Editor.integration.test.tsx - Full flow testing

### Medium Priority (Important Features)

6. SlashCommandMenu.test.tsx - Key user feature
7. FormattingToolbar.test.tsx - Text formatting
8. textFormatting.test.ts - Formatting logic
9. useCrossBlockSelection.test.tsx - Selection behavior
10. markdownDetection.test.ts - Markdown support

### Lower Priority (Supporting Components)

11. Sidebar.test.tsx - Navigation
12. Workspace.test.tsx - Layout
13. PageTitle.test.tsx - Title editing
14. Icon.test.tsx - UI components
15. Other utility tests

---

## Review Notes Template

When reviewing each test, document:

```markdown
### [Test File Name]

**Review Date**: YYYY-MM-DD
**Reviewer**: [Name]
**Score**: X/20 (Behavior: X/5, Bugs: X/5, Coverage: X/5, Maintainability: X/5)

**Strengths**:

- **Issues Found**:

- **Recommendations**:

- **Priority**: High/Medium/Low
```

---

## Next Steps

1. Start with high-priority tests
2. Use Test Evaluation Guide.md for scoring
3. Document findings in this checklist
4. Create issues for tests needing improvement
5. Update test files based on recommendations
6. Re-review after improvements
