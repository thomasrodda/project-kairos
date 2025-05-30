// packages/ui/src/utils/iconLoader.ts
// =============================================================================
// ICON LOADER - Enhanced with inline SVG support
// =============================================================================

// Icon name mapping - maps friendly names to actual file names
export const iconMap = {
  // AI and Smart Features
  ai: 'AI Icon.svg',
  'ai-enter': 'AIEnter.svg',
  'ai-send': 'AISend.svg',
  'ai-send-alt': 'AISend-1.svg',

  // Navigation and Actions
  add: 'AddIcon.svg',
  archive: 'ArchiveIcon.svg',
  back: 'BackIcon.svg',
  close: 'CloseIcon.svg',
  check: 'CheckIcon.svg',
  copy: 'CopyIcon.svg',
  more: 'MoreIcon.svg',
  'double-arrow': 'DoubleArrowIcon.svg',
  'large-arrow': 'LargeArrowIcon.svg',
  grab: 'Grab Icon.svg',

  // Content and Layout
  'bullet-list': 'BulletedListIcon.svg',
  'burger-menu': 'BurgerMenuIcon.svg',
  folder: 'FolderIcon.svg',
  page: 'PageIcon.svg',
  'open-page': 'OpenPage.svg',
  image: 'ImageIcon.svg',

  // User and Workspace
  profile: 'ProfileIcon.svg',
  members: 'MembersIcon.svg',
  workspace: 'Workspace Selection.svg',

  // System and Settings
  settings: 'SettingsIcon.svg',
  help: 'HelpIcon.svg',
  search: 'SearchIcon.svg',
  updates: 'UpdatesIcon.svg',
  'color-profile': 'ColourProfileIcon.svg',
  focus: 'Focus.svg',
} as const

// Type for all available icon names
export type IconName = keyof typeof iconMap

/**
 * Get the full path to an icon (for legacy img-based loading)
 * @deprecated Use loadSvgContent() for inline SVG support
 */
export function getIconPath(name: IconName): string {
  const fileName = iconMap[name]
  if (!fileName) {
    console.warn(`Icon "${name}" not found in icon map`)
    return ''
  }
  return `/packages/ui/src/assets/icons/${fileName}`
}

/**
 * Load SVG content as string (legacy method, use svgContentLoader instead)
 * @deprecated Use loadSvgContent() from svgContentLoader.ts
 */
export async function loadSvgContent(name: IconName): Promise<string> {
  console.warn('loadSvgContent from iconLoader is deprecated. Use svgContentLoader.ts instead')

  try {
    const path = getIconPath(name)
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(`Failed to load icon: ${name}`)
    }
    return await response.text()
  } catch (error) {
    console.warn(`Could not load icon "${name}":`, error)
    return ''
  }
}

/**
 * Check if an icon exists in the icon map
 */
export function hasIcon(name: string): name is IconName {
  return name in iconMap
}

/**
 * Get the filename for an icon
 */
export function getIconFilename(name: IconName): string {
  return iconMap[name] || ''
}

/**
 * Get all available icon names
 */
export function getAllIconNames(): IconName[] {
  return Object.keys(iconMap) as IconName[]
}

/**
 * Icon metadata for development and tooling
 */
export interface IconMetadata {
  name: IconName
  filename: string
  category: string
  description?: string
}

/**
 * Get metadata for all icons (useful for documentation/development)
 */
export function getIconMetadata(): IconMetadata[] {
  return Object.entries(iconMap).map(([name, filename]) => {
    // Categorize icons based on their names
    let category = 'Other'

    if (name.startsWith('ai')) {
      category = 'AI and Smart Features'
    } else if (['add', 'archive', 'back', 'close', 'check', 'copy', 'more', 'grab'].some((prefix) => name.includes(prefix))) {
      category = 'Navigation and Actions'
    } else if (['bullet-list', 'burger-menu', 'folder', 'page', 'image'].some((prefix) => name.includes(prefix))) {
      category = 'Content and Layout'
    } else if (['profile', 'members', 'workspace'].some((prefix) => name.includes(prefix))) {
      category = 'User and Workspace'
    } else if (['settings', 'help', 'search', 'updates', 'focus'].some((prefix) => name.includes(prefix))) {
      category = 'System and Settings'
    }

    return {
      name: name as IconName,
      filename,
      category,
    }
  })
}
