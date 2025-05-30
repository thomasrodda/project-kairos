// packages/ui/src/test/setup.ts
import '@testing-library/jest-dom'

// Mock DOM methods that might not be available in the test environment
global.DOMParser = class DOMParser {
  parseFromString(source: string, type: DOMParserSupportedType): Document {
    const parser = new window.DOMParser()
    return parser.parseFromString(source, type)
  }
}

// Mock performance API if not available
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
  } as Partial<Performance> as Performance
}

// Mock fetch API for icon loading tests
global.fetch = jest.fn()

// Mock URL constructor for icon path tests
if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = jest.fn(() => 'mocked-object-url')
}

// Suppress console warnings in tests unless explicitly testing them
const originalWarn = console.warn
beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Icon') && args[0].includes('not found')) {
      return // Suppress expected icon warnings in tests
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
})
