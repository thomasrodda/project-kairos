// packages/ui/src/components/Icon/Icon.tsx
// A React component that renders SVG icons inline with full performance optimization and accessibility support.
// It loads SVG content dynamically, handles loading/error states gracefully, and provides TypeScript autocompletion for all available icon names.

import React, { useState, useEffect, useMemo } from 'react'
import { IconName, iconMap } from '../../utils/iconLoader'
import { parseSvgContent, svgElementToProps } from '../../utils/svgContentLoader'
import { loadIconWithMonitoring } from '../../utils/iconPerformance'
import './Icon.scss'

// Props interface with TypeScript autocompletion for icon names
export interface IconProps {
  name: IconName
  size?: number | string
  className?: string
  color?: string
  fill?: string
  stroke?: string
  opacity?: number | string
  'aria-label'?: string
}

// Internal type for processed SVG props
interface SvgProps extends Record<string, unknown> {
  dangerouslySetInnerHTML?: { __html: string }
  className?: string
  style?: React.CSSProperties
}

export function Icon({ name, size = 20, className = '', color, fill, stroke, opacity, 'aria-label': ariaLabel }: IconProps) {
  // State management for async SVG loading
  const [svgProps, setSvgProps] = useState<SvgProps | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized styles to prevent unnecessary re-renders
  const iconStyle = useMemo(
    (): React.CSSProperties => ({
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      display: 'inline-block',
      flexShrink: 0,
      color: color || 'currentColor',
      fill: fill || 'currentColor',
      stroke: stroke || 'none',
      opacity: opacity !== undefined ? opacity : 1,
    }),
    [size, color, fill, stroke, opacity]
  )

  // Main effect for loading and processing SVG content
  useEffect(() => {
    let isMounted = true

    const fetchSvg = async () => {
      setIsLoading(true)
      setError(null)
      setSvgProps(null)

      // Check if icon exists in our icon map
      if (!iconMap[name]) {
        if (isMounted) {
          setError(`Icon "${name}" not found`)
          setIsLoading(false)
        }
        console.warn(`Icon "${name}" not found in map.`)
        return
      }

      try {
        // Load SVG content with performance monitoring
        const content = await loadIconWithMonitoring(name)
        if (!isMounted) return

        if (!content) {
          setError(`Failed to load SVG content for icon "${name}"`)
          setIsLoading(false)
          console.warn(`Failed to load SVG content for icon "${name}". Content is empty.`)
          return
        }

        // Parse SVG string into DOM element
        const svgElement = parseSvgContent(content, name)
        if (!isMounted) return

        if (!svgElement) {
          setError(`Failed to parse SVG content for icon "${name}"`)
          setIsLoading(false)
          console.warn(`Failed to parse SVG content for icon "${name}". Parsing returned null.`)
          return
        }

        // Convert SVG element to React props
        const props = svgElementToProps(svgElement) as SvgProps
        if (isMounted) {
          setSvgProps(props)
          setIsLoading(false)
        }
      } catch (_error) {
        // Handle any errors during loading/processing
        if (isMounted) {
          setError(`Error loading icon "${name}"`)
          setIsLoading(false)
        }
        console.error(`Error processing icon "${name}":`, _error)
      }
    }

    fetchSvg()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [name])

  // Error/missing icon fallback
  if (error || (!isLoading && !svgProps)) {
    return (
      <span className={`icon icon--missing ${className}`} style={iconStyle} aria-label={ariaLabel || name} role="img">
        ?
      </span>
    )
  }

  // Loading state placeholder
  if (isLoading || !svgProps) {
    return <span className={`icon icon--loading ${className}`} style={iconStyle} role="img" aria-label={ariaLabel || `${name} loading`} />
  }

  // Successful render: merge SVG props with our styles and accessibility attributes
  const finalSvgProps = {
    ...svgProps,
    className: `icon ${className} ${svgProps.className || ''}`.trim(),
    style: { ...svgProps.style, ...iconStyle },
    'aria-label': ariaLabel || name,
    role: 'img',
  }

  return React.createElement('svg', finalSvgProps)
}
