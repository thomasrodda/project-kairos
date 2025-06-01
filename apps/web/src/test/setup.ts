// apps/web/src/test/setup.ts
import '@testing-library/jest-dom'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock performance API if not available
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
  } as Partial<Performance> as Performance
}

// Mock DOMParser for SVG parsing
global.DOMParser = class DOMParser {
  parseFromString(_source: string, _type: DOMParserSupportedType): Document {
    const doc = document.implementation.createHTMLDocument()
    const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    mockSvg.setAttribute('viewBox', '0 0 24 24')
    mockSvg.innerHTML = '<path d="M12 2L2 7v10c0 5.55 3.84 9.739 9.824 9.956"/>'
    doc.body.appendChild(mockSvg)
    return doc
  }
}

// Suppress console errors during tests unless explicitly testing error handling
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
      return
    }
    // Also suppress SVG-related errors during testing
    if (typeof args[0] === 'string' && args[0].includes('SVG')) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Icon')) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})
