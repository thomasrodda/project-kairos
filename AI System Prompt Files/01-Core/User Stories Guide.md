# User Stories Guide

This guide provides instructions for writing effective user stories for Project Kairos. User stories capture feature requirements from the user's perspective.

## What is a User Story?

A user story is a short, simple description of a feature told from the perspective of the person who desires the new capability. It focuses on what the user wants to do and why, rather than how to implement it technically.

## Standard User Story Format

Every user story follows this format:

```
As a [type of user], I want to [action/goal], so that [benefit/value]
```

### Examples:

- **Good**: "As a writer, I want to press Enter to create a new text block, so that I can write my content one section at a time."
- **Poor**: "Add Enter key functionality to split blocks" (focuses on implementation, not user value)

## Writing Effective User Stories

### 1. Focus on User Value

- Always start with the user's perspective
- Clearly articulate the benefit or problem being solved
- Avoid technical jargon unless the user would naturally use it

### 2. Keep Stories Small and Specific

- Each story should represent a single, testable piece of functionality
- If a story feels too large, break it into smaller stories
- Aim for stories that can be implemented in 1-3 days

### 3. Make Stories Independent

- Stories should be implementable in any order when possible
- Document dependencies explicitly when they exist
- Avoid stories that require extensive prerequisite work

## Acceptance Criteria Guidelines

Acceptance criteria define what must be true for the story to be considered complete. They provide clear, testable conditions.

### Best Practices:

1. **Be Specific**: Use concrete, observable behaviors
2. **Cover Edge Cases**: Include what happens in unusual situations
3. **Define User Interactions**: Specify exact user actions and expected results
4. **Keep it Simple**: Focus on behavior, not implementation

### Example Format:

```
Acceptance Criteria:
- When [action], then [result]
- [Feature] should [behavior]
- If [condition], then [outcome]
```

## User Story Document Template

```markdown
# User Stories - [Feature Name]

Brief description of what this feature area covers.

## [Category Name]

### [Story Number]. **[Story Title]**

> User Story:
>
> As a [user type], I want to [action], so that [benefit].

Acceptance Criteria:

- [Specific testable criterion]
- [Another criterion]
- [Edge case handling]

Priority: [High/Medium/Low]

**Complexity**: [Low/Medium/High/Very High]

**Status**: [Not Started/In Progress/Complete]

**Dependencies**:

- [List any stories that must be completed first]
- None (if no dependencies)

**Components** (if implemented):

- [Component path, e.g., `apps/web/src/components/Editor/Block.tsx`]
- Not yet implemented (if not built)

---
```

## Implementation Status Tracking

### Status Levels:

- **Not Started**: Story has not been worked on
- **In Progress**: Active development or partially complete
- **Complete**: All acceptance criteria met and tested

### Updating Status:

1. Update status when beginning work on a story
2. Include completion percentage if partially done (e.g., "In Progress - 70%")
3. Only mark "Complete" when all acceptance criteria are satisfied
4. Add implementation notes when marking complete

## Component Mapping

Component mapping helps developers and AI assistants quickly locate where features are implemented.

### For Implemented Features:

```markdown
**Components**:

- `apps/web/src/components/Editor/Block.tsx` - Main block component
- `apps/web/src/components/Editor/EditorContent.tsx` - Container and event handling
- `apps/web/src/contexts/EditorContext.tsx` - State management
```

### For Unimplemented Features:

```markdown
**Components**: Not yet implemented
```

## Examples of Well-Written User Stories

### Example 1: Simple Feature

```markdown
### 1. **Typing and creating blocks**

> User Story:
>
> As a user, I want to press "Enter" to create a new text block, so that I can write my content one section at a time.

Acceptance Criteria:

- Pressing "Enter" splits the current block and creates a new one below
- The new block is focused and ready for typing
- The new block defaults to paragraph type, unless continuing a list
- Cursor position is preserved when splitting mid-text
- Empty blocks are created when pressing Enter at the end of a block

Priority: High

**Complexity**: Low

**Status**: Complete

**Dependencies**: None

**Components**:

- `apps/web/src/components/Editor/EditorContent.tsx` - Handles Enter key events
- `apps/web/src/contexts/EditorContext.tsx` - ADD_BLOCK action
- `apps/web/src/utils/blockUtils.ts` - createBlock() function
```

### Example 2: Medium Complexity Feature

```markdown
### 2. **Changing block type via slash command**

> User Story:
>
> As a user, I want to type "/" to open a block menu, so that I can change a block into a heading, list, or other type.

Acceptance Criteria:

- Typing "/" at the start of a block opens a floating menu
- Menu shows options like Heading 1, Heading 2, Bullet List, Paragraph
- User can navigate options with arrow keys or mouse
- Pressing Enter or clicking selects the highlighted option
- Typing filters the options in real-time
- Pressing Escape or clicking outside closes the menu
- The slash character is removed after selecting an option

Priority: High

**Complexity**: Medium

**Status**: Complete

**Dependencies**:

- Block creation must be implemented first

**Components**:

- `apps/web/src/components/Editor/SlashCommandMenu/` - Menu component
- `apps/web/src/components/Editor/EditorContent.tsx` - Triggers menu
- `apps/web/src/hooks/useSlashCommands.ts` - Menu logic
```

## Directory of User Story Documents

All user stories are organized by feature area in `AI System Prompt Files/03-Features/`:

### Core Features

- **[Editor/User Stories - Editor.md](../03-Features/Editor/User Stories - Editor.md)** - Block management, drag/drop, copy/paste
- **[TextFormatting/User Stories - Text Formatting.md](../03-Features/TextFormatting/User Stories - Text Formatting.md)** - Bold, italic, links, markdown
- **[PageManagement/User Stories - Page Management.md](../03-Features/PageManagement/User Stories - Page Management.md)** - Create, delete, rename pages
- **[Workspace/User Stories - Workspace.md](../03-Features/Workspace/User Stories - Workspace.md)** - Multiple workspaces, navigation
- **[Authentication/User Stories - Authentication.md](../03-Features/Authentication/User Stories - Authentication.md)** - Login, user management
- **[DataManagement/User Stories - Data Management.md](../03-Features/DataManagement/User Stories - Data Management.md)** - Save, sync, import/export

### Future Features

- **[AI/](../03-Features/AI/)** - Grammar checking, consistency, smart search
- **[Collaboration/](../03-Features/Collaboration/)** - Multi-user editing

## Best Practices Summary

1. **Focus on the user** - Write from their perspective, not the developer's
2. **Be clear and specific** - Avoid ambiguity in acceptance criteria
3. **Keep it simple** - Don't over-engineer or add unnecessary complexity
4. **Update regularly** - Keep status and implementation details current
5. **Link dependencies** - Make relationships between stories clear

When writing or updating user stories, remember that they should be easily understood by anyone on the team - developers, designers, product managers, and even AI assistants helping with implementation.
