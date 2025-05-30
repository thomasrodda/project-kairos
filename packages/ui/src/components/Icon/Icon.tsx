// packages/ui/src/components/Icon/Icon.tsx
import React from 'react'
import { IconName, iconMap } from '../../utils/iconLoader'

export interface IconProps {
  name: IconName
  size?: number | string
  className?: string
  color?: string
  'aria-label'?: string
}

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
          display: 'inline-block',
          flexShrink: 0,
        }}
        aria-label={ariaLabel || name}
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
    ...(color && { color }),
  }

  // For now, we'll use an img tag to load the SVG
  // This approach works immediately without build configuration
  const iconSrc = `/packages/ui/src/assets/icons/${fileName}`

  return <img src={iconSrc} alt={ariaLabel || name} className={`icon ${className}`} style={iconStyle} role="img" />
}
