// packages/ui/src/utils/svgContentLoader.test.ts
// =============================================================================
// SVG CONTENT LOADER TESTS - Security and Functionality Testing
// =============================================================================

import { loadSvgContent, parseSvgContent, svgElementToProps, getAvailableIcons, preloadIcons, clearSvgCache } from './svgContentLoader'
import type { IconName } from './iconLoader'

describe('svgContentLoader', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearSvgCache()
  })

  describe('✅ Core Functionality', () => {
    it('should load valid icon content', async () => {
      const content = await loadSvgContent('search')
      expect(content).toBeTruthy()
      expect(content).toContain('<svg')
      expect(content).toContain('</svg>')
    })

    it('should return placeholder SVG for invalid icon names', async () => {
      const content = await loadSvgContent('non-existent-icon' as IconName)
      expect(content).toBeTruthy()
      expect(content).toContain('<svg')
      expect(content).toContain('viewBox="0 0 24 24"')
      expect(content).toContain('<rect') // Placeholder has a rect
      expect(content).toContain('<text') // Placeholder has text
    })

    it('should cache loaded content efficiently', async () => {
      const icon: IconName = 'search'

      // Load the same icon multiple times
      const start = performance.now()
      const content1 = await loadSvgContent(icon)
      const firstLoadTime = performance.now() - start

      const start2 = performance.now()
      const content2 = await loadSvgContent(icon)
      const secondLoadTime = performance.now() - start2

      // Second load should be from cache (much faster)
      expect(content1).toBe(content2)
      expect(secondLoadTime).toBeLessThan(firstLoadTime)
    })

    it('should handle concurrent loading of same icon', async () => {
      const icon: IconName = 'settings'

      // Load the same icon concurrently
      const promises = Array(10)
        .fill(null)
        .map(() => loadSvgContent(icon))
      const results = await Promise.all(promises)

      // All results should be identical
      const firstResult = results[0]
      results.forEach((result) => {
        expect(result).toBe(firstResult)
      })
    })
  })

  describe('✅ Security - XSS Prevention', () => {
    it('should remove script tags from SVG content', () => {
      const maliciousSvg = `
        <svg viewBox="0 0 24 24">
          <script>alert('XSS')</script>
          <path d="M12 2L2 7v10"/>
        </svg>
      `

      const element = parseSvgContent(maliciousSvg, 'test' as IconName)
      expect(element?.innerHTML).not.toContain('<script')
      expect(element?.innerHTML).not.toContain('alert')
      expect(element?.innerHTML).toContain('<path') // Keep valid content
    })

    it('should remove event handler attributes', () => {
      const maliciousSvg = `
        <svg viewBox="0 0 24 24" onload="alert('XSS')">
          <path d="M12 2L2 7v10" onclick="alert('click')" onmouseover="alert('hover')"/>
          <rect x="0" y="0" width="10" height="10" onError="alert('error')"/>
        </svg>
      `

      const element = parseSvgContent(maliciousSvg, 'test' as IconName)
      expect(element?.getAttribute('onload')).toBeNull()

      const path = element?.querySelector('path')
      expect(path?.getAttribute('onclick')).toBeNull()
      expect(path?.getAttribute('onmouseover')).toBeNull()

      const rect = element?.querySelector('rect')
      expect(rect?.getAttribute('onerror')).toBeNull()
    })

    it('should remove javascript: URLs from attributes', () => {
      const maliciousSvg = `
        <svg viewBox="0 0 24 24">
          <a href="javascript:alert('XSS')">
            <text x="10" y="10">Click me</text>
          </a>
          <use href="javascript:void(0)" />
        </svg>
      `

      const element = parseSvgContent(maliciousSvg, 'test' as IconName)
      const link = element?.querySelector('a')
      expect(link?.getAttribute('href')).toBeNull()

      const use = element?.querySelector('use')
      expect(use?.getAttribute('href')).toBeNull()
    })

    it('should remove dangerous elements like iframe and embed', () => {
      const maliciousSvg = `
        <svg viewBox="0 0 24 24">
          <iframe src="https://evil.com"></iframe>
          <embed src="https://evil.com/malware.swf" />
          <object data="https://evil.com/malware.pdf"></object>
          <foreignObject><div onclick="alert('XSS')">Click</div></foreignObject>
          <path d="M12 2L2 7v10"/>
        </svg>
      `

      const element = parseSvgContent(maliciousSvg, 'test' as IconName)
      expect(element?.querySelector('iframe')).toBeNull()
      expect(element?.querySelector('embed')).toBeNull()
      expect(element?.querySelector('object')).toBeNull()
      expect(element?.querySelector('foreignObject')).toBeNull()
      expect(element?.querySelector('path')).toBeTruthy() // Keep valid content
    })

    it('should remove external references in use elements', () => {
      const maliciousSvg = `
        <svg viewBox="0 0 24 24">
          <use href="https://evil.com/icon.svg#icon" />
          <use href="//evil.com/icon.svg#icon" />
          <use href="../../../etc/passwd" />
          <use href="#localReference" />
        </svg>
      `

      const element = parseSvgContent(maliciousSvg, 'test' as IconName)
      const uses = element?.querySelectorAll('use')

      // External references should be removed
      expect(uses?.length).toBe(1) // Only local reference remains
      expect(uses?.[0].getAttribute('href')).toBe('#localReference')
    })

    it('should remove style and link elements to prevent CSS injection', () => {
      const maliciousSvg = `
        <svg viewBox="0 0 24 24">
          <style>
            * { display: none !important; }
            body { background: url(https://evil.com/track); }
          </style>
          <link rel="stylesheet" href="https://evil.com/evil.css" />
          <path d="M12 2L2 7v10"/>
        </svg>
      `

      const element = parseSvgContent(maliciousSvg, 'test' as IconName)
      expect(element?.querySelector('style')).toBeNull()
      expect(element?.querySelector('link')).toBeNull()
      expect(element?.querySelector('path')).toBeTruthy()
    })

    it('should sanitize text content that contains script tags', () => {
      const maliciousSvg = `
        <svg viewBox="0 0 24 24">
          <text x="10" y="10"><script>alert('XSS')</script>Hello</text>
        </svg>
      `

      const element = parseSvgContent(maliciousSvg, 'test' as IconName)
      const text = element?.querySelector('text')
      expect(text?.textContent).not.toContain('<script')
      expect(text?.textContent).not.toContain('alert')
    })
  })

  describe('✅ SVG Processing', () => {
    it('should parse valid SVG content correctly', () => {
      const validSvg = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9.824 9.956" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="currentColor"/>
        </svg>
      `

      const element = parseSvgContent(validSvg, 'test' as IconName)
      expect(element).toBeInstanceOf(SVGElement)
      expect(element?.tagName.toLowerCase()).toBe('svg')
      expect(element?.querySelector('path')).toBeTruthy()
      expect(element?.querySelector('circle')).toBeTruthy()
    })

    it('should remove width and height attributes for CSS control', () => {
      const svgWithDimensions = `
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10"/>
        </svg>
      `

      const element = parseSvgContent(svgWithDimensions, 'test' as IconName)
      expect(element?.getAttribute('width')).toBeNull()
      expect(element?.getAttribute('height')).toBeNull()
      expect(element?.getAttribute('viewBox')).toBe('0 0 24 24')
    })

    it('should add accessibility attributes', () => {
      const simpleSvg = `
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7v10"/>
        </svg>
      `

      const element = parseSvgContent(simpleSvg, 'test' as IconName)
      expect(element?.getAttribute('focusable')).toBe('false')
      expect(element?.getAttribute('aria-hidden')).toBe('true')
    })

    it('should add default viewBox if missing', () => {
      const svgWithoutViewBox = `
        <svg>
          <path d="M12 2L2 7v10"/>
        </svg>
      `

      const element = parseSvgContent(svgWithoutViewBox, 'test' as IconName)
      expect(element?.getAttribute('viewBox')).toBe('0 0 24 24')
    })

    it('should return null for invalid SVG content', () => {
      const invalidContents = ['<div>Not an SVG</div>', '<svg><parsererror>Error</parsererror></svg>', 'plain text', '', null, undefined]

      invalidContents.forEach((content) => {
        const element = parseSvgContent(content as any, 'test' as IconName)
        expect(element).toBeNull()
      })
    })

    it('should handle malformed SVG gracefully', () => {
      const malformedSvg = `
        <svg viewBox="0 0 24 24"
          <path d="M12 2L2 7v10" />
        </svg>
      `

      // Should not throw, just return null
      expect(() => {
        const element = parseSvgContent(malformedSvg, 'test' as IconName)
        expect(element).toBeNull()
      }).not.toThrow()
    })
  })

  describe('✅ Cache Management', () => {
    it('should cache parsed SVG elements', () => {
      const svgContent = `
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7v10"/>
        </svg>
      `

      // Parse the same content multiple times
      const element1 = parseSvgContent(svgContent, 'cached-icon' as IconName)
      const element2 = parseSvgContent(svgContent, 'cached-icon' as IconName)

      // Should return cloned elements (not the same reference)
      expect(element1).not.toBe(element2)

      // But content should be identical
      expect(element1?.outerHTML).toBe(element2?.outerHTML)
    })

    it('should clear cache when requested', () => {
      const svgContent = `
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7v10"/>
        </svg>
      `

      // Parse and cache
      parseSvgContent(svgContent, 'test-cache' as IconName)

      // Clear cache
      clearSvgCache()

      // Parse again - should process from scratch
      const spy = jest.spyOn(console, 'log')
      clearSvgCache()
      expect(spy).toHaveBeenCalledWith('SVG element cache cleared')
      spy.mockRestore()
    })
  })

  describe('✅ React Props Conversion', () => {
    it('should convert SVG attributes to React props', () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svgElement.setAttribute('viewBox', '0 0 24 24')
      svgElement.setAttribute('fill', 'currentColor')
      svgElement.setAttribute('class', 'icon-class')
      svgElement.innerHTML = '<path d="M12 2L2 7v10"/>'

      const props = svgElementToProps(svgElement)

      expect(props.viewBox).toBe('0 0 24 24')
      expect(props.fill).toBe('currentColor')
      expect(props.className).toBe('icon-class') // class -> className
      expect((props.dangerouslySetInnerHTML as any).__html).toContain('<path')
    })

    it('should convert kebab-case attributes to camelCase', () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svgElement.setAttribute('stroke-width', '2')
      svgElement.setAttribute('stroke-linecap', 'round')
      svgElement.setAttribute('stroke-linejoin', 'round')
      svgElement.setAttribute('fill-opacity', '0.5')

      const props = svgElementToProps(svgElement)

      expect(props.strokeWidth).toBe('2')
      expect(props.strokeLinecap).toBe('round')
      expect(props.strokeLinejoin).toBe('round')
      expect(props.fillOpacity).toBe('0.5')
    })
  })

  describe('✅ Icon Management', () => {
    it('should return array of available icon names', () => {
      const icons = getAvailableIcons()

      expect(Array.isArray(icons)).toBe(true)
      expect(icons.length).toBeGreaterThan(0)

      // Check for common icons
      expect(icons).toContain('search')
      expect(icons).toContain('add')
      expect(icons).toContain('settings')
      expect(icons).toContain('close')

      // All items should be strings
      icons.forEach((icon) => {
        expect(typeof icon).toBe('string')
      })
    })

    it('should handle preloading icons without errors', async () => {
      const iconsToPreload: IconName[] = ['search', 'add', 'settings', 'close']

      // Should not throw
      await expect(preloadIcons(iconsToPreload)).resolves.toBeUndefined()
    })

    it('should handle preloading with invalid icons gracefully', async () => {
      const iconsToPreload = ['search', 'non-existent' as IconName, 'add']

      // Should not throw even with invalid icons
      await expect(preloadIcons(iconsToPreload as IconName[])).resolves.toBeUndefined()
    })
  })

  describe('✅ Error Handling', () => {
    it('should handle parsing errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      // Various error cases
      const errorCases = [
        { content: null, name: 'null content' },
        { content: undefined, name: 'undefined content' },
        { content: '', name: 'empty content' },
        { content: 'not xml', name: 'plain text' },
        { content: '<>', name: 'invalid xml' },
      ]

      errorCases.forEach(({ content, name }) => {
        const result = parseSvgContent(content as any, 'test' as IconName)
        expect(result).toBeNull()
      })

      // Should log warnings
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should create valid placeholder for missing icons', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const placeholder = await loadSvgContent('missing-icon' as IconName)

      // Should warn about missing icon
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SVG content not found for icon "missing-icon"'))

      // Should return valid placeholder
      expect(placeholder).toContain('<svg')
      expect(placeholder).toContain('viewBox="0 0 24 24"')
      expect(placeholder).toContain('<rect')
      expect(placeholder).toContain('<text')

      // Parse placeholder to ensure it's valid
      const element = parseSvgContent(placeholder, 'missing-icon' as IconName)
      expect(element).toBeTruthy()
      expect(element?.tagName.toLowerCase()).toBe('svg')

      consoleSpy.mockRestore()
    })
  })

  describe('✅ Performance', () => {
    it('should handle large SVG content efficiently', () => {
      // Create a large SVG with many paths
      const largeSvg = `
        <svg viewBox="0 0 1000 1000">
          ${Array(1000)
            .fill(null)
            .map((_, i) => `<path d="M${i} ${i}L${i + 10} ${i + 10}" stroke="currentColor"/>`)
            .join('\n')}
        </svg>
      `

      const start = performance.now()
      const element = parseSvgContent(largeSvg, 'large-icon' as IconName)
      const parseTime = performance.now() - start

      expect(element).toBeTruthy()
      expect(element?.querySelectorAll('path').length).toBe(1000)
      expect(parseTime).toBeLessThan(100) // Should parse in under 100ms
    })

    it('should benefit from caching on repeated access', () => {
      const svgContent = `
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7v10"/>
        </svg>
      `

      // First parse
      const start1 = performance.now()
      parseSvgContent(svgContent, 'perf-test' as IconName)
      const firstTime = performance.now() - start1

      // Second parse (should use cache)
      const start2 = performance.now()
      parseSvgContent(svgContent, 'perf-test' as IconName)
      const secondTime = performance.now() - start2

      // Cached access should be faster
      expect(secondTime).toBeLessThan(firstTime)
    })
  })
})
