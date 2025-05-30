// packages/ui/src/components/Icon/Icon.tsx
import React from 'react'
import { IconName, iconMap } from '../../utils/iconLoader'
import './Icon.scss'

export interface IconProps {
  name: IconName
  size?: number | string
  className?: string
  color?: string
  'aria-label'?: string
}

// For now, we'll use a simple img approach that works reliably
// In the future, we can optimize this to inline SVGs for better styling
export function Icon({ name, size = 20, className = '', color, 'aria-label': ariaLabel }: IconProps) {
  const fileName = iconMap[name]

  if (!fileName) {
    console.warn(`Icon "${name}" not found`)
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

  const iconStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    display: 'inline-block',
    flexShrink: 0,
  }

  // We need to copy the SVG files to the public directory for this to work
  // For now, let's use a relative import path
  const iconSrc = new URL(`../../assets/icons/${fileName}`, import.meta.url).href

  return <img src={iconSrc} alt={ariaLabel || name} className={`icon ${className}`} style={iconStyle} role="img" loading="lazy" />
}
