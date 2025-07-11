import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkspaceSelector } from './WorkspaceSelector'
import { useWorkspace } from '../../contexts/WorkspaceContext'

// Mock firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  User: {},
}))

// Mock firebase lib
jest.mock('../../lib/firebase')

// Mock the api client
jest.mock('../../services/api', () => ({
  apiClient: {
    verifyAuth: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}))

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { uid: 'test-user' },
    backendUser: { id: 'test-user' },
    loading: false,
    error: null,
    needsWorkspace: false,
    signInWithGoogle: jest.fn(),
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
    logout: jest.fn(),
    clearError: jest.fn(),
    refreshUserData: jest.fn(),
  })),
}))

// Mock the WorkspaceContext
jest.mock('../../contexts/WorkspaceContext')

// Mock the useDismiss hook
jest.mock('../../hooks/useDismiss', () => ({
  useDismiss: jest.fn(),
}))

describe('WorkspaceSelector', () => {
  const mockSelectWorkspace = jest.fn()
  const mockCreateWorkspace = jest.fn()

  const defaultMockContext = {
    workspaces: [
      { id: 'ws1', name: 'Workspace 1', userId: 'user1', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
      { id: 'ws2', name: 'Workspace 2', userId: 'user1', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    ],
    currentWorkspace: { id: 'ws1', name: 'Workspace 1', userId: 'user1', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    isLoading: false,
    error: null,
    loadWorkspaces: jest.fn(),
    createWorkspace: mockCreateWorkspace,
    updateWorkspace: jest.fn(),
    deleteWorkspace: jest.fn(),
    selectWorkspace: mockSelectWorkspace,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useWorkspace as any).mockReturnValue(defaultMockContext)
  })

  describe('✅ Core Functionality', () => {
    it('should render current workspace name when expanded', () => {
      render(<WorkspaceSelector isCollapsed={false} />)
      expect(screen.getByText('Workspace 1')).toBeInTheDocument()
    })

    it('should not show workspace name when collapsed', () => {
      render(<WorkspaceSelector isCollapsed={true} />)
      expect(screen.queryByText('Workspace 1')).not.toBeInTheDocument()
    })

    it('should show loading state', () => {
      ;(useWorkspace as any).mockReturnValue({
        ...defaultMockContext,
        isLoading: true,
        currentWorkspace: null,
      })
      render(<WorkspaceSelector isCollapsed={false} />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('✅ Dropdown Interaction', () => {
    it('should toggle dropdown on button click', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} />)

      const button = screen.getByRole('button', { name: /Workspace 1/i })

      // Dropdown should be closed initially
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

      // Click to open
      await user.click(button)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getByText('Workspaces')).toBeInTheDocument()

      // Click to close
      await user.click(button)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should display all workspaces in dropdown', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))

      expect(screen.getByRole('option', { name: /Workspace 1/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Workspace 2/i })).toBeInTheDocument()
    })

    it('should highlight current workspace', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))

      const currentOption = screen.getByRole('option', { name: /Workspace 1/i })
      expect(currentOption).toHaveClass('workspace-selector__dropdown-item--active')
      expect(currentOption).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('✅ Workspace Selection', () => {
    it('should select workspace on click', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))
      await user.click(screen.getByRole('option', { name: /Workspace 2/i }))

      expect(mockSelectWorkspace).toHaveBeenCalledWith('ws2')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('✅ Workspace Creation', () => {
    it('should show create workspace button', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))

      expect(screen.getByText('Create workspace')).toBeInTheDocument()
    })

    it('should show create form on button click', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))
      await user.click(screen.getByText('Create workspace'))

      expect(screen.getByPlaceholderText('Workspace name')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Create')).toBeInTheDocument()
    })

    it('should create workspace with valid name', async () => {
      const user = userEvent.setup()
      mockCreateWorkspace.mockResolvedValue({ id: 'ws3', name: 'New Workspace' })

      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))
      await user.click(screen.getByText('Create workspace'))

      const input = screen.getByPlaceholderText('Workspace name')
      await user.type(input, 'New Workspace')
      await user.click(screen.getByText('Create'))

      expect(mockCreateWorkspace).toHaveBeenCalledWith('New Workspace')
      await waitFor(() => {
        expect(mockSelectWorkspace).toHaveBeenCalledWith('ws3')
      })
    })

    it('should show error for empty workspace name', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))
      await user.click(screen.getByText('Create workspace'))
      await user.click(screen.getByText('Create'))

      expect(screen.getByText('Workspace name is required')).toBeInTheDocument()
      expect(mockCreateWorkspace).not.toHaveBeenCalled()
    })

    it('should cancel workspace creation', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))
      await user.click(screen.getByText('Create workspace'))

      const input = screen.getByPlaceholderText('Workspace name')
      await user.type(input, 'Test')
      await user.click(screen.getByText('Cancel'))

      expect(screen.queryByPlaceholderText('Workspace name')).not.toBeInTheDocument()
      expect(screen.getByText('Create workspace')).toBeInTheDocument()
    })
  })

  describe('✅ Keyboard Navigation', () => {
    it('should create workspace on Enter key', async () => {
      const user = userEvent.setup()
      mockCreateWorkspace.mockResolvedValue({ id: 'ws3', name: 'New Workspace' })

      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))
      await user.click(screen.getByText('Create workspace'))

      const input = screen.getByPlaceholderText('Workspace name')
      await user.type(input, 'New Workspace')
      await user.keyboard('{Enter}')

      expect(mockCreateWorkspace).toHaveBeenCalledWith('New Workspace')
    })

    it('should cancel on Escape key', async () => {
      const user = userEvent.setup()
      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))
      await user.click(screen.getByText('Create workspace'))

      await user.keyboard('{Escape}')

      expect(screen.queryByPlaceholderText('Workspace name')).not.toBeInTheDocument()
      expect(screen.getByText('Create workspace')).toBeInTheDocument()
    })
  })

  describe('✅ Error Handling', () => {
    it('should display error from failed creation', async () => {
      const user = userEvent.setup()
      mockCreateWorkspace.mockRejectedValue(new Error('Failed to create workspace'))

      render(<WorkspaceSelector isCollapsed={false} />)

      await user.click(screen.getByRole('button', { name: /Workspace 1/i }))
      await user.click(screen.getByText('Create workspace'))

      const input = screen.getByPlaceholderText('Workspace name')
      await user.type(input, 'New Workspace')
      await user.click(screen.getByText('Create'))

      await waitFor(() => {
        expect(screen.getByText('Failed to create workspace')).toBeInTheDocument()
      })
    })
  })
})
