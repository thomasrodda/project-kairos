// packages/ui/src/utils/svgTestUtils.ts
// =============================================================================
// SVG TEST UTILITIES - Development helpers for testing the SVG system
// =============================================================================

import { IconName, getAllIconNames } from './iconLoader'
import { loadSvgContent, parseSvgContent, preloadIcons } from './svgContentLoader'

/**
 * Test loading a single icon and log results
 */
export async function testSingleIcon(iconName: IconName): Promise<void> {
  console.log(`🔍 Testing icon: ${iconName}`)

  try {
    // Test content loading
    const content = await loadSvgContent(iconName)
    console.log(`✅ Content loaded (${content.length} chars):`, content.substring(0, 100) + '...')

    // Test parsing
    const element = parseSvgContent(content, iconName)
    if (element) {
      console.log(`✅ Parsed successfully:`, {
        tagName: element.tagName,
        viewBox: element.getAttribute('viewBox'),
        childElementCount: element.childElementCount,
      })
    } else {
      console.log(`❌ Failed to parse`)
    }
  } catch (error) {
    console.log(`❌ Error:`, error)
  }
}

/**
 * Test loading all available icons
 */
export async function testAllIcons(): Promise<void> {
  console.log('🧪 Testing all available icons...')

  const allIcons = getAllIconNames()
  const results = {
    total: allIcons.length,
    successful: 0,
    failed: 0,
    errors: [] as { icon: IconName; error: string }[],
  }

  for (const iconName of allIcons) {
    try {
      const content = await loadSvgContent(iconName)
      if (content && content.length > 0) {
        const element = parseSvgContent(content, iconName)
        if (element) {
          results.successful++
        } else {
          results.failed++
          results.errors.push({ icon: iconName, error: 'Failed to parse' })
        }
      } else {
        results.failed++
        results.errors.push({ icon: iconName, error: 'Empty content' })
      }
    } catch (error) {
      results.failed++
      results.errors.push({
        icon: iconName,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  console.log('📊 Test Results:', results)

  if (results.errors.length > 0) {
    console.log('❌ Failed icons:', results.errors)
  }
}

/**
 * Performance test for icon loading
 */
export async function performanceTest(iconNames: IconName[], iterations: number = 3): Promise<void> {
  console.log(`⚡ Performance testing ${iconNames.length} icons x ${iterations} iterations...`)

  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now()

    await Promise.all(iconNames.map((iconName) => loadSvgContent(iconName)))

    const endTime = performance.now()
    const duration = endTime - startTime
    times.push(duration)

    console.log(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms`)
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)

  console.log(`📈 Performance Results:`)
  console.log(`  Average: ${avgTime.toFixed(2)}ms`)
  console.log(`  Min: ${minTime.toFixed(2)}ms`)
  console.log(`  Max: ${maxTime.toFixed(2)}ms`)
  console.log(`  Per icon average: ${(avgTime / iconNames.length).toFixed(2)}ms`)
}

/**
 * Create a visual test page (returns HTML string)
 */
export function createIconTestPage(iconNames: IconName[]): string {
  const iconGrid = iconNames
    .map(
      (iconName) => `
    <div style="display: flex; flex-direction: column; align-items: center; padding: 16px; border: 1px solid #ccc; border-radius: 8px;">
      <div id="${iconName}-container" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 4px; margin-bottom: 8px;">
        <!-- SVG will be inserted here -->
      </div>
      <span style="font-size: 12px; text-align: center; font-family: monospace;">${iconName}</span>
    </div>
  `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SVG Icon Test Page</title>
        <style>
          body { font-family: system-ui; padding: 20px; background: #fafafa; }
          .icon-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
            gap: 16px; 
            margin-top: 20px; 
          }
          .loading { color: #666; font-style: italic; }
          .error { color: #e74c3c; }
          .success { color: #27ae60; }
        </style>
      </head>
      <body>
        <h1>SVG Icon Test Page</h1>
        <p>Testing ${iconNames.length} icons with inline SVG loading...</p>
        <div id="status" class="loading">Loading icons...</div>
        <div class="icon-grid">${iconGrid}</div>
        
        <script>
          // This would need to be implemented with actual icon loading
          // For now, it's just a template
          console.log('Icon test page loaded');
        </script>
      </body>
    </html>
  `
}

/**
 * Quick development helper - test common icons
 */
export async function quickTest(): Promise<void> {
  const commonIcons: IconName[] = ['search', 'add', 'settings', 'folder', 'profile']

  console.log('🚀 Quick test starting...')

  try {
    // Test preloading
    await preloadIcons(commonIcons)
    console.log('✅ Preloading successful')

    // Test individual loading
    for (const iconName of commonIcons) {
      await testSingleIcon(iconName)
    }

    // Performance test
    await performanceTest(commonIcons, 2)

    console.log('🎉 Quick test completed!')
  } catch (error) {
    console.log('❌ Quick test failed:', error)
  }
}
