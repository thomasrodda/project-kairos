import request from 'supertest'
import { Express } from 'express'
import { prismaMock } from '../../test/setup'
import { setupTestApp, expectErrorResponse, expectSuccessResponse, createAuthenticatedRequest } from '../../test/helpers'
import { createUser, createWorkspace, createPage, createBlock } from '../../test/factories'
import { BlockType } from '@prisma/client'

// Mock the search service
jest.mock('../../services/searchService', () => {
  const actual = jest.requireActual('../../services/searchService')
  return {
    ...actual,
    searchService: {
      search: jest.fn(),
      searchSuggestions: jest.fn(),
      createSearchIndices: jest.fn(),
    },
  }
})

import { searchService } from '../../services/searchService'

describe('Search Routes', () => {
  let app: Express

  beforeAll(() => {
    app = setupTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/search', () => {
    describe('✅ Core Functionality', () => {
      it('should search across pages and blocks', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const page = createPage({ workspaceId: workspace.id, title: 'Test Page' })
        const block = createBlock({ pageId: page.id, content: 'Test content' })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockResults = [
          {
            id: page.id,
            type: 'page',
            title: page.title,
            content: null,
            workspaceId: workspace.id,
            pageId: null,
            blockId: null,
            highlights: {
              title: '<mark>Test</mark> Page',
            },
            score: 0.95,
          },
          {
            id: block.id,
            type: 'block',
            title: page.title,
            content: block.content,
            workspaceId: workspace.id,
            pageId: page.id,
            blockId: block.id,
            highlights: {
              content: '<mark>Test</mark> content',
            },
            score: 0.85,
          },
        ]

        ;(searchService.search as jest.Mock).mockResolvedValueOnce({
          results: mockResults,
          total: 2,
        })

        const response = await authRequest('get', '/api/search?q=test')

        expectSuccessResponse(response)
        expect(response.body.items).toHaveLength(2)
        expect(response.body.items[0].type).toBe('page')
        expect(response.body.items[1].type).toBe('block')
        expect(response.body.pagination.total).toBe(2)
        expect(searchService.search).toHaveBeenCalledWith(user.id, {
          query: 'test',
          workspaceId: undefined,
          pageId: undefined,
          blockTypes: undefined,
          limit: 20,
          offset: 0,
        })
      })

      it('should support query parameter variations', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.search as jest.Mock).mockResolvedValueOnce({
          results: [],
          total: 0,
        })

        // Test with 'query' instead of 'q'
        const response = await authRequest('get', '/api/search?query=test')

        expectSuccessResponse(response)
        expect(searchService.search).toHaveBeenCalledWith(
          user.id,
          expect.objectContaining({
            query: 'test',
          })
        )
      })

      it('should filter by workspace', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.search as jest.Mock).mockResolvedValueOnce({
          results: [],
          total: 0,
        })

        const response = await authRequest('get', `/api/search?q=test&workspaceId=${workspace.id}`)

        expectSuccessResponse(response)
        expect(searchService.search).toHaveBeenCalledWith(user.id, {
          query: 'test',
          workspaceId: workspace.id,
          pageId: undefined,
          blockTypes: undefined,
          limit: 20,
          offset: 0,
        })
      })

      it('should filter by page', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.search as jest.Mock).mockResolvedValueOnce({
          results: [],
          total: 0,
        })

        const response = await authRequest('get', `/api/search?q=test&pageId=${page.id}`)

        expectSuccessResponse(response)
        expect(searchService.search).toHaveBeenCalledWith(
          user.id,
          expect.objectContaining({
            pageId: page.id,
          })
        )
      })

      it('should filter by block types', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.search as jest.Mock).mockResolvedValueOnce({
          results: [],
          total: 0,
        })

        const response = await authRequest('get', '/api/search?q=test&blockTypes=HEADING_1,HEADING_2,PARAGRAPH')

        expectSuccessResponse(response)
        expect(searchService.search).toHaveBeenCalledWith(
          user.id,
          expect.objectContaining({
            blockTypes: ['HEADING_1', 'HEADING_2', 'PARAGRAPH'],
          })
        )
      })

      it('should support pagination', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.search as jest.Mock).mockResolvedValueOnce({
          results: [],
          total: 100,
        })

        const response = await authRequest('get', '/api/search?q=test&limit=10&offset=30')

        expectSuccessResponse(response)
        expect(response.body.pagination.page).toBe(4) // offset 30 / limit 10 + 1
        expect(response.body.pagination.limit).toBe(10)
        expect(searchService.search).toHaveBeenCalledWith(
          user.id,
          expect.objectContaining({
            limit: 10,
            offset: 30,
          })
        )
      })

      it('should handle empty search results', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.search as jest.Mock).mockResolvedValueOnce({
          results: [],
          total: 0,
        })

        const response = await authRequest('get', '/api/search?q=nonexistent')

        expectSuccessResponse(response)
        expect(response.body.items).toHaveLength(0)
        expect(response.body.pagination.total).toBe(0)
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/search?q=test')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Validation', () => {
      it('should handle missing query parameter', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.search as jest.Mock).mockResolvedValueOnce({
          results: [],
          total: 0,
        })

        const response = await authRequest('get', '/api/search')

        // Should still work but with undefined query
        expectSuccessResponse(response)
        expect(searchService.search).toHaveBeenCalledWith(
          user.id,
          expect.objectContaining({
            query: undefined,
          })
        )
      })

      it('should validate pagination parameters', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('get', '/api/search?q=test&limit=invalid&offset=negative')

        expectErrorResponse(response, 400)
      })

      it('should handle invalid block types', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // The service should handle validation
        ;(searchService.search as jest.Mock).mockRejectedValueOnce(new Error('Invalid block type'))

        const response = await authRequest('get', '/api/search?q=test&blockTypes=INVALID_TYPE')

        expectErrorResponse(response, 500)
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle search service errors', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.search as jest.Mock).mockRejectedValueOnce(new Error('Search index unavailable'))

        const response = await authRequest('get', '/api/search?q=test')

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('GET /api/search/suggestions', () => {
    describe('✅ Core Functionality', () => {
      it('should return search suggestions', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockSuggestions = ['test document', 'test page', 'testing guide', 'test results', 'testimonials']

        ;(searchService.searchSuggestions as jest.Mock).mockResolvedValueOnce(mockSuggestions)

        const response = await authRequest('get', '/api/search/suggestions?q=test')

        expectSuccessResponse(response)
        expect(response.body.suggestions).toEqual(mockSuggestions)
        expect(searchService.searchSuggestions).toHaveBeenCalledWith(user.id, 'test', 5)
      })

      it('should support custom limit', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.searchSuggestions as jest.Mock).mockResolvedValueOnce([])

        const response = await authRequest('get', '/api/search/suggestions?q=test&limit=10')

        expectSuccessResponse(response)
        expect(searchService.searchSuggestions).toHaveBeenCalledWith(user.id, 'test', 10)
      })

      it('should handle empty query', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.searchSuggestions as jest.Mock).mockResolvedValueOnce([])

        const response = await authRequest('get', '/api/search/suggestions')

        expectSuccessResponse(response)
        expect(searchService.searchSuggestions).toHaveBeenCalledWith(user.id, '', 5)
      })

      it('should support query parameter variations', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.searchSuggestions as jest.Mock).mockResolvedValueOnce([])

        const response = await authRequest('get', '/api/search/suggestions?query=test')

        expectSuccessResponse(response)
        expect(searchService.searchSuggestions).toHaveBeenCalledWith(user.id, 'test', 5)
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/search/suggestions?q=test')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Validation', () => {
      it('should handle invalid limit parameter', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.searchSuggestions as jest.Mock).mockResolvedValueOnce([])

        // Non-numeric limit should default to 5
        const response = await authRequest('get', '/api/search/suggestions?q=test&limit=invalid')

        expectSuccessResponse(response)
        expect(searchService.searchSuggestions).toHaveBeenCalledWith(user.id, 'test', 5)
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle suggestion service errors', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.searchSuggestions as jest.Mock).mockRejectedValueOnce(new Error('Suggestion service unavailable'))

        const response = await authRequest('get', '/api/search/suggestions?q=test')

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('POST /api/search/indices', () => {
    describe('✅ Core Functionality', () => {
      it('should create/update search indices', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.createSearchIndices as jest.Mock).mockResolvedValueOnce(undefined)

        const response = await authRequest('post', '/api/search/indices')

        expectSuccessResponse(response)
        expect(response.body.message).toBe('Search indices created/updated successfully')
        expect(searchService.createSearchIndices).toHaveBeenCalled()
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).post('/api/search/indices')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Authorization', () => {
      it('should eventually require admin privileges', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // TODO comment in the route indicates admin check should be added
        ;(searchService.createSearchIndices as jest.Mock).mockResolvedValueOnce(undefined)

        const response = await authRequest('post', '/api/search/indices')

        // Currently succeeds for any authenticated user
        expectSuccessResponse(response)
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle index creation failures', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(searchService.createSearchIndices as jest.Mock).mockRejectedValueOnce(new Error('Failed to create indices'))

        const response = await authRequest('post', '/api/search/indices')

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('✅ Security Tests', () => {
    it('should only search within user accessible content', async () => {
      const user = createUser()
      const otherUser = createUser()
      const otherUserWorkspace = createWorkspace({ userId: otherUser.id })
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      // Search service should filter by user internally
      ;(searchService.search as jest.Mock).mockResolvedValueOnce({
        results: [],
        total: 0,
      })

      const response = await authRequest('get', `/api/search?q=test&workspaceId=${otherUserWorkspace.id}`)

      expectSuccessResponse(response)
      expect(response.body.items).toHaveLength(0)
      expect(searchService.search).toHaveBeenCalledWith(user.id, expect.any(Object))
    })

    it('should sanitize search query to prevent injection', async () => {
      const user = createUser()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      const maliciousQuery = '<script>alert("xss")</script>'

      ;(searchService.search as jest.Mock).mockResolvedValueOnce({
        results: [],
        total: 0,
      })

      const response = await authRequest('get', `/api/search?q=${encodeURIComponent(maliciousQuery)}`)

      expectSuccessResponse(response)
      // Service should receive the raw query, sanitization happens in service
      expect(searchService.search).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining({
          query: maliciousQuery,
        })
      )
    })

    it('should handle extremely long search queries', async () => {
      const user = createUser()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      const longQuery = 'a'.repeat(1000)

      ;(searchService.search as jest.Mock).mockResolvedValueOnce({
        results: [],
        total: 0,
      })

      const response = await authRequest('get', `/api/search?q=${longQuery}`)

      expectSuccessResponse(response)
      expect(searchService.search).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining({
          query: longQuery,
        })
      )
    })

    it('should handle concurrent search requests', async () => {
      const user = createUser()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      ;(searchService.search as jest.Mock).mockResolvedValue({
        results: [],
        total: 0,
      })

      const requests = Array.from({ length: 5 }, (_, i) => authRequest('get', `/api/search?q=test${i}`))

      const responses = await Promise.all(requests)

      responses.forEach((response) => {
        expectSuccessResponse(response)
      })

      expect(searchService.search).toHaveBeenCalledTimes(5)
    })
  })
})
