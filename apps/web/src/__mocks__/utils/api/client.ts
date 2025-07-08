// Mock implementation of API client for testing

export const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  cancelAll: jest.fn(),
}

export const api = {
  auth: {
    verify: jest.fn().mockResolvedValue({ user: null }),
    syncUser: jest.fn().mockResolvedValue({ user: { id: 'test-user' } }),
    me: jest.fn().mockResolvedValue({ user: { id: 'test-user' } }),
  },

  workspaces: {
    list: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'test-workspace', name: 'Test Workspace' }),
    get: jest.fn().mockResolvedValue({ id: 'test-workspace', name: 'Test Workspace' }),
    update: jest.fn().mockResolvedValue({ id: 'test-workspace', name: 'Updated Workspace' }),
    delete: jest.fn().mockResolvedValue(undefined),
  },

  pages: {
    list: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue({ id: 'test-page', title: 'Test Page' }),
    create: jest.fn().mockResolvedValue({ id: 'test-page', title: 'New Page' }),
    update: jest.fn().mockResolvedValue({ id: 'test-page', title: 'Updated Page' }),
    delete: jest.fn().mockResolvedValue(undefined),
    move: jest.fn().mockResolvedValue({ id: 'test-page', parentId: 'new-parent' }),
    duplicate: jest.fn().mockResolvedValue({ id: 'duplicated-page', title: 'Copy of Test Page' }),
    export: jest.fn().mockResolvedValue({ content: '# Test Page\n\nContent here' }),
    search: jest.fn().mockResolvedValue([]),
    breadcrumbs: jest.fn().mockResolvedValue([]),
    batch: jest.fn().mockResolvedValue([]),
    stats: jest.fn().mockResolvedValue({
      wordCount: 100,
      characterCount: 500,
      blockCount: 5,
      lastModified: new Date().toISOString(),
    }),
  },

  blocks: {
    listByPage: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'test-block', content: 'Test content' }),
    update: jest.fn().mockResolvedValue({ id: 'test-block', content: 'Updated content' }),
    delete: jest.fn().mockResolvedValue(undefined),
    batch: jest.fn().mockResolvedValue([]),
    reorder: jest.fn().mockResolvedValue(undefined),
  },
}

// Export mock classes for testing
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  constructor(public baseURL: string) {}

  get = apiClient.get
  post = apiClient.post
  put = apiClient.put
  patch = apiClient.patch
  delete = apiClient.delete
  cancelAll = apiClient.cancelAll
}
