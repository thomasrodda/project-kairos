# User Stories - AI

_Extracted from AI System Prompt Files/01-Core/User Stories.md_

## AI Features

### 1. **Grammar and style suggestions**

> User Story:
>
> As a writer, I want the AI to suggest grammar and style improvements, so that my writing reads is of a higher quality.

Acceptance Criteria:

- A button or toggle enables AI suggestions.
- AI highlights grammar or style issues inline.
- Suggestions can be accepted or ignored individually.

Priority: Medium

**Complexity**: Medium

---

### 2. **Lore consistency checking**

> User Story:
>
> As a worldbuilder, I want the AI to detect contradictions or inconsistencies in my content, so that my world stays coherent.

Acceptance Criteria:

- AI scans workspace content using a vector database.
- The AI can scan for a specific topic or for any conflictions across the entire workspace (maybe)
- Users can review and accept/reject recommendations by picking which version of the lore is correct.
- The incorrect versions get updated with AI generated content that aligns with the correct lore.

Priority: Low (Phase 2)

**Complexity**: Very High

---

### 3. **Contextual lookup/search**

> User Story:
>
> As a writer, I want to highlight a term and have the AI show related context from my workspace, so that I can quickly reference relevant information.

Acceptance Criteria:

- Highlighting a term and clicking "AI Lookup" searches the workspace.
- Using the AI shortcut and typing a message also prompts the AI to search the workspace.
- Results are pulled from pages and blocks that mention the term.
- Clicking a result navigates to the source.

Priority: Low (Phase 2)

**Complexity**: Medium
