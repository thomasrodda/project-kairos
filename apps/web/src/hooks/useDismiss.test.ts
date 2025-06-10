import { renderHook } from '@testing-library/react'
import { useDismiss } from './useDismiss'
import React from 'react'

describe('useDismiss', () => {
  let mockRef: React.RefObject<HTMLDivElement>
  let mockElement: HTMLDivElement
  let mockOnDismiss: jest.Mock
  let mockOnEscape: jest.Mock

  beforeEach(() => {
    // Create a mock element and ref
    mockElement = document.createElement('div')
    mockElement.setAttribute('id', 'test-element')
    document.body.appendChild(mockElement)

    mockRef = {
      current: mockElement,
    }

    mockOnDismiss = jest.fn()
    mockOnEscape = jest.fn()
  })

  afterEach(() => {
    // Clean up
    if (mockElement.parentNode) {
      mockElement.parentNode.removeChild(mockElement)
    }
    jest.clearAllMocks()
  })

  describe('✅ Click Outside', () => {
    it('triggers on click outside ref', () => {
      renderHook(() => useDismiss(mockRef, { onDismiss: mockOnDismiss }))

      // Create and click an outside element
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)

      const clickEvent = new MouseEvent('mousedown', { bubbles: true })
      outsideElement.dispatchEvent(clickEvent)

      expect(mockOnDismiss).toHaveBeenCalledTimes(1)

      // Clean up
      document.body.removeChild(outsideElement)
    })

    it('ignores clicks inside ref', () => {
      renderHook(() => useDismiss(mockRef, { onDismiss: mockOnDismiss }))

      // Click inside the element
      const clickEvent = new MouseEvent('mousedown', { bubbles: true })
      mockElement.dispatchEvent(clickEvent)

      expect(mockOnDismiss).not.toHaveBeenCalled()
    })

    it('respects excludeRefs array', () => {
      const excludeElement = document.createElement('div')
      excludeElement.setAttribute('id', 'exclude-element')
      document.body.appendChild(excludeElement)

      const excludeRef = { current: excludeElement }

      renderHook(() =>
        useDismiss(mockRef, {
          onDismiss: mockOnDismiss,
          excludeRefs: [excludeRef],
        })
      )

      // Click on excluded element
      const clickEvent = new MouseEvent('mousedown', { bubbles: true })
      excludeElement.dispatchEvent(clickEvent)

      expect(mockOnDismiss).not.toHaveBeenCalled()

      // Clean up
      document.body.removeChild(excludeElement)
    })

    it('works with nested elements', () => {
      renderHook(() => useDismiss(mockRef, { onDismiss: mockOnDismiss }))

      // Create a nested element inside the ref
      const nestedElement = document.createElement('span')
      mockElement.appendChild(nestedElement)

      // Click on nested element
      const clickEvent = new MouseEvent('mousedown', { bubbles: true })
      nestedElement.dispatchEvent(clickEvent)

      expect(mockOnDismiss).not.toHaveBeenCalled()

      // Create a nested element outside the ref
      const outsideParent = document.createElement('div')
      const outsideNested = document.createElement('span')
      outsideParent.appendChild(outsideNested)
      document.body.appendChild(outsideParent)

      // Click on nested outside element
      outsideNested.dispatchEvent(clickEvent)

      expect(mockOnDismiss).toHaveBeenCalledTimes(1)

      // Clean up
      document.body.removeChild(outsideParent)
    })
  })

  describe('✅ Keyboard', () => {
    it('triggers on Escape key', () => {
      renderHook(() => useDismiss(mockRef, { onDismiss: mockOnDismiss }))

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)

      expect(mockOnDismiss).toHaveBeenCalledTimes(1)
    })

    it('uses custom onEscape if provided', () => {
      renderHook(() =>
        useDismiss(mockRef, {
          onDismiss: mockOnDismiss,
          onEscape: mockOnEscape,
        })
      )

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)

      expect(mockOnEscape).toHaveBeenCalledTimes(1)
      expect(mockOnDismiss).not.toHaveBeenCalled()
    })

    it('respects enabled option', () => {
      renderHook(() =>
        useDismiss(mockRef, {
          onDismiss: mockOnDismiss,
          enabled: false,
        })
      )

      // Try escape key
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)

      expect(mockOnDismiss).not.toHaveBeenCalled()

      // Try click outside
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)

      const clickEvent = new MouseEvent('mousedown', { bubbles: true })
      outsideElement.dispatchEvent(clickEvent)

      expect(mockOnDismiss).not.toHaveBeenCalled()

      // Clean up
      document.body.removeChild(outsideElement)
    })

    it('ignores other keys', () => {
      renderHook(() => useDismiss(mockRef, { onDismiss: mockOnDismiss }))

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(enterEvent)

      expect(mockOnDismiss).not.toHaveBeenCalled()

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' })
      document.dispatchEvent(spaceEvent)

      expect(mockOnDismiss).not.toHaveBeenCalled()
    })
  })

  describe('✅ Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

      const { unmount } = renderHook(() => useDismiss(mockRef, { onDismiss: mockOnDismiss }))

      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true)
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })

    it('updates listeners when deps change', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

      const { rerender } = renderHook(({ enabled }) => useDismiss(mockRef, { onDismiss: mockOnDismiss, enabled }), {
        initialProps: { enabled: true },
      })

      const initialCalls = addEventListenerSpy.mock.calls.length

      // Change enabled prop
      rerender({ enabled: false })

      // Should have removed old listeners
      expect(removeEventListenerSpy).toHaveBeenCalled()

      // Enabled is false, so no new listeners should be added
      expect(addEventListenerSpy).toHaveBeenCalledTimes(initialCalls)

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles null ref gracefully', () => {
      const nullRef = { current: null }

      renderHook(() => useDismiss(nullRef, { onDismiss: mockOnDismiss }))

      // Click anywhere
      const clickEvent = new MouseEvent('mousedown', { bubbles: true })
      document.body.dispatchEvent(clickEvent)

      // Should NOT trigger dismiss since ref is null (no element to be "outside" of)
      expect(mockOnDismiss).not.toHaveBeenCalled()

      // But Escape should still work
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)

      expect(mockOnDismiss).toHaveBeenCalledTimes(1)
    })

    it('handles excludeRefs with null values', () => {
      const nullExcludeRef = { current: null }
      const validExcludeElement = document.createElement('div')
      document.body.appendChild(validExcludeElement)
      const validExcludeRef = { current: validExcludeElement }

      renderHook(() =>
        useDismiss(mockRef, {
          onDismiss: mockOnDismiss,
          excludeRefs: [nullExcludeRef, validExcludeRef],
        })
      )

      // Click on valid exclude element
      const clickEvent = new MouseEvent('mousedown', { bubbles: true })
      validExcludeElement.dispatchEvent(clickEvent)

      expect(mockOnDismiss).not.toHaveBeenCalled()

      // Clean up
      document.body.removeChild(validExcludeElement)
    })

    it('handles multiple instances without interference', () => {
      const secondElement = document.createElement('div')
      document.body.appendChild(secondElement)
      const secondRef = { current: secondElement }
      const secondOnDismiss = jest.fn()

      renderHook(() => useDismiss(mockRef, { onDismiss: mockOnDismiss }))
      renderHook(() => useDismiss(secondRef, { onDismiss: secondOnDismiss }))

      // Click on first element
      const clickEvent = new MouseEvent('mousedown', { bubbles: true })
      mockElement.dispatchEvent(clickEvent)

      expect(mockOnDismiss).not.toHaveBeenCalled()
      expect(secondOnDismiss).toHaveBeenCalledTimes(1) // Outside second ref

      // Clean up
      document.body.removeChild(secondElement)
    })
  })
})
