// packages/ui/src/utils/iconPerformance.ts
// =============================================================================
// ICON PERFORMANCE UTILITIES - Optimizations for production use
// =============================================================================

import { IconName, getAllIconNames } from './iconLoader'
import { loadSvgContent, preloadIcons, clearSvgCache } from './svgContentLoader'

// Performance monitoring
export interface IconLoadMetrics {
  iconName: IconName
  loadTime: number
  cacheHit: boolean
  error?: string
}

class IconPerformanceMonitor {
  private metrics: IconLoadMetrics[] = []
  private loadTimes = new Map<IconName, number>()

  startTiming(iconName: IconName): void {
    this.loadTimes.set(iconName, performance.now())
  }

  endTiming(iconName: IconName, cacheHit: boolean, error?: string): void {
    const startTime = this.loadTimes.get(iconName)
    if (startTime) {
      const loadTime = performance.now() - startTime
      this.metrics.push({
        iconName,
        loadTime,
        cacheHit,
        error,
      })
      this.loadTimes.delete(iconName)
    }
  }

  getMetrics(): IconLoadMetrics[] {
    return [...this.metrics]
  }

  getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0
    const total = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0)
    return total / this.metrics.length
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0
    const cacheHits = this.metrics.filter((metric) => metric.cacheHit).length
    return cacheHits / this.metrics.length
  }

  reset(): void {
    this.metrics = []
    this.loadTimes.clear()
  }
}

// Global performance monitor instance
export const iconPerformanceMonitor = new IconPerformanceMonitor()

/**
 * Critical icons that should be preloaded immediately
 * These are the most commonly used icons in the app
 */
export const CRITICAL_ICONS: IconName[] = ['search', 'add', 'close', 'settings', 'profile', 'folder']

/**
 * Important icons that should be preloaded on app initialization
 * These are frequently used but not critical for first render
 */
export const IMPORTANT_ICONS: IconName[] = ['archive', 'back', 'check', 'copy', 'help', 'image', 'more', 'page']

/**
 * All other icons that can be loaded on demand
 */
export function getOnDemandIcons(): IconName[] {
  const allIcons = getAllIconNames()
  const preloadedIcons = [...CRITICAL_ICONS, ...IMPORTANT_ICONS]
  return allIcons.filter((icon) => !preloadedIcons.includes(icon))
}

/**
 * Preload critical icons that are needed for first render
 * Call this as early as possible in app initialization
 */
export async function preloadCriticalIcons(): Promise<void> {
  if (typeof window === 'undefined') return // Skip on server side

  try {
    console.log('🔥 Preloading critical icons...', CRITICAL_ICONS)
    await preloadIcons(CRITICAL_ICONS)
    console.log('✅ Critical icons preloaded successfully')
  } catch (error) {
    console.warn('⚠️ Some critical icons failed to preload:', error)
  }
}

/**
 * Preload important icons in the background
 * Call this after the app has finished initial render
 */
export async function preloadImportantIcons(): Promise<void> {
  if (typeof window === 'undefined') return // Skip on server side

  try {
    console.log('📦 Preloading important icons...', IMPORTANT_ICONS)
    await preloadIcons(IMPORTANT_ICONS)
    console.log('✅ Important icons preloaded successfully')
  } catch (error) {
    console.warn('⚠️ Some important icons failed to preload:', error)
  }
}

/**
 * Intelligent icon preloading based on usage patterns
 * This can be enhanced with user behavior analytics
 */
export async function smartPreload(): Promise<void> {
  // First, preload critical icons immediately
  await preloadCriticalIcons()

  // Then preload important icons when the browser is idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        preloadImportantIcons()
      },
      { timeout: 5000 }
    )
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(preloadImportantIcons, 1000)
  }
}

/**
 * Monitor icon loading performance in development
 */
export function enablePerformanceMonitoring(): void {
  if (process.env.NODE_ENV !== 'development') return

  console.log('📊 Icon performance monitoring enabled')

  // Log metrics every 30 seconds in development
  setInterval(() => {
    const metrics = iconPerformanceMonitor.getMetrics()
    if (metrics.length > 0) {
      console.group('📊 Icon Performance Metrics')
      console.log(`Average load time: ${iconPerformanceMonitor.getAverageLoadTime().toFixed(2)}ms`)
      console.log(`Cache hit rate: ${(iconPerformanceMonitor.getCacheHitRate() * 100).toFixed(1)}%`)
      console.log(`Total icons loaded: ${metrics.length}`)

      // Show slowest icons
      const slowest = metrics
        .filter((m) => !m.cacheHit)
        .sort((a, b) => b.loadTime - a.loadTime)
        .slice(0, 3)

      if (slowest.length > 0) {
        console.log(
          'Slowest icons:',
          slowest.map((m) => `${m.iconName}: ${m.loadTime.toFixed(2)}ms`)
        )
      }

      console.groupEnd()
    }
  }, 30000)
}

/**
 * Enhanced icon loading with performance monitoring
 */
export async function loadIconWithMonitoring(iconName: IconName): Promise<string> {
  iconPerformanceMonitor.startTiming(iconName)

  try {
    const content = await loadSvgContent(iconName)
    iconPerformanceMonitor.endTiming(iconName, !!content)
    return content
  } catch (error) {
    iconPerformanceMonitor.endTiming(iconName, false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Memory management - clear caches when memory pressure is detected
 */
export function setupMemoryManagement(): void {
  if (typeof window === 'undefined') return

  // Listen for memory pressure events (Chrome)
  if ('memory' in performance && 'onmemorywarning' in window) {
    window.addEventListener('memorywarning', () => {
      console.log('⚠️ Memory pressure detected, clearing icon caches')
      clearSvgCache()
    })
  }

  // Clear cache on page unload to free memory
  window.addEventListener('beforeunload', () => {
    clearSvgCache()
  })
}

/**
 * Bundle size analysis for development
 */
export function analyzeIconUsage(): void {
  if (process.env.NODE_ENV !== 'production') {
    const metrics = iconPerformanceMonitor.getMetrics()
    const usage = metrics.reduce(
      (acc, metric) => {
        acc[metric.iconName] = (acc[metric.iconName] || 0) + 1
        return acc
      },
      {} as Record<IconName, number>
    )

    console.group('📈 Icon Usage Analysis')
    console.log(
      'Most used icons:',
      Object.entries(usage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([icon, count]) => `${icon}: ${count}`)
    )

    const unusedIcons = getAllIconNames().filter((icon) => !usage[icon])
    if (unusedIcons.length > 0) {
      console.log('Unused icons (consider for tree-shaking):', unusedIcons)
    }
    console.groupEnd()
  }
}

/**
 * Initialize all performance optimizations
 * Call this once during app startup
 */
export function initializeIconPerformance(): void {
  // Start smart preloading
  smartPreload()

  // Enable performance monitoring in development
  enablePerformanceMonitoring()

  // Setup memory management
  setupMemoryManagement()

  // Enable usage analysis in development
  if (process.env.NODE_ENV === 'development') {
    // Analyze usage every 5 minutes
    setInterval(analyzeIconUsage, 5 * 60 * 1000)
  }
}
