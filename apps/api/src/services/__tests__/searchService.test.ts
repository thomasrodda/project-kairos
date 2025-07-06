import { SearchService } from '../searchService'
import { prismaMock } from '../../test/setup'
import { createUser, createWorkspace, createPage, createBlock } from '../../test/factories'
import { ValidationError } from '../../utils/errors'
import { Prisma } from '@kairos/database'
import { BlockType } from '@prisma/client'
import { phase3Config } from '../../config/phase3.config'

describe('SearchService', () => {
  let searchService: SearchService
  let mockUser: ReturnType<typeof createUser>
  let mockWorkspace: ReturnType<typeof createWorkspace>
  let mockPage: ReturnType<typeof createPage>

  beforeEach(() => {
    searchService = new SearchService()
    mockUser = createUser()
    mockWorkspace = createWorkspace({ userId: mockUser.id })
    mockPage = createPage({ workspaceId: mockWorkspace.id })
    jest.clearAllMocks()
  })

  describe('✅ Core Search Functionality', () => {
    describe('search', () => {
      it('should search across blocks and pages', async () => {
        const mockBlockResults = [
          {
            id: 'block-1',
            pageId: mockPage.id,
            type: BlockType.PARAGRAPH,
            content: 'This is a test paragraph with search terms',
            metadata: null,
            page_title: mockPage.title,
            workspace_id: mockWorkspace.id,
            ts_rank: 0.8,
          },
          {
            id: 'block-2',
            pageId: mockPage.id,
            type: BlockType.HEADING1,
            content: 'Search heading test',
            metadata: { level: 1 },
            page_title: mockPage.title,
            workspace_id: mockWorkspace.id,
            ts_rank: 0.6,
          },
        ]

        const mockPageResults = [
          {
            id: mockPage.id,
            title: 'Test Search Page',
            workspace_id: mockWorkspace.id,
            ts_rank: 0.9,
          },
        ]

        prismaMock.$queryRaw.mockResolvedValueOnce(mockBlockResults)
        prismaMock.$queryRaw.mockResolvedValueOnce(mockPageResults)
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(2) }])
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(1) }])

        const result = await searchService.search(mockUser.id, {
          query: 'test search',
          limit: phase3Config.search.resultLimit.default,
          offset: 0,
        })

        expect(result.results).toHaveLength(3)
        expect(result.total).toBe(3)
        expect(result.results[0].type).toBe('page')
        expect(result.results[0].matchScore).toBe(0.9)
        expect(result.results[1].type).toBe('block')
        expect(result.results[1].matchScore).toBe(0.8)
        expect(result.results[2].type).toBe('block')
        expect(result.results[2].matchScore).toBe(0.6)
      })

      it('should filter by workspace', async () => {
        prismaMock.workspace.findFirst.mockResolvedValue(mockWorkspace)
        prismaMock.$queryRaw.mockResolvedValueOnce([]) // block results
        prismaMock.$queryRaw.mockResolvedValueOnce([]) // page results
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // block count
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // page count

        await searchService.search(mockUser.id, {
          query: 'test',
          workspaceId: mockWorkspace.id,
          limit: phase3Config.search.resultLimit.default,
          offset: 0,
        })

        expect(prismaMock.workspace.findFirst).toHaveBeenCalledWith({
          where: { id: mockWorkspace.id, userId: mockUser.id },
        })
      })

      it('should filter by page', async () => {
        prismaMock.$queryRaw.mockResolvedValueOnce([]) // block results
        prismaMock.$queryRaw.mockResolvedValueOnce([]) // page results
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // block count
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // page count

        await searchService.search(mockUser.id, {
          query: 'test',
          pageId: mockPage.id,
          limit: phase3Config.search.resultLimit.default,
          offset: 0,
        })

        // All queryRaw calls should include pageId filter
        expect(prismaMock.$queryRaw).toHaveBeenCalled()
      })

      it('should filter by block types', async () => {
        prismaMock.$queryRaw.mockResolvedValueOnce([]) // block results
        prismaMock.$queryRaw.mockResolvedValueOnce([]) // page results
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // block count
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // page count

        await searchService.search(mockUser.id, {
          query: 'test',
          blockTypes: [BlockType.HEADING1, BlockType.HEADING2],
          limit: phase3Config.search.resultLimit.default,
          offset: 0,
        })

        expect(prismaMock.$queryRaw).toHaveBeenCalled()
      })

      it('should handle multi-word queries', async () => {
        prismaMock.$queryRaw.mockResolvedValueOnce([]) // block results
        prismaMock.$queryRaw.mockResolvedValueOnce([]) // page results
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // block count
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // page count

        await searchService.search(mockUser.id, {
          query: 'multiple word search query',
          limit: phase3Config.search.resultLimit.default,
          offset: 0,
        })

        // The query should be converted to tsquery format with & operators
        expect(prismaMock.$queryRaw).toHaveBeenCalled()
      })

      it('should throw ValidationError for invalid workspace', async () => {
        prismaMock.workspace.findFirst.mockResolvedValue(null)

        await expect(
          searchService.search(mockUser.id, {
            query: 'test',
            workspaceId: 'invalid-workspace',
            limit: phase3Config.search.resultLimit.default,
            offset: 0,
          })
        ).rejects.toThrow(ValidationError)
      })

      it('should handle empty results', async () => {
        prismaMock.$queryRaw.mockResolvedValueOnce([])
        prismaMock.$queryRaw.mockResolvedValueOnce([])
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }])
        prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }])

        const result = await searchService.search(mockUser.id, {
          query: 'nonexistent',
          limit: phase3Config.search.resultLimit.default,
          offset: 0,
        })

        expect(result.results).toHaveLength(0)
        expect(result.total).toBe(0)
      })
    })
  })

  describe('✅ Search Suggestions', () => {
    describe('searchSuggestions', () => {
      it('should return page title suggestions', async () => {
        const mockPages = [{ title: 'Test Page 1' }, { title: 'Test Page 2' }, { title: 'Test Document' }]

        prismaMock.page.findMany.mockResolvedValue(mockPages as any)

        const suggestions = await searchService.searchSuggestions(mockUser.id, 'Test', phase3Config.search.suggestionLimit)

        expect(suggestions).toEqual(['Test Page 1', 'Test Page 2', 'Test Document'])
        expect(prismaMock.page.findMany).toHaveBeenCalledWith({
          where: {
            workspace: { userId: mockUser.id },
            title: {
              startsWith: 'Test',
              mode: 'insensitive',
            },
          },
          select: { title: true },
          distinct: ['title'],
          take: phase3Config.search.suggestionLimit,
        })
      })

      it('should return empty array for short queries', async () => {
        const suggestions = await searchService.searchSuggestions(mockUser.id, 'T', phase3Config.search.suggestionLimit)

        expect(suggestions).toEqual([])
        expect(prismaMock.page.findMany).not.toHaveBeenCalled()
      })

      it('should handle empty query', async () => {
        const suggestions = await searchService.searchSuggestions(mockUser.id, '', phase3Config.search.suggestionLimit)

        expect(suggestions).toEqual([])
        expect(prismaMock.page.findMany).not.toHaveBeenCalled()
      })

      it('should limit suggestions', async () => {
        const mockPages = Array.from({ length: 10 }, (_, i) => ({ title: `Test Page ${i}` }))

        prismaMock.page.findMany.mockResolvedValue(mockPages.slice(0, 3) as any)

        const suggestions = await searchService.searchSuggestions(mockUser.id, 'Test', 3)

        expect(suggestions).toHaveLength(3)
      })
    })
  })

  describe('✅ Search Result Highlighting', () => {
    it('should highlight matched terms in content', async () => {
      const mockBlockResults = [
        {
          id: 'block-1',
          pageId: mockPage.id,
          type: BlockType.PARAGRAPH,
          content: 'This is a test paragraph with search terms in the middle of the content',
          metadata: null,
          page_title: mockPage.title,
          workspace_id: mockWorkspace.id,
          ts_rank: 0.8,
        },
      ]

      prismaMock.$queryRaw.mockResolvedValueOnce(mockBlockResults)
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(1) }])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }])

      const result = await searchService.search(mockUser.id, {
        query: 'test search',
        limit: phase3Config.search.resultLimit.default,
        offset: 0,
      })

      expect(result.results[0].matchedContent).toContain('**test**')
      expect(result.results[0].matchedContent).toContain('**search**')
    })

    it('should truncate long content with ellipsis', async () => {
      const longContent = 'Start ' + 'x'.repeat(300) + ' test content ' + 'y'.repeat(300) + ' end'
      const mockBlockResults = [
        {
          id: 'block-1',
          pageId: mockPage.id,
          type: BlockType.PARAGRAPH,
          content: longContent,
          metadata: null,
          page_title: mockPage.title,
          workspace_id: mockWorkspace.id,
          ts_rank: 0.8,
        },
      ]

      prismaMock.$queryRaw.mockResolvedValueOnce(mockBlockResults)
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(1) }])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }])

      const result = await searchService.search(mockUser.id, {
        query: 'test',
        limit: phase3Config.search.resultLimit.default,
        offset: 0,
      })

      expect(result.results[0].matchedContent.length).toBeLessThanOrEqual(phase3Config.search.contextLength + 6) // contextLength + '...'
      expect(result.results[0].matchedContent).toContain('...')
    })

    it('should handle special regex characters in search terms', async () => {
      const mockBlockResults = [
        {
          id: 'block-1',
          pageId: mockPage.id,
          type: BlockType.PARAGRAPH,
          content: 'Search for $special.chars* and (brackets)',
          metadata: null,
          page_title: mockPage.title,
          workspace_id: mockWorkspace.id,
          ts_rank: 0.8,
        },
      ]

      prismaMock.$queryRaw.mockResolvedValueOnce(mockBlockResults)
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(1) }])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }])

      const result = await searchService.search(mockUser.id, {
        query: '$special.chars*',
        limit: phase3Config.search.resultLimit.default,
        offset: 0,
      })

      // Should not throw error and should highlight correctly
      expect(result.results[0].matchedContent).toContain('**$special.chars***')
    })
  })

  describe('✅ Search Index Management', () => {
    describe('createSearchIndices', () => {
      it('should create all required indices', async () => {
        prismaMock.$executeRaw.mockResolvedValue(0)

        await searchService.createSearchIndices()

        expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(3)

        // Check that GIN indices are created for full-text search
        expect(prismaMock.$executeRaw).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining('idx_blocks_content_search')]))
        expect(prismaMock.$executeRaw).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining('idx_pages_title_search')]))
        expect(prismaMock.$executeRaw).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining('idx_blocks_type')]))
      })

      it('should handle index creation failures', async () => {
        prismaMock.$executeRaw.mockRejectedValue(new Error('Index creation failed'))

        await expect(searchService.createSearchIndices()).rejects.toThrow('Index creation failed')
      })
    })
  })

  describe('✅ Pagination and Sorting', () => {
    it('should respect pagination limits', async () => {
      const mockResults = Array.from({ length: 50 }, (_, i) => ({
        id: `block-${i}`,
        pageId: mockPage.id,
        type: BlockType.PARAGRAPH,
        content: `Result ${i}`,
        metadata: null,
        page_title: mockPage.title,
        workspace_id: mockWorkspace.id,
        ts_rank: 0.5 - i * 0.01,
      }))

      prismaMock.$queryRaw.mockResolvedValueOnce(mockResults.slice(0, 10))
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(50) }])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }])

      const result = await searchService.search(mockUser.id, {
        query: 'test',
        limit: 10,
        offset: 0,
      })

      expect(result.results).toHaveLength(10)
      expect(result.total).toBe(50)
    })

    it('should handle offset correctly', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([]) // block results
      prismaMock.$queryRaw.mockResolvedValueOnce([]) // page results
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // block count
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // page count

      await searchService.search(mockUser.id, {
        query: 'test',
        limit: 10,
        offset: 20,
      })

      expect(prismaMock.$queryRaw).toHaveBeenCalled()
    })

    it('should sort results by relevance score', async () => {
      const mockBlockResults = [
        {
          id: 'block-1',
          pageId: mockPage.id,
          type: BlockType.PARAGRAPH,
          content: 'Low relevance',
          metadata: null,
          page_title: mockPage.title,
          workspace_id: mockWorkspace.id,
          ts_rank: 0.3,
        },
        {
          id: 'block-2',
          pageId: mockPage.id,
          type: BlockType.PARAGRAPH,
          content: 'High relevance',
          metadata: null,
          page_title: mockPage.title,
          workspace_id: mockWorkspace.id,
          ts_rank: 0.9,
        },
      ]

      prismaMock.$queryRaw.mockResolvedValueOnce(mockBlockResults)
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(2) }])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }])

      const result = await searchService.search(mockUser.id, {
        query: 'test',
        limit: phase3Config.search.resultLimit.default,
        offset: 0,
      })

      expect(result.results[0].matchScore).toBe(0.9)
      expect(result.results[1].matchScore).toBe(0.3)
    })
  })

  describe('✅ Error Handling', () => {
    it('should handle database query errors', async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error('Query failed'))

      await expect(
        searchService.search(mockUser.id, {
          query: 'test',
          limit: phase3Config.search.resultLimit.default,
          offset: 0,
        })
      ).rejects.toThrow('Query failed')
    })

    it('should handle invalid query parameters', async () => {
      prismaMock.workspace.findFirst.mockResolvedValue(null)

      await expect(
        searchService.search(mockUser.id, {
          query: 'test',
          workspaceId: 'non-existent',
          limit: phase3Config.search.resultLimit.default,
          offset: 0,
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should handle BigInt conversion', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(Number.MAX_SAFE_INTEGER) }])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(10) }])

      const result = await searchService.search(mockUser.id, {
        query: 'test',
        limit: phase3Config.search.resultLimit.default,
        offset: 0,
      })

      expect(result.total).toBe(Number.MAX_SAFE_INTEGER + 10)
    })
  })

  describe('✅ Edge Cases', () => {
    it('should handle empty search query after trimming', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([]) // block results
      prismaMock.$queryRaw.mockResolvedValueOnce([]) // page results
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // block count
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // page count

      await searchService.search(mockUser.id, {
        query: '   ',
        limit: phase3Config.search.resultLimit.default,
        offset: 0,
      })

      expect(prismaMock.$queryRaw).toHaveBeenCalled()
    })

    it('should handle very long search queries', async () => {
      const longQuery = 'word '.repeat(50)
      prismaMock.$queryRaw.mockResolvedValueOnce([]) // block results
      prismaMock.$queryRaw.mockResolvedValueOnce([]) // page results
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // block count
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]) // page count

      await searchService.search(mockUser.id, {
        query: longQuery,
        limit: phase3Config.search.resultLimit.default,
        offset: 0,
      })

      expect(prismaMock.$queryRaw).toHaveBeenCalled()
    })

    it('should handle mixed case search queries', async () => {
      const mockResults = [
        {
          id: 'block-1',
          pageId: mockPage.id,
          type: BlockType.PARAGRAPH,
          content: 'TEST test TeSt',
          metadata: null,
          page_title: mockPage.title,
          workspace_id: mockWorkspace.id,
          ts_rank: 0.8,
        },
      ]

      prismaMock.$queryRaw.mockResolvedValueOnce(mockResults)
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(1) }])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }])

      const result = await searchService.search(mockUser.id, {
        query: 'TeSt',
        limit: phase3Config.search.resultLimit.default,
        offset: 0,
      })

      expect(result.results[0].matchedContent).toContain('**TEST**')
      expect(result.results[0].matchedContent).toContain('**test**')
      expect(result.results[0].matchedContent).toContain('**TeSt**')
    })

    it('should handle results with null metadata', async () => {
      const mockResults = [
        {
          id: 'block-1',
          pageId: mockPage.id,
          type: BlockType.PARAGRAPH,
          content: 'Content',
          metadata: null,
          page_title: mockPage.title,
          workspace_id: mockWorkspace.id,
          ts_rank: 0.5,
        },
      ]

      prismaMock.$queryRaw.mockResolvedValueOnce(mockResults)
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(1) }])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }])

      const result = await searchService.search(mockUser.id, {
        query: 'content',
        limit: phase3Config.search.resultLimit.default,
        offset: 0,
      })

      expect(result.results[0].metadata).toBeNull()
    })
  })
})
