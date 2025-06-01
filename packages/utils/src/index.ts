// packages/utils/src/index.ts
// Utility functions
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Environment validation
export { validateClientEnv, validateServerEnv } from './env'
export type { ClientEnv, ServerEnv } from './env'

// Date utilities
export const formatDate = (date: Date): string => {
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Block utilities (for future use)
export const createBlockId = () => generateId()
export const createPageId = () => generateId()
export const createWorkspaceId = () => generateId()
