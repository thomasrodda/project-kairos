import { useCallback, useEffect, useRef } from 'react'

interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
}

export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): DebouncedFunction<T> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)
  const lastArgsRef = useRef<Parameters<T> | null>(null)

  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    lastArgsRef.current = null
  }, [])

  // Flush function - execute immediately if pending
  const flush = useCallback(() => {
    if (timeoutRef.current && lastArgsRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      callbackRef.current(...lastArgsRef.current)
      lastArgsRef.current = null
    }
  }, [])

  // Debounced function
  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
        timeoutRef.current = null
        lastArgsRef.current = null
      }, delay)
    },
    [delay]
  ) as DebouncedFunction<T>

  // Add cancel and flush methods
  debouncedFunction.cancel = cancel
  debouncedFunction.flush = flush

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedFunction
}
