import { validateClientEnv } from './env'

describe('Environment Validation', () => {
  let originalEnv: NodeJS.ProcessEnv
  let consoleErrorSpy: jest.SpyInstance

  beforeAll(() => {
    // Store original process.env
    originalEnv = process.env
    // Spy on console.error to prevent logs during tests and check calls
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore original process.env after each test
    process.env = originalEnv
  })

  afterAll(() => {
    // Restore console.error spy
    consoleErrorSpy.mockRestore()
  })

  describe('✅ Core Functionality', () => {
    it('should return parsed client environment when all valid variables are present', () => {
      // Mock process.env with valid client variables
      // Set NODE_ENV to development to avoid test mode mock values
      process.env = {
        ...originalEnv,
        NODE_ENV: 'development',
        VITE_FIREBASE_API_KEY: 'valid-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'valid.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'valid-project',
        VITE_FIREBASE_STORAGE_BUCKET: 'valid.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '987654321',
        VITE_FIREBASE_APP_ID: 'valid-app-id',
        VITE_API_URL: 'http://localhost:4000',
      }

      const clientEnv = validateClientEnv()

      // Assert that the returned object matches the mocked values
      expect(clientEnv).toEqual({
        VITE_FIREBASE_API_KEY: 'valid-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'valid.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'valid-project',
        VITE_FIREBASE_STORAGE_BUCKET: 'valid.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '987654321',
        VITE_FIREBASE_APP_ID: 'valid-app-id',
        VITE_API_URL: 'http://localhost:4000',
      })
      // Ensure console.error was not called
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should return mock client environment in test mode', () => {
      // Mock process.env.NODE_ENV to 'test'
      process.env = {
        ...originalEnv,
        NODE_ENV: 'test',
        // Even if other variables are missing, it should return mock in test mode
        // VITE_FIREBASE_API_KEY: undefined, // Explicitly show it can be undefined
      }

      const clientEnv = validateClientEnv()

      // Assert that the returned object matches the expected mock values from env.ts
      expect(clientEnv).toEqual({
        VITE_FIREBASE_API_KEY: 'test-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'test-project',
        VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
        VITE_FIREBASE_APP_ID: 'test-app-id',
        VITE_API_URL: 'http://localhost:3001',
      })
      // Ensure console.error was not called
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('✅ Error Handling', () => {
    it('should throw an error when required client environment variables are missing', () => {
      // Mock process.env with a missing required variable (e.g., VITE_FIREBASE_API_KEY)
      // Ensure NODE_ENV is not 'test'
      process.env = {
        ...originalEnv,
        NODE_ENV: 'development', // Set to development to avoid test mode
        // VITE_FIREBASE_API_KEY is missing
        VITE_FIREBASE_AUTH_DOMAIN: 'valid.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'valid-project',
        VITE_FIREBASE_STORAGE_BUCKET: 'valid.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '987654321',
        VITE_FIREBASE_APP_ID: 'valid-app-id',
        VITE_API_URL: 'http://localhost:4000',
      }

      // Expect validateClientEnv to throw an error
      expect(() => validateClientEnv()).toThrow('Invalid client environment configuration')
      // Ensure console.error was called because validation failed
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})
