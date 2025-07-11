export const apiClient = {
  // Auth methods
  verifyAuth: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),

  // Workspace methods
  getWorkspaces: jest.fn(),
  getWorkspace: jest.fn(),
  createWorkspace: jest.fn(),
  updateWorkspace: jest.fn(),
  deleteWorkspace: jest.fn(),

  // Page methods
  getPages: jest.fn(),
  getPage: jest.fn(),
  createPage: jest.fn(),
  updatePage: jest.fn(),
  deletePage: jest.fn(),
  reorderPages: jest.fn(),
  savePageContent: jest.fn(),
  getPageVersions: jest.fn(),
  getPageVersion: jest.fn(),
  restorePageVersion: jest.fn(),

  // Block methods
  getBlocks: jest.fn(),
  getBlock: jest.fn(),
  createBlock: jest.fn(),
  updateBlock: jest.fn(),
  updateBlocks: jest.fn(),
  deleteBlock: jest.fn(),
  reorderBlocks: jest.fn(),
}
