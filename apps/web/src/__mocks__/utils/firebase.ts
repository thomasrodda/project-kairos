// Mock implementation of Firebase utilities for testing
// This prevents the real firebase.ts from trying to access import.meta.env

export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    // Call the callback with null user initially
    callback(null)
    // Return an unsubscribe function
    return jest.fn()
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}

export const db = {
  collection: jest.fn(),
  doc: jest.fn(),
}

export const storage = {
  ref: jest.fn(),
  upload: jest.fn(),
}

// Default export for the app instance
const mockApp = {
  name: 'test-app',
  options: {},
}

export default mockApp
