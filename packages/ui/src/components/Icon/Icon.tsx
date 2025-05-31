// packages/ui/src/components/Icon/Icon.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { IconName, iconMap } from '../../utils/iconLoader'
import { parseSvgContent, svgElementToProps } from '../../utils/svgContentLoader'
import { loadIconWithMonitoring } from '../../utils/iconPerformance'
import './Icon.scss'

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

interface SvgProps extends Record<string, unknown> {
  dangerouslySetInnerHTML?: { __html: string }
  className?: string
  style?: React.CSSProperties
}

export function Icon({ name, size = 20, className = '', color, fill, stroke, opacity, 'aria-label': ariaLabel }: IconProps) {
  const [svgProps, setSvgProps] = useState<SvgProps | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize style object to prevent unnecessary re-renders
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

  useEffect(() => {
    let isMounted = true

    const fetchSvg = async () => {
      setIsLoading(true)
      setError(null)
      setSvgProps(null)

      if (!iconMap[name]) {
        if (isMounted) {
          setError(`Icon "${name}" not found`)
          setIsLoading(false)
        }
        console.warn(`Icon "${name}" not found in map.`)
        return
      }

      try {
        const content = await loadIconWithMonitoring(name)
        if (!isMounted) return

        if (!content) {
          setError(`Failed to load SVG content for icon "${name}"`)
          setIsLoading(false)
          console.warn(`Failed to load SVG content for icon "${name}". Content is empty.`)
          return
        }

        const svgElement = parseSvgContent(content, name)
        if (!isMounted) return

        if (!svgElement) {
          setError(`Failed to parse SVG content for icon "${name}"`)
          setIsLoading(false)
          console.warn(`Failed to parse SVG content for icon "${name}". Parsing returned null.`)
          return
        }

        const props = svgElementToProps(svgElement) as SvgProps
        if (isMounted) {
          setSvgProps(props)
          setIsLoading(false)
        }
      } catch (_error) {
        // Use underscore prefix to indicate intentionally unused parameter
        if (isMounted) {
          setError(`Error loading icon "${name}"`)
          setIsLoading(false)
        }
        console.error(`Error processing icon "${name}":`, _error)
      }
    }

    fetchSvg()
    return () => {
      isMounted = false
    }
  }, [name])

  // Fallback for missing or failed icons
  if (error || (!isLoading && !svgProps)) {
    return (
      <span className={`icon icon--missing ${className}`} style={iconStyle} aria-label={ariaLabel || name} role="img">
        ?
      </span>
    )
  }

  // Loading state
  if (isLoading || !svgProps) {
    return <span className={`icon icon--loading ${className}`} style={iconStyle} role="img" aria-label={ariaLabel || `${name} loading`} />
  }

  // At this point, svgProps is guaranteed to be non-null due to the checks above
  const finalSvgProps = {
    ...svgProps,
    className: `icon ${className} ${svgProps.className || ''}`.trim(),
    style: { ...svgProps.style, ...iconStyle },
    'aria-label': ariaLabel || name,
    role: 'img',
  }

  return React.createElement('svg', finalSvgProps)
}
