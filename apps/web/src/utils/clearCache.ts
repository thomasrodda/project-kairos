/**
 * Utility to clear any cached data that might contain old mock IDs
 */
export function clearCachedData() {
  try {
    // Clear localStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('mock') || key.includes('page') || key.includes('workspace'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Clear sessionStorage
    const sessionKeysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('mock') || key.includes('page') || key.includes('workspace'))) {
        sessionKeysToRemove.push(key)
      }
    }
    sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key))

    console.log('Cleared cached data:', {
      localStorage: keysToRemove,
      sessionStorage: sessionKeysToRemove,
    })
  } catch (error) {
    console.error('Error clearing cached data:', error)
  }
}

// Run on load to clear any stale data
if (typeof window !== 'undefined') {
  clearCachedData()
}
