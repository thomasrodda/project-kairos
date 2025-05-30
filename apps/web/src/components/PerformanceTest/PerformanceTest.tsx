// apps/web/src/components/PerformanceTest/PerformanceTest.tsx
import { useState, useEffect } from 'react'
import { Icon, iconPerformanceMonitor, CRITICAL_ICONS, IMPORTANT_ICONS } from '@kairos/ui'
import type { IconName, IconLoadMetrics } from '@kairos/ui'

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
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '16px',
        zIndex: 9999,
        maxWidth: '400px',
        fontSize: '12px',
      }}
    >
      <h4 style={{ margin: '0 0 12px 0' }}>Icon Performance Test</h4>

      <div style={{ marginBottom: '12px' }}>
        <strong>Critical Icons:</strong>
        <div style={{ display: 'flex', gap: '4px', margin: '4px 0' }}>
          {CRITICAL_ICONS.map((icon: IconName) => (
            <Icon key={icon} name={icon} size={16} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Important Icons:</strong>
        <div style={{ display: 'flex', gap: '4px', margin: '4px 0' }}>
          {IMPORTANT_ICONS.map((icon: IconName) => (
            <Icon key={icon} name={icon} size={16} />
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowMetrics(!showMetrics)}
        style={{
          background: 'var(--color-primary-500)',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          marginBottom: '8px',
        }}
      >
        {showMetrics ? 'Hide' : 'Show'} Metrics
      </button>

      {showMetrics && (
        <div>
          <p>
            <strong>Total loaded:</strong> {metrics.length}
          </p>
          <p>
            <strong>Avg load time:</strong> {iconPerformanceMonitor.getAverageLoadTime().toFixed(2)}ms
          </p>
          <p>
            <strong>Cache hit rate:</strong> {(iconPerformanceMonitor.getCacheHitRate() * 100).toFixed(1)}%
          </p>

          {metrics.length > 0 && (
            <details style={{ marginTop: '8px' }}>
              <summary>Recent loads</summary>
              <div style={{ maxHeight: '200px', overflow: 'auto', marginTop: '4px' }}>
                {metrics.slice(-10).map((metric, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '2px 0',
                      borderBottom: '1px solid var(--color-border)',
                      fontSize: '10px',
                    }}
                  >
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
