// Export all API services from a single entry point
export { authService } from './auth'
export { workspaceService } from './workspaces'
export { pageService } from './pages'
export { blockService } from './blocks'

// Export the base client for health checks or custom extensions
export { BaseApiClient } from './client'

// Import services for the unified client
import { authService } from './auth'
import { workspaceService } from './workspaces'
import { pageService } from './pages'
import { blockService } from './blocks'
import { BaseApiClient } from './client'

// Create a unified API client object for backward compatibility
export const apiClient = {
  // Health check
  healthCheck: () => new BaseApiClient().healthCheck(),

  // Auth methods
  verifyAuth: () => authService.verifyAuth(),
  getCurrentUser: () => authService.getCurrentUser(),
  logout: () => authService.logout(),

  // Workspace methods
  getWorkspaces: () => workspaceService.getWorkspaces(),
  getWorkspace: (id: string) => workspaceService.getWorkspace(id),
  createWorkspace: (data: { name: string }) => workspaceService.createWorkspace(data),
  updateWorkspace: (id: string, data: { name: string }) => workspaceService.updateWorkspace(id, data),
  deleteWorkspace: (id: string) => workspaceService.deleteWorkspace(id),

  // Page methods
  getPages: (workspaceId: string) => pageService.getPages(workspaceId),
  getPage: (id: string) => pageService.getPage(id),
  createPage: (workspaceId: string, data: { title: string; parentId?: string }) => pageService.createPage(workspaceId, data),
  updatePage: (id: string, data: { title: string }) => pageService.updatePage(id, data),
  deletePage: (id: string) => pageService.deletePage(id),
  reorderPages: (data: { pageId: string; newOrder: number }[]) => pageService.reorderPages(data),
  savePageContent: (pageId: string, data: any) => pageService.savePageContent(pageId, data),

  // Block methods
  getBlocks: (pageId: string) => blockService.getBlocks(pageId),
  createBlock: (pageId: string, data: any) => blockService.createBlock(pageId, data),
  updateBlock: (id: string, data: any) => blockService.updateBlock(id, data),
  updateBlocksBulk: (blocks: any[]) => blockService.updateBlocksBulk(blocks),
  deleteBlock: (id: string) => blockService.deleteBlock(id),
  reorderBlocks: (data: { blockId: string; newOrder: number }[]) => blockService.reorderBlocks(data),
}
