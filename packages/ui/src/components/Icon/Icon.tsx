// packages/ui/src/components/Icon/Icon.tsx
import React, { useState, useEffect } from 'react'
import { IconName, iconMap } from '../../utils/iconLoader'
import { loadSvgContent, parseSvgContent, svgElementToProps } from '../../utils/svgContentLoader'
import './Icon.scss'

export interface IconProps {
  name: IconName
  size?: number | string
  className?: string
  color?: string // Use for general color control (applies to fill/stroke by default)
  fill?: string // Explicit fill color override
  stroke?: string // Explicit stroke color override
  opacity?: number | string // Explicit opacity control
  'aria-label'?: string
  dangerouslySetInnerHTML?: { __html: string } // Add this prop type
}

interface SvgProps extends Record<string, unknown> {
  dangerouslySetInnerHTML?: { __html: string }
  className?: string
  style?: React.CSSProperties
}

export function Icon({ name, size = 20, className = '', color, fill, stroke, opacity, 'aria-label': ariaLabel }: IconProps) {
  const [svgProps, setSvgProps] = useState<SvgProps | null>(null)
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchSvg = async () => {
      setIsLoading(true)
      setError(null)
      setSvgProps(null)
      setSvgContent(null)

      if (!iconMap[name]) {
        if (isMounted) {
          setError(`Icon "${name}" not found`)
          setIsLoading(false)
        }
        console.warn(`Icon "${name}" not found in map.`)
        return
      }

      try {
        const content = await loadSvgContent(name)
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
          setSvgContent(props.dangerouslySetInnerHTML?.__html || '')
          setIsLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(`Error loading or parsing icon "${name}"`)
          setIsLoading(false)
        }
        console.error(`Error processing icon "${name}":`, err)
      }
    }

    fetchSvg()

    return () => {
      isMounted = false
    }
  }, [name]) // Rerun effect when icon name changes

  // Fallback for missing or failed icons
  if (error || (!isLoading && !svgProps)) {
    console.warn(`Rendering fallback for icon "${name}". Error: ${error}`)
    return (
      <span
        className={`icon icon--missing ${className}`}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'var(--color-text-muted)',
        }}
        aria-label={ariaLabel || name}
        role="img"
      >
        ?
      </span>
    )
  }

  if (isLoading || !svgProps || !svgContent) {
    // Optionally render a loading state or null while loading
    return (
      <span
        className={`icon icon--loading ${className}`}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          display: 'inline-block',
          flexShrink: 0,
        }}
        role="img"
        aria-label={ariaLabel || `${name} loading`}
      >
        {/* You could add a spinner or placeholder here */}
      </span>
    )
  }

  const iconStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    display: 'inline-block',
    flexShrink: 0,
    // Apply general color control
    color: color || 'currentColor',
    // Apply specific fill, stroke, opacity if provided, overriding 'color'
    fill: fill || 'currentColor', // Default fill to currentColor or specified
    stroke: stroke || 'none', // Default stroke to none or specified
    opacity: opacity !== undefined ? opacity : 1, // Default opacity to 1 if not specified
  }

  // Combine original svg props with our desired props (className, style, aria-label)
  const finalSvgProps = {
    ...svgProps,
    className: `icon ${className} ${svgProps.className || ''}`.trim(),
    style: { ...svgProps.style, ...iconStyle },
    'aria-label': ariaLabel || name,
    role: 'img',
    // dangerouslySetInnerHTML is already included in svgProps from svgElementToProps
  }

  // Remove explicit style attributes from original SVG if they conflict with our props
  // This is handled in parseSvgContent, but double-check here if needed.
  // For now, the spread order should handle overrides correctly.

  return React.createElement(
    'svg',
    finalSvgProps
    // The SVG content is injected via dangerouslySetInnerHTML in finalSvgProps
  )
}
