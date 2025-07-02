// packages/ui/src/components/Icon/Icon.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { Icon } from './Icon'
import { loadIconWithMonitoring } from '../../utils/iconPerformance'
import { parseSvgContent } from '../../utils/svgContentLoader'

// Mock the icon performance monitoring
jest.mock('../../utils/iconPerformance', () => ({
  loadIconWithMonitoring: jest.fn(),
}))

// Mock the SVG content loader
jest.mock('../../utils/svgContentLoader', () => ({
  parseSvgContent: jest.fn(),
  svgElementToProps: jest.fn(),
}))

// Mock the icon loader to control what icons exist
jest.mock('../../utils/iconLoader', () => ({
  iconMap: {
    search: 'SearchIcon.svg',
    add: 'AddIcon.svg',
    'non-existent': 'NonExistent.svg', // For testing missing icons
  },
}))

const mockLoadIconWithMonitoring = loadIconWithMonitoring as jest.MockedFunction<typeof loadIconWithMonitoring>
const mockParseSvgContent = parseSvgContent as jest.MockedFunction<typeof parseSvgContent>

// Helper to create a mock SVG element
const createMockSvgElement = (viewBox = '0 0 24 24'): SVGElement => {
  const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  mockSvg.setAttribute('viewBox', viewBox)
  mockSvg.innerHTML = '<path d="M12 2L2 7v10c0 5.55 3.84 9.739 9.824 9.956"/>'
  return mockSvg
}

// Helper to create mock SVG props
const createMockSvgProps = (className = '', style = {}) => ({
  viewBox: '0 0 24 24',
  className,
  style,
  dangerouslySetInnerHTML: {
    __html: '<path d="M12 2L2 7v10c0 5.55 3.84 9.739 9.824 9.956"/>',
  },
})

describe('Icon Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console.warn to avoid noise in tests
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('✅ Renders known icons successfully', () => {
    it('should render a valid icon with SVG content', async () => {
      // Mock successful SVG loading
      mockLoadIconWithMonitoring.mockResolvedValue('<svg viewBox="0 0 24 24"><path d="test"/></svg>')

      // Mock successful parsing
      const mockSvgElement = createMockSvgElement()
      mockParseSvgContent.mockReturnValue(mockSvgElement)

      // Mock svgElementToProps
      const { svgElementToProps } = await import('../../utils/svgContentLoader')
      ;(svgElementToProps as jest.MockedFunction<typeof svgElementToProps>).mockReturnValue(
        createMockSvgProps('icon', { width: '20px', height: '20px' })
      )

      render(<Icon name="search" />)

      // Should show loading initially
      expect(screen.getByRole('img', { name: /search loading/i })).toBeInTheDocument()

      // Wait for SVG to load
      await waitFor(() => {
        const svgElement = screen.getByRole('img', { name: 'search' })
        expect(svgElement).toBeInTheDocument()
        expect(svgElement.tagName.toLowerCase()).toBe('svg')
      })

      // Verify the loading function was called
      expect(mockLoadIconWithMonitoring).toHaveBeenCalledWith('search')
    })

    it('should render multiple different icons', async () => {
      mockLoadIconWithMonitoring.mockResolvedValue('<svg viewBox="0 0 24 24"><path d="test"/></svg>')
      mockParseSvgContent.mockReturnValue(createMockSvgElement())

      const { svgElementToProps } = await import('../../utils/svgContentLoader')
      ;(svgElementToProps as jest.MockedFunction<typeof svgElementToProps>).mockReturnValue(createMockSvgProps())

      const { rerender } = render(<Icon name="search" />)

      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'search' })).toBeInTheDocument()
      })

      // Rerender with different icon
      rerender(<Icon name="add" />)

      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'add' })).toBeInTheDocument()
      })

      expect(mockLoadIconWithMonitoring).toHaveBeenCalledWith('search')
      expect(mockLoadIconWithMonitoring).toHaveBeenCalledWith('add')
    })
  })

  describe('✅ Shows fallback for invalid icons', () => {
    it('should show fallback when icon is not in iconMap', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Icon name={'invalid-icon' as any} />)

      await waitFor(() => {
        const fallback = screen.getByRole('img', { name: 'invalid-icon' })
        expect(fallback).toBeInTheDocument()
        expect(fallback).toHaveClass('icon--missing')
        expect(fallback).toHaveTextContent('?')
      })

      // Should not try to load invalid icon
      expect(mockLoadIconWithMonitoring).not.toHaveBeenCalled()
    })

    it('should show fallback when SVG loading fails', async () => {
      mockLoadIconWithMonitoring.mockRejectedValue(new Error('Network error'))

      render(<Icon name="search" />)

      await waitFor(() => {
        const fallback = screen.getByRole('img', { name: 'search' })
        expect(fallback).toBeInTheDocument()
        expect(fallback).toHaveClass('icon--missing')
        expect(fallback).toHaveTextContent('?')
      })
    })

    it('should show fallback when SVG content is empty', async () => {
      mockLoadIconWithMonitoring.mockResolvedValue('')

      render(<Icon name="search" />)

      await waitFor(() => {
        const fallback = screen.getByRole('img', { name: 'search' })
        expect(fallback).toBeInTheDocument()
        expect(fallback).toHaveClass('icon--missing')
      })
    })

    it('should show fallback when SVG parsing fails', async () => {
      mockLoadIconWithMonitoring.mockResolvedValue('<svg>valid content</svg>')
      mockParseSvgContent.mockReturnValue(null) // Parsing failed

      render(<Icon name="search" />)

      await waitFor(() => {
        const fallback = screen.getByRole('img', { name: 'search' })
        expect(fallback).toBeInTheDocument()
        expect(fallback).toHaveClass('icon--missing')
      })
    })
  })

  describe('✅ Applies size and color props correctly', () => {
    beforeEach(async () => {
      // Setup successful icon loading for these tests
      mockLoadIconWithMonitoring.mockResolvedValue('<svg viewBox="0 0 24 24"><path d="test"/></svg>')
      mockParseSvgContent.mockReturnValue(createMockSvgElement())

      const { svgElementToProps } = await import('../../utils/svgContentLoader')
      ;(svgElementToProps as jest.MockedFunction<typeof svgElementToProps>).mockReturnValue(createMockSvgProps())
    })

    it('should apply numeric size correctly', async () => {
      render(<Icon name="search" size={32} />)

      await waitFor(() => {
        const icon = screen.getByRole('img', { name: 'search' })
        expect(icon).toHaveStyle({
          width: '32px',
          height: '32px',
        })
      })
    })

    it('should apply string size correctly', async () => {
      render(<Icon name="search" size="2rem" />)

      await waitFor(() => {
        const icon = screen.getByRole('img', { name: 'search' })
        expect(icon).toHaveStyle({
          width: '2rem',
          height: '2rem',
        })
      })
    })

    it('should apply color prop correctly', async () => {
      render(<Icon name="search" color="#ff0000" />)

      await waitFor(() => {
        const icon = screen.getByRole('img', { name: 'search' })
        expect(icon).toHaveStyle({
          color: '#ff0000',
        })
      })
    })

    it('should apply fill prop correctly', async () => {
      render(<Icon name="search" fill="#00ff00" />)

      await waitFor(() => {
        const icon = screen.getByRole('img', { name: 'search' })
        expect(icon).toHaveStyle({
          fill: '#00ff00',
        })
      })
    })

    it('should apply stroke prop correctly', async () => {
      render(<Icon name="search" stroke="#0000ff" />)

      await waitFor(() => {
        const icon = screen.getByRole('img', { name: 'search' })
        expect(icon).toHaveStyle({
          stroke: '#0000ff',
        })
      })
    })

    it('should apply opacity prop correctly', async () => {
      render(<Icon name="search" opacity={0.5} />)

      await waitFor(() => {
        const icon = screen.getByRole('img', { name: 'search' })
        expect(icon).toHaveStyle({
          opacity: '0.5',
        })
      })
    })
  })

  describe('✅ Handles aria-label for accessibility', () => {
    beforeEach(async () => {
      // Setup successful icon loading
      mockLoadIconWithMonitoring.mockResolvedValue('<svg viewBox="0 0 24 24"><path d="test"/></svg>')
      mockParseSvgContent.mockReturnValue(createMockSvgElement())

      const { svgElementToProps } = await import('../../utils/svgContentLoader')
      ;(svgElementToProps as jest.MockedFunction<typeof svgElementToProps>).mockReturnValue(createMockSvgProps())
    })

    it('should use custom aria-label when provided', async () => {
      render(<Icon name="search" aria-label="Search for content" />)

      await waitFor(() => {
        const icon = screen.getByRole('img', { name: 'Search for content' })
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveAttribute('aria-label', 'Search for content')
      })
    })

    it('should use icon name as aria-label when not provided', async () => {
      render(<Icon name="search" />)

      await waitFor(() => {
        const icon = screen.getByRole('img', { name: 'search' })
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveAttribute('aria-label', 'search')
      })
    })

    it('should append "loading" to icon name when no custom aria-label provided', () => {
      render(<Icon name="search" />)

      // When no custom aria-label, it should append "loading" to the icon name
      const loadingIcon = screen.getByRole('img', { name: 'search loading' })
      expect(loadingIcon).toBeInTheDocument()
      expect(loadingIcon).toHaveAttribute('role', 'img')
      expect(loadingIcon).toHaveClass('icon--loading')
    })

    it('should maintain accessibility in error state', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Icon name={'invalid' as any} aria-label="Custom label" />)

      await waitFor(() => {
        const errorIcon = screen.getByRole('img', { name: 'Custom label' })
        expect(errorIcon).toBeInTheDocument()
        expect(errorIcon).toHaveAttribute('role', 'img')
      })
    })
  })

  describe('✅ Shows loading state while fetching SVG', () => {
    it('should show loading state immediately', () => {
      // Don't resolve the promise to keep it in loading state
      mockLoadIconWithMonitoring.mockImplementation(() => new Promise(() => {}))

      render(<Icon name="search" />)

      const loadingIcon = screen.getByRole('img', { name: /search loading/i })
      expect(loadingIcon).toBeInTheDocument()
      expect(loadingIcon).toHaveClass('icon--loading')
    })

    it('should transition from loading to loaded state', async () => {
      mockLoadIconWithMonitoring.mockResolvedValue('<svg viewBox="0 0 24 24"><path d="test"/></svg>')
      mockParseSvgContent.mockReturnValue(createMockSvgElement())

      const { svgElementToProps } = await import('../../utils/svgContentLoader')
      ;(svgElementToProps as jest.MockedFunction<typeof svgElementToProps>).mockReturnValue(createMockSvgProps())

      render(<Icon name="search" />)

      // Initially loading
      expect(screen.getByRole('img', { name: /search loading/i })).toBeInTheDocument()

      // Wait for it to load
      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'search' })).toBeInTheDocument()
        expect(screen.queryByRole('img', { name: /search loading/i })).not.toBeInTheDocument()
      })
    })

    it('should transition from loading to error state', async () => {
      mockLoadIconWithMonitoring.mockRejectedValue(new Error('Failed to load'))

      render(<Icon name="search" />)

      // Initially loading
      expect(screen.getByRole('img', { name: /search loading/i })).toBeInTheDocument()

      // Wait for error state
      await waitFor(() => {
        const errorIcon = screen.getByRole('img', { name: 'search' })
        expect(errorIcon).toBeInTheDocument()
        expect(errorIcon).toHaveClass('icon--missing')
        expect(screen.queryByRole('img', { name: /search loading/i })).not.toBeInTheDocument()
      })
    })

    it('should handle multiple icons loading simultaneously', async () => {
      mockLoadIconWithMonitoring.mockImplementation((name) => {
        return new Promise((resolve) => {
          setTimeout(
            () => {
              resolve('<svg viewBox="0 0 24 24"><path d="test"/></svg>')
            },
            name === 'search' ? 100 : 200
          )
        })
      })

      mockParseSvgContent.mockReturnValue(createMockSvgElement())

      const { svgElementToProps } = await import('../../utils/svgContentLoader')
      ;(svgElementToProps as jest.MockedFunction<typeof svgElementToProps>).mockReturnValue(createMockSvgProps())

      render(
        <div>
          <Icon name="search" />
          <Icon name="add" />
        </div>
      )

      // Both should be loading initially
      expect(screen.getByRole('img', { name: /search loading/i })).toBeInTheDocument()
      expect(screen.getByRole('img', { name: /add loading/i })).toBeInTheDocument()

      // Search loads first
      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'search' })).toBeInTheDocument()
      })

      // Add loads second
      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'add' })).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases and Component Lifecycle', () => {
    it('should handle component unmounting during load', async () => {
      let resolveLoad: (value: string) => void
      mockLoadIconWithMonitoring.mockImplementation(() => {
        return new Promise((resolve) => {
          resolveLoad = resolve
        })
      })

      const { unmount } = render(<Icon name="search" />)

      // Unmount before load completes
      unmount()

      // Complete the load - should not cause errors
      resolveLoad!('<svg>test</svg>')

      // Give React a chance to process any state updates
      await new Promise((resolve) => setTimeout(resolve, 0))

      // No assertions needed - just ensuring no errors thrown
    })

    it('should handle rapid icon name changes', async () => {
      mockLoadIconWithMonitoring.mockResolvedValue('<svg viewBox="0 0 24 24"><path d="test"/></svg>')
      mockParseSvgContent.mockReturnValue(createMockSvgElement())

      const { svgElementToProps } = await import('../../utils/svgContentLoader')
      ;(svgElementToProps as jest.MockedFunction<typeof svgElementToProps>).mockReturnValue(createMockSvgProps())

      const { rerender } = render(<Icon name="search" />)

      // Quickly change icon names
      rerender(<Icon name="add" />)
      rerender(<Icon name="search" />)
      rerender(<Icon name="add" />)

      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'add' })).toBeInTheDocument()
      })
    })
  })
})
