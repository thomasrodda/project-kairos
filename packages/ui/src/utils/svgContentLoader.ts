// packages/ui/src/utils/svgContentLoader.ts
// =============================================================================
// SVG CONTENT LOADER - Static imports for Vite compatibility
// =============================================================================

import { IconName } from './iconLoader'

// Import all SVG files statically - Vite can analyze these
import aiIcon from '../assets/icons/AI Icon.svg?raw'
import aiEnter from '../assets/icons/AIEnter.svg?raw'
import aiSend from '../assets/icons/AISend.svg?raw'
import aiSendAlt from '../assets/icons/AISend-1.svg?raw'
import addIcon from '../assets/icons/AddIcon.svg?raw'
import archiveIcon from '../assets/icons/ArchiveIcon.svg?raw'
import backIcon from '../assets/icons/BackIcon.svg?raw'
import closeIcon from '../assets/icons/CloseIcon.svg?raw'
import checkIcon from '../assets/icons/CheckIcon.svg?raw'
import copyIcon from '../assets/icons/CopyIcon.svg?raw'
import moreIcon from '../assets/icons/MoreIcon.svg?raw'
import doubleArrowIcon from '../assets/icons/DoubleArrowIcon.svg?raw'
import largeArrowIcon from '../assets/icons/LargeArrowIcon.svg?raw'
import grabIcon from '../assets/icons/Grab Icon.svg?raw'
import bulletListIcon from '../assets/icons/BulletedListIcon.svg?raw'
import burgerMenuIcon from '../assets/icons/BurgerMenuIcon.svg?raw'
import folderIcon from '../assets/icons/FolderIcon.svg?raw'
import pageIcon from '../assets/icons/PageIcon.svg?raw'
import openPageIcon from '../assets/icons/OpenPage.svg?raw'
import imageIcon from '../assets/icons/ImageIcon.svg?raw'
import profileIcon from '../assets/icons/ProfileIcon.svg?raw'
import membersIcon from '../assets/icons/MembersIcon.svg?raw'
import workspaceIcon from '../assets/icons/Workspace Selection.svg?raw'
import settingsIcon from '../assets/icons/SettingsIcon.svg?raw'
import helpIcon from '../assets/icons/HelpIcon.svg?raw'
import searchIcon from '../assets/icons/SearchIcon.svg?raw'
import updatesIcon from '../assets/icons/UpdatesIcon.svg?raw'
import colorProfileIcon from '../assets/icons/ColourProfileIcon.svg?raw'
import focusIcon from '../assets/icons/Focus.svg?raw'

// Map icon names to their imported content
const svgContentMap: Record<IconName, string> = {
  ai: aiIcon,
  'ai-enter': aiEnter,
  'ai-send': aiSend,
  'ai-send-alt': aiSendAlt,
  add: addIcon,
  archive: archiveIcon,
  back: backIcon,
  close: closeIcon,
  check: checkIcon,
  copy: copyIcon,
  more: moreIcon,
  'double-arrow': doubleArrowIcon,
  'large-arrow': largeArrowIcon,
  grab: grabIcon,
  'bullet-list': bulletListIcon,
  'burger-menu': burgerMenuIcon,
  folder: folderIcon,
  page: pageIcon,
  'open-page': openPageIcon,
  image: imageIcon,
  profile: profileIcon,
  members: membersIcon,
  workspace: workspaceIcon,
  settings: settingsIcon,
  help: helpIcon,
  search: searchIcon,
  updates: updatesIcon,
  'color-profile': colorProfileIcon,
  focus: focusIcon,
}

// Cache for processed SVG elements
const svgElementCache = new Map<IconName, SVGElement>()

/**
 * Load SVG content - now using static imports
 */
export async function loadSvgContent(iconName: IconName): Promise<string> {
  const content = svgContentMap[iconName]

  if (content) {
    return content
  }

  console.warn(`SVG content not found for icon "${iconName}"`)
  return createPlaceholderSvg(iconName)
}

/**
 * Create a simple placeholder SVG
 */
function createPlaceholderSvg(iconName: IconName): string {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
    <text x="12" y="16" text-anchor="middle" font-family="monospace" font-size="8" fill="currentColor">${iconName.charAt(0).toUpperCase()}</text>
  </svg>`
}

/**
 * Parse SVG content and return a cleaned SVG element
 */
export function parseSvgContent(svgContent: string, iconName: IconName): SVGElement | null {
  // Check element cache first
  if (svgElementCache.has(iconName)) {
    return svgElementCache.get(iconName)!.cloneNode(true) as SVGElement
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')

    // Check for parsing errors
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      throw new Error(`SVG parsing error: ${parseError.textContent}`)
    }

    const svgElement = doc.querySelector('svg')
    if (!svgElement) {
      throw new Error('No SVG element found in content')
    }

    // Clean up the SVG element
    const cleanedSvg = cleanSvgElement(svgElement)
    svgElementCache.set(iconName, cleanedSvg)

    return cleanedSvg.cloneNode(true) as SVGElement
  } catch (error) {
    console.warn(`Failed to parse SVG content for icon "${iconName}":`, error)
    return null
  }
}

/**
 * Clean SVG element for inline use
 */
function cleanSvgElement(svgElement: SVGElement): SVGElement {
  const cleaned = svgElement.cloneNode(true) as SVGElement

  // Remove size attributes (we'll control these via CSS)
  cleaned.removeAttribute('width')
  cleaned.removeAttribute('height')

  // Ensure proper accessibility
  cleaned.setAttribute('focusable', 'false')
  cleaned.setAttribute('aria-hidden', 'true')

  // Ensure viewBox exists
  if (!cleaned.getAttribute('viewBox')) {
    cleaned.setAttribute('viewBox', '0 0 24 24')
  }

  return cleaned
}

/**
 * Convert SVG element to React props
 */
export function svgElementToProps(svgElement: SVGElement): Record<string, unknown> {
  const props: Record<string, unknown> = {}

  // Convert attributes to React props
  Array.from(svgElement.attributes).forEach((attr) => {
    let propName = attr.name

    if (propName === 'class') {
      propName = 'className'
    } else if (propName.includes('-')) {
      propName = propName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    }

    props[propName] = attr.value
  })

  // Add inner content
  props.dangerouslySetInnerHTML = {
    __html: svgElement.innerHTML,
  }

  return props
}

/**
 * Get all available icons
 */
export function getAvailableIcons(): IconName[] {
  return Object.keys(svgContentMap) as IconName[]
}

/**
 * Preload icons (now instant since they're already imported)
 */
export async function preloadIcons(iconNames: IconName[]): Promise<void> {
  // All icons are already loaded at build time, so this is essentially a no-op
  console.log(`Icons are pre-loaded at build time: ${iconNames.length} icons ready`)
}

/**
 * Clear cache
 */
export function clearSvgCache(): void {
  svgElementCache.clear()
  console.log('SVG element cache cleared')
}
