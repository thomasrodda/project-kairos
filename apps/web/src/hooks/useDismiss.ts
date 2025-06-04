// apps/web/src/hooks/useDismiss.ts
// Reusable hook for dismissing UI elements via click-away or escape key.
// Used for selections, menus, toolbars, modals, dropdowns, and any dismissible UI.
// Provides consistent dismiss behavior across the entire application.

import { useEffect, RefObject } from 'react'

interface UseDismissOptions {
  onDismiss: () => void
  onEscape?: () => void // Optional separate handler for escape
  enabled?: boolean // Allow disabling the hook conditionally
  excludeRefs?: RefObject<HTMLElement>[] // Additional refs to exclude from "outside"
}

export function useDismiss(ref: RefObject<HTMLElement>, { onDismiss, onEscape, enabled = true, excludeRefs = [] }: UseDismissOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Node

      // Check if click is outside the main ref
      const isOutsideMain = ref.current && !ref.current.contains(target)

      // Check if click is outside all excluded refs
      const isOutsideExcluded = excludeRefs.every((excludeRef) => !excludeRef.current || !excludeRef.current.contains(target))

      // Only trigger if outside main ref AND outside all excluded refs
      if (isOutsideMain && isOutsideExcluded) {
        onDismiss()
      }
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Use separate escape handler if provided, otherwise use dismiss handler
        if (onEscape) {
          onEscape()
        } else {
          onDismiss()
        }
      }
    }

    // Add global event listeners
    document.addEventListener('mousedown', handleGlobalClick)
    document.addEventListener('keydown', handleGlobalKeyDown)

    // Cleanup event listeners
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick)
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [ref, onDismiss, onEscape, enabled, excludeRefs])
}
