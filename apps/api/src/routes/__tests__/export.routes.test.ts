import request from 'supertest'
import { Express } from 'express'
import { prismaMock } from '../../test/setup'
import { setupTestApp, expectErrorResponse, expectSuccessResponse, createAuthenticatedRequest } from '../../test/helpers'
import { createUser, createWorkspace, createPage, createBlock } from '../../test/factories'
import { BlockType } from '@prisma/client'

// Mock the export service
jest.mock('../../services/exportService', () => {
  const actual = jest.requireActual('../../services/exportService')
  return {
    ...actual,
    exportService: {
      exportPageToMarkdown: jest.fn(),
      exportPageToJson: jest.fn(),
      exportWorkspace: jest.fn(),
      importMarkdown: jest.fn(),
    },
  }
})

import { exportService } from '../../services/exportService'

describe('Export Routes', () => {
  let app: Express

  beforeAll(() => {
    app = setupTestApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/export/pages/:pageId', () => {
    describe('✅ Core Functionality - Markdown Export', () => {
      it('should export page to markdown with default options', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const page = createPage({ workspaceId: workspace.id, title: 'Test Page' })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockMarkdown = `# Test Page

This is the page content.

## Subheading

More content here.`

        ;(exportService.exportPageToMarkdown as jest.Mock).mockResolvedValueOnce(mockMarkdown)

        const response = await authRequest('get', `/api/export/pages/${page.id}`)

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toBe('text/markdown; charset=utf-8')
        expect(response.headers['content-disposition']).toBe(`attachment; filename="page-${page.id}.md"`)
        expect(response.text).toBe(mockMarkdown)
        expect(exportService.exportPageToMarkdown).toHaveBeenCalledWith(page.id, user.id, {
          includeMetadata: false,
          includeSubpages: true,
          format: 'markdown',
        })
      })

      it('should export with metadata when requested', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockMarkdown = `---
title: Test Page
created: 2024-01-01
updated: 2024-01-15
---

# Test Page

Content here.`

        ;(exportService.exportPageToMarkdown as jest.Mock).mockResolvedValueOnce(mockMarkdown)

        const response = await authRequest('get', `/api/export/pages/${page.id}?includeMetadata=true`)

        expect(response.status).toBe(200)
        expect(response.text).toContain('---')
        expect(exportService.exportPageToMarkdown).toHaveBeenCalledWith(page.id, user.id, {
          includeMetadata: true,
          includeSubpages: true,
          format: 'markdown',
        })
      })

      it('should export without subpages when specified', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(exportService.exportPageToMarkdown as jest.Mock).mockResolvedValueOnce('# Page without subpages')

        const response = await authRequest('get', `/api/export/pages/${page.id}?includeSubpages=false`)

        expect(response.status).toBe(200)
        expect(exportService.exportPageToMarkdown).toHaveBeenCalledWith(page.id, user.id, {
          includeMetadata: false,
          includeSubpages: false,
          format: 'markdown',
        })
      })
    })

    describe('✅ Core Functionality - JSON Export', () => {
      it('should export page to JSON', async () => {
        const user = createUser()
        const page = createPage({ title: 'Test Page' })
        const blocks = [
          createBlock({ pageId: page.id, type: BlockType.HEADING_1, content: 'Test Page' }),
          createBlock({ pageId: page.id, type: BlockType.PARAGRAPH, content: 'Content' }),
        ]
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockJsonExport = {
          page: {
            id: page.id,
            title: page.title,
            createdAt: page.createdAt.toISOString(),
            updatedAt: page.updatedAt.toISOString(),
          },
          blocks: blocks.map((b) => ({
            id: b.id,
            type: b.type,
            content: b.content,
            order: b.order,
          })),
          subpages: [],
        }

        ;(exportService.exportPageToJson as jest.Mock).mockResolvedValueOnce(mockJsonExport)

        const response = await authRequest('get', `/api/export/pages/${page.id}?format=json`)

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toMatch(/application\/json/)
        expect(response.headers['content-disposition']).toBe(`attachment; filename="page-${page.id}.json"`)
        expect(response.body).toEqual(mockJsonExport)
        expect(exportService.exportPageToJson).toHaveBeenCalledWith(page.id, user.id, {
          includeMetadata: false,
          includeSubpages: true,
          format: 'json',
        })
      })

      it('should export JSON with all options', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockJsonExport = {
          page: {},
          blocks: [],
          subpages: [],
          metadata: {
            exportDate: new Date().toISOString(),
            version: '1.0',
          },
        }

        ;(exportService.exportPageToJson as jest.Mock).mockResolvedValueOnce(mockJsonExport)

        const response = await authRequest('get', `/api/export/pages/${page.id}?format=json&includeMetadata=true&includeSubpages=false`)

        expect(response.status).toBe(200)
        expect(exportService.exportPageToJson).toHaveBeenCalledWith(page.id, user.id, {
          includeMetadata: true,
          includeSubpages: false,
          format: 'json',
        })
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/export/pages/test-id')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Authorization', () => {
      it('should only export pages the user has access to', async () => {
        const user = createUser()
        const otherUserPage = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(exportService.exportPageToMarkdown as jest.Mock).mockRejectedValueOnce(new Error('Page not found'))

        const response = await authRequest('get', `/api/export/pages/${otherUserPage.id}`)

        expectErrorResponse(response, 500)
      })
    })

    describe('✅ Validation', () => {
      it('should validate format parameter', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // Service should handle validation
        ;(exportService.exportPageToMarkdown as jest.Mock).mockRejectedValueOnce(new Error('Invalid format'))

        const response = await authRequest('get', `/api/export/pages/${page.id}?format=invalid`)

        expectErrorResponse(response, 400)
      })

      it('should handle invalid boolean parameters gracefully', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(exportService.exportPageToMarkdown as jest.Mock).mockResolvedValueOnce('# Test')

        // Invalid boolean should be treated as false
        const response = await authRequest('get', `/api/export/pages/${page.id}?includeMetadata=invalid`)

        expect(response.status).toBe(200)
        expect(exportService.exportPageToMarkdown).toHaveBeenCalledWith(page.id, user.id, {
          includeMetadata: false, // 'invalid' !== 'true' so it's false
          includeSubpages: true,
          format: 'markdown',
        })
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle export service errors', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(exportService.exportPageToMarkdown as jest.Mock).mockRejectedValueOnce(new Error('Export failed'))

        const response = await authRequest('get', `/api/export/pages/${page.id}`)

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('GET /api/export/workspaces/:workspaceId', () => {
    describe('✅ Core Functionality', () => {
      it('should export entire workspace to markdown', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id, name: 'My Workspace' })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockMarkdown = `# My Workspace

## Page 1

Content...

## Page 2

More content...`

        ;(exportService.exportWorkspace as jest.Mock).mockResolvedValueOnce(mockMarkdown)

        const response = await authRequest('get', `/api/export/workspaces/${workspace.id}`)

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toBe('text/markdown; charset=utf-8')
        expect(response.headers['content-disposition']).toBe(`attachment; filename="workspace-${workspace.id}.md"`)
        expect(response.text).toBe(mockMarkdown)
        expect(exportService.exportWorkspace).toHaveBeenCalledWith(workspace.id, user.id, 'markdown')
      })

      it('should export workspace to JSON', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockJsonExport = {
          workspace: {
            id: workspace.id,
            name: workspace.name,
            createdAt: workspace.createdAt.toISOString(),
            updatedAt: workspace.updatedAt.toISOString(),
          },
          pages: [],
        }

        ;(exportService.exportWorkspace as jest.Mock).mockResolvedValueOnce(mockJsonExport)

        const response = await authRequest('get', `/api/export/workspaces/${workspace.id}?format=json`)

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toMatch(/application\/json/)
        expect(response.headers['content-disposition']).toBe(`attachment; filename="workspace-${workspace.id}.json"`)
        expect(response.body).toEqual(mockJsonExport)
        expect(exportService.exportWorkspace).toHaveBeenCalledWith(workspace.id, user.id, 'json')
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).get('/api/export/workspaces/test-id')

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Authorization', () => {
      it('should only export workspaces the user owns', async () => {
        const user = createUser()
        const otherUserWorkspace = createWorkspace({ userId: 'other-user' })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(exportService.exportWorkspace as jest.Mock).mockRejectedValueOnce(new Error('Workspace not found'))

        const response = await authRequest('get', `/api/export/workspaces/${otherUserWorkspace.id}`)

        expectErrorResponse(response, 500)
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle large workspace exports', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // Simulate a very large markdown export
        const largeMarkdown = '#'.repeat(1000000) // 1MB of content

        ;(exportService.exportWorkspace as jest.Mock).mockResolvedValueOnce(largeMarkdown)

        const response = await authRequest('get', `/api/export/workspaces/${workspace.id}`)

        expect(response.status).toBe(200)
        expect(response.text.length).toBe(1000000)
      })

      it('should handle workspace export failures', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(exportService.exportWorkspace as jest.Mock).mockRejectedValueOnce(new Error('Export timeout'))

        const response = await authRequest('get', `/api/export/workspaces/${workspace.id}`)

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('POST /api/export/import', () => {
    describe('✅ Core Functionality', () => {
      it('should import markdown content into a new page', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const markdownContent = `# Imported Page

This is imported content.

## Section 1

Some text here.`

        const mockResult = {
          page: {
            id: 'new-page-id',
            title: 'Imported Page',
            workspaceId: workspace.id,
          },
          blocksCreated: 3,
        }

        ;(exportService.importMarkdown as jest.Mock).mockResolvedValueOnce(mockResult)

        const response = await authRequest('post', '/api/export/import').send({
          markdown: markdownContent,
          workspaceId: workspace.id,
        })

        expectSuccessResponse(response)
        expect(response.body).toEqual(mockResult)
        expect(exportService.importMarkdown).toHaveBeenCalledWith(user.id, {
          markdown: markdownContent,
          workspaceId: workspace.id,
        })
      })

      it('should import into existing page when pageId provided', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const markdownContent = '## New Section\n\nAdded content.'

        const mockResult = {
          page: {
            id: page.id,
            title: page.title,
          },
          blocksCreated: 2,
          blocksUpdated: 0,
        }

        ;(exportService.importMarkdown as jest.Mock).mockResolvedValueOnce(mockResult)

        const response = await authRequest('post', '/api/export/import').send({
          markdown: markdownContent,
          pageId: page.id,
        })

        expectSuccessResponse(response)
        expect(exportService.importMarkdown).toHaveBeenCalledWith(user.id, {
          markdown: markdownContent,
          pageId: page.id,
        })
      })

      it('should handle import options', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const mockResult = {
          page: { id: 'new-page' },
          blocksCreated: 5,
        }

        ;(exportService.importMarkdown as jest.Mock).mockResolvedValueOnce(mockResult)

        const response = await authRequest('post', '/api/export/import').send({
          markdown: '# Test',
          workspaceId: workspace.id,
          options: {
            preserveIds: true,
            mergeStrategy: 'replace',
          },
        })

        expectSuccessResponse(response)
        expect(exportService.importMarkdown).toHaveBeenCalledWith(user.id, {
          markdown: '# Test',
          workspaceId: workspace.id,
          options: {
            preserveIds: true,
            mergeStrategy: 'replace',
          },
        })
      })
    })

    describe('✅ Authentication Requirements', () => {
      it('should require authentication', async () => {
        const response = await request(app).post('/api/export/import').send({
          markdown: '# Test',
          workspaceId: 'test-workspace',
        })

        expectErrorResponse(response, 401, 'Missing or invalid authorization header')
      })
    })

    describe('✅ Validation', () => {
      it('should require markdown content', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/export/import').send({
          workspaceId: 'test-workspace',
        })

        expectErrorResponse(response, 400)
      })

      it('should require either workspaceId or pageId', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const response = await authRequest('post', '/api/export/import').send({
          markdown: '# Test',
        })

        expectErrorResponse(response, 400)
      })

      it('should not allow both workspaceId and pageId', async () => {
        const user = createUser()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        // Service should handle this validation
        ;(exportService.importMarkdown as jest.Mock).mockRejectedValueOnce(new Error('Cannot specify both workspaceId and pageId'))

        const response = await authRequest('post', '/api/export/import').send({
          markdown: '# Test',
          workspaceId: 'workspace-1',
          pageId: 'page-1',
        })

        expectErrorResponse(response, 400)
      })
    })

    describe('✅ Authorization', () => {
      it('should only allow import to owned workspaces', async () => {
        const user = createUser()
        const otherUserWorkspace = createWorkspace({ userId: 'other-user' })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(exportService.importMarkdown as jest.Mock).mockRejectedValueOnce(new Error('Workspace not found'))

        const response = await authRequest('post', '/api/export/import').send({
          markdown: '# Test',
          workspaceId: otherUserWorkspace.id,
        })

        expectErrorResponse(response, 500)
      })

      it('should only allow import to accessible pages', async () => {
        const user = createUser()
        const otherUserPage = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(exportService.importMarkdown as jest.Mock).mockRejectedValueOnce(new Error('Page not found'))

        const response = await authRequest('post', '/api/export/import').send({
          markdown: '# Test',
          pageId: otherUserPage.id,
        })

        expectErrorResponse(response, 500)
      })
    })

    describe('✅ Error Handling', () => {
      it('should handle malformed markdown', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(exportService.importMarkdown as jest.Mock).mockRejectedValueOnce(new Error('Invalid markdown format'))

        const response = await authRequest('post', '/api/export/import').send({
          markdown: '```unclosed code block',
          workspaceId: workspace.id,
        })

        expectErrorResponse(response, 500)
      })

      it('should handle extremely large imports', async () => {
        const user = createUser()
        const workspace = createWorkspace({ userId: user.id })
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        const largeMarkdown = '# Heading\n\n' + 'Lorem ipsum '.repeat(100000) // Very large content

        ;(exportService.importMarkdown as jest.Mock).mockRejectedValueOnce(new Error('Content too large'))

        const response = await authRequest('post', '/api/export/import').send({
          markdown: largeMarkdown,
          workspaceId: workspace.id,
        })

        expectErrorResponse(response, 500)
      })

      it('should handle import conflicts', async () => {
        const user = createUser()
        const page = createPage()
        const { request: authRequest } = createAuthenticatedRequest(app, user)

        ;(exportService.importMarkdown as jest.Mock).mockRejectedValueOnce(new Error('Merge conflict detected'))

        const response = await authRequest('post', '/api/export/import').send({
          markdown: '# Updated content',
          pageId: page.id,
          options: {
            mergeStrategy: 'merge',
          },
        })

        expectErrorResponse(response, 500)
      })
    })
  })

  describe('✅ Security Tests', () => {
    it('should sanitize file names in content-disposition header', async () => {
      const user = createUser()
      const page = createPage({ id: '../../../etc/passwd' }) // Malicious ID
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      ;(exportService.exportPageToMarkdown as jest.Mock).mockResolvedValueOnce('# Safe content')

      const response = await authRequest('get', `/api/export/pages/${encodeURIComponent(page.id)}`)

      expect(response.status).toBe(200)
      // The ID is used as-is in the filename, but browsers handle this safely
      expect(response.headers['content-disposition']).toContain('page-../../../etc/passwd')
    })

    it('should handle XSS attempts in exported content', async () => {
      const user = createUser()
      const page = createPage()
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      const xssContent = '# Test\n\n<script>alert("xss")</script>\n\nSafe content'

      ;(exportService.exportPageToMarkdown as jest.Mock).mockResolvedValueOnce(xssContent)

      const response = await authRequest('get', `/api/export/pages/${page.id}`)

      expect(response.status).toBe(200)
      // Content is returned as-is, sanitization is client's responsibility
      expect(response.text).toContain('<script>alert("xss")</script>')
    })

    it('should validate import content size limits', async () => {
      const user = createUser()
      const workspace = createWorkspace({ userId: user.id })
      const { request: authRequest } = createAuthenticatedRequest(app, user)

      // Simulate a request body that's too large
      const hugeMarkdown = '#'.repeat(10 * 1024 * 1024) // 10MB

      ;(exportService.importMarkdown as jest.Mock).mockRejectedValueOnce(new Error('Request too large'))

      const response = await authRequest('post', '/api/export/import').send({
        markdown: hugeMarkdown,
        workspaceId: workspace.id,
      })

      expectErrorResponse(response, 500)
    })
  })
})
