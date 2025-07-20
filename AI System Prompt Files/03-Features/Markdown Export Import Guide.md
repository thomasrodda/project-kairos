# Markdown Export/Import Guide

## Overview

Project Kairos supports full markdown export and import functionality, allowing users to:

- Export their pages as standard markdown files
- Import existing markdown documents into the block editor
- Maintain formatting and structure during conversion

## Data Structure Foundation

Our block storage format is designed for easy markdown conversion:

```typescript
interface Block {
  id: string
  type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'bullet'
  content: string // Plain text content
  formatting: TextFormat[] // Separate formatting layer
  position: number
}

interface TextFormat {
  start: number
  end: number
  type: 'bold' | 'italic' | 'underline' | 'link'
  data?: { url: string }
}
```

## Export: Blocks to Markdown

### Basic Conversion Algorithm

```typescript
export async function exportPageToMarkdown(pageId: string): Promise<string> {
  // 1. Fetch all blocks for the page
  const blocks = await api.getBlocks(pageId)

  // 2. Sort by position
  const sortedBlocks = blocks.sort((a, b) => a.position - b.position)

  // 3. Convert each block
  const markdownLines = sortedBlocks.map((block) => {
    // Apply inline formatting first
    let formattedContent = applyFormattingToContent(block.content, block.formatting)

    // Then apply block-level formatting
    return convertBlockToMarkdown(block.type, formattedContent)
  })

  // 4. Join with appropriate spacing
  return markdownLines.join('\n\n')
}
```

### Block Type Conversion

```typescript
function convertBlockToMarkdown(type: BlockType, content: string): string {
  const blockTypeMap: Record<BlockType, (content: string) => string> = {
    h1: (c) => `# ${c}`,
    h2: (c) => `## ${c}`,
    h3: (c) => `### ${c}`,
    paragraph: (c) => c,
    bullet: (c) => `- ${c}`,
  }

  return blockTypeMap[type](content)
}
```

### Inline Formatting Conversion

```typescript
function applyFormattingToContent(content: string, formatting: TextFormat[]): string {
  // Sort formatting by start position (reverse to apply from end to start)
  const sortedFormatting = [...formatting].sort((a, b) => b.start - a.start)

  let result = content

  for (const format of sortedFormatting) {
    const before = result.slice(0, format.start)
    const formatted = result.slice(format.start, format.end)
    const after = result.slice(format.end)

    switch (format.type) {
      case 'bold':
        result = `${before}**${formatted}**${after}`
        break
      case 'italic':
        result = `${before}*${formatted}*${after}`
        break
      case 'underline':
        // Markdown doesn't support underline, use HTML
        result = `${before}<u>${formatted}</u>${after}`
        break
      case 'link':
        result = `${before}[${formatted}](${format.data?.url || ''})${after}`
        break
    }
  }

  return result
}
```

### Handling Overlapping Formatting

When multiple formats overlap, we need to handle them carefully:

```typescript
function handleOverlappingFormats(content: string, formatting: TextFormat[]): string {
  // Create a map of all format boundaries
  const boundaries = new Set<number>()
  formatting.forEach((f) => {
    boundaries.add(f.start)
    boundaries.add(f.end)
  })

  // Sort boundaries
  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b)

  // Build result by processing each segment
  let result = ''

  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const start = sortedBoundaries[i]
    const end = sortedBoundaries[i + 1]
    const segment = content.slice(start, end)

    // Find all active formats for this segment
    const activeFormats = formatting.filter((f) => f.start <= start && f.end >= end)

    // Apply formats in correct order (link > bold > italic)
    let formattedSegment = segment

    if (activeFormats.some((f) => f.type === 'italic')) {
      formattedSegment = `*${formattedSegment}*`
    }
    if (activeFormats.some((f) => f.type === 'bold')) {
      formattedSegment = `**${formattedSegment}**`
    }
    const linkFormat = activeFormats.find((f) => f.type === 'link')
    if (linkFormat) {
      formattedSegment = `[${formattedSegment}](${linkFormat.data?.url || ''})`
    }

    result += formattedSegment
  }

  // Add any remaining content
  if (sortedBoundaries.length > 0) {
    result = content.slice(0, sortedBoundaries[0]) + result + content.slice(sortedBoundaries[sortedBoundaries.length - 1])
  }

  return result
}
```

## Import: Markdown to Blocks

### Parsing Strategy

```typescript
export async function importMarkdownToPage(markdown: string, pageId: string): Promise<void> {
  // 1. Split into lines
  const lines = markdown.split('\n')

  // 2. Group lines into blocks
  const blocks: CreateBlockInput[] = []
  let currentBlock: string[] = []
  let position = 1000 // Start position

  for (const line of lines) {
    if (line.trim() === '') {
      // Empty line ends current block
      if (currentBlock.length > 0) {
        blocks.push(parseBlock(currentBlock.join('\n'), position))
        position += 1000
        currentBlock = []
      }
    } else {
      currentBlock.push(line)
    }
  }

  // Don't forget the last block
  if (currentBlock.length > 0) {
    blocks.push(parseBlock(currentBlock.join('\n'), position))
  }

  // 3. Create blocks in database
  await api.createBlocks(pageId, blocks)
}
```

### Block Type Detection

```typescript
function parseBlock(text: string, position: number): CreateBlockInput {
  // Detect block type
  const blockPatterns: Array<[RegExp, BlockType, (match: RegExpMatchArray) => string]> = [
    [/^# (.+)$/, 'h1', (m) => m[1]],
    [/^## (.+)$/, 'h2', (m) => m[1]],
    [/^### (.+)$/, 'h3', (m) => m[1]],
    [/^- (.+)$/, 'bullet', (m) => m[1]],
    [/^\* (.+)$/, 'bullet', (m) => m[1]],
    [/^[0-9]+\. (.+)$/, 'bullet', (m) => m[1]], // Convert numbered lists to bullets for now
  ]

  for (const [pattern, type, extractor] of blockPatterns) {
    const match = text.match(pattern)
    if (match) {
      const content = extractor(match)
      const { plainText, formatting } = parseInlineFormatting(content)

      return {
        type,
        content: plainText,
        formatting,
        position,
      }
    }
  }

  // Default to paragraph
  const { plainText, formatting } = parseInlineFormatting(text)
  return {
    type: 'paragraph',
    content: plainText,
    formatting,
    position,
  }
}
```

### Inline Formatting Parsing

```typescript
function parseInlineFormatting(markdown: string): { plainText: string; formatting: TextFormat[] } {
  const formatting: TextFormat[] = []
  let plainText = markdown
  let offset = 0

  // Parse links first (most complex)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let linkMatch

  while ((linkMatch = linkRegex.exec(markdown)) !== null) {
    const linkText = linkMatch[1]
    const linkUrl = linkMatch[2]
    const startInOriginal = linkMatch.index
    const startInPlain = startInOriginal - offset

    formatting.push({
      start: startInPlain,
      end: startInPlain + linkText.length,
      type: 'link',
      data: { url: linkUrl },
    })

    // Replace in plainText
    plainText = plainText.slice(0, startInPlain) + linkText + plainText.slice(startInPlain + linkMatch[0].length)
    offset += linkMatch[0].length - linkText.length
  }

  // Parse bold (must come before italic to handle ***)
  plainText = parseSimpleFormat(plainText, /\*\*([^*]+)\*\*/g, 'bold', formatting)

  // Parse italic
  plainText = parseSimpleFormat(plainText, /\*([^*]+)\*/g, 'italic', formatting)

  // Parse underline (HTML style)
  plainText = parseSimpleFormat(plainText, /<u>([^<]+)<\/u>/g, 'underline', formatting)

  return { plainText, formatting }
}

function parseSimpleFormat(text: string, regex: RegExp, type: TextFormat['type'], formatting: TextFormat[]): string {
  let result = text
  let match
  let offset = 0

  while ((match = regex.exec(text)) !== null) {
    const content = match[1]
    const startInOriginal = match.index
    const startInResult = startInOriginal - offset

    formatting.push({
      start: startInResult,
      end: startInResult + content.length,
      type,
    })

    result = result.slice(0, startInResult) + content + result.slice(startInResult + match[0].length)
    offset += match[0].length - content.length
  }

  return result
}
```

## API Endpoints

### Export Endpoints

```typescript
// Export single page
GET /api/pages/:pageId/export
Response:
{
  "filename": "page-title.md",
  "content": "# Page Title\n\nContent here...",
  "mimeType": "text/markdown"
}

// Export entire workspace
GET /api/workspaces/:workspaceId/export
Response: ZIP file containing:
/
├── workspace-name/
│   ├── page1.md
│   ├── page2.md
│   └── folder/
│       └── nested-page.md
```

### Import Endpoints

```typescript
// Import markdown to new page
POST /api/pages/import
Body: {
  "workspaceId": "...",
  "parentId": "...", // optional
  "markdown": "# Title\n\nContent...",
  "filename": "document.md" // optional, for title extraction
}

// Import multiple files
POST /api/workspaces/:workspaceId/import
Body: FormData with multiple .md files
```

## Frontend Implementation

### Export UI

```typescript
function ExportButton({ pageId }: { pageId: string }) {
  const handleExport = async () => {
    const response = await api.exportPage(pageId);

    // Create download link
    const blob = new Blob([response.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return <button onClick={handleExport}>Export as Markdown</button>;
}
```

### Import UI

```typescript
function ImportButton({ workspaceId }: { workspaceId: string }) {
  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const markdown = await file.text();
    await api.importMarkdown({
      workspaceId,
      markdown,
      filename: file.name
    });

    // Refresh page list
    router.refresh();
  };

  return (
    <input
      type="file"
      accept=".md,.markdown"
      onChange={handleImport}
    />
  );
}
```

## Edge Cases & Considerations

### 1. Large Files

- Stream processing for files > 10MB
- Progress indicators for import/export
- Chunked upload/download

### 2. Special Characters

- Escape special markdown characters in content
- Handle Unicode properly
- Preserve HTML entities

### 3. Future Enhancements

- Support for tables (when added to editor)
- Image export/import
- Code block support
- Custom metadata in YAML frontmatter

### 4. Format Preservation

- Maintain spacing and indentation
- Preserve list continuity
- Handle nested structures

## Testing

```typescript
describe('Markdown Conversion', () => {
  it('should export blocks to markdown correctly', async () => {
    const blocks = [
      { type: 'h1', content: 'Title', formatting: [] },
      { type: 'paragraph', content: 'Text with bold', formatting: [{ start: 10, end: 14, type: 'bold' }] },
    ]

    const markdown = await exportToMarkdown(blocks)
    expect(markdown).toBe('# Title\n\nText with **bold**')
  })

  it('should import markdown to blocks correctly', async () => {
    const markdown = '# Title\n\nText with **bold**'
    const blocks = await importMarkdown(markdown)

    expect(blocks[0].type).toBe('h1')
    expect(blocks[1].formatting[0].type).toBe('bold')
  })
})
```

This system ensures full fidelity when exporting and importing content, making Project Kairos compatible with the broader markdown ecosystem while maintaining its rich editing capabilities.
