import { prisma, Prisma } from '@kairos/database'
import { z } from 'zod'
import { ValidationError } from '../utils/errors'
import { phase3Config } from '../config/phase3.config'

// Validation schemas
export const searchQuerySchema = z.object({
  query: z.string().min(1).max(phase3Config.search.queryMaxLength),
  workspaceId: z.string().optional(),
  pageId: z.string().optional(),
  blockTypes: z.array(z.string()).optional(),
  limit: z
    .number()
    .int()
    .min(phase3Config.search.resultLimit.min)
    .max(phase3Config.search.resultLimit.max)
    .default(phase3Config.search.resultLimit.default),
  offset: z.number().int().min(0).default(0),
})

export interface SearchResult {
  id: string
  type: 'page' | 'block'
  pageId: string
  pageTitle: string
  workspaceId: string
  content: string
  matchedContent: string
  matchScore?: number
  metadata?: any
}

export class SearchService {
  /**
   * Search across pages and blocks in user's workspaces
   */
  async search(userId: string, params: z.infer<typeof searchQuerySchema>): Promise<{ results: SearchResult[]; total: number }> {
    const { query, workspaceId, pageId, blockTypes, limit, offset } = params

    // Validate user has access to the workspace if specified
    if (workspaceId) {
      const workspace = await prisma.workspace.findFirst({
        where: { id: workspaceId, userId },
      })
      if (!workspace) {
        throw new ValidationError('Invalid workspace', {
          field: 'workspaceId',
          reason: 'Workspace not found or access denied',
        })
      }
    }

    // Prepare search query for PostgreSQL full-text search
    // Convert spaces to & for AND operation in tsquery
    const searchQuery = query.trim().split(/\s+/).join(' & ')

    // Build the base where clause
    const baseWhere: any = {
      page: {
        workspace: { userId },
      },
    }

    if (workspaceId) {
      baseWhere.page.workspaceId = workspaceId
    }

    if (pageId) {
      baseWhere.pageId = pageId
    }

    if (blockTypes && blockTypes.length > 0) {
      baseWhere.type = { in: blockTypes }
    }

    // Search in blocks
    const blockResults = await prisma.$queryRaw<
      Array<{
        id: string
        pageId: string
        type: string
        content: string
        metadata: any
        page_title: string
        workspace_id: string
        ts_rank: number
      }>
    >`
      SELECT 
        b.id,
        b."pageId" as "pageId",
        b.type,
        b.content,
        b.metadata,
        p.title as page_title,
        p."workspaceId" as workspace_id,
        ts_rank(to_tsvector('english', b.content), to_tsquery('english', ${searchQuery})) as ts_rank
      FROM blocks b
      INNER JOIN pages p ON b."pageId" = p.id
      INNER JOIN workspaces w ON p."workspaceId" = w.id
      WHERE 
        w."userId" = ${userId}
        ${workspaceId ? Prisma.sql`AND p."workspaceId" = ${workspaceId}` : Prisma.sql``}
        ${pageId ? Prisma.sql`AND b."pageId" = ${pageId}` : Prisma.sql``}
        ${blockTypes && blockTypes.length > 0 ? Prisma.sql`AND b.type = ANY(${blockTypes})` : Prisma.sql``}
        AND to_tsvector('english', b.content) @@ to_tsquery('english', ${searchQuery})
      ORDER BY ts_rank DESC, b."updatedAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    // Search in page titles
    const pageResults = await prisma.$queryRaw<
      Array<{
        id: string
        title: string
        workspace_id: string
        ts_rank: number
      }>
    >`
      SELECT 
        p.id,
        p.title,
        p."workspaceId" as workspace_id,
        ts_rank(to_tsvector('english', p.title), to_tsquery('english', ${searchQuery})) as ts_rank
      FROM pages p
      INNER JOIN workspaces w ON p."workspaceId" = w.id
      WHERE 
        w."userId" = ${userId}
        ${workspaceId ? Prisma.sql`AND p."workspaceId" = ${workspaceId}` : Prisma.sql``}
        AND to_tsvector('english', p.title) @@ to_tsquery('english', ${searchQuery})
      ORDER BY ts_rank DESC, p."updatedAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    // Get total count
    const blockCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM blocks b
      INNER JOIN pages p ON b."pageId" = p.id
      INNER JOIN workspaces w ON p."workspaceId" = w.id
      WHERE 
        w."userId" = ${userId}
        ${workspaceId ? Prisma.sql`AND p."workspaceId" = ${workspaceId}` : Prisma.sql``}
        ${pageId ? Prisma.sql`AND b."pageId" = ${pageId}` : Prisma.sql``}
        ${blockTypes && blockTypes.length > 0 ? Prisma.sql`AND b.type = ANY(${blockTypes})` : Prisma.sql``}
        AND to_tsvector('english', b.content) @@ to_tsquery('english', ${searchQuery})
    `

    const pageCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM pages p
      INNER JOIN workspaces w ON p."workspaceId" = w.id
      WHERE 
        w."userId" = ${userId}
        ${workspaceId ? Prisma.sql`AND p."workspaceId" = ${workspaceId}` : Prisma.sql``}
        AND to_tsvector('english', p.title) @@ to_tsquery('english', ${searchQuery})
    `

    const total = Number(blockCount[0].count) + Number(pageCount[0].count)

    // Format results
    const results: SearchResult[] = []

    // Add page results
    for (const page of pageResults) {
      results.push({
        id: page.id,
        type: 'page',
        pageId: page.id,
        pageTitle: page.title,
        workspaceId: page.workspace_id,
        content: page.title,
        matchedContent: this.highlightMatch(page.title, query),
        matchScore: page.ts_rank,
      })
    }

    // Add block results
    for (const block of blockResults) {
      results.push({
        id: block.id,
        type: 'block',
        pageId: block.pageId,
        pageTitle: block.page_title,
        workspaceId: block.workspace_id,
        content: block.content,
        matchedContent: this.highlightMatch(block.content, query),
        matchScore: block.ts_rank,
        metadata: block.metadata,
      })
    }

    // Sort by score and limit
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

    return {
      results: results.slice(0, limit),
      total,
    }
  }

  /**
   * Search suggestions based on partial query
   */
  async searchSuggestions(userId: string, query: string, limit: number = phase3Config.search.suggestionLimit): Promise<string[]> {
    if (query.length < 2) {
      return []
    }

    // Search for page titles that start with the query
    const pages = await prisma.page.findMany({
      where: {
        workspace: { userId },
        title: {
          startsWith: query,
          mode: 'insensitive',
        },
      },
      select: { title: true },
      distinct: ['title'],
      take: limit,
    })

    return pages.map((p) => p.title)
  }

  /**
   * Highlight matched text in content
   */
  private highlightMatch(content: string, query: string): string {
    const words = query.trim().split(/\s+/)
    let highlighted = content

    // Create a regex pattern for each word
    for (const word of words) {
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi')
      highlighted = highlighted.replace(regex, '**$1**')
    }

    // Truncate to show context around matches
    const firstMatch = highlighted.indexOf('**')
    if (firstMatch > phase3Config.search.contextPreview) {
      const start = Math.max(0, firstMatch - phase3Config.search.contextPreview)
      highlighted = '...' + highlighted.substring(start)
    }
    if (highlighted.length > phase3Config.search.contextLength) {
      highlighted = highlighted.substring(0, phase3Config.search.contextLength) + '...'
    }

    return highlighted
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * Create or update search indices
   */
  async createSearchIndices(): Promise<void> {
    // Create GIN index for full-text search on blocks
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_blocks_content_search 
      ON blocks USING GIN (to_tsvector('english', content))
    `

    // Create GIN index for full-text search on page titles
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_pages_title_search 
      ON pages USING GIN (to_tsvector('english', title))
    `

    // Create index for filtering by block type
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_blocks_type 
      ON blocks (type)
    `
  }
}

export const searchService = new SearchService()
