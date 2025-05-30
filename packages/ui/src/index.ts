// packages/ui/src/index.ts
// Export Icon component
export { Icon } from './components/Icon'
export type { IconProps } from './components/Icon'

// Export icon types and utilities for TypeScript autocompletion
export type { IconName } from './utils/iconLoader'
export { getAllIconNames, hasIcon, getIconFilename, getIconMetadata } from './utils/iconLoader'

// Export SVG content loading utilities
export { loadSvgContent, parseSvgContent, svgElementToProps, getAvailableIcons, preloadIcons, clearSvgCache } from './utils/svgContentLoader'

// Export development utilities (only in development)
export { testSingleIcon, testAllIcons, performanceTest, quickTest } from './utils/svgTestUtils'

// Future UI components will be exported here
export {}
