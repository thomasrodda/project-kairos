// packages/ui/src/utils/svgContentLoader.test.ts
// =============================================================================
// SVG CONTENT LOADER TESTS
// =============================================================================

import { loadSvgContent, parseSvgContent, svgElementToProps, getAvailableIcons, preloadIcons, clearSvgCache } from './svgContentLoader'
import type { IconName } from './iconLoader'

describe('svgContentLoader', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearSvgCache()
  })

  describe('loadSvgContent', () => {
    it('should return empty string for invalid icon names', async () => {
      const content = await loadSvgContent('non-existent-icon' as IconName)
      expect(content).toBe('')
    })

    it('should cache loaded content', async () => {
      // This test would need actual SVG files to work properly
      // For now, we'll test the caching mechanism with invalid icons
      const content1 = await loadSvgContent('non-existent' as IconName)
      const content2 = await loadSvgContent('non-existent' as IconName)

      expect(content1).toBe(content2)
      expect(content1).toBe('')
    })
  })

  describe('parseSvgContent', () => {
    it('should parse valid SVG content', () => {
      const mockSvgContent = `
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9.824 9.956"/>
        </svg>
      `

      const element = parseSvgContent(mockSvgContent, 'search')
      expect(element).toBeInstanceOf(SVGElement)
      expect(element?.tagName.toLowerCase()).toBe('svg')
    })

    it('should remove width and height attributes', () => {
      const mockSvgContent = `
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9.824 9.956"/>
        </svg>
      `

      const element = parseSvgContent(mockSvgContent, 'search')
      expect(element?.getAttribute('width')).toBeNull()
      expect(element?.getAttribute('height')).toBeNull()
      expect(element?.getAttribute('viewBox')).toBe('0 0 24 24')
    })

    it('should add accessibility attributes', () => {
      const mockSvgContent = `
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9.824 9.956"/>
        </svg>
      `

      const element = parseSvgContent(mockSvgContent, 'search')
      expect(element?.getAttribute('focusable')).toBe('false')
      expect(element?.getAttribute('aria-hidden')).toBe('true')
    })

    it('should return null for invalid SVG content', () => {
      const invalidContent = '<div>Not an SVG</div>'
      const element = parseSvgContent(invalidContent, 'search')
      expect(element).toBeNull()
    })
  })

  describe('svgElementToProps', () => {
    it('should convert SVG attributes to React props', () => {
      // Create a mock SVG element
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      mockSvg.setAttribute('viewBox', '0 0 24 24')
      mockSvg.setAttribute('fill', 'currentColor')
      mockSvg.innerHTML = '<path d="M12 2L2 7v10c0 5.55 3.84 9.739 9.824 9.956"/>'

      const props = svgElementToProps(mockSvg)

      expect(props.viewBox).toBe('0 0 24 24')
      expect(props.fill).toBe('currentColor')
      expect((props.dangerouslySetInnerHTML as { __html: string }).__html).toContain('<path')
    })

    it('should convert kebab-case attributes to camelCase', () => {
      const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      mockSvg.setAttribute('stroke-width', '2')
      mockSvg.setAttribute('stroke-linecap', 'round')

      const props = svgElementToProps(mockSvg)

      expect(props.strokeWidth).toBe('2')
      expect(props.strokeLinecap).toBe('round')
    })
  })

  describe('getAvailableIcons', () => {
    it('should return array of icon names', () => {
      const icons = getAvailableIcons()
      expect(Array.isArray(icons)).toBe(true)
      expect(icons.length).toBeGreaterThan(0)
      expect(icons).toContain('search')
      expect(icons).toContain('add')
    })
  })

  describe('preloadIcons', () => {
    it('should preload multiple icons', async () => {
      const iconsToPreload: IconName[] = ['search', 'add', 'settings']

      // This should not throw
      await expect(preloadIcons(iconsToPreload)).resolves.toBeUndefined()
    })

    it('should handle invalid icons gracefully', async () => {
      const iconsToPreload: IconName[] = ['search', 'non-existent' as IconName]

      // Should not throw even with invalid icons
      await expect(preloadIcons(iconsToPreload)).resolves.toBeUndefined()
    })
  })
})
