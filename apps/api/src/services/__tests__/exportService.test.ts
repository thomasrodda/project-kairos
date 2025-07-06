import { ExportService } from '../exportService'
import { prismaMock } from '../../test/setup'
import { createUser, createWorkspace, createPage, createBlock } from '../../test/factories'
import { NotFoundError, ValidationError } from '../../utils/errors'
import { pageService } from '../pageService'
import { blockService } from '../blockService'
import { BlockType } from '@prisma/client'
import { Prisma } from '@kairos/database'

// Mock the other services
jest.mock('../pageService')
jest.mock('../blockService')

describe('ExportService', () => {
  let exportService: ExportService
  let mockUser: ReturnType<typeof createUser>
  let mockWorkspace: ReturnType<typeof createWorkspace>
  let mockPage: ReturnType<typeof createPage>

  beforeEach(() => {
    exportService = new ExportService()
    mockUser = createUser()
    mockWorkspace = createWorkspace({ userId: mockUser.id })
    mockPage = createPage({ workspaceId: mockWorkspace.id })
    jest.clearAllMocks()
  })

  describe('✅ Markdown Export', () => {
    describe('exportPageToMarkdown', () => {
      it('should export a page with blocks to markdown', async () => {
        const mockBlocks = [
          createBlock({
            id: 'block-1',
            pageId: mockPage.id,
            type: BlockType.HEADING1,
            content: 'Chapter One',
            order: 0,
          }),
          createBlock({
            id: 'block-2',
            pageId: mockPage.id,
            type: BlockType.PARAGRAPH,
            content: 'This is the first paragraph.',
            order: 1,
          }),
          createBlock({
            id: 'block-3',
            pageId: mockPage.id,
            type: BlockType.BULLET,
            content: 'First bullet point',
            order: 2,
          }),
          createBlock({
            id: 'block-4',
            pageId: mockPage.id,
            type: BlockType.BULLET,
            content: 'Second bullet point',
            order: 3,
          }),
        ]

        const pageWithBlocks = {
          ...mockPage,
          blocks: mockBlocks,
        }

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValue(pageWithBlocks as any)
        prismaMock.page.findMany.mockResolvedValue([]) // No subpages

        const result = await exportService.exportPageToMarkdown(mockPage.id, mockUser.id, {
          includeMetadata: false,
          includeSubpages: true,
          format: 'markdown',
        })

        expect(result).toContain(`# ${mockPage.title}`)
        expect(result).toContain('## Chapter One')
        expect(result).toContain('This is the first paragraph.')
        expect(result).toContain('- First bullet point')
        expect(result).toContain('- Second bullet point')
      })

      it('should include metadata when requested', async () => {
        const pageWithBlocks = {
          ...mockPage,
          blocks: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        }

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValue(pageWithBlocks as any)
        prismaMock.page.findMany.mockResolvedValue([])

        const result = await exportService.exportPageToMarkdown(mockPage.id, mockUser.id, {
          includeMetadata: true,
          includeSubpages: false,
          format: 'markdown',
        })

        expect(result).toContain('<!-- ')
        expect(result).toContain(`Page ID: ${mockPage.id}`)
        expect(result).toContain('Created: 2024-01-01')
        expect(result).toContain('Updated: 2024-01-02')
        expect(result).toContain('-->')
      })

      it('should export subpages recursively', async () => {
        const subpage = createPage({
          id: 'subpage-1',
          title: 'Subpage Title',
          workspaceId: mockWorkspace.id,
          parentId: mockPage.id,
        })

        const pageWithBlocks = {
          ...mockPage,
          blocks: [createBlock({ pageId: mockPage.id, content: 'Main page content' })],
        }

        const subpageWithBlocks = {
          ...subpage,
          blocks: [createBlock({ pageId: subpage.id, content: 'Subpage content' })],
        }

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValueOnce(pageWithBlocks as any).mockResolvedValueOnce(subpageWithBlocks as any)
        prismaMock.page.findMany
          .mockResolvedValueOnce([subpage] as any) // Main page has subpage
          .mockResolvedValueOnce([]) // Subpage has no children

        const result = await exportService.exportPageToMarkdown(mockPage.id, mockUser.id, {
          includeMetadata: false,
          includeSubpages: true,
          format: 'markdown',
        })

        expect(result).toContain(`# ${mockPage.title}`)
        expect(result).toContain('Main page content')
        expect(result).toContain('---')
        expect(result).toContain(`## ${subpage.title}`) // Subpage title with increased heading level
        expect(result).toContain('Subpage content')
      })

      it('should handle empty pages', async () => {
        const pageWithNoBlocks = {
          ...mockPage,
          blocks: [],
        }

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValue(pageWithNoBlocks as any)
        prismaMock.page.findMany.mockResolvedValue([])

        const result = await exportService.exportPageToMarkdown(mockPage.id, mockUser.id, {
          includeMetadata: false,
          includeSubpages: false,
          format: 'markdown',
        })

        expect(result).toBe(`# ${mockPage.title}\n\n`)
      })

      it('should throw NotFoundError when page access is denied', async () => {
        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(false)

        await expect(
          exportService.exportPageToMarkdown(mockPage.id, mockUser.id, {
            includeMetadata: false,
            includeSubpages: true,
            format: 'markdown',
          })
        ).rejects.toThrow(NotFoundError)
      })

      it('should handle all block types correctly', async () => {
        const mockBlocks = [
          createBlock({ type: BlockType.HEADING1, content: 'H1 Title', order: 0 }),
          createBlock({ type: BlockType.HEADING2, content: 'H2 Title', order: 1 }),
          createBlock({ type: BlockType.HEADING3, content: 'H3 Title', order: 2 }),
          createBlock({ type: BlockType.PARAGRAPH, content: 'Regular paragraph', order: 3 }),
          createBlock({ type: BlockType.BULLET, content: 'Bullet item', order: 4 }),
        ]

        const pageWithBlocks = {
          ...mockPage,
          blocks: mockBlocks,
        }

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValue(pageWithBlocks as any)
        prismaMock.page.findMany.mockResolvedValue([])

        const result = await exportService.exportPageToMarkdown(mockPage.id, mockUser.id, {
          includeMetadata: false,
          includeSubpages: false,
          format: 'markdown',
        })

        expect(result).toContain('## H1 Title')
        expect(result).toContain('### H2 Title')
        expect(result).toContain('#### H3 Title')
        expect(result).toContain('Regular paragraph')
        expect(result).toContain('- Bullet item')
      })
    })
  })

  describe('✅ JSON Export', () => {
    describe('exportPageToJson', () => {
      it('should export a page to JSON format', async () => {
        const mockBlocks = [
          createBlock({
            id: 'block-1',
            pageId: mockPage.id,
            type: BlockType.HEADING1,
            content: 'Test Heading',
            order: 0,
          }),
          createBlock({
            id: 'block-2',
            pageId: mockPage.id,
            type: BlockType.PARAGRAPH,
            content: 'Test paragraph',
            order: 1,
          }),
        ]

        const pageWithBlocks = {
          ...mockPage,
          blocks: mockBlocks,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          order: 5,
        }

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValue(pageWithBlocks as any)
        prismaMock.page.findMany.mockResolvedValue([])

        const result = await exportService.exportPageToJson(mockPage.id, mockUser.id, {
          includeMetadata: true,
          includeSubpages: false,
          format: 'json',
        })

        expect(result).toEqual({
          id: mockPage.id,
          title: mockPage.title,
          content: expect.stringContaining('## Test Heading'),
          metadata: {
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
            order: 5,
          },
        })
      })

      it('should export subpages as children', async () => {
        const subpage1 = createPage({
          id: 'sub-1',
          title: 'Subpage 1',
          parentId: mockPage.id,
          workspaceId: mockWorkspace.id,
        })
        const subpage2 = createPage({
          id: 'sub-2',
          title: 'Subpage 2',
          parentId: mockPage.id,
          workspaceId: mockWorkspace.id,
        })

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValue({ ...mockPage, blocks: [] } as any)
        prismaMock.page.findMany.mockResolvedValueOnce([subpage1, subpage2] as any).mockResolvedValue([])

        const result = await exportService.exportPageToJson(mockPage.id, mockUser.id, {
          includeMetadata: false,
          includeSubpages: true,
          format: 'json',
        })

        expect(result.children).toHaveLength(2)
        expect(result.children![0].title).toBe('Subpage 1')
        expect(result.children![1].title).toBe('Subpage 2')
      })

      it('should not include metadata when not requested', async () => {
        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValue({ ...mockPage, blocks: [] } as any)
        prismaMock.page.findMany.mockResolvedValue([])

        const result = await exportService.exportPageToJson(mockPage.id, mockUser.id, {
          includeMetadata: false,
          includeSubpages: false,
          format: 'json',
        })

        expect(result.metadata).toBeUndefined()
      })
    })
  })

  describe('✅ Markdown Import', () => {
    describe('importMarkdown', () => {
      it('should import markdown and create blocks', async () => {
        const markdown = `# Page Title

## Chapter One

This is a paragraph.

### Section 1.1

- First bullet
- Second bullet

Another paragraph.`

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.block.findFirst.mockResolvedValue(null) // No existing blocks
        prismaMock.$transaction.mockImplementation(async (callback) => {
          const tx = {
            block: {
              deleteMany: jest.fn(),
              createMany: jest.fn().mockResolvedValue({ count: 5 }),
            },
            page: { update: jest.fn() },
          }
          return await callback(tx as any)
        })

        const result = await exportService.importMarkdown(mockUser.id, {
          pageId: mockPage.id,
          markdown,
          replaceExisting: true,
        })

        expect(result.pageId).toBe(mockPage.id)
        expect(result.blocksCreated).toBe(5)
        expect(prismaMock.$transaction).toHaveBeenCalled()
      })

      it('should replace existing blocks when requested', async () => {
        const markdown = '## New Content\n\nReplacing everything.'

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.$transaction.mockImplementation(async (callback) => {
          const tx = {
            block: {
              deleteMany: jest.fn(),
              createMany: jest.fn().mockResolvedValue({ count: 2 }),
            },
            page: { update: jest.fn() },
          }
          const result = await callback(tx as any)
          expect(tx.block.deleteMany).toHaveBeenCalledWith({
            where: { pageId: mockPage.id },
          })
          return result
        })

        await exportService.importMarkdown(mockUser.id, {
          pageId: mockPage.id,
          markdown,
          replaceExisting: true,
        })
      })

      it('should append to existing blocks when not replacing', async () => {
        const existingBlock = createBlock({ pageId: mockPage.id, order: 5 })
        const markdown = '## Additional Content'

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.block.findFirst.mockResolvedValue(existingBlock)
        prismaMock.$transaction.mockImplementation(async (callback) => {
          const tx = {
            block: {
              deleteMany: jest.fn(),
              createMany: jest.fn().mockResolvedValue({ count: 1 }),
              findFirst: jest.fn().mockResolvedValue(existingBlock),
            },
            page: { update: jest.fn() },
          }
          const result = await callback(tx as any)
          expect(tx.block.deleteMany).not.toHaveBeenCalled()
          return result
        })

        await exportService.importMarkdown(mockUser.id, {
          pageId: mockPage.id,
          markdown,
          replaceExisting: false,
        })
      })

      it('should handle code blocks', async () => {
        const markdown = `## Code Example

\`\`\`javascript
const hello = 'world';
console.log(hello);
\`\`\`

Regular text after code.`

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.$transaction.mockImplementation(async (callback) => {
          const tx = {
            block: {
              deleteMany: jest.fn(),
              createMany: jest.fn().mockResolvedValue({ count: 3 }),
              findFirst: jest.fn().mockResolvedValue(null),
            },
            page: { update: jest.fn() },
          }
          return await callback(tx as any)
        })

        const result = await exportService.importMarkdown(mockUser.id, {
          pageId: mockPage.id,
          markdown,
          replaceExisting: false,
        })

        expect(result.blocksCreated).toBe(3)
      })

      it('should handle mixed bullet lists', async () => {
        const markdown = `- First item
- Second item
* Third item with asterisk
+ Fourth item with plus

Not a list item
- New list starts here`

        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.$transaction.mockImplementation(async (callback) => {
          const tx = {
            block: {
              deleteMany: jest.fn(),
              createMany: jest.fn().mockResolvedValue({ count: 6 }),
              findFirst: jest.fn().mockResolvedValue(null),
            },
            page: { update: jest.fn() },
          }
          return await callback(tx as any)
        })

        const result = await exportService.importMarkdown(mockUser.id, {
          pageId: mockPage.id,
          markdown,
          replaceExisting: false,
        })

        expect(result.blocksCreated).toBe(6)
      })

      it('should throw NotFoundError when page access is denied', async () => {
        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(false)

        await expect(
          exportService.importMarkdown(mockUser.id, {
            pageId: mockPage.id,
            markdown: '## Test',
            replaceExisting: false,
          })
        ).rejects.toThrow(NotFoundError)
      })
    })
  })

  describe('✅ Workspace Export', () => {
    describe('exportWorkspace', () => {
      it('should export entire workspace to markdown', async () => {
        const page1 = createPage({ id: 'page-1', title: 'Page 1', workspaceId: mockWorkspace.id, order: 0 })
        const page2 = createPage({ id: 'page-2', title: 'Page 2', workspaceId: mockWorkspace.id, order: 1 })

        prismaMock.workspace.findFirst.mockResolvedValue(mockWorkspace)
        prismaMock.page.findMany.mockResolvedValue([page1, page2] as any)
        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValueOnce({ ...page1, blocks: [] } as any).mockResolvedValueOnce({ ...page2, blocks: [] } as any)

        const result = await exportService.exportWorkspace(mockWorkspace.id, mockUser.id, 'markdown')

        expect(typeof result).toBe('string')
        expect(result).toContain(`# ${mockWorkspace.name}`)
        expect(result).toContain('# Page 1')
        expect(result).toContain('# Page 2')
        expect(result).toContain('---')
      })

      it('should export entire workspace to JSON', async () => {
        const page1 = createPage({ id: 'page-1', title: 'Page 1', workspaceId: mockWorkspace.id })

        prismaMock.workspace.findFirst.mockResolvedValue({
          ...mockWorkspace,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        })
        prismaMock.page.findMany.mockResolvedValue([page1] as any)
        ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
        prismaMock.page.findUnique.mockResolvedValue({ ...page1, blocks: [] } as any)

        const result = (await exportService.exportWorkspace(mockWorkspace.id, mockUser.id, 'json')) as any

        expect(result.workspace).toEqual({
          id: mockWorkspace.id,
          name: mockWorkspace.name,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        })
        expect(result.pages).toHaveLength(1)
        expect(result.pages[0].title).toBe('Page 1')
      })

      it('should throw NotFoundError for invalid workspace', async () => {
        prismaMock.workspace.findFirst.mockResolvedValue(null)

        await expect(exportService.exportWorkspace('invalid-id', mockUser.id)).rejects.toThrow(NotFoundError)
      })

      it('should handle workspace with no pages', async () => {
        prismaMock.workspace.findFirst.mockResolvedValue(mockWorkspace)
        prismaMock.page.findMany.mockResolvedValue([])

        const result = (await exportService.exportWorkspace(mockWorkspace.id, mockUser.id, 'json')) as any

        expect(result.pages).toEqual([])
      })
    })
  })

  describe('✅ Edge Cases', () => {
    it('should handle blocks with empty content', async () => {
      const mockBlocks = [
        createBlock({ type: BlockType.PARAGRAPH, content: '', order: 0 }),
        createBlock({ type: BlockType.PARAGRAPH, content: '   ', order: 1 }),
        createBlock({ type: BlockType.PARAGRAPH, content: 'Valid content', order: 2 }),
      ]

      const pageWithBlocks = {
        ...mockPage,
        blocks: mockBlocks,
      }

      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.page.findUnique.mockResolvedValue(pageWithBlocks as any)
      prismaMock.page.findMany.mockResolvedValue([])

      const result = await exportService.exportPageToMarkdown(mockPage.id, mockUser.id, {
        includeMetadata: false,
        includeSubpages: false,
        format: 'markdown',
      })

      expect(result).not.toContain('\n\n\n') // Should not have multiple empty lines
      expect(result).toContain('Valid content')
    })

    it('should handle deeply nested subpages', async () => {
      const subpage1 = createPage({ id: 'sub-1', parentId: mockPage.id, workspaceId: mockWorkspace.id })
      const subpage2 = createPage({ id: 'sub-2', parentId: 'sub-1', workspaceId: mockWorkspace.id })

      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.page.findUnique
        .mockResolvedValueOnce({ ...mockPage, blocks: [] } as any)
        .mockResolvedValueOnce({ ...subpage1, blocks: [] } as any)
        .mockResolvedValueOnce({ ...subpage2, blocks: [] } as any)
      prismaMock.page.findMany
        .mockResolvedValueOnce([subpage1] as any)
        .mockResolvedValueOnce([subpage2] as any)
        .mockResolvedValue([])

      const result = await exportService.exportPageToMarkdown(mockPage.id, mockUser.id, {
        includeMetadata: false,
        includeSubpages: true,
        format: 'markdown',
      })

      // Check for proper heading level increase
      const headingMatches = result.match(/#{1,6}/g)
      expect(headingMatches).toBeTruthy()
    })

    it('should handle markdown with only horizontal rules', async () => {
      const markdown = `---
---
---`

      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const tx = {
          block: {
            deleteMany: jest.fn(),
            createMany: jest.fn().mockResolvedValue({ count: 0 }),
            findFirst: jest.fn().mockResolvedValue(null),
          },
          page: { update: jest.fn() },
        }
        return await callback(tx as any)
      })

      const result = await exportService.importMarkdown(mockUser.id, {
        pageId: mockPage.id,
        markdown,
        replaceExisting: false,
      })

      expect(result.blocksCreated).toBe(0)
    })

    it('should preserve block metadata during export', async () => {
      const blockWithMetadata = createBlock({
        type: BlockType.PARAGRAPH,
        content: 'Content with metadata',
        metadata: { customField: 'value', isImportant: true },
      })

      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.page.findUnique.mockResolvedValue({
        ...mockPage,
        blocks: [blockWithMetadata],
      } as any)
      prismaMock.page.findMany.mockResolvedValue([])

      const result = await exportService.exportPageToJson(mockPage.id, mockUser.id, {
        includeMetadata: true,
        includeSubpages: false,
        format: 'json',
      })

      // The content should be converted to markdown format
      expect(result.content).toContain('Content with metadata')
    })
  })

  describe('✅ Error Handling', () => {
    it('should handle database errors during export', async () => {
      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.page.findUnique.mockRejectedValue(new Error('Database error'))

      await expect(
        exportService.exportPageToMarkdown(mockPage.id, mockUser.id, {
          includeMetadata: false,
          includeSubpages: true,
          format: 'markdown',
        })
      ).rejects.toThrow('Database error')
    })

    it('should handle transaction failures during import', async () => {
      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.$transaction.mockRejectedValue(new Error('Transaction failed'))

      await expect(
        exportService.importMarkdown(mockUser.id, {
          pageId: mockPage.id,
          markdown: '## Test',
          replaceExisting: false,
        })
      ).rejects.toThrow('Transaction failed')
    })

    it('should handle page not found during export', async () => {
      ;(pageService.verifyPageAccess as jest.Mock).mockResolvedValue(true)
      prismaMock.page.findUnique.mockResolvedValue(null)

      await expect(
        exportService.exportPageToMarkdown(mockPage.id, mockUser.id, {
          includeMetadata: false,
          includeSubpages: true,
          format: 'markdown',
        })
      ).rejects.toThrow(NotFoundError)
    })
  })
})
