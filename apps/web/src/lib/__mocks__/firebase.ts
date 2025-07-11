// Mock firebase module for tests
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
}

export const signInWithGoogle = jest.fn()
export const signInWithEmail = jest.fn()
export const signUpWithEmail = jest.fn()
export const logout = jest.fn()
