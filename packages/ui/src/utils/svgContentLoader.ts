// packages/ui/src/utils/svgContentLoader.ts
// =============================================================================
// SVG CONTENT LOADER - Loads SVG files as inline content
// =============================================================================

import { IconName, iconMap } from './iconLoader'

// Cache for loaded SVG content to avoid re-parsing
const svgContentCache = new Map<IconName, string>()

// Cache for processed SVG elements to avoid re-processing
const svgElementCache = new Map<IconName, SVGElement>()

/**
 * Load SVG content as a string from the file system
 * This will be used at build time to inline SVG content
 */
export async function loadSvgContent(iconName: IconName): Promise<string> {
  // Check cache first
  if (svgContentCache.has(iconName)) {
    return svgContentCache.get(iconName)!
  }

  try {
    const fileName = iconMap[iconName]
    if (!fileName) {
      throw new Error(`Icon "${iconName}" not found in icon map`)
    }

    // Import the SVG file as text content
    // This uses Vite's ?raw suffix to get the file content as a string
    const svgModule = await import(`../assets/icons/${fileName}?raw`)
    const svgContent = svgModule.default

    if (!svgContent || typeof svgContent !== 'string') {
      throw new Error(`Invalid SVG content for icon "${iconName}"`)
    }

    // Cache the content
    svgContentCache.set(iconName, svgContent)
    return svgContent
  } catch (error) {
    console.warn(`Failed to load SVG content for icon "${iconName}":`, error)
    return '' // Return empty string as fallback
  }
}

/**
 * Parse SVG content and return a cleaned SVG element
 * Removes unnecessary attributes and prepares it for inline use
 */
export function parseSvgContent(svgContent: string, iconName: IconName): SVGElement | null {
  // Check element cache first
  if (svgElementCache.has(iconName)) {
    return svgElementCache.get(iconName)!.cloneNode(true) as SVGElement
  }

  try {
    // Create a temporary container to parse the SVG
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    const svgElement = doc.querySelector('svg')

    if (!svgElement) {
      throw new Error('No SVG element found in content')
    }

    // Clean up the SVG element for inline use
    const cleanedSvg = cleanSvgElement(svgElement)

    // Cache the cleaned element
    svgElementCache.set(iconName, cleanedSvg)

    // Return a clone to avoid modifying the cached version
    return cleanedSvg.cloneNode(true) as SVGElement
  } catch (error) {
    console.warn(`Failed to parse SVG content for icon "${iconName}":`, error)
    return null
  }
}

/**
 * Clean SVG element by removing unnecessary attributes and preparing for inline use
 */
function cleanSvgElement(svgElement: SVGElement): SVGElement {
  // Clone the element to avoid modifying the original
  const cleaned = svgElement.cloneNode(true) as SVGElement

  // Remove attributes that we'll control via props
  const attributesToRemove = [
    'width',
    'height',
    'style', // We'll use CSS classes instead
    'class', // We'll set our own classes
    'id', // Avoid ID conflicts when using multiple instances
  ]

  attributesToRemove.forEach((attr) => {
    cleaned.removeAttribute(attr)
  })

  // Ensure the SVG has proper attributes for inline use
  cleaned.setAttribute('focusable', 'false') // Prevent focus in IE
  cleaned.setAttribute('aria-hidden', 'true') // Hide from screen readers by default

  // Set default viewBox if not present (helps with scaling)
  if (!cleaned.getAttribute('viewBox')) {
    // Try to infer viewBox from width/height if they exist in the original
    const originalWidth = svgElement.getAttribute('width')
    const originalHeight = svgElement.getAttribute('height')

    if (originalWidth && originalHeight) {
      cleaned.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`)
    } else {
      // Default to a common icon size
      cleaned.setAttribute('viewBox', '0 0 24 24')
    }
  }

  return cleaned
}

/**
 * Convert SVG element to React-compatible JSX props
 * This helps with rendering SVG elements in React
 */
export function svgElementToProps(svgElement: SVGElement): Record<string, unknown> {
  const props: Record<string, unknown> = {}

  // Convert attributes to React props
  Array.from(svgElement.attributes).forEach((attr) => {
    // Convert attribute names to React prop names
    let propName = attr.name

    // Handle special cases for React
    if (propName === 'class') {
      propName = 'className'
    } else if (propName.includes('-')) {
      // Convert kebab-case to camelCase for React
      propName = propName.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
    }

    props[propName] = attr.value
  })

  // Get inner content (paths, circles, etc.)
  props.dangerouslySetInnerHTML = {
    __html: svgElement.innerHTML,
  }

  return props
}

/**
 * Get all available icons (useful for development/debugging)
 */
export function getAvailableIcons(): IconName[] {
  return Object.keys(iconMap) as IconName[]
}

/**
 * Preload commonly used icons for better performance
 * Call this during app initialization
 */
export async function preloadIcons(iconNames: IconName[]): Promise<void> {
  const loadPromises = iconNames.map((iconName) => loadSvgContent(iconName))

  try {
    await Promise.all(loadPromises)
    console.log(`Preloaded ${iconNames.length} icons:`, iconNames)
  } catch (error) {
    console.warn('Some icons failed to preload:', error)
  }
}

/**
 * Clear the SVG content cache (useful for development)
 */
export function clearSvgCache(): void {
  svgContentCache.clear()
  svgElementCache.clear()
  console.log('SVG cache cleared')
}
