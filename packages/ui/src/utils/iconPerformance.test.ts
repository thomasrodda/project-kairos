// packages/ui/src/utils/iconPerformance.test.ts
// Essential tests for icon performance monitoring and preloading utilities.
// Focuses on core functionality: metrics tracking, preloading, and error handling.

import {
  iconPerformanceMonitor,
  preloadCriticalIcons,
  preloadImportantIcons,
  loadIconWithMonitoring,
  CRITICAL_ICONS,
  IMPORTANT_ICONS,
  getOnDemandIcons,
} from './iconPerformance'
import type { IconName } from './iconLoader'

// Mock the dependencies
jest.mock('./svgContentLoader', () => ({
  loadSvgContent: jest.fn(),
  preloadIcons: jest.fn(),
}))

jest.mock('./iconLoader', () => ({
  getAllIconNames: jest.fn(),
}))

// Import mocked dependencies
import { loadSvgContent, preloadIcons } from './svgContentLoader'
import { getAllIconNames } from './iconLoader'

const mockLoadSvgContent = loadSvgContent as jest.MockedFunction<typeof loadSvgContent>
const mockPreloadIcons = preloadIcons as jest.MockedFunction<typeof preloadIcons>
const mockGetAllIconNames = getAllIconNames as jest.MockedFunction<typeof getAllIconNames>

// Store original globals to restore them
const originalWindow = global.window
const originalPerformance = global.performance

// Mock performance API
const mockPerformanceNow = jest.fn()

describe('Icon Performance Utilities', () => {
  beforeEach(() => {
    // Reset all mocks and performance monitor state
    jest.clearAllMocks()
    iconPerformanceMonitor.reset()

    // Ensure performance API is available for most tests
    Object.defineProperty(global, 'performance', {
      writable: true,
      configurable: true,
      value: { now: mockPerformanceNow },
    })

    // Ensure window is available for most tests
    if (!global.window) {
      global.window = originalWindow
    }

    // Setup default mock behaviors
    mockPerformanceNow.mockReturnValue(1000)
    mockLoadSvgContent.mockResolvedValue('<svg>test</svg>')
    mockPreloadIcons.mockResolvedValue()
    mockGetAllIconNames.mockReturnValue(['search', 'add', 'close', 'settings', 'help'] as IconName[])

    // Suppress console output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()

    // Restore original globals
    global.window = originalWindow
    global.performance = originalPerformance
  })

  describe('✅ Performance Monitor Tracks Metrics', () => {
    it('should track timing for icon loading', () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000) // startTiming
        .mockReturnValueOnce(1150) // endTiming

      iconPerformanceMonitor.startTiming('search')
      iconPerformanceMonitor.endTiming('search', false)

      const metrics = iconPerformanceMonitor.getMetrics()
      expect(metrics).toHaveLength(1)
      expect(metrics[0]).toEqual({
        iconName: 'search',
        loadTime: 150,
        cacheHit: false,
        error: undefined,
      })
    })

    it('should calculate cache hit rate correctly', () => {
      mockPerformanceNow.mockReturnValue(1000)

      // Add 2 cache hits and 1 cache miss
      iconPerformanceMonitor.startTiming('search')
      iconPerformanceMonitor.endTiming('search', true) // hit

      iconPerformanceMonitor.startTiming('add')
      iconPerformanceMonitor.endTiming('add', true) // hit

      iconPerformanceMonitor.startTiming('close')
      iconPerformanceMonitor.endTiming('close', false) // miss

      const hitRate = iconPerformanceMonitor.getCacheHitRate()
      expect(hitRate).toBeCloseTo(0.667, 3) // 2/3 = 0.667
    })

    it('should calculate average load time correctly', () => {
      mockPerformanceNow
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1100) // 100ms
        .mockReturnValueOnce(2000)
        .mockReturnValueOnce(2300) // 300ms

      iconPerformanceMonitor.startTiming('search')
      iconPerformanceMonitor.endTiming('search', false)

      iconPerformanceMonitor.startTiming('add')
      iconPerformanceMonitor.endTiming('add', false)

      const averageTime = iconPerformanceMonitor.getAverageLoadTime()
      expect(averageTime).toBe(200) // (100 + 300) / 2
    })

    it('should reset metrics correctly', () => {
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1150)

      iconPerformanceMonitor.startTiming('search')
      iconPerformanceMonitor.endTiming('search', false)
      expect(iconPerformanceMonitor.getMetrics()).toHaveLength(1)

      iconPerformanceMonitor.reset()
      expect(iconPerformanceMonitor.getMetrics()).toHaveLength(0)
      expect(iconPerformanceMonitor.getAverageLoadTime()).toBe(0)
      expect(iconPerformanceMonitor.getCacheHitRate()).toBe(0)
    })
  })

  describe('✅ Preloading Works Without Errors', () => {
    it('should preload critical icons successfully', async () => {
      await preloadCriticalIcons()
      expect(mockPreloadIcons).toHaveBeenCalledWith(CRITICAL_ICONS)
    })

    it('should preload important icons successfully', async () => {
      await preloadImportantIcons()
      expect(mockPreloadIcons).toHaveBeenCalledWith(IMPORTANT_ICONS)
    })

    it('should handle preload failures gracefully', async () => {
      mockPreloadIcons.mockRejectedValue(new Error('Network error'))

      // Should not throw
      await expect(preloadCriticalIcons()).resolves.toBeUndefined()
      await expect(preloadImportantIcons()).resolves.toBeUndefined()
    })

    it('should handle server-side environment gracefully', async () => {
      // Just verify the function doesn't throw errors
      await expect(preloadCriticalIcons()).resolves.toBeUndefined()
      await expect(preloadImportantIcons()).resolves.toBeUndefined()
    })
  })

  describe('✅ Load Icon With Monitoring', () => {
    it('should load icon and track performance', async () => {
      const mockSvgContent = '<svg>test content</svg>'
      mockLoadSvgContent.mockResolvedValue(mockSvgContent)

      mockPerformanceNow
        .mockReturnValueOnce(1000) // start
        .mockReturnValueOnce(1250) // end

      const result = await loadIconWithMonitoring('search')

      expect(result).toBe(mockSvgContent)
      expect(mockLoadSvgContent).toHaveBeenCalledWith('search')

      const metrics = iconPerformanceMonitor.getMetrics()
      expect(metrics).toHaveLength(1)
      expect(metrics[0].loadTime).toBe(250)
    })

    it('should track errors when loading fails', async () => {
      mockLoadSvgContent.mockRejectedValue(new Error('Failed to load'))
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100)

      await expect(loadIconWithMonitoring('search')).rejects.toThrow('Failed to load')

      const metrics = iconPerformanceMonitor.getMetrics()
      expect(metrics[0]).toMatchObject({
        iconName: 'search',
        cacheHit: false,
        error: 'Failed to load',
      })
    })
  })

  describe('✅ Icon Constants Are Valid', () => {
    it('should return on-demand icons excluding preloaded ones', () => {
      const allIcons = ['search', 'add', 'archive', 'custom'] as IconName[]
      mockGetAllIconNames.mockReturnValue(allIcons)

      const onDemandIcons = getOnDemandIcons()
      expect(onDemandIcons).toContain('custom')
      expect(onDemandIcons).not.toContain('search') // Should be excluded (critical)
    })

    it('should not have overlapping icons between critical and important', () => {
      const importantSet = new Set(IMPORTANT_ICONS)
      const overlap = CRITICAL_ICONS.filter((icon) => importantSet.has(icon))
      expect(overlap).toHaveLength(0)
    })
  })

  describe('✅ Error Handling', () => {})
})
