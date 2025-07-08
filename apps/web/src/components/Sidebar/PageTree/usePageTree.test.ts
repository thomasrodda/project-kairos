import { renderHook, act, waitFor } from '@testing-library/react'
import { usePageTree } from './usePageTree'
import { Page } from '../../../utils/api/types'
import { useWorkspace } from '../../../contexts/WorkspaceContext'

// Mock useWorkspace
jest.mock('../../../contexts/WorkspaceContext', () => ({
  useWorkspace: jest.fn(),
}))

describe('usePageTree', () => {
  const mockPages: Page[] = [
    {
      id: '1',
      workspaceId: 'workspace-1',
      title: 'Root Page',
      order: 0,
      isFolder: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      workspaceId: 'workspace-1',
      title: 'Folder 1',
      order: 1,
      isFolder: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      workspaceId: 'workspace-1',
      parentId: '2',
      title: 'Child Page',
      order: 0,
      isFolder: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const mockOnPageSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should use pages from workspace context', async () => {
    ;(useWorkspace as jest.Mock).mockReturnValue({
      pages: mockPages,
      loading: false,
      error: null,
    })

    const { result } = renderHook(() =>
      usePageTree({
        workspaceId: 'workspace-1',
        onPageSelect: mockOnPageSelect,
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.pageTree).toHaveLength(2) // Two root pages
  })

  it('should build hierarchical tree structure', async () => {
    ;(useWorkspace as jest.Mock).mockReturnValue({
      pages: mockPages,
      loading: false,
      error: null,
    })

    const { result } = renderHook(() =>
      usePageTree({
        workspaceId: 'workspace-1',
        onPageSelect: mockOnPageSelect,
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const tree = result.current.pageTree
    expect(tree[1].children).toHaveLength(1)
    expect(tree[1].children[0].id).toBe('3')
  })

  it('should handle page selection', async () => {
    ;(useWorkspace as jest.Mock).mockReturnValue({
      pages: mockPages,
      loading: false,
      error: null,
    })

    const { result } = renderHook(() =>
      usePageTree({
        workspaceId: 'workspace-1',
        onPageSelect: mockOnPageSelect,
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.handlePageSelect('1')
    })

    expect(mockOnPageSelect).toHaveBeenCalledWith('1')
  })

  it('should not select folders', async () => {
    ;(useWorkspace as jest.Mock).mockReturnValue({
      pages: mockPages,
      loading: false,
      error: null,
    })

    const { result } = renderHook(() =>
      usePageTree({
        workspaceId: 'workspace-1',
        onPageSelect: mockOnPageSelect,
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.handlePageSelect('2') // Folder ID
    })

    expect(mockOnPageSelect).not.toHaveBeenCalled()
  })

  it('should toggle folder expansion', async () => {
    ;(useWorkspace as jest.Mock).mockReturnValue({
      pages: mockPages,
      loading: false,
      error: null,
    })

    const { result } = renderHook(() =>
      usePageTree({
        workspaceId: 'workspace-1',
        onPageSelect: mockOnPageSelect,
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.expandedFolders.has('2')).toBe(false)

    act(() => {
      result.current.toggleFolder('2')
    })

    expect(result.current.expandedFolders.has('2')).toBe(true)

    act(() => {
      result.current.toggleFolder('2')
    })

    expect(result.current.expandedFolders.has('2')).toBe(false)
  })

  it('should expand parent folders of current page', async () => {
    const nestedPages: Page[] = [
      ...mockPages,
      {
        id: '4',
        workspaceId: 'workspace-1',
        parentId: '3',
        title: 'Deeply Nested',
        order: 0,
        isFolder: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    ;(useWorkspace as jest.Mock).mockReturnValue({
      pages: nestedPages,
      loading: false,
      error: null,
    })

    const { result } = renderHook(() =>
      usePageTree({
        workspaceId: 'workspace-1',
        currentPageId: '4',
        onPageSelect: mockOnPageSelect,
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should expand parent folders
    expect(result.current.expandedFolders.has('2')).toBe(true)
  })

  it('should handle workspace errors', async () => {
    const error = new Error('Failed to fetch')
    ;(useWorkspace as jest.Mock).mockReturnValue({
      pages: [],
      loading: false,
      error: error,
    })

    const { result } = renderHook(() =>
      usePageTree({
        workspaceId: 'workspace-1',
        onPageSelect: mockOnPageSelect,
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(error)
    expect(result.current.pageTree).toHaveLength(0)
  })

  it('should handle loading state from workspace', () => {
    ;(useWorkspace as jest.Mock).mockReturnValue({
      pages: [],
      loading: true,
      error: null,
    })

    const { result } = renderHook(() =>
      usePageTree({
        workspaceId: 'workspace-1',
        onPageSelect: mockOnPageSelect,
      })
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.pageTree).toHaveLength(0)
  })

  it('should sort pages by order', async () => {
    const unsortedPages: Page[] = [
      { ...mockPages[0], order: 2 },
      { ...mockPages[1], order: 0 },
      { ...mockPages[2], order: 1 },
    ]

    ;(useWorkspace as jest.Mock).mockReturnValue({
      pages: unsortedPages,
      loading: false,
      error: null,
    })

    const { result } = renderHook(() =>
      usePageTree({
        workspaceId: 'workspace-1',
        onPageSelect: mockOnPageSelect,
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const tree = result.current.pageTree
    expect(tree[0].id).toBe('2') // order: 0
    expect(tree[1].id).toBe('1') // order: 2
  })
})
