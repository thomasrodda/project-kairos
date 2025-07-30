/**
 * Golden File Test Utilities
 *
 * Utilities for capturing and comparing golden files (snapshots) of editor behavior
 * before and after the HTML transition.
 */

import fs from 'fs'
import path from 'path'
// Define EditorBlock type locally to avoid circular dependencies
interface EditorBlock {
  id: string
  type: string
  content: string
  metadata?: any
  textFormats?: any[]
}

export interface GoldenFileMetadata {
  timestamp: string
  testName: string
  browserInfo: string
  description: string
}

export interface DOMSnapshot {
  metadata: GoldenFileMetadata
  html: string
  structure: any // Simplified DOM structure
}

export interface EventSequence {
  metadata: GoldenFileMetadata
  events: Array<{
    type: string
    target: string
    data: any
    timestamp: number
  }>
}

export interface StateSnapshot {
  metadata: GoldenFileMetadata
  blocks: EditorBlock[]
  selection: any
  clipboard?: any
}

/**
 * Captures the current DOM state of the editor
 */
export function captureDOMSnapshot(element: HTMLElement, testName: string, description: string): DOMSnapshot {
  const metadata: GoldenFileMetadata = {
    timestamp: new Date().toISOString(),
    testName,
    browserInfo: navigator.userAgent,
    description,
  }

  // Capture raw HTML
  const html = element.innerHTML

  // Build simplified structure for easier comparison
  const structure = buildDOMStructure(element)

  return {
    metadata,
    html,
    structure,
  }
}

/**
 * Builds a simplified DOM structure for comparison
 */
function buildDOMStructure(element: Element): any {
  const structure: any = {
    tag: element.tagName.toLowerCase(),
    attributes: {},
    children: [],
  }

  // Capture relevant attributes
  const relevantAttrs = ['class', 'data-block-id', 'data-block-type', 'contenteditable']
  relevantAttrs.forEach((attr) => {
    const value = element.getAttribute(attr)
    if (value) {
      structure.attributes[attr] = value
    }
  })

  // Capture text content if it's a text node
  if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
    structure.text = element.textContent
  }

  // Recursively capture children
  Array.from(element.children).forEach((child) => {
    structure.children.push(buildDOMStructure(child))
  })

  return structure
}

/**
 * Event recorder for capturing user interactions
 */
export class EventRecorder {
  private events: EventSequence['events'] = []
  private startTime: number = Date.now()
  private element: HTMLElement

  constructor(element: HTMLElement) {
    this.element = element
  }

  start() {
    // Capture keyboard events
    this.element.addEventListener('keydown', this.recordEvent)
    this.element.addEventListener('keyup', this.recordEvent)
    this.element.addEventListener('keypress', this.recordEvent)

    // Capture mouse events
    this.element.addEventListener('click', this.recordEvent)
    this.element.addEventListener('mousedown', this.recordEvent)
    this.element.addEventListener('mouseup', this.recordEvent)
    this.element.addEventListener('mousemove', this.recordEvent)

    // Capture clipboard events
    this.element.addEventListener('copy', this.recordEvent)
    this.element.addEventListener('cut', this.recordEvent)
    this.element.addEventListener('paste', this.recordEvent)

    // Capture custom events
    this.element.addEventListener('input', this.recordEvent)
    this.element.addEventListener('beforeinput', this.recordEvent)
  }

  stop(): EventSequence['events'] {
    // Remove all event listeners
    this.element.removeEventListener('keydown', this.recordEvent)
    this.element.removeEventListener('keyup', this.recordEvent)
    this.element.removeEventListener('keypress', this.recordEvent)
    this.element.removeEventListener('click', this.recordEvent)
    this.element.removeEventListener('mousedown', this.recordEvent)
    this.element.removeEventListener('mouseup', this.recordEvent)
    this.element.removeEventListener('mousemove', this.recordEvent)
    this.element.removeEventListener('copy', this.recordEvent)
    this.element.removeEventListener('cut', this.recordEvent)
    this.element.removeEventListener('paste', this.recordEvent)
    this.element.removeEventListener('input', this.recordEvent)
    this.element.removeEventListener('beforeinput', this.recordEvent)

    return this.events
  }

  private recordEvent = (event: Event) => {
    const eventData: any = {
      type: event.type,
      target: this.getTargetSelector(event.target as Element),
      data: {},
      timestamp: Date.now() - this.startTime,
    }

    // Capture event-specific data
    if (event instanceof KeyboardEvent) {
      eventData.data = {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      }
    } else if (event instanceof MouseEvent) {
      eventData.data = {
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button,
      }
    } else if (event instanceof ClipboardEvent) {
      eventData.data = {
        clipboardData: event.clipboardData?.types || [],
      }
    }

    this.events.push(eventData)
  }

  private getTargetSelector(element: Element): string {
    // Generate a simple selector for the target element
    const id = element.id ? `#${element.id}` : ''
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : ''
    const tag = element.tagName.toLowerCase()
    return `${tag}${id}${classes}`
  }
}

/**
 * Saves a golden file
 */
export function saveGoldenFile(category: 'dom-snapshots' | 'event-sequences' | 'state-changes', filename: string, data: any) {
  const dirPath = path.join(__dirname, category)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  const filePath = path.join(dirPath, `${filename}.json`)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

/**
 * Loads a golden file
 */
export function loadGoldenFile(category: 'dom-snapshots' | 'event-sequences' | 'state-changes', filename: string): any {
  const filePath = path.join(__dirname, category, `${filename}.json`)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Golden file not found: ${filePath}`)
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

/**
 * Compares two DOM snapshots
 */
export function compareDOMSnapshots(actual: DOMSnapshot, expected: DOMSnapshot): { match: boolean; differences: string[] } {
  const differences: string[] = []

  // Compare structures recursively
  function compareStructures(actualNode: any, expectedNode: any, path: string = '') {
    if (actualNode.tag !== expectedNode.tag) {
      differences.push(`Tag mismatch at ${path}: ${actualNode.tag} vs ${expectedNode.tag}`)
    }

    // Compare attributes
    Object.keys(expectedNode.attributes || {}).forEach((attr) => {
      if (actualNode.attributes?.[attr] !== expectedNode.attributes[attr]) {
        differences.push(`Attribute ${attr} mismatch at ${path}: ${actualNode.attributes?.[attr]} vs ${expectedNode.attributes[attr]}`)
      }
    })

    // Compare text content
    if (expectedNode.text && actualNode.text !== expectedNode.text) {
      differences.push(`Text mismatch at ${path}: "${actualNode.text}" vs "${expectedNode.text}"`)
    }

    // Compare children
    const actualChildren = actualNode.children || []
    const expectedChildren = expectedNode.children || []

    if (actualChildren.length !== expectedChildren.length) {
      differences.push(`Child count mismatch at ${path}: ${actualChildren.length} vs ${expectedChildren.length}`)
    }

    // Compare each child
    const minLength = Math.min(actualChildren.length, expectedChildren.length)
    for (let i = 0; i < minLength; i++) {
      compareStructures(actualChildren[i], expectedChildren[i], `${path}/${actualNode.tag}[${i}]`)
    }
  }

  compareStructures(actual.structure, expected.structure)

  return {
    match: differences.length === 0,
    differences,
  }
}

/**
 * Replays an event sequence on an element
 */
export async function replayEventSequence(element: HTMLElement, sequence: EventSequence['events']) {
  for (const event of sequence) {
    await new Promise((resolve) => setTimeout(resolve, 50)) // Small delay between events

    const target = element.querySelector(event.target) || element

    if (event.type.startsWith('key')) {
      const keyEvent = new KeyboardEvent(event.type, event.data)
      target.dispatchEvent(keyEvent)
    } else if (event.type.startsWith('mouse') || event.type === 'click') {
      const mouseEvent = new MouseEvent(event.type, event.data)
      target.dispatchEvent(mouseEvent)
    } else {
      const customEvent = new Event(event.type, { bubbles: true })
      target.dispatchEvent(customEvent)
    }
  }
}
