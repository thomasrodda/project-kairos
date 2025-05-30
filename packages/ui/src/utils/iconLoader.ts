// packages/ui/src/utils/iconLoader.ts

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

// Function to get the full path to an icon
export function getIconPath(name: IconName): string {
  const fileName = iconMap[name]
  if (!fileName) {
    console.warn(`Icon "${name}" not found in icon map`)
    return ''
  }
  return `/packages/ui/src/assets/icons/${fileName}`
}

// Function to load SVG content (for future use if needed)
export async function loadSvgContent(name: IconName): Promise<string> {
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
