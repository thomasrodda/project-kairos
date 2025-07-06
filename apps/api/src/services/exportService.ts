import { prisma, Block, Page } from '@kairos/database'
import { BlockType } from '@prisma/client'
import { z } from 'zod'
import { NotFoundError, ValidationError } from '../utils/errors'
import { pageService } from './pageService'
import { blockService } from './blockService'

// Validation schemas
export const exportOptionsSchema = z.object({
  includeMetadata: z.boolean().default(false),
  includeSubpages: z.boolean().default(true),
  format: z.enum(['markdown', 'json']).default('markdown'),
})

export const importMarkdownSchema = z.object({
  pageId: z.string(),
  markdown: z.string(),
  replaceExisting: z.boolean().default(false),
})

interface ExportedPage {
  id: string
  title: string
  content: string
  children?: ExportedPage[]
  metadata?: {
    createdAt: string
    updatedAt: string
    order: number
  }
}

export class ExportService {
  /**
   * Export a page and optionally its subpages to markdown
   */
  async exportPageToMarkdown(pageId: string, userId: string, options: z.infer<typeof exportOptionsSchema>): Promise<string> {
    // Verify user has access to the page
    const hasAccess = await pageService.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // Get page with blocks
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        blocks: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!page) {
      throw new NotFoundError('Page', pageId)
    }

    let markdown = ''

    // Add page title as H1
    markdown += `# ${page.title}\n\n`

    // Add metadata if requested
    if (options.includeMetadata) {
      markdown += `<!-- 
Page ID: ${page.id}
Created: ${page.createdAt.toISOString()}
Updated: ${page.updatedAt.toISOString()}
-->\n\n`
    }

    // Convert blocks to markdown
    markdown += this.blocksToMarkdown(page.blocks)

    // Export subpages if requested
    if (options.includeSubpages) {
      const subpages = await prisma.page.findMany({
        where: {
          parentId: pageId,
          workspace: {
            userId,
          },
        },
        orderBy: { order: 'asc' },
      })

      for (const subpage of subpages) {
        markdown += '\n---\n\n'
        const subpageMarkdown = await this.exportPageToMarkdown(subpage.id, userId, { ...options, includeSubpages: true })
        // Increase heading level for subpages
        markdown += subpageMarkdown.replace(/^#/gm, '##')
      }
    }

    return markdown
  }

  /**
   * Export a page to JSON format
   */
  async exportPageToJson(pageId: string, userId: string, options: z.infer<typeof exportOptionsSchema>): Promise<ExportedPage> {
    // Verify user has access to the page
    const hasAccess = await pageService.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // Get page with blocks
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        blocks: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!page) {
      throw new NotFoundError('Page', pageId)
    }

    const exportedPage: ExportedPage = {
      id: page.id,
      title: page.title,
      content: this.blocksToMarkdown(page.blocks),
    }

    if (options.includeMetadata) {
      exportedPage.metadata = {
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
        order: page.order,
      }
    }

    // Export subpages if requested
    if (options.includeSubpages) {
      const subpages = await prisma.page.findMany({
        where: {
          parentId: pageId,
          workspace: {
            userId,
          },
        },
        orderBy: { order: 'asc' },
      })

      if (subpages.length > 0) {
        exportedPage.children = []
        for (const subpage of subpages) {
          const exportedSubpage = await this.exportPageToJson(subpage.id, userId, options)
          exportedPage.children.push(exportedSubpage)
        }
      }
    }

    return exportedPage
  }

  /**
   * Import markdown content into a page
   */
  async importMarkdown(userId: string, data: z.infer<typeof importMarkdownSchema>): Promise<{ pageId: string; blocksCreated: number }> {
    const { pageId, markdown, replaceExisting } = data

    // Verify user has access to the page
    const hasAccess = await pageService.verifyPageAccess(pageId, userId)
    if (!hasAccess) {
      throw new NotFoundError('Page', pageId)
    }

    // Parse markdown into blocks
    const blocks = this.parseMarkdownToBlocks(markdown)

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing blocks if requested
      if (replaceExisting) {
        await tx.block.deleteMany({
          where: { pageId },
        })
      }

      // Get the current highest order value
      const lastBlock = await tx.block.findFirst({
        where: { pageId },
        orderBy: { order: 'desc' },
      })
      const startOrder = lastBlock ? lastBlock.order + 1 : 0

      // Create new blocks
      const createdBlocks = await tx.block.createMany({
        data: blocks.map((block, index) => ({
          pageId,
          type: block.type,
          content: block.content,
          order: startOrder + index,
          metadata: block.metadata || null,
        })),
      })

      // Update page title if it's in the markdown
      const titleMatch = markdown.match(/^#\s+(.+)$/m)
      if (titleMatch && replaceExisting) {
        await tx.page.update({
          where: { id: pageId },
          data: { title: titleMatch[1].trim() },
        })
      }

      return createdBlocks.count
    })

    return {
      pageId,
      blocksCreated: result,
    }
  }

  /**
   * Convert blocks to markdown format
   */
  private blocksToMarkdown(blocks: Block[]): string {
    let markdown = ''

    for (const block of blocks) {
      switch (block.type) {
        case BlockType.HEADING1:
          markdown += `## ${block.content}\n\n`
          break
        case BlockType.HEADING2:
          markdown += `### ${block.content}\n\n`
          break
        case BlockType.HEADING3:
          markdown += `#### ${block.content}\n\n`
          break
        case BlockType.BULLET:
          markdown += `- ${block.content}\n`
          break
        case BlockType.PARAGRAPH:
        default:
          if (block.content.trim()) {
            markdown += `${block.content}\n\n`
          }
          break
      }
    }

    return markdown
  }

  /**
   * Parse markdown into blocks
   */
  private parseMarkdownToBlocks(markdown: string): Array<{ type: BlockType; content: string; metadata?: any }> {
    const blocks: Array<{ type: BlockType; content: string; metadata?: any }> = []
    const lines = markdown.split('\n')
    let currentParagraph = ''
    let inCodeBlock = false
    let inList = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Handle code blocks
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock
        if (!inCodeBlock && currentParagraph) {
          blocks.push({
            type: BlockType.PARAGRAPH,
            content: currentParagraph.trim(),
            metadata: { isCode: true },
          })
          currentParagraph = ''
        }
        continue
      }

      if (inCodeBlock) {
        currentParagraph += line + '\n'
        continue
      }

      // Handle headings
      if (line.startsWith('# ')) {
        // Skip page title (H1) as it's handled separately
        this.finishParagraph(blocks, currentParagraph)
        currentParagraph = ''
        inList = false
        continue
      } else if (line.startsWith('## ')) {
        this.finishParagraph(blocks, currentParagraph)
        blocks.push({
          type: BlockType.HEADING1,
          content: line.substring(3).trim(),
        })
        currentParagraph = ''
        inList = false
        continue
      } else if (line.startsWith('### ')) {
        this.finishParagraph(blocks, currentParagraph)
        blocks.push({
          type: BlockType.HEADING2,
          content: line.substring(4).trim(),
        })
        currentParagraph = ''
        inList = false
        continue
      } else if (line.startsWith('#### ')) {
        this.finishParagraph(blocks, currentParagraph)
        blocks.push({
          type: BlockType.HEADING3,
          content: line.substring(5).trim(),
        })
        currentParagraph = ''
        inList = false
        continue
      }

      // Handle bullet points
      if (line.match(/^[-*+]\s+/)) {
        this.finishParagraph(blocks, currentParagraph)
        blocks.push({
          type: BlockType.BULLET,
          content: line.replace(/^[-*+]\s+/, '').trim(),
        })
        currentParagraph = ''
        inList = true
        continue
      }

      // Handle horizontal rules
      if (line.match(/^---+$/)) {
        this.finishParagraph(blocks, currentParagraph)
        currentParagraph = ''
        inList = false
        continue
      }

      // Handle empty lines
      if (line.trim() === '') {
        if (currentParagraph) {
          this.finishParagraph(blocks, currentParagraph)
          currentParagraph = ''
        }
        inList = false
        continue
      }

      // Regular paragraph content
      if (inList && !line.match(/^\s/)) {
        // Not indented, so end the list
        inList = false
      }

      currentParagraph += line + ' '
    }

    // Finish any remaining paragraph
    this.finishParagraph(blocks, currentParagraph)

    return blocks
  }

  /**
   * Helper to finish a paragraph and add it to blocks
   */
  private finishParagraph(blocks: Array<{ type: BlockType; content: string; metadata?: any }>, content: string): void {
    const trimmed = content.trim()
    if (trimmed) {
      blocks.push({
        type: BlockType.PARAGRAPH,
        content: trimmed,
      })
    }
  }

  /**
   * Export entire workspace structure
   */
  async exportWorkspace(workspaceId: string, userId: string, format: 'markdown' | 'json' = 'markdown'): Promise<string | object> {
    // Verify user has access to the workspace
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    })

    if (!workspace) {
      throw new NotFoundError('Workspace', workspaceId)
    }

    // Get all root pages
    const rootPages = await prisma.page.findMany({
      where: {
        workspaceId,
        parentId: null,
      },
      orderBy: { order: 'asc' },
    })

    if (format === 'json') {
      const exportedPages: ExportedPage[] = []
      for (const page of rootPages) {
        const exportedPage = await this.exportPageToJson(page.id, userId, {
          includeMetadata: true,
          includeSubpages: true,
          format: 'json',
        })
        exportedPages.push(exportedPage)
      }
      return {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          createdAt: workspace.createdAt.toISOString(),
          updatedAt: workspace.updatedAt.toISOString(),
        },
        pages: exportedPages,
      }
    } else {
      let markdown = `# ${workspace.name}\n\n`

      for (const page of rootPages) {
        const pageMarkdown = await this.exportPageToMarkdown(page.id, userId, {
          includeMetadata: false,
          includeSubpages: true,
          format: 'markdown',
        })
        markdown += pageMarkdown + '\n---\n\n'
      }

      return markdown
    }
  }
}

export const exportService = new ExportService()
