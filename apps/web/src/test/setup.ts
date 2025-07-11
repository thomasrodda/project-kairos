// apps/web/src/test/setup.ts
import '@testing-library/jest-dom'

// Mock import.meta.env for Vite environment variables
;(global as any).import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3001',
    },
  },
}

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

// Add ClipboardEvent polyfill for jest-dom
if (typeof ClipboardEvent === 'undefined') {
  global.ClipboardEvent = class ClipboardEvent extends Event {
    clipboardData: DataTransfer
    constructor(type: string, eventInitDict?: ClipboardEventInit) {
      super(type, eventInitDict)
      this.clipboardData = eventInitDict?.clipboardData || new DataTransfer()
    }
  } as any
}

// Add DataTransfer polyfill if needed
if (typeof DataTransfer === 'undefined') {
  global.DataTransfer = class DataTransfer {
    items: any[] = []
    types: string[] = []
    files: FileList = [] as any

    getData(format: string): string {
      return ''
    }

    setData(format: string, data: string): void {
      this.types.push(format)
    }

    clearData(format?: string): void {
      if (format) {
        const index = this.types.indexOf(format)
        if (index > -1) {
          this.types.splice(index, 1)
        }
      } else {
        this.types = []
      }
    }
  } as any
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
    // Suppress act() warnings in tests as they can cause flakiness
    if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) {
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

// Add support for InputEvent if not available
if (typeof InputEvent === 'undefined') {
  global.InputEvent = class InputEvent extends Event {
    data: string | null
    inputType: string
    constructor(type: string, eventInitDict?: InputEventInit) {
      super(type, eventInitDict)
      this.data = eventInitDict?.data || null
      this.inputType = eventInitDict?.inputType || ''
    }
  } as any
}
