// Separate config module to handle environment variables
// This can be easily mocked in tests

export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api'
}
