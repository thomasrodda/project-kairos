# Documentation Standards

This guide ensures consistency across all Project Kairos documentation. All documentation should follow these standards for structure, formatting, and content.

## General Principles

1. **Clarity First**: Write for developers who are new to the codebase
2. **Practical Examples**: Include real code examples from the actual implementation
3. **Maintenance**: Keep documentation in sync with code changes
4. **Searchability**: Use consistent terminology and clear headings

## Document Structure

### 1. Title and Header

Every document starts with:

```markdown
# [Document Title]

> [One-line description summarizing the document's purpose]

---
```

### 2. Overview Section

Begin with context:

- What is being documented
- Why it exists
- How it fits into the larger system
- Who should read this document

### 3. Status Indicators

Use these consistently:

- **Status**: Not Started | In Progress | Complete
- **Priority**: High | Medium | Low
- **Complexity**: Low | Medium | High
- **Last Updated**: YYYY-MM-DD

### 4. Code Examples

```typescript
// Always include the file path as a comment
// apps/web/src/components/Example.tsx

// Use real examples from the codebase when possible
const example = 'actual code from implementation'
```

## Formatting Standards

### Headings

- **H1 (#)**: Document title only
- **H2 (##)**: Major sections
- **H3 (###)**: Subsections
- **H4 (####)**: Rarely used, only for deep nesting

### Lists

Use task lists for trackable items:

```markdown
- [x] Completed item
- [ ] Pending item
```

Use bullet points for non-actionable items:

```markdown
- Information point
- Another point
  - Nested detail
```

### Tables

For structured data:

```markdown
| Column | Type   | Required | Description       |
| ------ | ------ | -------- | ----------------- |
| id     | string | Yes      | Unique identifier |
```

### Code Blocks

Always specify the language:

```typescript
// TypeScript code
```

```bash
# Shell commands
```

```json
{
  "json": "data"
}
```

### Emphasis

- **Bold** for important terms or first usage
- _Italics_ sparingly for emphasis
- `code` for inline code, file names, or technical terms
- > Blockquotes for important notes or warnings

## Cross-References

### Internal Links

Use relative paths:

```markdown
See [Component Guide](../03-Features/Component Structure Guide.md)
```

### File References

Include line numbers when referencing specific code:

```markdown
Implementation in `apps/web/src/components/Editor/Editor.tsx:45-67`
```

### Component Mapping

When documenting features, always map to actual components:

```markdown
**Components**:

- `apps/web/src/components/Feature/Feature.tsx` - Main component
- `apps/web/src/contexts/FeatureContext.tsx` - State management
- `apps/web/src/hooks/useFeature.ts` - Custom hook
```

## Document Types

### 1. Feature Documentation (User Stories)

Follow the [FEATURE_TEMPLATE.md](./FEATURE_TEMPLATE.md):

- User story format
- Acceptance criteria with checkboxes
- Component mappings
- Status tracking

### 2. Component Documentation

Follow the [COMPONENT_TEMPLATE.md](./COMPONENT_TEMPLATE.md):

- Props interface
- Usage examples
- Testing coverage
- Performance notes

### 3. API Documentation

Follow the [API_ENDPOINT_TEMPLATE.md](./API_ENDPOINT_TEMPLATE.md):

- Request/response formats
- Error handling
- Example calls
- Frontend usage

### 4. Architecture Documentation

Include:

- System diagrams (using Mermaid when possible)
- Data flow descriptions
- Technology choices with rationale
- Integration points

### 5. Guide Documentation

For how-to guides:

1. Clear objective statement
2. Prerequisites section
3. Step-by-step instructions
4. Troubleshooting section
5. Related resources

## Version Control

### Commit Messages for Docs

```
docs: [action] [what was changed]

Examples:
docs: add user stories for workspace feature
docs: update API endpoint documentation
docs: fix broken links in component guide
```

### Update Tracking

Always update the "Last Updated" date when making significant changes:

```markdown
**Last Updated**: 2025-01-23
```

## Common Patterns

### Status Blocks

```markdown
> **Current State**: As of January 23, 2025, [describe current state]
>
> **Note**: [Any important caveats or context]
```

### Feature Availability

```markdown
✅ **Implemented**: Feature is complete and working
⚠️ **Partial**: Basic functionality exists but incomplete  
❌ **Not Started**: Planned but not yet implemented
🐛 **Buggy**: Implemented but has known issues
```

### Dependency Notation

```markdown
**Dependencies**:

- [Feature Name]: [How they relate]
- Database: PostgreSQL with Prisma ORM
- Authentication: Firebase Auth
```

## Quality Checklist

Before finalizing any documentation:

- [ ] Title clearly describes content
- [ ] Overview provides context
- [ ] All code examples are from actual implementation
- [ ] Cross-references are working links
- [ ] Status indicators are current
- [ ] No placeholder text remains
- [ ] Formatting is consistent
- [ ] Technical accuracy verified against code

## Maintenance

### Regular Reviews

- Weekly: Update status indicators
- On PR: Update affected documentation
- Monthly: Audit for accuracy
- Quarterly: Major reorganization if needed

### Deprecation

When deprecating documentation:

1. Add deprecation notice at top
2. Link to replacement documentation
3. Keep for 3 months before removal
4. Update all references

```markdown
> ⚠️ **DEPRECATED**: This document is outdated. Please refer to [New Document](./new-doc.md) instead.
> This document will be removed after 2025-04-23.
```

## Tools and Automation

### Linting

Documentation should pass markdown linting:

```bash
markdownlint "AI System Prompt Files/**/*.md"
```

### Link Checking

Regularly verify all internal links:

```bash
# Tool to check for broken links
markdown-link-check "AI System Prompt Files/**/*.md"
```

## Getting Help

- For template questions: See the templates in `/templates/`
- For style questions: Refer to this guide
- For technical questions: Check existing examples in the codebase
