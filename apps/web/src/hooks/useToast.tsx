import { useState, useCallback, createContext, useContext, ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (options: { message: string; type: Toast['type'] }) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  return context || { showToast: () => {}, toasts: [], hideToast: () => {} }
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback(({ message, type }: { message: string; type: Toast['type'] }) => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type }

    setToasts((prev) => [...prev, newToast])

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return <ToastContext.Provider value={{ toasts, showToast, hideToast }}>{children}</ToastContext.Provider>
}
