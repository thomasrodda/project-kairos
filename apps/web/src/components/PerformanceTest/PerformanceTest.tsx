// apps/web/src/components/PerformanceTest/PerformanceTest.tsx
import { useState, useEffect } from 'react'
import { Icon, iconPerformanceMonitor, CRITICAL_ICONS, IMPORTANT_ICONS } from '@kairos/ui'
import type { IconName, IconLoadMetrics } from '@kairos/ui'
import './PerformanceTest.scss'

export function PerformanceTest() {
  const [showMetrics, setShowMetrics] = useState(false)
  const [metrics, setMetrics] = useState<IconLoadMetrics[]>([])

  useEffect(() => {
    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      setMetrics(iconPerformanceMonitor.getMetrics())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null // Only show in development
  }

  return (
    <div className="performance-test">
      <h4 className="performance-test__title">Icon Performance Test</h4>

      <div className="performance-test__section">
        <strong className="performance-test__label">Critical Icons:</strong>
        <div className="performance-test__icon-list">
          {CRITICAL_ICONS.map((icon: IconName) => (
            <Icon key={icon} name={icon} size={16} />
          ))}
        </div>
      </div>

      <div className="performance-test__section">
        <strong className="performance-test__label">Important Icons:</strong>
        <div className="performance-test__icon-list">
          {IMPORTANT_ICONS.map((icon: IconName) => (
            <Icon key={icon} name={icon} size={16} />
          ))}
        </div>
      </div>

      <button onClick={() => setShowMetrics(!showMetrics)} className="performance-test__toggle-button">
        {showMetrics ? 'Hide' : 'Show'} Metrics
      </button>

      {showMetrics && (
        <div className="performance-test__metrics">
          <p className="performance-test__metrics-stat">
            <strong>Total loaded:</strong> {metrics.length}
          </p>
          <p className="performance-test__metrics-stat">
            <strong>Avg load time:</strong> {iconPerformanceMonitor.getAverageLoadTime().toFixed(2)}ms
          </p>
          <p className="performance-test__metrics-stat">
            <strong>Cache hit rate:</strong> {(iconPerformanceMonitor.getCacheHitRate() * 100).toFixed(1)}%
          </p>

          {metrics.length > 0 && (
            <details className="performance-test__metrics-details">
              <summary>Recent loads</summary>
              <div className="performance-test__metrics-list">
                {metrics.slice(-10).map((metric, i) => (
                  <div key={i} className="performance-test__metrics-item">
                    {metric.iconName}: {metric.loadTime.toFixed(1)}ms
                    {metric.cacheHit && ' (cached)'}
                    {metric.error && ' (error)'}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
