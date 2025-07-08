import { renderHook, act, waitFor } from '@testing-library/react'
import { usePageTree } from './usePageTree'
import { api } from '../../../utils/api/client'
import { Page } from '@kairos/types'

// Mock the API client
jest.mock('../../../utils/api/client', () => ({
  api: {
    pages: {
      list: jest.fn(),
    },
  },
}))

describe('usePageTree', () => {
  const mockPages: Page[] = [
    {
      id: '1',
      workspaceId: 'workspace-1',
      title: 'Root Page',
      order: 0,
      isFolder: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      workspaceId: 'workspace-1',
      title: 'Folder 1',
      order: 1,
      isFolder: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      workspaceId: 'workspace-1',
      parentId: '2',
      title: 'Child Page',
      order: 0,
      isFolder: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const mockOnPageSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch pages on mount', async () => {
    ;(api.pages.list as jest.Mock).mockResolvedValue(mockPages)

    const { result } = renderHook(() =>
      usePageTree({
        workspaceId: 'workspace-1',
        onPageSelect: mockOnPageSelect,
      })
    )

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(api.pages.list).toHaveBeenCalledWith('workspace-1')
    expect(result.current.pageTree).toHaveLength(2) // Two root pages
  })

  it('should build hierarchical tree structure', async () => {
    ;(api.pages.list as jest.Mock).mockResolvedValue(mockPages)

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
    ;(api.pages.list as jest.Mock).mockResolvedValue(mockPages)

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
    ;(api.pages.list as jest.Mock).mockResolvedValue(mockPages)

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
    ;(api.pages.list as jest.Mock).mockResolvedValue(mockPages)

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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    ;(api.pages.list as jest.Mock).mockResolvedValue(nestedPages)

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

  it('should handle API errors', async () => {
    const error = new Error('Failed to fetch')
    ;(api.pages.list as jest.Mock).mockRejectedValue(error)

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

  it('should not fetch if workspaceId is not provided', () => {
    renderHook(() =>
      usePageTree({
        workspaceId: '',
        onPageSelect: mockOnPageSelect,
      })
    )

    expect(api.pages.list).not.toHaveBeenCalled()
  })

  it('should sort pages by order', async () => {
    const unsortedPages: Page[] = [
      { ...mockPages[0], order: 2 },
      { ...mockPages[1], order: 0 },
      { ...mockPages[2], order: 1 },
    ]

    ;(api.pages.list as jest.Mock).mockResolvedValue(unsortedPages)

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
